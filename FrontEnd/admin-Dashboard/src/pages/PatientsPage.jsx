import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Person,
  LocalShipping,
  LocationOn,
  AccessTime,
  Schedule,
  LocalHospital,
  CheckCircle,
} from '@mui/icons-material';
import { adminAPI } from '../services/api';
import '../styles/PatientsPage.css';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await adminAPI.getPatients();
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status) => {
    return patients.filter((p) => p.pickupStatus === status).length;
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'awaiting-pickup':
        return 'warning';
      case 'en-route':
        return 'error';
      case 'picked-up':
        return 'info';
      case 'arrived':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'awaiting-pickup':
        return 'Awaiting Pickup';
      case 'en-route':
        return 'En Route';
      case 'picked-up':
        return 'Picked Up';
      case 'arrived':
        return 'Arrived at Hospital';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  const activePatients = patients.filter((p) => p.pickupStatus !== 'arrived');

  return (
    <Box className="patients-container">
      <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 'bold' }}>
        Patient Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {activePatients.length} active cases being tracked
      </Typography>

      {/* Status Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: 'warning.light',
              color: 'warning.contrastText',
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Schedule sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {getStatusCount('awaiting-pickup')}
                  </Typography>
                  <Typography variant="h6">Awaiting Pickup</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: 'error.light',
              color: 'error.contrastText',
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <LocalShipping sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {getStatusCount('en-route') + getStatusCount('picked-up')}
                  </Typography>
                  <Typography variant="h6">En Route to Hospital</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              bgcolor: 'success.light',
              color: 'success.contrastText',
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {getStatusCount('arrived')}
                  </Typography>
                  <Typography variant="h6">Arrived at Hospital</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Patients Table */}
      {patients.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No patients found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Patient
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 'bold' }}>Emergency Type</Typography>
                </TableCell>
                <TableCell>
                  <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Location
                </TableCell>
                <TableCell>
                  <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Assigned Ambulance
                </TableCell>
                <TableCell>Pickup Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>
                  <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Call Time
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {patient.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {patient.age} years • {patient.patientId || patient.id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{patient.emergencyType || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    {patient.location
                      ? `${patient.location.lat.toFixed(4)}, ${patient.location.lng.toFixed(4)}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {patient.assignedAmbulance || 'Unassigned'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(patient.pickupStatus)}
                      color={getStatusColor(patient.pickupStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={patient.priority || 'N/A'}
                      color={getPriorityColor(patient.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{patient.callTime || 'N/A'}</Typography>
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
