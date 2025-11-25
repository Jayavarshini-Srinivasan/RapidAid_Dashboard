import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const USE_SAMPLE_DATA = import.meta.env.VITE_USE_SAMPLE_DATA === 'true'; // /// ADDED

let socket = null;

export const initSocket = () => {
  if (USE_SAMPLE_DATA) { // /// ADDED
    return null; // /// ADDED
  } // /// ADDED
  if (!socket) {
    try { // /// ADDED
      socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        if (import.meta.env.VITE_DEBUG_SOCKET === 'true') console.log('✅ Socket.IO connected'); // /// ADDED
      });

      socket.on('disconnect', () => {
        if (import.meta.env.VITE_DEBUG_SOCKET === 'true') console.log('❌ Socket.IO disconnected'); // /// ADDED
      });

      socket.on('connect_error', (error) => {
        if (import.meta.env.VITE_DEBUG_SOCKET === 'true') console.error('Socket.IO connection error:', error?.message || error); // /// ADDED
      });
    } catch (_) { // /// ADDED
      socket = null; // /// ADDED
    } // /// ADDED
  }
  return socket;
};

export const getSocket = () => {
  if (USE_SAMPLE_DATA) return null; // /// ADDED
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    try { socket.disconnect(); } catch (_) {}
    socket = null;
  }
};

// Socket event listeners for real-time updates
export const setupSocketListeners = (callbacks) => {
  const socketInstance = getSocket();
  if (!socketInstance) { // /// ADDED
    return () => {}; // /// ADDED
  } // /// ADDED

  // Driver location updates
  socketInstance.on('driverLocationUpdate', (data) => {
    if (callbacks.onDriverLocationUpdate) {
      callbacks.onDriverLocationUpdate(data);
    }
  });

  // Patient location updates
  socketInstance.on('patientLocationUpdate', (data) => {
    if (callbacks.onPatientLocationUpdate) {
      callbacks.onPatientLocationUpdate(data);
    }
  });

  // New emergency request
  socketInstance.on('newEmergencyRequest', (data) => {
    if (callbacks.onNewEmergency) {
      callbacks.onNewEmergency(data);
    }
  });

  // Emergency status update
  socketInstance.on('emergencyStatus', (data) => {
    if (callbacks.onEmergencyStatusUpdate) {
      callbacks.onEmergencyStatusUpdate(data);
    }
  });

  socketInstance.on('updateCaseLocation', (data) => { // /// ADDED
    if (callbacks.onCaseLocationUpdate) { // /// ADDED
      callbacks.onCaseLocationUpdate(data); // /// ADDED
    } // /// ADDED
  }); // /// ADDED

  socketInstance.on('updateCaseSeverity', (data) => { // /// ADDED
    if (callbacks.onCaseSeverityUpdate) { // /// ADDED
      callbacks.onCaseSeverityUpdate(data); // /// ADDED
    } // /// ADDED
  }); // /// ADDED

  return () => {
    socketInstance.off('driverLocationUpdate');
    socketInstance.off('patientLocationUpdate');
    socketInstance.off('newEmergencyRequest');
    socketInstance.off('emergencyStatus');
    socketInstance.off('updateCaseLocation'); // /// ADDED
    socketInstance.off('updateCaseSeverity'); // /// ADDED
  };
};

