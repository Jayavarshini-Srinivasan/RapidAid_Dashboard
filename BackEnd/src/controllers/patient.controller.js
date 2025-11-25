const emergencyService = require('../services/emergency.service');
const userRepository = require('../repositories/user.repository');
const { successResponse, errorResponse } = require('../utils/response');

const createEmergency = async (req, res) => {
  try {
    const emergency = await emergencyService.createEmergency(req.user.uid, req.body);
    return successResponse(res, emergency, 'Emergency request created', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getMyEmergency = async (req, res) => {
  try {
    const emergency = await emergencyService.getPatientEmergency(req.user.uid);
    return successResponse(res, emergency, 'Emergency retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getAssignedDriver = async (req, res) => {
  try {
    const emergency = await emergencyService.getPatientEmergency(req.user.uid);
    if (!emergency) {
      return errorResponse(res, 'No active emergency', 404);
    }
    const driver = await emergencyService.getAssignedDriver(emergency.id);
    return successResponse(res, driver, 'Driver retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userRepository.getUserById(req.user.uid);
    return successResponse(res, user, 'Profile retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const updateProfile = async (req, res) => {
  try {
    const updated = await userRepository.updateUser(req.user.uid, req.body);
    return successResponse(res, { id: updated.id, ...updated.data() }, 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createEmergency,
  getMyEmergency,
  getAssignedDriver,
  getProfile,
  updateProfile,
};

