const { successResponse, errorResponse } = require('../utils/response'); // /// ADDED
const { getCriticalZones, seedCriticalZones } = require('../services/criticalZone.service'); // /// ADDED

const list = async (req, res) => { // /// ADDED
  try { // /// ADDED
    const data = await getCriticalZones(); // /// ADDED
    return successResponse(res, data, 'Critical zones fetched'); // /// ADDED
  } catch (error) { // /// ADDED
    return errorResponse(res, error.message || 'Failed to fetch zones', 500); // /// ADDED
  } // /// ADDED
}; // /// ADDED

const seed = async (req, res) => { // /// ADDED
  try { // /// ADDED
    const data = await seedCriticalZones(); // /// ADDED
    return successResponse(res, data, 'Critical zones seeded'); // /// ADDED
  } catch (error) { // /// ADDED
    return errorResponse(res, error.message || 'Failed to seed zones', 500); // /// ADDED
  } // /// ADDED
}; // /// ADDED

module.exports = { // /// ADDED
  list, // /// ADDED
  seed, // /// ADDED
}; // /// ADDED