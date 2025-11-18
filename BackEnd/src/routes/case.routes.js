const express = require('express'); // /// ADDED
const router = express.Router(); // /// ADDED
const caseController = require('../controllers/case.controller'); // /// ADDED

router.post('/updateLocation/:id', caseController.updateCaseLocation); // /// ADDED
router.patch('/updateSeverity/:id', caseController.updateCaseSeverity); // /// ADDED
router.post('/seed', caseController.seedSampleCases); // /// ADDED

module.exports = router; // /// ADDED

