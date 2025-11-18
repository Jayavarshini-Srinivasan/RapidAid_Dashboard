import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
} from '@mui/material';
import {
  DashboardOutlined,
  PublicOutlined,
  LocalHospitalOutlined,
  Groups2Outlined,
  NotificationsOutlined,
  SettingsOutlined,
  Menu as MenuIcon,
  LogoutOutlined,
  LightModeOutlined,
  DarkModeOutlined,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';
import '../styles/Layout.css';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardOutlined />, path: '/dashboard' },
  { text: 'Live Map', icon: <PublicOutlined />, path: '/map' },
  { text: 'Hospitals', icon: <LocalHospitalOutlined />, path: '/hospitals' },
  { text: 'Users', icon: <Groups2Outlined />, path: '/users' },
  { text: 'Notifications', icon: <NotificationsOutlined />, path: '/notifications' },
  { text: 'Settings', icon: <SettingsOutlined />, path: '/settings' },
];

export default function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const userName = user?.displayName || user?.email || 'Admin';
  const userInitials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          color: theme.palette.text.primary,
          px: 3,
          py: 2.5,
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 0.35,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(27,35,68,0.95), rgba(11,17,33,0.95))'
              : 'linear-gradient(135deg, rgba(243,246,255,0.95), rgba(255,255,255,0.95))',
          borderBottom: `1px solid ${
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
          }`,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            letterSpacing: 3,
            fontSize: 11,
            color:
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.65)'
                : 'rgba(15,23,42,0.55)',
          }}
        >
          RAPIDAID
        </Typography>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: 700, color: theme.palette.text.primary }}
        >
          Command Center
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                mx: 2,
                my: 0.75,
                borderRadius: '14px',
                px: 2,
                transition: 'all 0.25s ease',
                backdropFilter: 'blur(4px)',
                '&.Mui-selected': {
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(92,106,196,0.12)',
                  color:
                    theme.palette.mode === 'dark'
                      ? '#f8fbff'
                      : theme.palette.primary.main,
                  '&:hover': {
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.18)'
                        : 'rgba(92,106,196,0.2)',
                  },
                },
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(15,23,42,0.05)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? theme.palette.mode === 'dark'
                        ? '#f8fbff'
                        : theme.palette.primary.main
                      : theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.6)'
                        : 'rgba(15,23,42,0.5)',
                  minWidth: 36,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 500,
                    color:
                      location.pathname === item.path
                        ? theme.palette.mode === 'dark'
                          ? '#f8fbff'
                          : theme.palette.primary.main
                        : theme.palette.text.primary,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutOutlined />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: theme.palette.background.default,
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          borderBottom: `1px solid ${
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
          }`,
          background:
            theme.palette.mode === 'dark'
              ? 'rgba(8,12,24,0.82)'
              : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(18px)',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 25px 45px rgba(5,6,23,0.55)'
              : '0 20px 40px rgba(15,23,42,0.12)',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            color: theme.palette.text.primary,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              {menuItems.find(item => item.path === location.pathname)?.text || 'RapidAid Admin'}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Chip
              label="Operational"
              color="success"
              variant="outlined"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                borderColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(16,185,129,0.4)'
                    : 'rgba(34,197,94,0.4)',
                color: theme.palette.mode === 'dark' ? '#bbf7d0' : '#166534',
              }}
            />
            <IconButton
              onClick={toggleTheme}
              color="inherit"
              sx={{
                borderRadius: '14px',
                width: 44,
                height: 44,
                border: `1px solid ${
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.15)'
                }`,
                background:
                  theme.palette.mode === 'dark'
                    ? 'rgba(15,23,42,0.6)'
                    : 'rgba(255,255,255,0.9)',
                boxShadow:
                  theme.palette.mode === 'dark'
                    ? '0 10px 25px rgba(5,6,23,0.45)'
                    : '0 10px 25px rgba(15,23,42,0.15)',
              }}
            >
              {mode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
                >
                  {userName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      theme.palette.mode === 'dark'
                        ? 'rgba(203,213,225,0.8)'
                        : 'rgba(15,23,42,0.6)',
                  }}
                >
                  Command Center
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.primary.main
                      : theme.palette.primary.light,
                  color: theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.dark,
                  fontWeight: 600,
                }}
              >
                {userInitials}
              </Avatar>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)'
              }`,
              background:
                theme.palette.mode === 'dark'
                  ? 'rgba(4,7,20,0.92)'
                  : 'rgba(244,247,255,0.98)',
              backdropFilter: 'blur(18px)',
              color: theme.palette.text.primary,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: `1px solid ${
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)'
              }`,
              background:
                theme.palette.mode === 'dark'
                  ? 'rgba(4,7,20,0.9)'
                  : 'rgba(247,249,255,0.95)',
              backdropFilter: 'blur(18px)',
              color: theme.palette.text.primary,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '45px 0 65px rgba(2,3,12,0.6)'
                  : '35px 0 55px rgba(15,23,42,0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background:
            theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at top, #0b1120 0%, #050810 40%, #03050a 100%)'
              : 'linear-gradient(145deg, #eff6ff, #fdf2ff)',
          position: 'relative',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

