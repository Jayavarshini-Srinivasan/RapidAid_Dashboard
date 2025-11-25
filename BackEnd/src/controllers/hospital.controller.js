const { loadHospitalsCached, findNearestHospital, generateSimpleRoute, seedHospitalsIndia, getHospitalById, createHospital, updateHospital, deleteHospital } = require('../services/hospital.service'); // /// ADDED
const { storeRouteHistory } = require('../services/route.service'); // /// ADDED

const list = async (req, res) => { // /// ADDED
  try { // /// ADDED
    const hospitals = await loadHospitalsCached(); // /// ADDED
    return res.json({ success: true, data: hospitals }); // /// ADDED
  } catch (e) { // /// ADDED
    return res.status(500).json({ success: false, message: e.message }); // /// ADDED
  } // /// ADDED
}; // /// ADDED

const nearest = async (req, res) => { // /// ADDED
  try { // /// ADDED
    const lat = parseFloat(req.query.lat); // /// ADDED
    const lng = parseFloat(req.query.lng); // /// ADDED
    const type = req.query.type; // /// ADDED
    if (Number.isNaN(lat) || Number.isNaN(lng)) return res.status(400).json({ success: false, message: 'Invalid coordinates' }); // /// ADDED
    const result = await findNearestHospital({ lat, lng, type }); // /// ADDED
    return res.json({ success: true, data: result }); // /// ADDED
  } catch (e) { // /// ADDED
    return res.status(500).json({ success: false, message: e.message }); // /// ADDED
  } // /// ADDED
}; // /// ADDED

const route = async (req, res) => { // /// ADDED
  try { // /// ADDED
    const { accidentLat, accidentLng, patientLat, patientLng, hospitalId } = req.body; // /// ADDED
    if ([accidentLat, accidentLng, patientLat, patientLng].some((v) => typeof v !== 'number')) { // /// ADDED
      return res.status(400).json({ success: false, message: 'Invalid coordinates' }); // /// ADDED
    } // /// ADDED
    const hospital = await getHospitalById(hospitalId); // /// ADDED
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' }); // /// ADDED
    const payload = { // /// ADDED
      accident: { lat: accidentLat, lng: accidentLng }, // /// ADDED
      patient: { lat: patientLat, lng: patientLng }, // /// ADDED
      hospital, // /// ADDED
    }; // /// ADDED
    const routeData = generateSimpleRoute(payload); // /// ADDED
    if (req.body.storeHistory) { // /// ADDED
      try { // /// ADDED
        await storeRouteHistory({ patientId: req.body.patientId, hospitalId, path: routeData.path }); // /// ADDED
      } catch (_) { /* swallow storage error */ } // /// ADDED
    } // /// ADDED
    return res.json({ success: true, data: routeData }); // /// ADDED
  } catch (e) { // /// ADDED
    return res.status(500).json({ success: false, message: e.message }); // /// ADDED
  } // /// ADDED
}; // /// ADDED

const seed = async (req, res) => { // /// ADDED
  try { // /// ADDED
    const data = await seedHospitalsIndia(); // /// ADDED
    return res.json({ success: true, data }); // /// ADDED
  } catch (e) { // /// ADDED
    return res.status(500).json({ success: false, message: e.message }); // /// ADDED
  } // /// ADDED
}; // /// ADDED

const create = async (req, res) => { // /// ADDED
  try { // /// ADDED
    const hospital = await createHospital(req.body); // /// ADDED
    return res.status(201).json({ success: true, data: hospital }); // /// ADDED
  } catch (e) { // /// ADDED
    return res.status(400).json({ success: false, message: e.message }); // /// ADDED
  } // /// ADDED
}; // /// ADDED

const update = async (req, res) => { // /// ADDED
  try { // /// ADDED
    const hospital = await updateHospital(req.params.id, req.body); // /// ADDED
    return res.json({ success: true, data: hospital }); // /// ADDED
  } catch (e) { // /// ADDED
    return res.status(400).json({ success: false, message: e.message }); // /// ADDED
  } // /// ADDED
}; // /// ADDED

const remove = async (req, res) => { // /// ADDED
  try { // /// ADDED
    const result = await deleteHospital(req.params.id); // /// ADDED
    return res.json({ success: true, data: result }); // /// ADDED
  } catch (e) { // /// ADDED
    return res.status(400).json({ success: false, message: e.message }); // /// ADDED
  } // /// ADDED
}; // /// ADDED

module.exports = { // /// ADDED
  list, // /// ADDED
  nearest, // /// ADDED
  route, // /// ADDED
  seed, // /// ADDED
  create, // /// ADDED
  update, // /// ADDED
  remove, // /// ADDED
}; // /// ADDED