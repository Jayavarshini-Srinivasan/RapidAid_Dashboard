const admin = require('firebase-admin');
require('dotenv').config();

let db = null; // /// ADDED
let auth = null; // /// ADDED
let isFirebaseReady = false; // /// ADDED

try { // /// ADDED
  if (!admin.apps.length) { // /// ADDED
    const hasCreds = Boolean( // /// ADDED
      process.env.FIREBASE_PROJECT_ID && // /// ADDED
      process.env.FIREBASE_PRIVATE_KEY && // /// ADDED
      process.env.FIREBASE_CLIENT_EMAIL // /// ADDED
    ); // /// ADDED

    if (hasCreds) { // /// ADDED
      admin.initializeApp({ // /// ADDED
        credential: admin.credential.cert({ // /// ADDED
          projectId: process.env.FIREBASE_PROJECT_ID, // /// ADDED
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'), // /// ADDED
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL, // /// ADDED
        }), // /// ADDED
      }); // /// ADDED
      isFirebaseReady = true; // /// ADDED
    } else { // /// ADDED
      isFirebaseReady = false; // /// ADDED
    } // /// ADDED
  } // /// ADDED
  if (admin.apps.length) { // /// ADDED
    db = admin.firestore(); // /// ADDED
    auth = admin.auth(); // /// ADDED
    isFirebaseReady = true; // /// ADDED
  } // /// ADDED
} catch (_) { // /// ADDED
  isFirebaseReady = false; // /// ADDED
  db = null; // /// ADDED
  auth = null; // /// ADDED
} // /// ADDED

module.exports = { admin, db, auth, isFirebaseReady }; // /// ADDED

