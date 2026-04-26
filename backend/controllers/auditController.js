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
