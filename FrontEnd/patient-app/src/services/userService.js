import { db } from '../../firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// User profile structure
const createUserProfile = (userId, userData) => ({
  id: userId,
  email: userData.email || '',
  name: userData.name || '',
  phone: userData.phone || '',
  age: userData.age || '',
  bloodType: userData.bloodType || '',
  emergencyContact: userData.emergencyContact || '',
  emergencyPhone: userData.emergencyPhone || '',
  allergies: userData.allergies || [],
  conditions: userData.conditions || [],
  medications: userData.medications || [],
  location: userData.location || null,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

export const userService = {
  // Create or update user profile
  async createUserProfile(userId, userData) {
    try {
      const profile = createUserProfile(userId, userData);
      await setDoc(doc(db, 'patients', userId), profile);
      return profile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'patients', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      console.log('Updating user profile for userId:', userId);
      console.log('Updates:', updates);
      
      if (!db) {
        throw new Error('Firestore database is not initialized');
      }
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const userRef = doc(db, 'patients', userId);
      console.log('User reference created:', userRef.path);
      
      // Check if document exists first
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        console.log('Document does not exist, creating new one');
        // Create the document if it doesn't exist
        await setDoc(userRef, {
          ...updates,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        console.log('Document exists, updating');
        await updateDoc(userRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      }
      
      // Return updated profile
      const updatedDoc = await getDoc(userRef);
      console.log('Profile updated successfully');
      return updatedDoc.data();
    } catch (error) {
      console.error('Error updating user profile:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  },
  async updateUserLocation(userId, locationData) {
    try {
      const userRef = doc(db, 'patients', userId);
      await updateDoc(userRef, {
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address || '',
          timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user location:', error);
      throw error;
    }
  },

  async diagnoseFirestore(userId) {
    try {
      const diagRef = doc(db, 'diagnostics', userId);
      await setDoc(diagRef, { ts: serverTimestamp(), ok: true }, { merge: true });
      const snap = await getDoc(diagRef);
      console.log('Diagnostics doc read:', snap.exists(), snap.data());
      return snap.exists() ? snap.data() : null;
    } catch (error) {
      console.error('Firestore diagnostics error:', error);
      throw error;
    }
  },

  // Add medical data
  async addMedicalData(userId, medicalData) {
    try {
      const userRef = doc(db, 'patients', userId);
      await updateDoc(userRef, {
        bloodType: medicalData.bloodType,
        allergies: medicalData.allergies,
        conditions: medicalData.conditions,
        medications: medicalData.medications,
        emergencyContact: medicalData.emergencyContact,
        emergencyPhone: medicalData.emergencyPhone,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding medical data:', error);
      throw error;
    }
  },
};

export default userService;