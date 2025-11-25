const caseService = require('../services/case.service'); // /// ADDED
const { seedHospitalsIndia } = require('../services/hospital.service'); // /// ADDED

const broadcast = (req, event, payload) => { // /// ADDED
  const io = req.app.get('io'); // /// ADDED
  if (io) { // /// ADDED
    io.emit(event, payload); // /// ADDED
  } // /// ADDED
}; // /// ADDED

const updateCaseLocation = async (req, res) => { // /// ADDED
  try { // /// ADDED
    const { id } = req.params; // /// ADDED
    const { lat, lng } = req.body; // /// ADDED
    const updatedCase = await caseService.updateLocation(id, { lat, lng }); // /// ADDED
    if (!updatedCase) { // /// ADDED
      return res.status(404).json({ success: false, message: 'Case not found' }); // /// ADDED
    } // /// ADDED
    broadcast(req, 'updateCaseLocation', { caseId: id, location: { lat, lng } }); // /// ADDED
    return res.json({ success: true, data: updatedCase }); // /// ADDED
  } catch (error) { // /// ADDED
    return res.status(400).json({ success: false, message: error.message }); // /// ADDED
  } // /// ADDED
}; // /// ADDED

const updateCaseSeverity = async (req, res) => { // /// ADDED
  try { // /// ADDED
    const { id } = req.params; // /// ADDED
    const { severity } = req.body; // /// ADDED
    const normalizedSeverity = severity?.toUpperCase(); // /// ADDED
    const updatedCase = await caseService.updateSeverity(id, normalizedSeverity); // /// ADDED
    if (!updatedCase) { // /// ADDED
      return res.status(404).json({ success: false, message: 'Case not found' }); // /// ADDED
    } // /// ADDED
    broadcast(req, 'updateCaseSeverity', { caseId: id, severity: normalizedSeverity }); // /// ADDED
    return res.json({ success: true, data: updatedCase }); // /// ADDED
  } catch (error) { // /// ADDED
    return res.status(400).json({ success: false, message: error.message }); // /// ADDED
  } // /// ADDED
}; // /// ADDED

module.exports = { // /// ADDED
  updateCaseLocation, // /// ADDED
  updateCaseSeverity, // /// ADDED
  seedSampleCases: async (req, res) => { // /// ADDED
    try { // /// ADDED
      await seedHospitalsIndia(); // /// ADDED
      const data = await caseService.seedSampleCases(); // /// ADDED
      return res.json({ success: true, data }); // /// ADDED
    } catch (error) { // /// ADDED
      return res.status(500).json({ success: false, message: error.message }); // /// ADDED
    } // /// ADDED
  }, // /// ADDED
}; // /// ADDED

