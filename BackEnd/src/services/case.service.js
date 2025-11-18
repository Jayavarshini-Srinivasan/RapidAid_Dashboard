const { upsertCaseLocation, upsertCaseSeverity, seedCaseBatch } = require('../repositories/case.repository'); // /// ADDED

const updateLocation = async (caseId, location) => { // /// ADDED
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') { // /// ADDED
    throw new Error('Invalid location payload'); // /// ADDED
  } // /// ADDED
  return upsertCaseLocation(caseId, location); // /// ADDED
}; // /// ADDED

const updateSeverity = async (caseId, severity) => { // /// ADDED
  const allowed = ['LOW', 'MEDIUM', 'HIGH']; // /// ADDED
  if (!allowed.includes(severity)) { // /// ADDED
    throw new Error('Invalid severity value'); // /// ADDED
  } // /// ADDED
  return upsertCaseSeverity(caseId, severity); // /// ADDED
}; // /// ADDED

const seedSampleCases = async () => { // /// ADDED
  const sampleCases = [ // /// ADDED
    { // /// ADDED
      id: 'case-delhi-a21', // /// ADDED
      unitLabel: 'A21', // /// ADDED
      operator: 'Emily Chen', // /// ADDED
      patientName: 'Aarav Sharma', // /// ADDED
      patientPhone: '+91 98100 22111', // /// ADDED
      intersection: 'Connaught Place, New Delhi', // /// ADDED
      speed: '44 mph', // /// ADDED
      eta: '5 min', // /// ADDED
      location: { lat: 28.6328, lng: 77.2197 }, // /// ADDED
      severity: 'HIGH', // /// ADDED
    }, // /// ADDED
    { // /// ADDED
      id: 'case-mumbai-b11', // /// ADDED
      unitLabel: 'B11', // /// ADDED
      operator: 'Rohan Desai', // /// ADDED
      patientName: 'Ishita Kapoor', // /// ADDED
      patientPhone: '+91 98202 44333', // /// ADDED
      intersection: 'Marine Drive, Mumbai', // /// ADDED
      speed: '35 mph', // /// ADDED
      eta: '8 min', // /// ADDED
      location: { lat: 19.076, lng: 72.8777 }, // /// ADDED
      severity: 'MEDIUM', // /// ADDED
    }, // /// ADDED
    { // /// ADDED
      id: 'case-bengaluru-c07', // /// ADDED
      unitLabel: 'C07', // /// ADDED
      operator: 'Priya Nair', // /// ADDED
      patientName: 'Sanjay Rao', // /// ADDED
      patientPhone: '+91 98450 77889', // /// ADDED
      intersection: 'MG Road, Bengaluru', // /// ADDED
      speed: '38 mph', // /// ADDED
      eta: '6 min', // /// ADDED
      location: { lat: 12.9735, lng: 77.6082 }, // /// ADDED
      severity: 'LOW', // /// ADDED
    }, // /// ADDED
    { // /// ADDED
      id: 'case-hyderabad-d14', // /// ADDED
      unitLabel: 'D14', // /// ADDED
      operator: 'Ananya Reddy', // /// ADDED
      patientName: 'Kabir Malhotra', // /// ADDED
      patientPhone: '+91 98765 11223', // /// ADDED
      intersection: 'HITEC City, Hyderabad', // /// ADDED
      speed: '41 mph', // /// ADDED
      eta: '7 min', // /// ADDED
      location: { lat: 17.4474, lng: 78.3762 }, // /// ADDED
      severity: 'HIGH', // /// ADDED
    }, // /// ADDED
    { // /// ADDED
      id: 'case-pune-e03', // /// ADDED
      unitLabel: 'E03', // /// ADDED
      operator: 'Vikram Kulkarni', // /// ADDED
      patientName: 'Neha Joshi', // /// ADDED
      patientPhone: '+91 98600 55667', // /// ADDED
      intersection: 'FC Road, Pune', // /// ADDED
      speed: '39 mph', // /// ADDED
      eta: '6 min', // /// ADDED
      location: { lat: 18.5204, lng: 73.8567 }, // /// ADDED
      severity: 'MEDIUM', // /// ADDED
    }, // /// ADDED
    { // /// ADDED
      id: 'case-chennai-f19', // /// ADDED
      unitLabel: 'F19', // /// ADDED
      operator: 'Meera Krishnan', // /// ADDED
      patientName: 'Arjun Iyer', // /// ADDED
      patientPhone: '+91 98404 88990', // /// ADDED
      intersection: 'T. Nagar, Chennai', // /// ADDED
      speed: '37 mph', // /// ADDED
      eta: '9 min', // /// ADDED
      location: { lat: 13.0418, lng: 80.2337 }, // /// ADDED
      severity: 'HIGH', // /// ADDED
    }, // /// ADDED
    { // /// ADDED
      id: 'case-ahmedabad-g05', // /// ADDED
      unitLabel: 'G05', // /// ADDED
      operator: 'Kunal Patel', // /// ADDED
      patientName: 'Pooja Shah', // /// ADDED
      patientPhone: '+91 98790 22331', // /// ADDED
      intersection: 'CG Road, Ahmedabad', // /// ADDED
      speed: '33 mph', // /// ADDED
      eta: '4 min', // /// ADDED
      location: { lat: 23.0225, lng: 72.5714 }, // /// ADDED
      severity: 'LOW', // /// ADDED
    }, // /// ADDED
    { // /// ADDED
      id: 'case-kolkata-h12', // /// ADDED
      unitLabel: 'H12', // /// ADDED
      operator: 'Sourav Banerjee', // /// ADDED
      patientName: 'Ananya Mukherjee', // /// ADDED
      patientPhone: '+91 98300 11445', // /// ADDED
      intersection: 'Park Street, Kolkata', // /// ADDED
      speed: '36 mph', // /// ADDED
      eta: '7 min', // /// ADDED
      location: { lat: 22.5535, lng: 88.3507 }, // /// ADDED
      severity: 'MEDIUM', // /// ADDED
    }, // /// ADDED
  ]; // /// ADDED
  return seedCaseBatch(sampleCases); // /// ADDED
}; // /// ADDED

module.exports = { // /// ADDED
  updateLocation, // /// ADDED
  updateSeverity, // /// ADDED
  seedSampleCases, // /// ADDED
}; // /// ADDED

