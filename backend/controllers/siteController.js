const { supabase } = require('../config/supabase');

exports.createSite = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.auth.userId;

        const { data: site, error } = await supabase
            .from('sites')
            .insert([{ name, owner_id: userId }])
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            if (error.code === '23505') {
                return res.status(409).json({ error: "Site name already exists" });
            }
            return res.status(500).json({ error: "Failed to create site" });
        }

        res.status(201).json({ ...site, _id: site.id, ownerId: site.owner_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create site" });
    }
};

exports.getSites = async (req, res) => {
    try {
        const userId = req.auth.userId;
        
        // Fetch sites and join the current version data
        const { data: sites, error } = await supabase
            .from('sites')
            .select(`
                *,
                versions!fk_current_version (*)
            `)
            .eq('owner_id', userId);

        if (error) throw error;

        // Map to match frontend expectations (_id, ownerId, currentVersionId object)
        const mappedSites = sites.map(site => {
            const currentVersion = site.versions ? { ...site.versions, _id: site.versions.id } : null;
            return {
                ...site,
                _id: site.id,
                ownerId: site.owner_id,
                currentVersionId: currentVersion
            };
        });

        res.json(mappedSites);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch sites" });
    }
};
