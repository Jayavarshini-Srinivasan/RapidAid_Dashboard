import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'rapidaid-8a617.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'rapidaid-8a617',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'rapidaid-8a617.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'demo-sender-id',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
};

// Check if Firebase config is properly set
const isConfigValid = firebaseConfig.apiKey && 
                      firebaseConfig.apiKey !== 'demo-api-key' &&
                      firebaseConfig.apiKey.startsWith('AIza');

// Debug: Log what we're getting (only in dev)
if (import.meta.env.DEV) {
  console.log('🔍 Firebase Config Check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    apiKeyPrefix: firebaseConfig.apiKey?.substring(0, 10) || 'missing',
    hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
    hasAppId: !!firebaseConfig.appId,
    isValid: isConfigValid
  });
  
  if (!isConfigValid) {
    console.error('❌ Firebase API Key is missing or invalid!');
    console.error('📝 Please add these to your .env file:');
    console.error('   VITE_FIREBASE_API_KEY=your-api-key-here');
    console.error('   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id-here');
    console.error('   VITE_FIREBASE_APP_ID=your-app-id-here');
    console.error('🔗 Get them from: https://console.firebase.google.com/project/rapidaid-8a617/settings/general/web');
  }
}

let app, auth, db;

try {
  if (!isConfigValid) {
    throw new Error('Firebase API key is missing or invalid.');
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  app = null; // /// ADDED
  auth = { currentUser: null }; // /// ADDED
  db = {}; // /// ADDED
}

export { auth, db };
export default app;

