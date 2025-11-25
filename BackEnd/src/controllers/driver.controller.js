const driverService = require('../services/driver.service');
const { successResponse, errorResponse } = require('../utils/response');

const toggleDutyStatus = async (req, res) => {
  try {
    const { isOnDuty } = req.body;
    const result = await driverService.toggleDutyStatus(req.user.uid, isOnDuty);
    return successResponse(res, { isOnDuty }, 'Duty status updated');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    await driverService.updateLocation(req.user.uid, { latitude, longitude });
    return successResponse(res, null, 'Location updated');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getAssignedRequests = async (req, res) => {
  try {
    const requests = await driverService.getAssignedRequests(req.user.uid);
    return successResponse(res, requests, 'Assigned requests retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const requests = await driverService.getPendingRequests();
    return successResponse(res, requests, 'Pending requests retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const emergency = await driverService.acceptRequest(req.user.uid, emergencyId);
    return successResponse(res, emergency, 'Request accepted');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const emergency = await driverService.rejectRequest(emergencyId);
    return successResponse(res, emergency, 'Request rejected');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const completeRequest = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const emergency = await driverService.completeRequest(emergencyId);
    return successResponse(res, emergency, 'Request completed');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await driverService.getStats(req.user.uid);
    return successResponse(res, stats, 'Stats retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  toggleDutyStatus,
  updateLocation,
  getAssignedRequests,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
  getStats,
};

