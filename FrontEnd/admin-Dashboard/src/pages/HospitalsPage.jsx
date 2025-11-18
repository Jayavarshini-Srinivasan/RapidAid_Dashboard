import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip, // <-- added
} from '@mui/material';
import {
  LocalHospitalOutlined,
  Hotel,
  TrendingUp,
  People,
} from '@mui/icons-material';
import { adminAPI } from '../services/api';
import { sampleHospitalCapacity } from '../utils/sampleData';
import '../styles/HospitalsPage.css';

// Simple Donut Chart Component
const DonutChart = ({ percentage, color, size = 100 }) => {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {percentage}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Occupied
        </Typography>
      </Box>
    </Box>
  );
};

export default function HospitalsPage() {
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCapacity();
  }, []);

  const loadCapacity = async () => {
    try {
      // Try to get from API, fallback to sample data
      const response = await adminAPI.getHospitals();
      if (response.data.data && Array.isArray(response.data.data)) {
        // Calculate aggregate from hospital data
        const hospitals = response.data.data;
        const totalBeds = hospitals.reduce((sum, h) => sum + (h.totalBeds || 0), 0);
        const availableBeds = hospitals.reduce((sum, h) => sum + (h.availableBeds || 0), 0);
        const occupiedBeds = totalBeds - availableBeds;
        setCapacity({
          totalBeds,
          availableBeds,
          occupiedBeds,
          occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0, // <-- guard divide-by-zero
          incoming: 8,
          wards: sampleHospitalCapacity.wards,
        });
      } else {
        setCapacity(sampleHospitalCapacity);
      }
    } catch (error) {
      console.error('Error loading capacity:', error);
      setCapacity(sampleHospitalCapacity);
    } finally {
      setLoading(false);
    }
  };

  const getWardStatus = (occupancyRate) => {
    if (occupancyRate >= 80) return { label: 'Critical', color: 'error' };
    if (occupancyRate >= 65) return { label: 'Moderate', color: 'warning' };
    return { label: 'Good', color: 'success' };
  };

  const getWardColor = (occupancyRate) => {
    if (occupancyRate >= 80) return '#d32f2f';
    if (occupancyRate >= 65) return '#ed6c02';
    return '#2e7d32';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!capacity) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No capacity data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Box className="hospitals-container">
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        <LocalHospitalOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
        Hospital Capacity
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Real-time bed availability and occupancy rates
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Hotel sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {capacity.totalBeds}
                  </Typography>
                  <Typography variant="h6">Total Beds</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <LocalHospitalOutlined sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {capacity.availableBeds}
                  </Typography>
                  <Typography variant="h6">Available</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {capacity.occupancyRate}%
                  </Typography>
                  <Typography variant="h6">Occupancy</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'white', height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <People sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {capacity.incoming}
                  </Typography>
                  <Typography variant="h6">Incoming</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ward Details */}
      <Grid container spacing={3}>
        {Object.entries(capacity.wards).map(([wardName, wardData]) => {
          const status = getWardStatus(wardData.occupancyRate);
          const color = getWardColor(wardData.occupancyRate);
          return (
            <Grid item xs={12} sm={6} md={3} key={wardName}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                    {wardName} Ward
                  </Typography>
                  <Chip
                    label={status.label}
                    color={status.color}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" justifyContent="center" my={2}>
                    <DonutChart percentage={wardData.occupancyRate} color={color} />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Available: {wardData.available} / {wardData.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Occupied: {wardData.occupied}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
