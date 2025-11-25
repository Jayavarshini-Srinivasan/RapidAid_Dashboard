const { db } = require('../config/firebase');

const createEmergency = async (emergencyData) => {
  const emergencyRef = db.collection('emergencies');
  const docRef = await emergencyRef.add({
    ...emergencyData,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.get();
};

const getEmergencyById = async (emergencyId) => {
  const emergencyRef = db.collection('emergencies').doc(emergencyId);
  const doc = await emergencyRef.get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

const getEmergenciesByPatientId = async (patientId) => {
  const emergenciesRef = db.collection('emergencies');
  const snapshot = await emergenciesRef.where('patientId', '==', patientId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getEmergenciesByDriverId = async (driverId) => {
  const emergenciesRef = db.collection('emergencies');
  const snapshot = await emergenciesRef.where('driverId', '==', driverId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getPendingEmergencies = async () => {
  const emergenciesRef = db.collection('emergencies');
  const snapshot = await emergenciesRef.where('status', '==', 'pending').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getAllEmergencies = async () => {
  const emergenciesRef = db.collection('emergencies');
  const snapshot = await emergenciesRef.orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const updateEmergency = async (emergencyId, updateData) => {
  const emergencyRef = db.collection('emergencies').doc(emergencyId);
  await emergencyRef.update({
    ...updateData,
    updatedAt: new Date(),
  });
  return emergencyRef.get();
};

module.exports = {
  createEmergency,
  getEmergencyById,
  getEmergenciesByPatientId,
  getEmergenciesByDriverId,
  getPendingEmergencies,
  getAllEmergencies,
  updateEmergency,
};

