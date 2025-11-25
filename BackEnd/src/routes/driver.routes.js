const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.use(verifyToken);
router.use(requireRole('driver'));

router.post('/duty/toggle', driverController.toggleDutyStatus);
router.post('/location', driverController.updateLocation);
router.get('/requests/assigned', driverController.getAssignedRequests);
router.get('/requests/pending', driverController.getPendingRequests);
router.post('/requests/:emergencyId/accept', driverController.acceptRequest);
router.post('/requests/:emergencyId/reject', driverController.rejectRequest);
router.post('/requests/:emergencyId/complete', driverController.completeRequest);
router.get('/stats', driverController.getStats);

module.exports = router;

