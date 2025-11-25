const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { email, password, ...userData } = req.body;
    const result = await authService.register(email, password, userData);
    return successResponse(res, result, 'User registered successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const login = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await authService.login(email);
    return successResponse(res, user, 'Login successful');
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.uid);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, user, 'User retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = { register, login, getMe };

