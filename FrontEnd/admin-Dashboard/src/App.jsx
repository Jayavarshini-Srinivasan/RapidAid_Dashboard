import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Lazy load route pages to enable code-splitting and reduce main bundle size
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LiveMapPage = lazy(() => import('./pages/LiveMapPage'));
const DriversPage = lazy(() => import('./pages/DriversPage'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const EmergenciesPage = lazy(() => import('./pages/EmergenciesPage'));
const HospitalsPage = lazy(() => import('./pages/HospitalsPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const CriticalZonesPage = lazy(() => import('./pages/CriticalZonesPage')); 

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    let mounted = true;
    if (user) {
      (async () => {
        try {
          const { initSocket } = await import('./services/socket');
          if (mounted && initSocket) initSocket();
          const { seedFirestoreData } = await import('./services/api');
          if (mounted && seedFirestoreData) {
            await seedFirestoreData();
          }
        } catch (err) {
          console.error('Failed to load socket module', err);
        }
      })();
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/map"
            element={
              <PrivateRoute>
                <LiveMapPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/hospitals"
            element={
              <PrivateRoute>
                <HospitalsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/drivers"
            element={
              <PrivateRoute>
                <DriversPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute>
                <PatientsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/emergencies"
            element={
              <PrivateRoute>
                <EmergenciesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route   
            path="/critical-zones"   
            element={   
              <PrivateRoute>   
                <CriticalZonesPage />   
              </PrivateRoute>   
            }   
          />   
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

