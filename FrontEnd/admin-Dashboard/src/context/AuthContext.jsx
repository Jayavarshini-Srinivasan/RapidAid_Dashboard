import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const AuthContext = createContext();
const useSampleMode = import.meta.env.VITE_USE_SAMPLE_DATA === 'true';
const SAMPLE_ADMIN = {
  uid: 'sample-admin',
  email: 'admin@example.com',
  displayName: 'Sample Admin',
};

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

  useEffect(() => {
    if (useSampleMode) {
      setUser(SAMPLE_ADMIN);
      setLoading(false);
      console.warn('[Auth] Sample mode enabled. Skipping Firebase Auth.');
      return () => {};
    }

    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      }, (error) => {
        console.error('Auth state change error:', error);
        setLoading(false);
      });
    } catch (error) {
      console.error('Firebase Auth initialization error:', error);
      setLoading(false);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    if (useSampleMode) {
      const mockedUser = { ...SAMPLE_ADMIN, email: email || SAMPLE_ADMIN.email };
      setUser(mockedUser);
      return mockedUser;
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const logout = async () => {
    if (useSampleMode) {
      setUser(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

