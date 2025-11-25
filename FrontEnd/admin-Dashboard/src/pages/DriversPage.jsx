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
  Button,
  ButtonGroup,
  IconButton,
} from '@mui/material';
import { LocalShipping, Person, LocationOn, AccessTime, Visibility } from '@mui/icons-material';
import { adminAPI } from '../services/api';
import '../styles/DriversPage.css';

const statusFilters = ['all', 'available', 'en-route', 'transporting', 'offline'];

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [drivers, activeFilter]);

  const loadDrivers = async () => {
    try {
      const response = await adminAPI.getDrivers();
      setDrivers(response.data.data || []);
    } catch (error) {
      console.error('Error loading drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    if (activeFilter === 'all') {
      setFilteredDrivers(drivers);
    } else {
      setFilteredDrivers(
        drivers.filter((driver) => {
          const status = driver.ambulanceStatus || driver.status;
          return status === activeFilter;
        })
      );
    }
  };

  const getStatusCount = (status) => {
    if (status === 'all') return drivers.length;
    return drivers.filter((driver) => {
      const driverStatus = driver.ambulanceStatus || driver.status;
      return driverStatus === status;
    }).length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'en-route':
        return 'warning';
      case 'transporting':
        return 'error';
      case 'offline':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'en-route':
        return 'En Route';
      case 'transporting':
        return 'Transporting';
      case 'offline':
        return 'Offline';
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

  return (
    <Box className="drivers-container">
      <Typography variant="h4" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
        Ambulance Fleet
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {drivers.length} total units - {getStatusCount('available')} available
      </Typography>

      {/* Filter Buttons */}
      <Box sx={{ mb: 3 }}>
        <ButtonGroup variant="outlined" aria-label="status filter">
          {statusFilters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'contained' : 'outlined'}
              onClick={() => setActiveFilter(filter)}
              sx={{
                textTransform: 'capitalize',
                minWidth: '120px',
              }}
            >
              {filter === 'all' ? `All (${getStatusCount(filter)})` : `${getStatusLabel(filter)} (${getStatusCount(filter)})`}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {filteredDrivers.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No ambulances found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Ambulance ID
                </TableCell>
                <TableCell>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Driver
                </TableCell>
                <TableCell>
                  <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Location
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Route History</TableCell>
                <TableCell>
                  <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Last Updated
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDrivers.map((driver) => {
                const status = driver.ambulanceStatus || driver.status;
                return (
                  <TableRow key={driver.id} hover>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {driver.ambulanceNumber || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>{driver.name || 'N/A'}</TableCell>
                    <TableCell>
                      {driver.currentLocation
                        ? `${driver.currentLocation.lat.toFixed(4)}, ${driver.currentLocation.lng.toFixed(4)}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(status)}
                        color={getStatusColor(status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{driver.type || 'N/A'}</TableCell>
                    <TableCell>{driver.routeHistory || '0 mi'}</TableCell>
                    <TableCell>{driver.lastUpdated || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
