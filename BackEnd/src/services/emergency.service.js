const emergencyRepository = require('../repositories/emergency.repository');
const userRepository = require('../repositories/user.repository');

const createEmergency = async (patientId, emergencyData) => {
  const patient = await userRepository.getUserById(patientId);
  if (!patient) {
    throw new Error('Patient not found');
  }

  const emergency = await emergencyRepository.createEmergency({
    patientId,
    patientName: patient.name || patient.email,
    ...emergencyData,
  });

  return { id: emergency.id, ...emergency.data() };
};

const getPatientEmergency = async (patientId) => {
  const emergencies = await emergencyRepository.getEmergenciesByPatientId(patientId);
  const active = emergencies.find(e => ['pending', 'accepted', 'in_progress'].includes(e.status));
  return active || null;
};

const getAssignedDriver = async (emergencyId) => {
  const emergency = await emergencyRepository.getEmergencyById(emergencyId);
  if (!emergency || !emergency.driverId) {
    return null;
  }
  return await userRepository.getUserById(emergency.driverId);
};

const getAllEmergencies = async () => {
  return await emergencyRepository.getAllEmergencies();
};

module.exports = {
  createEmergency,
  getPatientEmergency,
  getAssignedDriver,
  getAllEmergencies,
};

