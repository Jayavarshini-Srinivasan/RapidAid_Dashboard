const path = require('path'); // /// ADDED
const fs = require('fs'); // /// ADDED
const { isFirebaseReady } = require('../config/firebase'); // /// ADDED
const { upsertZonesBatch, listZones } = require('../repositories/criticalZone.repository'); // /// ADDED

const severityMap = { // /// ADDED
  1: 'Low', // /// ADDED
  2: 'Medium', // /// ADDED
  3: 'High', // /// ADDED
  4: 'Critical', // /// ADDED
  5: 'Extreme', // /// ADDED
}; // /// ADDED

const seedCitiesIndia = [ // /// ADDED
  { name: 'Delhi Central', lat: 28.6139, lng: 77.2090 }, // /// ADDED
  { name: 'Mumbai South', lat: 18.9388, lng: 72.8354 }, // /// ADDED
  { name: 'Bangalore Core', lat: 12.9716, lng: 77.5946 }, // /// ADDED
  { name: 'Chennai North', lat: 13.0827, lng: 80.2707 }, // /// ADDED
  { name: 'Kolkata Central', lat: 22.5726, lng: 88.3639 }, // /// ADDED
  { name: 'Hyderabad Tech Park', lat: 17.3850, lng: 78.4867 }, // /// ADDED
  { name: 'Pune West', lat: 18.5204, lng: 73.8567 }, // /// ADDED
  { name: 'Ahmedabad East', lat: 23.0225, lng: 72.5714 }, // /// ADDED
  { name: 'Jaipur Old City', lat: 26.9124, lng: 75.7873 }, // /// ADDED
  { name: 'Lucknow Center', lat: 26.8467, lng: 80.9462 }, // /// ADDED
  { name: 'Surat Coastal', lat: 21.1702, lng: 72.8311 }, // /// ADDED
  { name: 'Indore Ring Road', lat: 22.7196, lng: 75.8577 }, // /// ADDED
  { name: 'Nagpur HQ', lat: 21.1458, lng: 79.0882 }, // /// ADDED
  { name: 'Visakhapatnam Port', lat: 17.6868, lng: 83.2185 }, // /// ADDED
  { name: 'Bhopal Lakeside', lat: 23.2599, lng: 77.4126 }, // /// ADDED
  { name: 'Chandigarh Sector 17', lat: 30.7417, lng: 76.7683 }, // /// ADDED
  { name: 'Coimbatore Transit', lat: 11.0168, lng: 76.9558 }, // /// ADDED
  { name: 'Kochi Metro Hub', lat: 9.9312, lng: 76.2673 }, // /// ADDED
]; // /// ADDED

const sampleZoneTypes = ['traffic', 'accidents', 'floods', 'crime', 'pollution']; // /// ADDED
const sampleDescriptions = { // /// ADDED
  traffic: 'Heavy traffic congestion zone', // /// ADDED
  accidents: 'Frequent road accident hotspot', // /// ADDED
  floods: 'Flood-prone low-lying area', // /// ADDED
  crime: 'High crime reports area', // /// ADDED
  pollution: 'Air quality deterioration hotspot', // /// ADDED
}; // /// ADDED

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min; // /// ADDED

const buildSeedZones = () => { // /// ADDED
  return seedCitiesIndia.map((city, idx) => { // /// ADDED
    const severity = randomInt(1, 5); // /// ADDED
    const radius = randomInt(500, 5000); // /// ADDED
    const type = sampleZoneTypes[idx % sampleZoneTypes.length]; // /// ADDED
    return { // /// ADDED
      zone_id: `zone_${String(idx + 1).padStart(3, '0')}`, // /// ADDED
      zone_name: `${type === 'traffic' ? 'High Traffic Area' : type.charAt(0).toUpperCase() + type.slice(1)} - ${city.name}`, // /// ADDED
      latitude: city.lat, // /// ADDED
      longitude: city.lng, // /// ADDED
      radius, // /// ADDED
      severity_level: severity, // /// ADDED
      severity_label: severityMap[severity], // /// ADDED
      status: 'active', // /// ADDED
      description: sampleDescriptions[type], // /// ADDED
      metadata: { zone_type: type, risk_factors: type === 'traffic' ? ['accidents'] : [type] }, // /// ADDED
      created_at: new Date().toISOString(), // /// ADDED
      updated_at: new Date().toISOString(), // /// ADDED
    }; // /// ADDED
  }); // /// ADDED
}; // /// ADDED

