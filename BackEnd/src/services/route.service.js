const { addRouteHistory } = require('../repositories/route.repository'); // /// ADDED

const storeRouteHistory = async ({ patientId, hospitalId, path }) => { // /// ADDED
  return addRouteHistory({ patientId, hospitalId, routeCoordinates: path }); // /// ADDED
}; // /// ADDED

module.exports = { // /// ADDED
  storeRouteHistory, // /// ADDED
}; // /// ADDED