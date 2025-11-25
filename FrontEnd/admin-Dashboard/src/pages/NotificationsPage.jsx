import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import { NotificationsOutlined } from '@mui/icons-material';
import { setupSocketListeners } from '../services/socket';
import '../styles/NotificationsPage.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Setup Socket.IO listeners for real-time notifications
    const cleanup = setupSocketListeners({
      onNewEmergency: (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          type: 'emergency',
          message: `New emergency request from ${data.patientName || 'Patient'}`,
          timestamp: new Date(),
          data,
        }, ...prev]);
      },
      onEmergencyStatusUpdate: (data) => {
        setNotifications(prev => [{
          id: Date.now(),
          type: 'status',
          message: `Emergency ${data.id} status updated to ${data.status}`,
          timestamp: new Date(),
          data,
        }, ...prev]);
      },
    });

    return cleanup;
  }, []);

  const getNotificationColor = (type) => {
    switch (type) {
      case 'emergency':
        return 'error';
      case 'status':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box className="notifications-container">
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        <NotificationsOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
        Notifications
      </Typography>

      {notifications.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No notifications yet
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={3}>
          <List>
            {notifications.map((notification) => (
              <ListItem key={notification.id} divider>
                <ListItemText
                  primary={notification.message}
                  secondary={notification.timestamp.toLocaleString()}
                />
                <Chip
                  label={notification.type}
                  color={getNotificationColor(notification.type)}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

