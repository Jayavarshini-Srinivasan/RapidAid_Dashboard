import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event listeners for real-time updates
export const setupSocketListeners = (callbacks) => {
  const socketInstance = getSocket();

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

