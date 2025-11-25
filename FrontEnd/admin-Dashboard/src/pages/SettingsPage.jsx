import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
} from '@mui/material';
import { SettingsOutlined, SecurityOutlined, HistoryOutlined } from '@mui/icons-material';
import '../styles/SettingsPage.css';
import { useThemeMode } from '../context/ThemeModeContext';
import { db } from '../../firebaseConfig';
import { writeBatch, doc, collection } from 'firebase/firestore';
import { sampleDrivers, samplePatients, sampleHospitals, sampleEmergencies } from '../utils/sampleData';

const themePresets = [
  { id: 'violet', name: 'Aurora Violet', accent: '#6366f1', description: 'Balanced, calm command tone.' },
  { id: 'cyan', name: 'Glacier Cyan', accent: '#06b6d4', description: 'High contrast, modern clinical feel.' },
  { id: 'amber', name: 'Solar Amber', accent: '#f59e0b', description: 'Warm emergency-forward palette.' },
];

const initialRoles = [
  { id: 'r1', name: 'Emily Chen', email: 'emily.chen@rapidaid.com', role: 'Administrator', active: true },
  { id: 'r2', name: 'Liam Patel', email: 'liam.p@rapidaid.com', role: 'Dispatcher', active: true },
  { id: 'r3', name: 'Sarah Thompson', email: 'sarah.t@rapidaid.com', role: 'Supervisor', active: false },
];

const auditLogs = [
  { id: 'log-1032', action: 'Role updated', actor: 'Emily Chen', detail: 'Promoted Liam to Dispatcher lead', time: '2m ago' },
  { id: 'log-1031', action: 'Theme changed', actor: 'Sarah Thompson', detail: 'Applied Glacier Cyan preset', time: '12m ago' },
  { id: 'log-1030', action: 'Policy updated', actor: 'Operations Bot', detail: 'Auto-approved driver compliance forms', time: '1h ago' },
];

export default function SettingsPage() {
  const { mode, toggleTheme, accent, setAccent } = useThemeMode();
  const [roles, setRoles] = useState(initialRoles);
  const [adminSettings, setAdminSettings] = useState({
    enforceCompliance: true,
    autoAssign: true,
    downtimeAlert: '15',
    dataRetention: '90',
  });
  const [syncStatus, setSyncStatus] = useState('Idle');
  const [syncing, setSyncing] = useState(false);

  const pushSampleToFirestore = async () => {
    try {
      setSyncing(true);
      setSyncStatus('Syncing');
      const batch = writeBatch(db);
      sampleDrivers.forEach((d) => batch.set(doc(collection(db, 'drivers'), d.id), d));
      samplePatients.forEach((p) => batch.set(doc(collection(db, 'patients'), p.id), p));
      sampleHospitals.forEach((h) => batch.set(doc(collection(db, 'hospitals'), h.id), h));
      sampleEmergencies.forEach((e) => batch.set(doc(collection(db, 'emergencies'), e.id), e));
      await batch.commit();
      setSyncStatus('Synced');
    } catch (e) {
      setSyncStatus('Failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleRoleChange = (id, newRole) => {
    setRoles((prev) => prev.map((role) => (role.id === id ? { ...role, role: newRole } : role)));
  };

  const handleActiveToggle = (id) => {
    setRoles((prev) => prev.map((role) => (role.id === id ? { ...role, active: !role.active } : role)));
  };

  return (
    <Box className="settings-container">
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        <SettingsOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Admin Controls
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure compliance, automation, and retention policies
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={adminSettings.enforceCompliance}
                    onChange={(e) =>
                      setAdminSettings((prev) => ({
                        ...prev,
                        enforceCompliance: e.target.checked,
                      }))
                    }
                  />
                }
                label="Enforce daily driver compliance checks"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={adminSettings.autoAssign}
                    onChange={(e) =>
                      setAdminSettings((prev) => ({
                        ...prev,
                        autoAssign: e.target.checked,
                      }))
                    }
                  />
                }
                label="Auto-assign nearest available ambulance"
              />
              <Select
                fullWidth
                size="small"
                value={adminSettings.downtimeAlert}
                onChange={(e) =>
                  setAdminSettings((prev) => ({ ...prev, downtimeAlert: e.target.value }))
                }
              >
                <MenuItem value="5">Alert if idle &gt; 5 min</MenuItem>
                <MenuItem value="15">Alert if idle &gt; 15 min</MenuItem>
                <MenuItem value="30">Alert if idle &gt; 30 min</MenuItem>
              </Select>
              <Select
                fullWidth
                size="small"
                value={adminSettings.dataRetention}
                onChange={(e) =>
                  setAdminSettings((prev) => ({ ...prev, dataRetention: e.target.value }))
                }
              >
                <MenuItem value="30">Retain audit logs 30 days</MenuItem>
                <MenuItem value="90">Retain audit logs 90 days</MenuItem>
                <MenuItem value="365">Retain audit logs 1 year</MenuItem>
              </Select>
              <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={pushSampleToFirestore} disabled={syncing}>
                {syncing ? 'Syncing…' : 'Push Sample Data to Firebase'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure notification preferences and alerts
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              Configure Notifications
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6">Role Management</Typography>
                <Typography variant="body2" color="text.secondary">
                  Control access across admin, dispatcher, and supervisor roles
                </Typography>
              </Box>
              <Chip icon={<SecurityOutlined />} label="Protected" size="small" color="primary" />
            </Box>
            {roles.map((user) => (
              <React.Fragment key={user.id}>
                <Box display="flex" alignItems="center" gap={2} py={2}>
                  <Avatar>{user.name.charAt(0)}</Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Select
                    size="small"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <MenuItem value="Administrator">Administrator</MenuItem>
                    <MenuItem value="Supervisor">Supervisor</MenuItem>
                    <MenuItem value="Dispatcher">Dispatcher</MenuItem>
                    <MenuItem value="Analyst">Analyst</MenuItem>
                  </Select>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={user.active}
                        onChange={() => handleActiveToggle(user.id)}
                      />
                    }
                    label={user.active ? 'Active' : 'Suspended'}
                  />
                </Box>
                <Divider />
              </React.Fragment>
            ))}
            <Button variant="contained" sx={{ mt: 2 }}>
              Add Team Member
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6">Theme Presets</Typography>
                <Typography variant="body2" color="text.secondary">
                  Align dashboards with operations center ambience
                </Typography>
              </Box>
              <Chip icon={<HistoryOutlined />} label={syncStatus} size="small" color={syncStatus === 'Synced' ? 'success' : syncStatus === 'Failed' ? 'error' : 'default'} />
            </Box>

            <Stack spacing={2}>
              {themePresets.map((preset) => (
                <Paper
                  key={preset.id}
                  variant="outlined"
                  className={`theme-preset ${accent === preset.id ? 'active' : ''}`}
                  onClick={() => setAccent(preset.id)}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {preset.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {preset.description}
                      </Typography>
                    </Box>
                    <Box
                      className="theme-swatch"
                      style={{ backgroundColor: preset.accent }}
                    />
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6">Audit Timeline</Typography>
                <Typography variant="body2" color="text.secondary">
                  Regulatory-grade activity log for command accountability
                </Typography>
              </Box>
              <Chip icon={<HistoryOutlined />} label="Synced" size="small" color="success" />
            </Box>
            <List>
              {auditLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {log.action}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            {log.detail}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.actor} • {log.time}
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
      </Grid>
    </Box>
  );
}

