const adminService = require('../services/admin.service');
const { successResponse, errorResponse } = require('../utils/response');

const getAllDrivers = async (req, res) => {
  try {
    const drivers = await adminService.getAllDrivers();
    return successResponse(res, drivers, 'Drivers retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getAllPatients = async (req, res) => {
  try {
    const patients = await adminService.getAllPatients();
    return successResponse(res, patients, 'Patients retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getAllEmergencies = async (req, res) => {
  try {
    const emergencies = await adminService.getAllEmergencies();
    return successResponse(res, emergencies, 'Emergencies retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getDashboardMetrics = async (req, res) => {
  try {
    const timeframe = (req.query.timeframe || '24h').toLowerCase();
    const metrics = await adminService.getDashboardMetrics(timeframe);
    return successResponse(res, metrics, 'Dashboard metrics retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  getAllDrivers,
  getAllPatients,
  getAllEmergencies,
  getDashboardMetrics,
};

