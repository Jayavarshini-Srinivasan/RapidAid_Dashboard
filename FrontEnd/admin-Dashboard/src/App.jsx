import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LiveMapPage from './pages/LiveMapPage';
import DriversPage from './pages/DriversPage';
import PatientsPage from './pages/PatientsPage';
import EmergenciesPage from './pages/EmergenciesPage';
import HospitalsPage from './pages/HospitalsPage';
import UsersPage from './pages/UsersPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import { initSocket } from './services/socket';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      initSocket();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

