import axios from 'axios';
import { auth } from '../../firebaseConfig';
import { db } from '../../firebaseConfig';
import { writeBatch, doc, collection } from 'firebase/firestore';
import {
  sampleDrivers,
  samplePatients,
  sampleEmergencies,
  sampleHospitals,
  sampleHospitalCapacity,
  sampleDashboardMetrics,
  simulateDelay,
} from '../utils/sampleData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_SAMPLE_DATA = import.meta.env.VITE_USE_SAMPLE_DATA === 'true' || false;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to create mock API response
const createMockResponse = (data) => {
  return {
    data: {
      success: true,
      data,
      message: 'Success',
    },
  };
};

// Admin API endpoints
export const adminAPI = {
  // Drivers
  getDrivers: async () => {
    if (USE_SAMPLE_DATA) {
      await simulateDelay();
      return createMockResponse(sampleDrivers);
    }
    try {
      return await api.get('/admin/drivers');
    } catch (error) {
      // Fallback to sample data if API fails
      console.warn('API failed, using sample data:', error.message);
      await simulateDelay();
      return createMockResponse(sampleDrivers);
    }
  },
  
  // Patients
  getPatients: async () => {
    if (USE_SAMPLE_DATA) {
      await simulateDelay();
      return createMockResponse(samplePatients);
    }
    try {
      return await api.get('/admin/patients');
    } catch (error) {
      console.warn('API failed, using sample data:', error.message);
      await simulateDelay();
      return createMockResponse(samplePatients);
    }
  },
  
  // Emergency Requests
  getActiveRequests: async () => {
    if (USE_SAMPLE_DATA) {
      await simulateDelay();
      const active = sampleEmergencies.filter(e => e.status !== 'completed');
      return createMockResponse(active);
    }
    try {
      return await api.get('/admin/requests/active');
    } catch (error) {
      console.warn('API failed, using sample data:', error.message);
      await simulateDelay();
      const active = sampleEmergencies.filter(e => e.status !== 'completed');
      return createMockResponse(active);
    }
  },
  
  assignDriver: async (requestId, driverId) => {
    if (USE_SAMPLE_DATA) {
      await simulateDelay();
      return createMockResponse({ success: true, message: 'Driver assigned' });
    }
    try {
      return await api.post('/admin/assign-driver', { requestId, driverId });
    } catch (error) {
      console.warn('API failed, using sample data:', error.message);
      await simulateDelay();
      return createMockResponse({ success: true, message: 'Driver assigned (mock)' });
    }
  },
  
  completeRequest: async (requestId) => {
    if (USE_SAMPLE_DATA) {
      await simulateDelay();
      return createMockResponse({ success: true, message: 'Request completed' });
    }
    try {
      return await api.patch(`/admin/request/complete/${requestId}`);
    } catch (error) {
      console.warn('API failed, using sample data:', error.message);
      await simulateDelay();
      return createMockResponse({ success: true, message: 'Request completed (mock)' });
    }
  },
  
  // Hospitals
  getHospitals: async () => {
    if (USE_SAMPLE_DATA) {
      await simulateDelay();
      return createMockResponse(sampleHospitals);
    }
    try {
      return await api.get('/admin/hospitals');
    } catch (error) {
      console.warn('API failed, using sample data:', error.message);
      await simulateDelay();
      return createMockResponse(sampleHospitals);
    }
  },
  
  // Hospital Capacity
  getHospitalCapacity: async () => {
    if (USE_SAMPLE_DATA) {
      await simulateDelay();
      return createMockResponse(sampleHospitalCapacity);
    }
    try {
      return await api.get('/admin/hospitals/capacity');
    } catch (error) {
      console.warn('API failed, using sample data:', error.message);
      await simulateDelay();
      return createMockResponse(sampleHospitalCapacity);
    }
  },
  
  // Dashboard
  getDashboardMetrics: async (timeframe = '24h') => {
    if (USE_SAMPLE_DATA) {
      await simulateDelay();
      const scaleEmerg = timeframe === '7d' ? 1.6 : timeframe === '30d' ? 2.4 : 1;
      const scaleDrivers = timeframe === '7d' ? 1.2 : timeframe === '30d' ? 1.4 : 1;
      const scalePatients = timeframe === '7d' ? 1.4 : timeframe === '30d' ? 2.0 : 1.05;
      const scaleBeds = timeframe === '7d' ? 1.35 : timeframe === '30d' ? 1.7 : 1;
      const scaled = {
        ...sampleDashboardMetrics,
        totalDrivers: Math.max(1, Math.round(sampleDashboardMetrics.totalDrivers * scaleDrivers)),
        onDutyDrivers: Math.max(1, Math.round(sampleDashboardMetrics.onDutyDrivers * Math.min(scaleDrivers * 1.1, 1.8))),
        totalPatients: Math.max(1, Math.round(sampleDashboardMetrics.totalPatients * scalePatients)),
        totalEmergencies: Math.max(0, Math.round(sampleDashboardMetrics.totalEmergencies * scaleEmerg)),
        activeEmergencies: Math.max(0, Math.round(sampleDashboardMetrics.activeEmergencies * scaleEmerg)),
        completedEmergencies: Math.max(0, Math.round(sampleDashboardMetrics.completedEmergencies * Math.max(scaleEmerg - 0.3, 1))),
        liveTracking: Math.max(0, Math.round(sampleDashboardMetrics.liveTracking * Math.min(scaleEmerg, 2))),
        totalHospitals: sampleDashboardMetrics.totalHospitals,
        availableBeds: Math.max(1, Math.round(sampleDashboardMetrics.availableBeds * scaleBeds)),
      };
      return createMockResponse(scaled);
    }
    try {
      return await api.get('/admin/dashboard/metrics', { params: { timeframe } });
    } catch (error) {
      console.warn('API failed, using sample data:', error.message);
      await simulateDelay();
      const scaleEmerg = timeframe === '7d' ? 1.6 : timeframe === '30d' ? 2.4 : 1;
      const scaleDrivers = timeframe === '7d' ? 1.2 : timeframe === '30d' ? 1.4 : 1;
      const scalePatients = timeframe === '7d' ? 1.4 : timeframe === '30d' ? 2.0 : 1.05;
      const scaleBeds = timeframe === '7d' ? 1.35 : timeframe === '30d' ? 1.7 : 1;
      const scaled = {
        ...sampleDashboardMetrics,
        totalDrivers: Math.max(1, Math.round(sampleDashboardMetrics.totalDrivers * scaleDrivers)),
        onDutyDrivers: Math.max(1, Math.round(sampleDashboardMetrics.onDutyDrivers * Math.min(scaleDrivers * 1.1, 1.8))),
        totalPatients: Math.max(1, Math.round(sampleDashboardMetrics.totalPatients * scalePatients)),
        totalEmergencies: Math.max(0, Math.round(sampleDashboardMetrics.totalEmergencies * scaleEmerg)),
        activeEmergencies: Math.max(0, Math.round(sampleDashboardMetrics.activeEmergencies * scaleEmerg)),
        completedEmergencies: Math.max(0, Math.round(sampleDashboardMetrics.completedEmergencies * Math.max(scaleEmerg - 0.3, 1))),
        liveTracking: Math.max(0, Math.round(sampleDashboardMetrics.liveTracking * Math.min(scaleEmerg, 2))),
        totalHospitals: sampleDashboardMetrics.totalHospitals,
        availableBeds: Math.max(1, Math.round(sampleDashboardMetrics.availableBeds * scaleBeds)),
      };
      return createMockResponse(scaled);
    }
  },
  
  // Emergencies
  getEmergencies: async () => {
    if (USE_SAMPLE_DATA) {
      await simulateDelay();
      return createMockResponse(sampleEmergencies);
    }
    try {
      return await api.get('/admin/emergencies');
    } catch (error) {
      console.warn('API failed, using sample data:', error.message);
      await simulateDelay();
      return createMockResponse(sampleEmergencies);
    }
  },

  // /// ADDED Critical Zones
  getCriticalZones: async () => { // /// ADDED
    try { // /// ADDED
      return await api.get('/admin/critical-zones'); // /// ADDED
    } catch (error) { // /// ADDED
      try { // /// ADDED
        const alt = await axios.get((API_BASE_URL.replace('5000','5001')) + '/admin/critical-zones'); // /// ADDED
        return alt; // /// ADDED
      } catch (_) { // /// ADDED
      } // /// ADDED
      await simulateDelay(); // /// ADDED
      const severityColors = { 1: '#4CAF50', 2: '#FFC107', 3: '#FF9800', 4: '#F44336', 5: '#B71C1C' }; // /// ADDED
      const cities = [ // /// ADDED
        { name: 'Delhi Central', lat: 28.6139, lng: 77.209 }, // /// ADDED
        { name: 'Mumbai South', lat: 18.9388, lng: 72.8354 }, // /// ADDED
        { name: 'Bangalore Core', lat: 12.9716, lng: 77.5946 }, // /// ADDED
        { name: 'Chennai North', lat: 13.0827, lng: 80.2707 }, // /// ADDED
        { name: 'Kolkata Central', lat: 22.5726, lng: 88.3639 }, // /// ADDED
        { name: 'Hyderabad Tech Park', lat: 17.385, lng: 78.4867 }, // /// ADDED
      ]; // /// ADDED
      const result = cities.map((c, idx) => { // /// ADDED
        const sev = (idx % 5) + 1; // /// ADDED
        return { // /// ADDED
          zone_id: `zone_${idx + 1}`, // /// ADDED
          zone_name: `Sample Zone - ${c.name}`, // /// ADDED
          latitude: c.lat, // /// ADDED
          longitude: c.lng, // /// ADDED
          radius: 1500 + idx * 300, // /// ADDED
          severity_level: sev, // /// ADDED
          severity_label: ['Low','Medium','High','Critical','Extreme'][sev-1], // /// ADDED
          status: 'active', // /// ADDED
          description: 'Development sample zone', // /// ADDED
          metadata: { color: severityColors[sev] }, // /// ADDED
          created_at: new Date().toISOString(), // /// ADDED
          updated_at: new Date().toISOString(), // /// ADDED
        }; // /// ADDED
      }); // /// ADDED
      return createMockResponse(result); // /// ADDED
    } // /// ADDED
  }, // /// ADDED
};

export default api;

export const seedFirestoreData = async () => {
  try {
    if (!db || typeof writeBatch !== 'function') return { success: false, message: 'Firestore not available' };
    const batch = writeBatch(db);
    sampleDrivers.forEach((d) => batch.set(doc(collection(db, 'drivers'), d.id), d));
    samplePatients.forEach((p) => batch.set(doc(collection(db, 'patients'), p.id), p));
    const testEmails = [
      { id: 'seed-admin', address: 'admin@example.com' },
      { id: 'seed-dispatch', address: 'dispatch@example.com' },
    ];
    testEmails.forEach((e) => batch.set(doc(collection(db, 'test_emails'), e.id), e));
    await batch.commit();
    return { success: true };
  } catch (e) {
    return { success: false, message: e?.message || 'Unknown error' };
  }
};

