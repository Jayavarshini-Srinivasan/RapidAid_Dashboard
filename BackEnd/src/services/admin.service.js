const userRepository = require('../repositories/user.repository');
const emergencyRepository = require('../repositories/emergency.repository');
const driverRepository = require('../repositories/driver.repository');

const getAllDrivers = async () => {
  return await userRepository.getAllUsersByRole('driver');
};

const getAllPatients = async () => {
  return await userRepository.getAllUsersByRole('patient');
};

const getAllEmergencies = async () => {
  return await emergencyRepository.getAllEmergencies();
};

const getAllLiveLocations = async () => {
  return await driverRepository.getAllLiveLocations();
};

const getDashboardMetrics = async (timeframe = '24h') => {
  const now = new Date();
  const since = new Date(now);
  if (timeframe === '7d') {
    since.setDate(now.getDate() - 7);
  } else if (timeframe === '30d') {
    since.setDate(now.getDate() - 30);
  } else {
    since.setHours(now.getHours() - 24);
  }

  const drivers = await getAllDrivers();
  const patients = await getAllPatients();
  const emergencies = await getAllEmergencies();
  const liveLocations = await getAllLiveLocations();

  const toDate = (val) => {
    if (!val) return null;
    try {
      return typeof val.toDate === 'function' ? val.toDate() : new Date(val);
    } catch (_) {
      return null;
    }
  };

  const emergenciesSince = emergencies.filter((e) => {
    const created = toDate(e.createdAt);
    return created && created >= since;
  });

  const completedSince = emergencies.filter((e) => {
    const completed = toDate(e.completedAt);
    return e.status === 'completed' && completed && completed >= since;
  });

  const activeEmergencies = emergenciesSince.filter((e) =>
    ['pending', 'accepted', 'in_progress'].includes(e.status)
  );

  const patientsSince = patients.filter((p) => {
    const created = toDate(p.createdAt);
    return created && created >= since;
  });

  const driversSince = drivers.filter((d) => {
    const created = toDate(d.createdAt);
    return created && created >= since;
  });

  const liveSince = liveLocations.filter((l) => {
    const ts = toDate(l.timestamp);
    return ts && ts >= since;
  });

  const onDutyDrivers = drivers.filter((d) => d.isOnDuty);

  return {
    totalDrivers: driversSince.length,
    onDutyDrivers: onDutyDrivers.length,
    totalPatients: patientsSince.length,
    totalEmergencies: emergenciesSince.length,
    activeEmergencies: activeEmergencies.length,
    completedEmergencies: completedSince.length,
    liveTracking: liveSince.length,
  };
};

module.exports = {
  getAllDrivers,
  getAllPatients,
  getAllEmergencies,
  getAllLiveLocations,
  getDashboardMetrics,
};

