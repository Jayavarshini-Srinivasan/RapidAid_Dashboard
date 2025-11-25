const driverRepository = require('../repositories/driver.repository');
const emergencyRepository = require('../repositories/emergency.repository');

const toggleDutyStatus = async (driverId, isOnDuty) => {
  return await driverRepository.updateDutyStatus(driverId, isOnDuty);
};

const updateLocation = async (driverId, location) => {
  return await driverRepository.updateLiveLocation(driverId, location);
};

const getAssignedRequests = async (driverId) => {
  return await emergencyRepository.getEmergenciesByDriverId(driverId);
};

const getPendingRequests = async () => {
  return await emergencyRepository.getPendingEmergencies();
};

const acceptRequest = async (driverId, emergencyId) => {
  const emergency = await emergencyRepository.getEmergencyById(emergencyId);
  if (!emergency) {
    throw new Error('Emergency not found');
  }
  if (emergency.status !== 'pending') {
    throw new Error('Emergency already assigned');
  }

  await emergencyRepository.updateEmergency(emergencyId, {
    driverId,
    status: 'accepted',
    acceptedAt: new Date(),
  });

  return await emergencyRepository.getEmergencyById(emergencyId);
};

const rejectRequest = async (emergencyId) => {
  await emergencyRepository.updateEmergency(emergencyId, {
    status: 'rejected',
    rejectedAt: new Date(),
  });
  return await emergencyRepository.getEmergencyById(emergencyId);
};

const completeRequest = async (emergencyId) => {
  await emergencyRepository.updateEmergency(emergencyId, {
    status: 'completed',
    completedAt: new Date(),
  });
  return await emergencyRepository.getEmergencyById(emergencyId);
};

const getStats = async (driverId) => {
  return await driverRepository.getDriverStats(driverId);
};

module.exports = {
  toggleDutyStatus,
  updateLocation,
  getAssignedRequests,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
  getStats,
};

