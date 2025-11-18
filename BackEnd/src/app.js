const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const driverRoutes = require('./routes/driver.routes');
const adminRoutes = require('./routes/admin.routes');
const mlRoutes = require('./routes/ml.routes');
const caseRoutes = require('./routes/case.routes'); // /// ADDED

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/case', caseRoutes); // /// ADDED

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RapidAid API is running' });
});

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    name: 'RapidAid API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to RapidAid Emergency Medical Services API',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (requires auth)'
      },
      patient: {
        emergency: 'POST /api/patient/emergency (requires auth)',
        getEmergency: 'GET /api/patient/emergency (requires auth)',
        profile: 'GET /api/patient/profile (requires auth)'
      },
      driver: {
        toggleDuty: 'POST /api/driver/duty/toggle (requires auth)',
        updateLocation: 'POST /api/driver/location (requires auth)',
        assignedRequests: 'GET /api/driver/requests/assigned (requires auth)'
      },
      admin: {
        drivers: 'GET /api/admin/drivers (requires auth)',
        patients: 'GET /api/admin/patients (requires auth)',
        emergencies: 'GET /api/admin/emergencies (requires auth)',
        dashboardMetrics: 'GET /api/admin/dashboard/metrics (requires auth)'
      }
    },
    documentation: 'See README.md for full API documentation'
  });
});

module.exports = app;

