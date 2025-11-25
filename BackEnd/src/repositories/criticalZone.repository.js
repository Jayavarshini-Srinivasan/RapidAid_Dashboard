const { db } = require('../config/firebase'); // /// ADDED

const collectionName = 'criticalZones'; // /// ADDED

const toDocData = (doc) => ({ id: doc.id, ...doc.data() }); // /// ADDED

const listZones = async () => { // /// ADDED
  if (!db) return []; // /// ADDED
  const snapshot = await db.collection(collectionName).orderBy('created_at', 'desc').get(); // /// ADDED
  return snapshot.docs.map(toDocData); // /// ADDED
}; // /// ADDED

const createZone = async (payload) => { // /// ADDED
  if (!db) return { ...payload, id: payload.zone_id || String(Date.now()) }; // /// ADDED
  const ref = await db.collection(collectionName).add({ // /// ADDED
    ...payload, // /// ADDED
    created_at: payload.created_at || new Date(), // /// ADDED
    updated_at: payload.updated_at || new Date(), // /// ADDED
  }); // /// ADDED
  const doc = await ref.get(); // /// ADDED
  return toDocData(doc); // /// ADDED
}; // /// ADDED

const upsertZonesBatch = async (zones = []) => { // /// ADDED
  if (!Array.isArray(zones) || !zones.length) return []; // /// ADDED
  if (!db) return zones.map((z) => ({ id: z.zone_id || String(Date.now()), ...z })); // /// ADDED
  const batch = db.batch(); // /// ADDED
  const col = db.collection(collectionName); // /// ADDED
  const refs = zones.map((z) => { // /// ADDED
    const ref = z.zone_id ? col.doc(String(z.zone_id)) : col.doc(); // /// ADDED
    batch.set(ref, { // /// ADDED
      zone_id: z.zone_id || ref.id, // /// ADDED
      zone_name: z.zone_name, // /// ADDED
      latitude: z.latitude, // /// ADDED
      longitude: z.longitude, // /// ADDED
      radius: z.radius, // /// ADDED
      severity_level: z.severity_level, // /// ADDED
      severity_label: z.severity_label, // /// ADDED
      status: z.status || 'active', // /// ADDED
      description: z.description || '', // /// ADDED
      metadata: z.metadata || {}, // /// ADDED
      created_at: z.created_at ? new Date(z.created_at) : new Date(), // /// ADDED
      updated_at: new Date(), // /// ADDED
    }); // /// ADDED
    return ref; // /// ADDED
  }); // /// ADDED
  await batch.commit(); // /// ADDED
  const docs = await Promise.all(refs.map((r) => r.get())); // /// ADDED
  return docs.map(toDocData); // /// ADDED
}; // /// ADDED

module.exports = { // /// ADDED
  listZones, // /// ADDED
  createZone, // /// ADDED
  upsertZonesBatch, // /// ADDED
}; // /// ADDED