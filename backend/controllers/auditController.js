const { supabase } = require('../config/supabase');

exports.getAuditLogs = async (req, res) => {
    try {
        const { siteId } = req.params;

        const { data: logs, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('site_id', siteId)
            .order('timestamp', { ascending: false });

        if (error) throw error;

        const mappedLogs = logs.map(log => ({
            ...log,
            _id: log.id,
            userId: log.user_id,
            versionId: log.version_id,
            createdAt: log.timestamp
        }));

        res.json(mappedLogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch audit logs" });
    }
};

exports.getGlobalActivityLogs = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { limit = 10 } = req.query;

        // Get user's sites first
        const { data: sites, error: sitesError } = await supabase
            .from('sites')
            .select('id')
            .eq('owner_id', userId);

        if (sitesError) throw sitesError;

        if (!sites || sites.length === 0) {
            return res.json([]);
        }

        const siteIds = sites.map(site => site.id);

        // Get audit logs for all user's sites, ordered by timestamp descending
        const { data: logs, error: logsError } = await supabase
            .from('audit_logs')
            .select('*, sites(name, id)')
            .in('site_id', siteIds)
            .order('timestamp', { ascending: false })
            .limit(parseInt(limit));

        if (logsError) throw logsError;

        const mappedLogs = logs.map(log => ({
            ...log,
            _id: log.id,
            userId: log.user_id,
            versionId: log.version_id,
            siteId: log.site_id,
            siteName: log.sites?.name || 'Unknown Site',
            createdAt: log.timestamp
        }));

        res.json(mappedLogs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch activity logs" });
    }
};
