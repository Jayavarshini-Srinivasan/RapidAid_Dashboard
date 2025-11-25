const { listHospitals, getHospitalById, createHospital, updateHospital, deleteHospital, seedHospitalsBatch } = require('../repositories/hospital.repository'); // /// ADDED

let hospitalCache = null; // /// ADDED
let cacheTimestamp = 0; // /// ADDED
const CACHE_TTL_MS = 5 * 60 * 1000; // /// ADDED

const loadHospitalsCached = async () => { // /// ADDED
  const now = Date.now(); // /// ADDED
  if (hospitalCache && now - cacheTimestamp < CACHE_TTL_MS) return hospitalCache; // /// ADDED
  hospitalCache = await listHospitals(); // /// ADDED
  cacheTimestamp = now; // /// ADDED
  return hospitalCache; // /// ADDED
}; // /// ADDED

const haversineKm = (a, b) => { // /// ADDED
  if (!a || !b) return Infinity; // /// ADDED
  const toRad = (v) => (v * Math.PI) / 180; // /// ADDED
  const R = 6371; // /// ADDED
  const dLat = toRad(b.lat - a.lat); // /// ADDED
  const dLon = toRad(b.lng - a.lng); // /// ADDED
  const lat1 = toRad(a.lat); // /// ADDED
  const lat2 = toRad(b.lat); // /// ADDED
  const sinDLat = Math.sin(dLat / 2); // /// ADDED
  const sinDLon = Math.sin(dLon / 2); // /// ADDED
  const c = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2); // /// ADDED
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c)); // /// ADDED
  return R * d; // /// ADDED
}; // /// ADDED

const findNearestHospital = async ({ lat, lng, type }) => { // /// ADDED
  const hospitals = await loadHospitalsCached(); // /// ADDED
  const filtered = type ? hospitals.filter((h) => (h.type || '').toLowerCase() === type.toLowerCase()) : hospitals; // /// ADDED
  let best = null; // /// ADDED
  let bestDist = Infinity; // /// ADDED
  filtered.forEach((h) => { // /// ADDED
    const dist = haversineKm({ lat, lng }, { lat: h.latitude, lng: h.longitude }); // /// ADDED
    if (dist < bestDist) { bestDist = dist; best = h; } // /// ADDED
  }); // /// ADDED
  return { hospital: best, distanceKm: bestDist }; // /// ADDED
}; // /// ADDED

const generateSimpleRoute = ({ accident, patient, hospital }) => { // /// ADDED
  const path = [ // /// ADDED
    { lat: accident.lat, lng: accident.lng }, // /// ADDED
    { lat: patient.lat, lng: patient.lng }, // /// ADDED
    { lat: hospital.latitude, lng: hospital.longitude }, // /// ADDED
  ]; // /// ADDED
  return { path, points: path.length, totalKm: haversineKm(accident, patient) + haversineKm(patient, { lat: hospital.latitude, lng: hospital.longitude }) }; // /// ADDED
}; // /// ADDED

