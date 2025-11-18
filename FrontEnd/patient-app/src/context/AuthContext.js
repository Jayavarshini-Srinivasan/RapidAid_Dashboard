import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import api from '../services/api';
import userService from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const SAMPLE_MODE = (process.env.EXPO_PUBLIC_USE_SAMPLE_DATA === 'true' || process.env.VITE_USE_SAMPLE_DATA === 'true' || !auth);
  
  // Debug logging for Firebase configuration
  console.log('AuthContext - SAMPLE_MODE:', SAMPLE_MODE);
  console.log('AuthContext - EXPO_PUBLIC_USE_SAMPLE_DATA:', process.env.EXPO_PUBLIC_USE_SAMPLE_DATA);
  console.log('AuthContext - VITE_USE_SAMPLE_DATA:', process.env.VITE_USE_SAMPLE_DATA);
  console.log('AuthContext - auth available:', !!auth);
  console.log('AuthContext - db available:', !!db);
  const TEST_CREATE_FLAG = process.env.EXPO_PUBLIC_CREATE_TEST_USER === 'true';
  const TEST_EMAIL = process.env.EXPO_PUBLIC_TEST_EMAIL;
  const TEST_PASSWORD = process.env.EXPO_PUBLIC_TEST_PASSWORD;
  const DEFAULT_TEST_EMAIL = 'patient.test002@rapidaid.dev';
  const DEFAULT_TEST_PASSWORD = 'RapidAidTest!2025';
  const [triedCreateTest, setTriedCreateTest] = useState(false);
  const [ensuredTestProfile, setEnsuredTestProfile] = useState(false);

  useEffect(() => {
    if (SAMPLE_MODE || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && db) {
        setUser(firebaseUser);
        try {
          // Fetch user profile from Firestore
          const userProfile = await userService.getUserProfile(firebaseUser.uid);
          if (userProfile) {
            setUserData(userProfile);
          } else {
            // Create default profile if it doesn't exist
            const newProfile = await userService.createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email,
              name: firebaseUser.email.split('@')[0],
            });
            setUserData(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    if (!auth) throw new Error('Firebase not configured: set environment variables.');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Fetch user profile from Firestore
    try {
      const userProfile = await userService.getUserProfile(userCredential.user.uid);
      if (userProfile) {
        setUserData(userProfile);
      } else {
        // Create default profile if it doesn't exist
        const newProfile = await userService.createUserProfile(userCredential.user.uid, {
          email: userCredential.user.email,
          name: userCredential.user.email.split('@')[0],
        });
        setUserData(newProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    
    return userCredential.user;
  };

  const register = async (email, password, userData) => {
    if (!auth) throw new Error('Firebase not configured: set environment variables.');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    try {
      // Create user profile in Firestore
      const newProfile = await userService.createUserProfile(userCredential.user.uid, {
        email: userCredential.user.email,
        name: userData?.name || userCredential.user.email.split('@')[0],
        phone: userData?.phone || '',
        age: userData?.age || '',
      });
      setUserData(newProfile);
      
      // Also register with backend API
      await api.post('/auth/register', { email, password, ...userData, role: 'patient' });
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
    
    return userCredential.user;
  };

  const logout = async () => {
    if (SAMPLE_MODE) {
      setUser(null);
      setUserData(null);
      return;
    }
    if (!auth) return;
    await signOut(auth);
  };

  const forceRealFirebaseMode = () => {
    console.log('Forcing real Firebase mode - this will bypass sample mode checks');
    // This function can be called to override sample mode for testing
    return {
      isSampleMode: false,
      auth: auth,
      db: db
    };
  };

  useEffect(() => {
    console.log('AuthContext - TEST_CREATE_FLAG:', TEST_CREATE_FLAG);
    console.log('AuthContext - TEST_EMAIL:', TEST_EMAIL);
    if (auth && (TEST_CREATE_FLAG || !TEST_EMAIL) && !triedCreateTest) {
      if (!TEST_EMAIL || !TEST_PASSWORD) {
        console.log('Using default test credentials for creation');
      }
      (async () => {
        try {
          const email = TEST_EMAIL || DEFAULT_TEST_EMAIL;
          const password = TEST_PASSWORD || DEFAULT_TEST_PASSWORD;
          console.log('Attempting to create test user:', email);
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newProfile = await userService.createUserProfile(userCredential.user.uid, {
            email: userCredential.user.email,
            name: 'Test Patient',
            phone: '',
            age: '',
          });
          console.log('Test user created and profile stored:', newProfile);
          await signOut(auth);
          setTriedCreateTest(true);
        } catch (error) {
          if (error.code === 'auth/email-already-in-use') {
            console.log('Test email already exists. Skipping creation.');
            setTriedCreateTest(true);
          } else {
            console.error('Error creating test user:', error);
          }
        }
      })();
    }
  }, []);

  useEffect(() => {
    const email = TEST_EMAIL || DEFAULT_TEST_EMAIL;
    const password = TEST_PASSWORD || DEFAULT_TEST_PASSWORD;
    if (auth && !ensuredTestProfile && email && password) {
      (async () => {
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const uid = cred.user.uid;
          const existing = await userService.getUserProfile(uid);
          if (!existing) {
            const profile = await userService.createUserProfile(uid, {
              email: cred.user.email,
              name: email.split('@')[0],
            });
            console.log('Ensured Firestore patient profile:', profile);
          } else {
            console.log('Firestore patient profile already exists');
          }
          await signOut(auth);
          setEnsuredTestProfile(true);
        } catch (err) {
          if (err.code === 'auth/user-not-found') {
            try {
              const created = await createUserWithEmailAndPassword(auth, email, password);
              const prof = await userService.createUserProfile(created.user.uid, {
                email: created.user.email,
                name: email.split('@')[0],
              });
              console.log('Created and ensured Firestore patient profile:', prof);
              await signOut(auth);
              setEnsuredTestProfile(true);
            } catch (e2) {
              console.error('Ensure profile creation failed:', e2);
            }
          } else {
            console.error('Ensure profile sign-in failed:', err);
          }
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          console.log('Running Firestore diagnostics for uid:', user.uid);
          const diag = await userService.diagnoseFirestore(user.uid);
          console.log('Firestore diagnostics result:', diag);
        } catch (e) {
          console.error('Diagnostics failed:', e);
        }
      })();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, register, logout, forceRealFirebaseMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
