import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Chip,
  LinearProgress,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  DashboardOutlined,
  LocalHospitalOutlined,
  Groups2Outlined,
  EmergencyOutlined,
  ArrowUpwardRounded,
  ArrowDownwardRounded,
  RefreshRounded,
} from '@mui/icons-material';
import { adminAPI } from '../services/api';
import '../styles/DashboardPage.css';

const timeframes = [
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
];

const trendMeta = {
  '24h': { growth: 0.05 },
  '7d': { growth: 0.08 },
  '30d': { growth: 0.12 },
};

const downtimeHeatmap = [
  { day: 'Mon', data: [5, 0, 0, 3, 2, 0, 1, 0, 4, 1, 0, 0] },
  { day: 'Tue', data: [0, 0, 2, 4, 0, 1, 0, 0, 2, 1, 3, 0] },
  { day: 'Wed', data: [1, 0, 0, 0, 3, 0, 0, 1, 0, 0, 4, 0] },
  { day: 'Thu', data: [2, 0, 0, 1, 0, 0, 2, 0, 3, 0, 0, 1] },
  { day: 'Fri', data: [0, 0, 3, 1, 0, 0, 4, 1, 0, 0, 2, 0] },
  { day: 'Sat', data: [0, 0, 1, 0, 2, 0, 0, 3, 0, 0, 1, 4] },
  { day: 'Sun', data: [0, 1, 0, 0, 2, 0, 1, 0, 0, 3, 0, 0] },
];

const driverUtilization = [
  { label: 'ALS Units', value: 82 },
  { label: 'BLS Units', value: 68 },
  { label: 'Rapid Response', value: 74 },
  { label: 'Community Care', value: 56 },
];

const incidentFeed = [
  { id: 'INC-2083', patient: 'James Wilson', status: 'Dispatched', eta: '4m', severity: 'High', location: 'Sector 21' },
  { id: 'INC-2082', patient: 'Sarah Lewis', status: 'Stabilizing', eta: 'On scene', severity: 'Critical', location: 'Ring Road' },
  { id: 'INC-2081', patient: 'Liam Patel', status: 'Awaiting Pickup', eta: 'Assigning', severity: 'Medium', location: 'Connaught Place' },
  { id: 'INC-2080', patient: 'Ravi Rao', status: 'Transporting', eta: '9m', severity: 'High', location: 'Sector 32' },
];

