const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth');

const uploadController = require('../controllers/uploadController');
const versionController = require('../controllers/versionController');
const siteController = require('../controllers/siteController');
const auditController = require('../controllers/auditController');

// Multer config for temp file storage
const upload = multer({ dest: 'uploads/' });

// Apply auth middleware to all routes
router.use(authMiddleware);

// Sites
router.post('/sites', siteController.createSite);
router.get('/sites', siteController.getSites);

// Upload ZIP
router.post('/sites/:siteId/upload', upload.single('website'), uploadController.uploadVersion);

// Versions & Rollback
router.get('/sites/:siteId/versions', versionController.getVersions);
router.post('/sites/:siteId/versions/:versionId/rollback', versionController.rollback);
router.get('/versions/compare/:baseVersionId/:targetVersionId', versionController.getDiff);

// Audit Logs
router.get('/sites/:siteId/audit-logs', auditController.getAuditLogs);

module.exports = router;
