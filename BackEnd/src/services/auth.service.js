const { admin } = require('../config/firebase');
const userRepository = require('../repositories/user.repository');

const register = async (email, password, userData) => {
  const userRecord = await admin.auth().createUser({
    email,
    password,
  });

  await admin.auth().setCustomUserClaims(userRecord.uid, {
    role: userData.role || 'patient',
  });

  await userRepository.createUser(userRecord.uid, {
    email,
    role: userData.role || 'patient',
    ...userData,
  });

  const token = await admin.auth().createCustomToken(userRecord.uid);
  return { uid: userRecord.uid, token };
};

const login = async (email, password) => {
  // Firebase Auth handles login on client side
  // This service just verifies and returns user data
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const getCurrentUser = async (uid) => {
  return await userRepository.getUserById(uid);
};

module.exports = {
  register,
  login,
  getCurrentUser,
};

