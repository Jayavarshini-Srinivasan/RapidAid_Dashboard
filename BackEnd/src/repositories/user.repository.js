const { db } = require('../config/firebase');

const createUser = async (uid, userData) => {
  const userRef = db.collection('users').doc(uid);
  await userRef.set({
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return userRef.get();
};

const getUserById = async (uid) => {
  const userRef = db.collection('users').doc(uid);
  const doc = await userRef.get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

const getUserByEmail = async (email) => {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

const updateUser = async (uid, userData) => {
  const userRef = db.collection('users').doc(uid);
  await userRef.update({
    ...userData,
    updatedAt: new Date(),
  });
  return userRef.get();
};

const getAllUsersByRole = async (role) => {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('role', '==', role).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  getAllUsersByRole,
};

