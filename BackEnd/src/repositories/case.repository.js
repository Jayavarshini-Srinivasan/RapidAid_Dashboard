const { db } = require('../config/firebase'); // /// ADDED

const getCaseRef = (caseId) => db.collection('cases').doc(caseId); // /// ADDED

const upsertCaseLocation = async (caseId, location) => { // /// ADDED
  const caseRef = getCaseRef(caseId); // /// ADDED
  await caseRef.set( // /// ADDED
    { // /// ADDED
      location: { // /// ADDED
        lat: location.lat, // /// ADDED
        lng: location.lng, // /// ADDED
      }, // /// ADDED
      updatedAt: new Date(), // /// ADDED
    }, // /// ADDED
    { merge: true }, // /// ADDED
  ); // /// ADDED
  const snapshot = await caseRef.get(); // /// ADDED
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null; // /// ADDED
}; // /// ADDED

const upsertCaseSeverity = async (caseId, severity) => { // /// ADDED
  const caseRef = getCaseRef(caseId); // /// ADDED
  await caseRef.set( // /// ADDED
    { // /// ADDED
      severity, // /// ADDED
      updatedAt: new Date(), // /// ADDED
    }, // /// ADDED
    { merge: true }, // /// ADDED
  ); // /// ADDED
  const snapshot = await caseRef.get(); // /// ADDED
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null; // /// ADDED
}; // /// ADDED

module.exports = { // /// ADDED
  upsertCaseLocation, // /// ADDED
  upsertCaseSeverity, // /// ADDED
  seedCaseBatch: async (casesPayload = []) => { // /// ADDED
    if (!Array.isArray(casesPayload) || !casesPayload.length) return []; // /// ADDED
    const batch = db.batch(); // /// ADDED
    casesPayload.forEach((caseDoc) => { // /// ADDED
      const { id, ...rest } = caseDoc; // /// ADDED
      if (!id) return; // /// ADDED
      const ref = getCaseRef(id); // /// ADDED
      batch.set(ref, { ...rest, updatedAt: new Date() }, { merge: true }); // /// ADDED
    }); // /// ADDED
    await batch.commit(); // /// ADDED
    const snapshots = await Promise.all( // /// ADDED
      casesPayload.map(({ id }) => getCaseRef(id).get()) // /// ADDED
    ); // /// ADDED
    return snapshots // /// ADDED
      .filter((doc) => doc.exists) // /// ADDED
      .map((doc) => ({ id: doc.id, ...doc.data() })); // /// ADDED
  }, // /// ADDED
}; // /// ADDED