const seedHospitalsIndia = async () => { // /// ADDED
  const hospitals = [ // /// ADDED
    { name: 'AIIMS New Delhi', address: 'Ansari Nagar, New Delhi', latitude: 28.5672, longitude: 77.2100, contact: '+91-11-26588500', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'New Delhi', state: 'Delhi' }, // /// ADDED
    { name: 'Safdarjung Hospital', address: 'Ring Road, New Delhi', latitude: 28.5677, longitude: 77.2109, contact: '+91-11-26165060', facilities: ['emergency','icu'], type: 'general', city: 'New Delhi', state: 'Delhi' }, // /// ADDED
    { name: 'KEM Hospital', address: 'Parel, Mumbai', latitude: 18.9960, longitude: 72.8384, contact: '+91-22-24100000', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Mumbai', state: 'Maharashtra' }, // /// ADDED
    { name: 'Lilavati Hospital', address: 'Bandra, Mumbai', latitude: 19.0623, longitude: 72.8364, contact: '+91-22-26751000', facilities: ['icu','emergency'], type: 'private', city: 'Mumbai', state: 'Maharashtra' }, // /// ADDED
    { name: 'NIMHANS', address: 'Hosur Road, Bengaluru', latitude: 12.9437, longitude: 77.5937, contact: '+91-80-26995000', facilities: ['trauma','icu'], type: 'trauma', city: 'Bengaluru', state: 'Karnataka' }, // /// ADDED
    { name: 'Fortis Hospital Bannerghatta', address: 'Bannerghatta Road, Bengaluru', latitude: 12.9086, longitude: 77.6018, contact: '+91-80-66214444', facilities: ['icu','emergency'], type: 'private', city: 'Bengaluru', state: 'Karnataka' }, // /// ADDED
    { name: 'Gandhi Hospital', address: 'Secunderabad, Hyderabad', latitude: 17.4399, longitude: 78.5016, contact: '+91-40-27505566', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Hyderabad', state: 'Telangana' }, // /// ADDED
    { name: 'Apollo Hospitals Hyderabad', address: 'Jubilee Hills, Hyderabad', latitude: 17.4275, longitude: 78.4120, contact: '+91-40-60601066', facilities: ['icu','emergency'], type: 'private', city: 'Hyderabad', state: 'Telangana' }, // /// ADDED
    { name: 'Sassoon General Hospital', address: 'Pune', latitude: 18.5294, longitude: 73.8730, contact: '+91-20-26128000', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Pune', state: 'Maharashtra' }, // /// ADDED
    { name: 'Ruby Hall Clinic', address: 'Sangamvadi, Pune', latitude: 18.5363, longitude: 73.8877, contact: '+91-20-66427000', facilities: ['icu','emergency'], type: 'private', city: 'Pune', state: 'Maharashtra' }, // /// ADDED
    { name: 'Rajiv Gandhi Govt General Hospital', address: 'Park Town, Chennai', latitude: 13.0827, longitude: 80.2707, contact: '+91-44-25305000', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Chennai', state: 'Tamil Nadu' }, // /// ADDED
    { name: 'Apollo Hospitals Chennai', address: 'Greams Road, Chennai', latitude: 13.0560, longitude: 80.2515, contact: '+91-44-28293333', facilities: ['icu','emergency'], type: 'private', city: 'Chennai', state: 'Tamil Nadu' }, // /// ADDED
    { name: 'Civil Hospital Ahmedabad', address: 'Asarwa, Ahmedabad', latitude: 23.0506, longitude: 72.6031, contact: '+91-79-22681000', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Ahmedabad', state: 'Gujarat' }, // /// ADDED
    { name: 'Sterling Hospitals', address: 'Gurukul, Ahmedabad', latitude: 23.0400, longitude: 72.5169, contact: '+91-79-40012345', facilities: ['icu','emergency'], type: 'private', city: 'Ahmedabad', state: 'Gujarat' }, // /// ADDED
    { name: 'SSKM Hospital', address: 'AJC Bose Rd, Kolkata', latitude: 22.5396, longitude: 88.3460, contact: '+91-33-22230083', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Kolkata', state: 'West Bengal' }, // /// ADDED
    { name: 'AMRI Hospitals', address: 'Dhakuria, Kolkata', latitude: 22.5019, longitude: 88.3700, contact: '+91-33-66800000', facilities: ['icu','emergency'], type: 'private', city: 'Kolkata', state: 'West Bengal' }, // /// ADDED
    { name: 'IGIMS Patna', address: 'Sheikhpura, Patna', latitude: 25.6110, longitude: 85.0910, contact: '+91-612-2287478', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Patna', state: 'Bihar' }, // /// ADDED
    { name: 'SCB Medical College', address: 'Cuttack', latitude: 20.4695, longitude: 85.8790, contact: '+91-671-2414027', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Cuttack', state: 'Odisha' }, // /// ADDED
    { name: 'PGIMER Chandigarh', address: 'Sector 12, Chandigarh', latitude: 30.7600, longitude: 76.7730, contact: '+91-172-2747585', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Chandigarh', state: 'Chandigarh' }, // /// ADDED
    { name: 'SMS Hospital Jaipur', address: 'Jaipur', latitude: 26.9124, longitude: 75.7873, contact: '+91-141-2560291', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Jaipur', state: 'Rajasthan' }, // /// ADDED
    { name: 'GMCH Guwahati', address: 'Bhangagarh, Guwahati', latitude: 26.1900, longitude: 91.7610, contact: '+91-361-2132751', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Guwahati', state: 'Assam' }, // /// ADDED
    { name: 'NEIGRIHMS Shillong', address: 'Mawdiangdiang, Shillong', latitude: 25.5770, longitude: 91.8963, contact: '+91-364-2538020', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Shillong', state: 'Meghalaya' }, // /// ADDED
    { name: 'RIMS Imphal', address: 'Lamphelpat, Imphal', latitude: 24.8180, longitude: 93.9360, contact: '+91-385-2414084', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Imphal', state: 'Manipur' }, // /// ADDED
    { name: 'Aizawl Civil Hospital', address: 'Aizawl', latitude: 23.7271, longitude: 92.7176, contact: '+91-389-2316274', facilities: ['icu','emergency'], type: 'general', city: 'Aizawl', state: 'Mizoram' }, // /// ADDED
    { name: 'Naga Hospital Authority', address: 'Kohima', latitude: 25.6751, longitude: 94.1086, contact: '+91-370-2243490', facilities: ['icu','emergency'], type: 'general', city: 'Kohima', state: 'Nagaland' }, // /// ADDED
    { name: 'Bir Tikendrajit Hospital', address: 'Agartala', latitude: 23.8315, longitude: 91.2868, contact: '+91-381-2324001', facilities: ['icu','emergency'], type: 'general', city: 'Agartala', state: 'Tripura' }, // /// ADDED
    { name: 'BPMC Bengaluru', address: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, contact: '+91-80-22220000', facilities: ['emergency'], type: 'general', city: 'Bengaluru', state: 'Karnataka' }, // /// ADDED
    { name: 'IGMC Shimla', address: 'Ridge, Shimla', latitude: 31.1048, longitude: 77.1734, contact: '+91-177-2804251', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Shimla', state: 'Himachal Pradesh' }, // /// ADDED
    { name: 'SKIMS Srinagar', address: 'Soura, Srinagar', latitude: 34.1191, longitude: 74.8030, contact: '+91-194-2401013', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Srinagar', state: 'Jammu & Kashmir' }, // /// ADDED
    { name: 'AIIMS Bhopal', address: 'Saket Nagar, Bhopal', latitude: 23.1993, longitude: 77.4475, contact: '+91-755-2673100', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Bhopal', state: 'Madhya Pradesh' }, // /// ADDED
    { name: 'AIIMS Raipur', address: 'Tata Steel Rd, Raipur', latitude: 21.2514, longitude: 81.6296, contact: '+91-771-2573777', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Raipur', state: 'Chhattisgarh' }, // /// ADDED
    { name: 'AIIMS Bhubaneswar', address: 'Sijua, Bhubaneswar', latitude: 20.2666, longitude: 85.7616, contact: '+91-674-2476789', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Bhubaneswar', state: 'Odisha' }, // /// ADDED
    { name: 'AIIMS Jodhpur', address: 'Basni, Jodhpur', latitude: 26.2389, longitude: 73.0240, contact: '+91-291-6723000', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Jodhpur', state: 'Rajasthan' }, // /// ADDED
    { name: 'AIIMS Rishikesh', address: 'Virbhadra Rd, Rishikesh', latitude: 30.0875, longitude: 78.2676, contact: '+91-135-2462999', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Rishikesh', state: 'Uttarakhand' }, // /// ADDED
    { name: 'AIIMS Patna', address: 'Phulwari Sharif, Patna', latitude: 25.5887, longitude: 85.0903, contact: '+91-612-2451070', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Patna', state: 'Bihar' }, // /// ADDED
    { name: 'AIIMS Nagpur', address: 'Mihan, Nagpur', latitude: 21.1322, longitude: 79.0532, contact: '+91-712-6985300', facilities: ['trauma','icu','emergency'], type: 'trauma', city: 'Nagpur', state: 'Maharashtra' }, // /// ADDED
  ]; // /// ADDED
  return seedHospitalsBatch(hospitals); // /// ADDED
}; // /// ADDED

module.exports = { // /// ADDED
  loadHospitalsCached, // /// ADDED
  findNearestHospital, // /// ADDED
  generateSimpleRoute, // /// ADDED
  seedHospitalsIndia, // /// ADDED
  getHospitalById, // /// ADDED
  createHospital, // /// ADDED
  updateHospital, // /// ADDED
  deleteHospital, // /// ADDED
}; // /// ADDED