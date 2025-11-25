const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.use(verifyToken);
router.use(requireRole('patient'));

router.post('/emergency', patientController.createEmergency);
router.get('/emergency', patientController.getMyEmergency);
router.get('/emergency/driver', patientController.getAssignedDriver);
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

module.exports = router;

