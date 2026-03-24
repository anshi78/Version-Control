const { supabase } = require('../config/supabase');

exports.getVersions = async (req, res) => {
    try {
        const { siteId } = req.params;
        
        const { data: versions, error } = await supabase
            .from('versions')
            .select('*')
            .eq('site_id', siteId)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        const mappedVersions = versions.map(v => ({ 
            ...v, 
            _id: v.id,
            versionNumber: v.version_number,
            uploadedBy: v.uploaded_by,
            createdAt: v.created_at
        }));
        
        res.json(mappedVersions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch versions" });
    }
};

exports.rollback = async (req, res) => {
    try {
        const { siteId, versionId } = req.params;
        const userId = req.auth.userId;

        const { data: site, error: siteError } = await supabase.from('sites').select('id').eq('id', siteId).single();
        if (siteError || !site) return res.status(404).json({ error: "Site not found" });

        const { data: targetVersion, error: verError } = await supabase.from('versions').select('id, version_number').eq('id', versionId).eq('site_id', siteId).single();
        if (verError || !targetVersion) return res.status(404).json({ error: "Version not found" });

        // Update site's current version
        const { error: updateError } = await supabase
            .from('sites')
            .update({ current_version_id: targetVersion.id })
            .eq('id', siteId);
            
        if (updateError) throw updateError;

        // Log the rollback
        await supabase.from('audit_logs').insert([{
            site_id: siteId,
            action: 'ROLLBACK',
            user_id: userId,
            version_id: targetVersion.id,
            description: `Rolled back to version ${targetVersion.version_number}`
        }]);

        res.json({ message: `Successfully rolled back to version ${targetVersion.version_number}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Rollback failed" });
    }
};

exports.getDiff = async (req, res) => {
    try {
        const { baseVersionId, targetVersionId } = req.params;

        const { data: baseVer, error: baseError } = await supabase.from('versions').select('manifest').eq('id', baseVersionId).single();
        const { data: targetVer, error: targetError } = await supabase.from('versions').select('manifest').eq('id', targetVersionId).single();

        if (baseError || targetError || !baseVer || !targetVer) return res.status(404).json({ error: "Version not found" });

        const baseMap = new Map();
        (baseVer.manifest || []).forEach(item => baseMap.set(item.filePath, item.hash));

        const targetMap = new Map();
        (targetVer.manifest || []).forEach(item => targetMap.set(item.filePath, item.hash));

        const diffs = {
            added: [],
            removed: [],
            modified: [],
            unchanged: []
        };

        // Check target against base
        targetMap.forEach((hash, filePath) => {
            if (!baseMap.has(filePath)) {
                diffs.added.push(filePath);
            } else if (baseMap.get(filePath) !== hash) {
                diffs.modified.push(filePath);
            } else {
                diffs.unchanged.push(filePath);
            }
        });

        // Check base against target for removals
        baseMap.forEach((hash, filePath) => {
            if (!targetMap.has(filePath)) {
                diffs.removed.push(filePath);
            }
        });

        res.json(diffs);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to compare versions" });
    }
};
