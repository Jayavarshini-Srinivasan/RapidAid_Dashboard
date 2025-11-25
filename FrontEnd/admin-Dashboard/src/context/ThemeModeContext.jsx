import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const ThemeModeContext = createContext({
  mode: 'dark',
  accent: 'violet',
  toggleTheme: () => {},
  setAccent: () => {},
});

const accentPalette = {
  violet: { main: '#6366f1', light: '#a5b4fc', dark: '#4338ca' },
  cyan: { main: '#06b6d4', light: '#67e8f9', dark: '#0e7490' },
  amber: { main: '#f59e0b', light: '#fcd34d', dark: '#b45309' },
};

const basePalette = {
  secondary: { main: '#f97316' },
  success: { main: '#22c55e' },
  warning: { main: '#facc15' },
  error: { main: '#ef4444' },
};

const lightBg = {
  default: '#f7f8fb',
  paper: '#ffffff',
};

const darkBg = {
  default: '#0d111c',
  paper: '#11182a',
};

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('rapidaid-theme-mode') || 'dark');
  const [accent, setAccentState] = useState(
    () => localStorage.getItem('rapidaid-theme-accent') || 'violet'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('rapidaid-theme-mode', next);
      return next;
    });
  };

  const setAccent = (value) => {
    setAccentState(value);
    localStorage.setItem('rapidaid-theme-accent', value);
  };

  const theme = useMemo(
    () =>
      createTheme({
          palette: {
            mode,
            primary: accentPalette[accent],
            ...basePalette,
            background: mode === 'dark' ? darkBg : lightBg,
            text: {
              primary: mode === 'dark' ? '#e5e7f5' : '#0f172a',
              secondary: mode === 'dark' ? 'rgba(229,231,245,0.7)' : 'rgba(15,23,42,0.7)',
            },
          },
        typography: {
          fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'SF Pro Display', -apple-system, sans-serif",
        },
        shape: { borderRadius: 16 },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 20,
                backgroundImage: 'none',
              },
            },
          },
          MuiButton: {
            defaultProps: { disableRipple: true },
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: 12,
                fontWeight: 600,
              },
            },
          },
        },
      }),
    [mode, accent]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, accent, toggleTheme, setAccent }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeModeContext);

