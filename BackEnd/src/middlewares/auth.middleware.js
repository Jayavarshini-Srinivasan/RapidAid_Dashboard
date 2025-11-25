const { admin, isFirebaseReady } = require('../config/firebase'); // /// ADDED
const { errorResponse } = require('../utils/response');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) { // /// ADDED
      if (!isFirebaseReady || process.env.USE_SAMPLE_DATA === 'true') { // /// ADDED
        req.user = { uid: 'dev-admin', email: 'admin@dev.local', role: 'admin' }; // /// ADDED
        return next(); // /// ADDED
      } // /// ADDED
      return errorResponse(res, 'No token provided', 401);
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'patient',
    };

    next();
  } catch (error) {
    if (!isFirebaseReady || process.env.USE_SAMPLE_DATA === 'true') { // /// ADDED
      req.user = { uid: 'dev-admin', email: 'admin@dev.local', role: 'admin' }; // /// ADDED
      return next(); // /// ADDED
    } // /// ADDED
    return errorResponse(res, 'Invalid token', 401);
  }
};

module.exports = { verifyToken };

