const express = require('express'); // /// ADDED
const router = express.Router(); // /// ADDED
const hospitalController = require('../controllers/hospital.controller'); // /// ADDED

router.get('/', hospitalController.list); // /// ADDED
router.get('/nearest', hospitalController.nearest); // /// ADDED
router.get('/:id', async (req, res) => { // /// ADDED
  try { // /// ADDED
    const { getHospitalById } = require('../services/hospital.service'); // /// ADDED
    const hospital = await getHospitalById(req.params.id); // /// ADDED
    if (!hospital) return res.status(404).json({ success: false, message: 'Not found' }); // /// ADDED
    return res.json({ success: true, data: hospital }); // /// ADDED
  } catch (e) { // /// ADDED
    return res.status(500).json({ success: false, message: e.message }); // /// ADDED
  } // /// ADDED
}); // /// ADDED
router.post('/route', hospitalController.route); // /// ADDED
router.post('/seed', hospitalController.seed); // /// ADDED
router.post('/', hospitalController.create); // /// ADDED
router.patch('/:id', hospitalController.update); // /// ADDED
router.delete('/:id', hospitalController.remove); // /// ADDED

module.exports = router; // /// ADDED