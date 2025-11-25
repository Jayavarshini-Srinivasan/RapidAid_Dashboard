import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Button } from '@mui/material';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { adminAPI } from '../services/api';
import '../styles/EmergenciesPage.css';

export default function EmergenciesPage() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmergencies();
    const unsubscribe = onSnapshot(collection(db, 'emergencies'), () => {
      loadEmergencies();
    });
    return unsubscribe;
  }, []);

  const loadEmergencies = async () => {
    try {
      const response = await adminAPI.getEmergencies();
      setEmergencies(response.data.data || []);
    } catch (error) {
      console.error('Error loading emergencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await adminAPI.completeRequest(id);
      // Update local state for sample data
      setEmergencies(prev => prev.map(emergency =>
        emergency.id === id
          ? { ...emergency, status: 'completed' }
          : emergency
      ));
      await loadEmergencies();
    } catch (error) {
      console.error('Error completing request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'in_progress': return 'success';
      case 'completed': return 'default';
      default: return 'error';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="emergencies-container">
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Emergency Requests
      </Typography>

      {emergencies.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No emergencies found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emergencies.map((emergency) => (
                <TableRow key={emergency.id}>
                  <TableCell>{emergency.patientName || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip label={emergency.severity || 'N/A'} size="small" color="error" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={emergency.status || 'N/A'}
                      color={getStatusColor(emergency.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{emergency.driverId ? 'Assigned' : 'Unassigned'}</TableCell>
                  <TableCell>
                    {emergency.createdAt
                      ? new Date(emergency.createdAt.seconds * 1000).toLocaleString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {emergency.status !== 'completed' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleComplete(emergency.id)}
                      >
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

