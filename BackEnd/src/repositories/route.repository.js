const { db } = require('../config/firebase'); // /// ADDED

const addRouteHistory = async (payload) => { // /// ADDED
  const ref = await db.collection('routeHistories').add({ // /// ADDED
    patientId: payload.patientId || null, // /// ADDED
    hospitalId: payload.hospitalId, // /// ADDED
    timestamp: new Date(), // /// ADDED
    routeCoordinates: payload.routeCoordinates, // /// ADDED
  }); // /// ADDED
  const doc = await ref.get(); // /// ADDED
  return { id: doc.id, ...doc.data() }; // /// ADDED
}; // /// ADDED

module.exports = { // /// ADDED
  addRouteHistory, // /// ADDED
}; // /// ADDED