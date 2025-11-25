const { db } = require('../config/firebase'); // /// ADDED

const getHospitalRef = (id) => db.collection('hospitals').doc(id); // /// ADDED

const listHospitals = async () => { // /// ADDED
  const snapshot = await db.collection('hospitals').get(); // /// ADDED
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // /// ADDED
}; // /// ADDED

const getHospitalById = async (id) => { // /// ADDED
  const doc = await getHospitalRef(id).get(); // /// ADDED
  return doc.exists ? { id: doc.id, ...doc.data() } : null; // /// ADDED
}; // /// ADDED

const createHospital = async (payload) => { // /// ADDED
  const ref = await db.collection('hospitals').add({ // /// ADDED
    ...payload, // /// ADDED
    createdAt: new Date(), // /// ADDED
    updatedAt: new Date(), // /// ADDED
  }); // /// ADDED
  const doc = await ref.get(); // /// ADDED
  return { id: doc.id, ...doc.data() }; // /// ADDED
}; // /// ADDED

const updateHospital = async (id, payload) => { // /// ADDED
  const ref = getHospitalRef(id); // /// ADDED
  await ref.set({ ...payload, updatedAt: new Date() }, { merge: true }); // /// ADDED
  const doc = await ref.get(); // /// ADDED
  return { id: doc.id, ...doc.data() }; // /// ADDED
}; // /// ADDED

const deleteHospital = async (id) => { // /// ADDED
  await getHospitalRef(id).delete(); // /// ADDED
  return { id }; // /// ADDED
}; // /// ADDED

const seedHospitalsBatch = async (hospitals) => { // /// ADDED
  if (!Array.isArray(hospitals) || !hospitals.length) return []; // /// ADDED
  const batch = db.batch(); // /// ADDED
  hospitals.forEach((h) => { // /// ADDED
    const docRef = h.id ? getHospitalRef(h.id) : db.collection('hospitals').doc(); // /// ADDED
    batch.set(docRef, { // /// ADDED
      name: h.name, // /// ADDED
      address: h.address, // /// ADDED
      latitude: h.latitude, // /// ADDED
      longitude: h.longitude, // /// ADDED
      contact: h.contact, // /// ADDED
      facilities: h.facilities || [], // /// ADDED
      type: h.type || 'general', // /// ADDED
      city: h.city, // /// ADDED
      state: h.state, // /// ADDED
      updatedAt: new Date(), // /// ADDED
      createdAt: new Date(), // /// ADDED
    }, { merge: true }); // /// ADDED
  }); // /// ADDED
  await batch.commit(); // /// ADDED
  const all = await listHospitals(); // /// ADDED
  return all; // /// ADDED
}; // /// ADDED

module.exports = { // /// ADDED
  listHospitals, // /// ADDED
  getHospitalById, // /// ADDED
  createHospital, // /// ADDED
  updateHospital, // /// ADDED
  deleteHospital, // /// ADDED
  seedHospitalsBatch, // /// ADDED
}; // /// ADDED