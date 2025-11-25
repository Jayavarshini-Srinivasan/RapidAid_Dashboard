const { db } = require('../config/firebase');

const updateDutyStatus = async (driverId, isOnDuty) => {
  const driverRef = db.collection('drivers').doc(driverId);
  await driverRef.set({
    isOnDuty,
    updatedAt: new Date(),
  }, { merge: true });
  return driverRef.get();
};

const updateLiveLocation = async (driverId, location) => {
  const locationRef = db.collection('liveLocations').doc(driverId);
  await locationRef.set({
    driverId,
    latitude: location.latitude,
    longitude: location.longitude,
    timestamp: new Date(),
  });
  return locationRef.get();
};

const getLiveLocation = async (driverId) => {
  const locationRef = db.collection('liveLocations').doc(driverId);
  const doc = await locationRef.get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

const getAllLiveLocations = async () => {
  const locationsRef = db.collection('liveLocations');
  const snapshot = await locationsRef.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getDriverStats = async (driverId) => {
  const emergenciesRef = db.collection('emergencies');
  const completed = await emergenciesRef
    .where('driverId', '==', driverId)
    .where('status', '==', 'completed')
    .get();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const completedToday = completed.docs.filter(doc => {
    const data = doc.data();
    return data.completedAt && data.completedAt.toDate() >= today;
  });

  return {
    totalCompleted: completed.size,
    completedToday: completedToday.length,
  };
};

module.exports = {
  updateDutyStatus,
  updateLiveLocation,
  getLiveLocation,
  getAllLiveLocations,
  getDriverStats,
};

