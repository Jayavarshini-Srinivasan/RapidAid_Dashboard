import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, CircularProgress } from '@mui/material';
import { Groups2Outlined } from '@mui/icons-material';
import DriversPage from './DriversPage';
import PatientsPage from './PatientsPage';
import '../styles/UsersPage.css';

export default function UsersPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box className="users-container">
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        <Groups2Outlined sx={{ mr: 1, verticalAlign: 'middle' }} />
        Users Management
      </Typography>

      <Paper elevation={3}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Drivers" />
          <Tab label="Patients" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <DriversPage />}
          {tabValue === 1 && <PatientsPage />}
        </Box>
      </Paper>
    </Box>
  );
}

