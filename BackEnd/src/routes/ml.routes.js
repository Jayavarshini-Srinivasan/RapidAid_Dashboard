const express = require('express');
const router = express.Router();
const { successResponse } = require('../utils/response');

router.get('/placeholder', (req, res) => {
  return successResponse(res, { message: 'ML endpoint placeholder - ready for future integration' }, 'ML placeholder');
});

module.exports = router;

