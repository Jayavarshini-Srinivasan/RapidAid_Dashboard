import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <h2>RapidAid Admin</h2>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/drivers" className="nav-link">Drivers</Link>
        <Link to="/patients" className="nav-link">Patients</Link>
        <Link to="/emergencies" className="nav-link">Emergencies</Link>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}