const Sparkline = ({ color, values }) => {
  const points = values
    .map((val, idx) => {
      const x = (idx / (values.length - 1)) * 100;
      const y = 100 - val;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width="100%" height="50" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(() => loadMetrics(true), 30000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const loadMetrics = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);
      const response = await adminAPI.getDashboardMetrics();
      setMetrics(response.data.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const derivedMetrics = useMemo(() => {
    if (!metrics) return null;
    const meta = trendMeta[timeframe] || trendMeta['24h'];
    const computeTrend = (base) => {
      const delta = base * meta.growth;
      const direction = Math.random() > 0.45 ? 1 : -1;
      const amount = Math.round(delta * 10) / 10;
      return { delta: amount, direction: direction > 0 ? 'up' : 'down' };
    };
    return {
      ...metrics,
      trends: {
        drivers: computeTrend(metrics?.onDutyDrivers || 0),
        patients: computeTrend(metrics?.totalPatients || 0),
        emergencies: computeTrend(metrics?.activeEmergencies || 0),
        hospitals: computeTrend(metrics?.availableBeds || 0),
      },
    };
  }, [metrics, timeframe]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Drivers',
      value: derivedMetrics?.totalDrivers || 0,
      subtitle: `On Duty: ${derivedMetrics?.onDutyDrivers || 0}`,
      icon: <Groups2Outlined sx={{ fontSize: 40 }} />,
      color: '#4f46e5',
      trend: derivedMetrics?.trends?.drivers,
    },
    {
      title: 'Total Patients',
      value: derivedMetrics?.totalPatients || 0,
      subtitle: 'Registered',
      icon: <Groups2Outlined sx={{ fontSize: 40 }} />,
      color: '#16a34a',
      trend: derivedMetrics?.trends?.patients,
    },
    {
      title: 'Active Emergencies',
      value: derivedMetrics?.activeEmergencies || 0,
      subtitle: `Total: ${derivedMetrics?.totalEmergencies || 0}`,
      icon: <EmergencyOutlined sx={{ fontSize: 40 }} />,
      color: '#dc2626',
      trend: derivedMetrics?.trends?.emergencies,
    },
    {
      title: 'Hospitals',
      value: derivedMetrics?.totalHospitals || 0,
      subtitle: `Available Beds: ${derivedMetrics?.availableBeds || 0}`,
      icon: <LocalHospitalOutlined sx={{ fontSize: 40 }} />,
      color: '#f97316',
      trend: derivedMetrics?.trends?.hospitals,
    },
  ];

  return (
    <Box className="dashboard-container">
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        <DashboardOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
        Dashboard
      </Typography>

      <Box className="dashboard-toolbar">
        <ToggleButtonGroup
          exclusive
          value={timeframe}
          onChange={(_, value) => value && setTimeframe(value)}
          size="small"
        >
          {timeframes.map((frame) => (
            <ToggleButton value={frame.value} key={frame.value}>
              {frame.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label="Live auto-refresh"
            color="success"
            variant="outlined"
            size="small"
            sx={{ borderColor: 'rgba(16,185,129,0.4)' }}
          />
          <Typography variant="body2" color="text.secondary">
            Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
          </Typography>
          <IconButton onClick={() => loadMetrics(true)} disabled={refreshing}>
            <RefreshRounded className={refreshing ? 'spin' : ''} />
          </IconButton>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="kpi-card">
              <CardContent>
                <Box className="kpi-card__header">
                  <Box className="kpi-card__icon" style={{ backgroundColor: card.color }}>
                    {card.icon}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {card.title}
                </Typography>
                <Box className="kpi-card__trend">
                  {card.trend?.direction === 'up' ? (
                    <ArrowUpwardRounded color="success" fontSize="small" />
                  ) : (
                    <ArrowDownwardRounded color="error" fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    color={card.trend?.direction === 'up' ? 'success.main' : 'error.main'}
                  >
                    {card.trend?.delta}% vs last {timeframe.toUpperCase()}
                  </Typography>
                </Box>
                <Sparkline
                  color={card.color}
                  values={[20, 40, 35, 55, 30, 60, 45, 70, 65, 80]}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Driver Utilization
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Fleet readiness across unit types
            </Typography>
            <Stack spacing={3}>
              {driverUtilization.map((item) => (
                <Box key={item.label}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="subtitle2">{item.label}</Typography>
                    <Typography variant="subtitle2">{item.value}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.value}
                    sx={{ height: 10, borderRadius: 999 }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Live Incident Feed
            </Typography>
            <List dense>
              {incidentFeed.map((incident) => (
                <React.Fragment key={incident.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {incident.patient}
                          </Typography>
                          <Chip
                            label={incident.severity}
                            size="small"
                            color={
                              incident.severity === 'Critical'
                                ? 'error'
                                : incident.severity === 'High'
                                  ? 'error'
                                  : 'warning'
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            {incident.status} • ETA {incident.eta}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {incident.location}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Downtime Heatmap
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Minutes per shift block (lower is better)
            </Typography>
            <Box className="heatmap-grid">
              {downtimeHeatmap.map((row) => (
                <Box key={row.day} className="heatmap-row">
                  <Typography variant="caption" sx={{ width: 32 }}>
                    {row.day}
                  </Typography>
                  <Box className="heatmap-cells">
                    {row.data.map((value, idx) => (
                      <span
                        key={`${row.day}-${idx}`}
                        className="heatmap-cell"
                        data-level={value}
                        title={`${value} min`}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Mission Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper className="mission-card success">
                  <Typography variant="h3">
                    {derivedMetrics?.completedEmergencies || 0}
                  </Typography>
                  <Typography variant="subtitle2">Completed today</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper className="mission-card warning">
                  <Typography variant="h3">{derivedMetrics?.liveTracking || 0}</Typography>
                  <Typography variant="subtitle2">Live tracking</Typography>
                </Paper>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Dispatch pipeline
              </Typography>
              <Stack spacing={2}>
                {['Queued', 'Dispatched', 'On Scene', 'Transporting'].map((stage, idx) => (
                  <Box key={stage}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">{stage}</Typography>
                      <Typography variant="body2">
                        {Math.floor(Math.random() * 8) + 2} units
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={60 + idx * 8}
                      sx={{ borderRadius: 999, height: 8 }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