const loadPredictionsSeed = () => { // /// ADDED
  try { // /// ADDED
    const filePath = path.resolve(process.cwd(), 'output', 'predictions.json'); // /// ADDED
    const raw = fs.readFileSync(filePath, 'utf-8'); // /// ADDED
    const parsed = JSON.parse(raw); // /// ADDED
    const preds = Array.isArray(parsed?.predictions) ? parsed.predictions.slice(0, 20) : []; // /// ADDED
    return preds.map((p, i) => { // /// ADDED
      const labelSrc = p.actual_severity || p.severity; // /// ADDED
      const sevLabel = labelSrc === 'Critical' ? 'Critical' : labelSrc === 'Medium' ? 'Medium' : 'Low'; // /// ADDED
      const sevLevel = sevLabel === 'Critical' ? 4 : sevLabel === 'Medium' ? 2 : 1; // /// ADDED
      return { // /// ADDED
        zone_id: `pred_${p.id}`, // /// ADDED
        zone_name: `Model Hotspot #${i + 1}`, // /// ADDED
        latitude: Number(p.latitude), // /// ADDED
        longitude: Number(p.longitude), // /// ADDED
        radius: randomInt(800, 3000), // /// ADDED
        severity_level: sevLevel, // /// ADDED
        severity_label: sevLabel, // /// ADDED
        status: 'active', // /// ADDED
        description: `ML predicted ${sevLabel} risk hotspot (confidence ${(p.confidence * 100).toFixed(1)}%)`, // /// ADDED
        metadata: { zone_type: 'model', probabilities: p.probabilities }, // /// ADDED
        created_at: new Date().toISOString(), // /// ADDED
        updated_at: new Date().toISOString(), // /// ADDED
      }; // /// ADDED
    }); // /// ADDED
  } catch (_) { // /// ADDED
    return []; // /// ADDED
  } // /// ADDED
}; // /// ADDED

const seedCriticalZones = async () => { // /// ADDED
  const zones = buildSeedZones(); // /// ADDED
  const modelZones = loadPredictionsSeed(); // /// ADDED
  const merged = [...zones, ...modelZones]; // /// ADDED
  return await upsertZonesBatch(merged); // /// ADDED
}; // /// ADDED

const getCriticalZones = async () => { // /// ADDED
  let zones = []; // /// ADDED
  try { zones = await listZones(); } catch (_) { zones = []; } // /// ADDED
  if ((!Array.isArray(zones) || zones.length === 0) && (process.env.USE_SAMPLE_DATA === 'true' || !isFirebaseReady)) { // /// ADDED
    const seeded = [...buildSeedZones(), ...loadPredictionsSeed()]; // /// ADDED
    return seeded; // /// ADDED
  } // /// ADDED
  return zones.map((z) => ({ // /// ADDED
    zone_id: z.zone_id || z.id, // /// ADDED
    zone_name: z.zone_name, // /// ADDED
    latitude: z.latitude, // /// ADDED
    longitude: z.longitude, // /// ADDED
    radius: z.radius, // /// ADDED
    severity_level: z.severity_level, // /// ADDED
    severity_label: z.severity_label || severityMap[z.severity_level] || 'Low', // /// ADDED
    status: z.status || 'active', // /// ADDED
    description: z.description || '', // /// ADDED
    metadata: z.metadata || {}, // /// ADDED
    created_at: z.created_at instanceof Date ? z.created_at.toISOString() : z.created_at, // /// ADDED
    updated_at: z.updated_at instanceof Date ? z.updated_at.toISOString() : z.updated_at, // /// ADDED
  })); // /// ADDED
}; // /// ADDED

module.exports = { // /// ADDED
  getCriticalZones, // /// ADDED
  seedCriticalZones, // /// ADDED
}; // /// ADDED