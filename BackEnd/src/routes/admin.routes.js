const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const criticalZoneController = require('../controllers/criticalZone.controller'); // /// ADDED
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.use(verifyToken);
router.use(requireRole('admin'));

router.get('/drivers', adminController.getAllDrivers);
router.get('/patients', adminController.getAllPatients);
router.get('/emergencies', adminController.getAllEmergencies);
router.get('/dashboard/metrics', adminController.getDashboardMetrics);
router.get('/critical-zones', criticalZoneController.list); // /// ADDED
router.post('/critical-zones/seed', criticalZoneController.seed); // /// ADDED

module.exports = router;

