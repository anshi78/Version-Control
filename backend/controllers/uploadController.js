const fs = require('fs');
const crypto = require('crypto');
const AdmZip = require('adm-zip');
const { supabase } = require('../config/supabase');

const generateHash = (buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

const uploadBlob = async (hash, buffer, mimeType) => {
    // Attempt to upload without upsert. If it errors because it already exists, that's fine.
    const { data, error } = await supabase.storage
        .from('versions') // Requires creating a bucket named "versions" in Supabase
        .upload(`blobs/${hash}`, buffer, {
            contentType: mimeType,
            upsert: false // This will cause Duplicates to fail, saving us a check!
        });
        
    if (error) {
        // Suppress duplicate errors (it means deduplication worked)
        if (error.message.includes('Duplicate') || error.message.includes('already exists') || error.error === 'Duplicate') {
            return false; // Not a new blob
        }
        throw error;
    }
    return true; // Successfully uploaded new blob
};

exports.uploadVersion = async (req, res) => {
    const { siteId } = req.params;
    const userId = req.auth.userId;

    if (!req.file) {
        return res.status(400).json({ error: "No ZIP file provided" });
    }

    try {
        // 1. Locking Mechanism using Supabase Row
        const { error: lockError } = await supabase
            .from('locks')
            .insert([{ site_id: siteId, locked_by: userId }]);
            
        if (lockError) {
            if (lockError.code === '23505') { // Postgres Unique Violation
                return res.status(409).json({ error: "Site is currently locked by another upload process. Please try again later." });
            }
            throw lockError;
        }

        const { data: site, error: siteError } = await supabase.from('sites').select('id').eq('id', siteId).single();
        if (siteError || !site) {
            await supabase.from('locks').delete().eq('site_id', siteId);
            throw new Error("Site not found");
        }

        const zip = new AdmZip(req.file.path);
        const zipEntries = zip.getEntries();

        const manifest = [];
        let newBlobsCount = 0;

        // 2. Process Files
        for (const entry of zipEntries) {
            if (entry.isDirectory) continue;

            const content = entry.getData();
            const hash = generateHash(content);
            const filePath = entry.entryName;

            let mimeType = 'application/octet-stream';
            if (filePath.endsWith('.html')) mimeType = 'text/html';
            else if (filePath.endsWith('.css')) mimeType = 'text/css';
            else if (filePath.endsWith('.js')) mimeType = 'application/javascript';

            // 3. Upload Blob (Deduplication handled inside uploadBlob via `upsert: false`)
            const isNew = await uploadBlob(hash, content, mimeType);
            if (isNew) {
                newBlobsCount++;
            }

            manifest.push({ filePath, hash });
        }

        // 4. Create Version Map
        const { data: lastVersion } = await supabase
            .from('versions')
            .select('version_number')
            .eq('site_id', siteId)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();
            
        const newVersionNumber = lastVersion ? lastVersion.version_number + 1 : 1;

        const { data: version, error: versionError } = await supabase
            .from('versions')
            .insert([{
                site_id: siteId,
                version_number: newVersionNumber,
                uploaded_by: userId,
                manifest: manifest
            }])
            .select()
            .single();

        if (versionError) throw versionError;

        // 5. Update Site Pointer
        await supabase
            .from('sites')
            .update({ current_version_id: version.id })
            .eq('id', siteId);

        // 6. Audit Logging
        await supabase.from('audit_logs').insert([{
            site_id: siteId,
            action: 'UPLOAD',
            user_id: userId,
            version_id: version.id,
            description: `Uploaded version ${newVersionNumber}. Added ${newBlobsCount} new files to storage.`
        }]);

        // Clean up locks and temp file
        await supabase.from('locks').delete().eq('site_id', siteId);
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: "Upload successful",
            version: newVersionNumber,
            totalFiles: manifest.length,
            newBlobs: newBlobsCount
        });

    } catch (error) {
        console.error(error);
        // Release lock on error
        await supabase.from('locks').delete().eq('site_id', siteId);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
