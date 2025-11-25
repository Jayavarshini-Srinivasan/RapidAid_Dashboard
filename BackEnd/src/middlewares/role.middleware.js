const { errorResponse } = require('../utils/response');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

module.exports = { requireRole };

