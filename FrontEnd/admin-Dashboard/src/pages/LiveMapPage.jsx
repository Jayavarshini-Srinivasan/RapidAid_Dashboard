// /// ADDED LiveMapPage rebuilt for Firestore + Socket.IO real-time markers
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { Box, Chip, CircularProgress, Paper, Typography } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { setupSocketListeners } from '../services/socket';
import '../styles/LiveMapPage.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBV0HSC6CPK2w9URvH_FxNXPjBEG52BGcA';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // /// ADDED
const mapContainerStyle = { width: '100%', height: '100%', minHeight: '80vh' };
const defaultCenter = { lat: 28.6139, lng: 77.209 };
const mapOptions = { zoomControl: true, streetViewControl: false, mapTypeControl: true, fullscreenControl: true };
const severityIcons = { HIGH: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', MEDIUM: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png', LOW: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' };
const severityChipColor = { HIGH: 'error', MEDIUM: 'warning', LOW: 'success' };

const FALLBACK_CASES = [ // /// ADDED
  { id: 'case-delhi-a21', unitLabel: 'A21', operator: 'Emily Chen', patientName: 'Aarav Sharma', patientPhone: '+91 98100 22111', intersection: 'Connaught Place, New Delhi', speed: '44 mph', eta: '5 min', location: { lat: 28.6328, lng: 77.2197 }, severity: 'HIGH' },
  { id: 'case-mumbai-b11', unitLabel: 'B11', operator: 'Rohan Desai', patientName: 'Ishita Kapoor', patientPhone: '+91 98202 44333', intersection: 'Marine Drive, Mumbai', speed: '35 mph', eta: '8 min', location: { lat: 19.076, lng: 72.8777 }, severity: 'MEDIUM' },
  { id: 'case-bengaluru-c07', unitLabel: 'C07', operator: 'Priya Nair', patientName: 'Sanjay Rao', patientPhone: '+91 98450 77889', intersection: 'MG Road, Bengaluru', speed: '38 mph', eta: '6 min', location: { lat: 12.9735, lng: 77.6082 }, severity: 'LOW' },
  { id: 'case-hyderabad-d14', unitLabel: 'D14', operator: 'Ananya Reddy', patientName: 'Kabir Malhotra', patientPhone: '+91 98765 11223', intersection: 'HITEC City, Hyderabad', speed: '41 mph', eta: '7 min', location: { lat: 17.4474, lng: 78.3762 }, severity: 'HIGH' },
  { id: 'case-pune-e03', unitLabel: 'E03', operator: 'Vikram Kulkarni', patientName: 'Neha Joshi', patientPhone: '+91 98600 55667', intersection: 'FC Road, Pune', speed: '39 mph', eta: '6 min', location: { lat: 18.5204, lng: 73.8567 }, severity: 'MEDIUM' },
  { id: 'case-chennai-f19', unitLabel: 'F19', operator: 'Meera Krishnan', patientName: 'Arjun Iyer', patientPhone: '+91 98404 88990', intersection: 'T. Nagar, Chennai', speed: '37 mph', eta: '9 min', location: { lat: 13.0418, lng: 80.2337 }, severity: 'HIGH' },
  { id: 'case-ahmedabad-g05', unitLabel: 'G05', operator: 'Kunal Patel', patientName: 'Pooja Shah', patientPhone: '+91 98790 22331', intersection: 'CG Road, Ahmedabad', speed: '33 mph', eta: '4 min', location: { lat: 23.0225, lng: 72.5714 }, severity: 'LOW' },
  { id: 'case-kolkata-h12', unitLabel: 'H12', operator: 'Sourav Banerjee', patientName: 'Ananya Mukherjee', patientPhone: '+91 98300 11445', intersection: 'Park Street, Kolkata', speed: '36 mph', eta: '7 min', location: { lat: 22.5535, lng: 88.3507 }, severity: 'MEDIUM' },
]; // /// ADDED

const formatLatLng = (location) => (location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '—');
const kmToMiles = (km) => km * 0.621371;
const haversineKm = (origin, destination) => {
  if (!origin || !destination) return 0;
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lng - origin.lng);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const LiveMapPage = () => {
  const [cases, setCases] = useState({});
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  const caseList = useMemo(() => Object.values(cases), [cases]);

  const animateMarkerMove = useCallback((marker, destination) => {
    if (!marker || !destination) return;
    const DELTA = 0.0001;
    const move = () => {
      const position = marker.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      const latDiff = destination.lat - lat;
      const lngDiff = destination.lng - lng;
      if (Math.abs(latDiff) < DELTA && Math.abs(lngDiff) < DELTA) {
        marker.setPosition(destination);
        return;
      }
      marker.setPosition({ lat: lat + latDiff * 0.25, lng: lng + lngDiff * 0.25 });
      requestAnimationFrame(move);
    };
    move();
  }, []);

  const createOrUpdateMarker = useCallback((caseEntity) => {
    if (!mapRef.current || !window.google || !caseEntity?.location) return;
    const caseId = caseEntity.id;
    const severity = (caseEntity.severity || 'LOW').toUpperCase();
    const iconUrl = severityIcons[severity] || severityIcons.LOW;
    const existingMarker = markersRef.current[caseId];

    if (existingMarker) {
      animateMarkerMove(existingMarker, caseEntity.location);
      if (existingMarker.__severity !== severity) {
        existingMarker.setIcon(iconUrl);
        existingMarker.__severity = severity;
      }
      existingMarker.setTitle(`Case ${caseId} - ${severity}`);
      return;
    }

    const marker = new window.google.maps.Marker({
      position: caseEntity.location,
      map: mapRef.current,
      icon: iconUrl,
      title: `Case ${caseId} - ${severity}`,
    });
    marker.__severity = severity;
    marker.addListener('click', () => {
      setSelectedCaseId(caseId);
    });
    markersRef.current[caseId] = marker;
  }, [animateMarkerMove]);

  const mergeCase = useCallback((caseId, payload) => {
    setCases((prev) => {
      const next = { ...prev };
      const current = next[caseId] || {};
      next[caseId] = { ...current, ...payload, id: caseId };
      return next;
    });
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        let snapshot = await getDocs(collection(db, 'cases'));
        if (snapshot.empty) {
          try {
            await fetch(`${API_BASE_URL}/case/seed`, { method: 'POST' });
            snapshot = await getDocs(collection(db, 'cases'));
          } catch (err) {
            console.warn('Fallback to static cases due to seed error', err);
          }
        }

        if (snapshot.empty) {
          const fallbackMap = {};
          FALLBACK_CASES.forEach((item) => {
            fallbackMap[item.id] = item;
          });
          setCases(fallbackMap);
          if (!selectedCaseId && FALLBACK_CASES.length > 0) {
            setSelectedCaseId(FALLBACK_CASES[0].id);
          }
          return;
        }

        const initial = {};
        snapshot.forEach((doc) => {
          initial[doc.id] = { id: doc.id, ...doc.data() };
        });
        setCases(initial);
        if (!selectedCaseId && snapshot.docs.length > 0) {
          setSelectedCaseId(snapshot.docs[0].id);
        }
      } catch (error) {
        console.error('Failed to load cases', error);
        const fallbackMap = {};
        FALLBACK_CASES.forEach((item) => { fallbackMap[item.id] = item; });
        setCases(fallbackMap);
        if (!selectedCaseId && FALLBACK_CASES.length > 0) {
          setSelectedCaseId(FALLBACK_CASES[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCases();

    const cleanupSockets = setupSocketListeners({
      onCaseLocationUpdate: ({ caseId, location }) => {
        if (!caseId || !location) return;
        mergeCase(caseId, { location });
      },
      onCaseSeverityUpdate: ({ caseId, severity }) => {
        if (!caseId || !severity) return;
        mergeCase(caseId, { severity });
      },
    });

    return () => {
      if (cleanupSockets) cleanupSockets();
      Object.values(markersRef.current).forEach((marker) => marker.setMap(null));
      markersRef.current = {};
    };
  }, [mergeCase, selectedCaseId]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    caseList.forEach((caseEntity) => createOrUpdateMarker(caseEntity));
    if (caseList.length > 0) { /// ADDED
      const bounds = new window.google.maps.LatLngBounds(); /// ADDED
      caseList.forEach((caseEntity) => { /// ADDED
        if (caseEntity.location) bounds.extend(caseEntity.location); /// ADDED
      }); /// ADDED
      if (!bounds.isEmpty()) { /// ADDED
        mapRef.current.fitBounds(bounds, 100); /// ADDED
      } /// ADDED
    } /// ADDED
  }, [caseList, createOrUpdateMarker]);

  const handleMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    caseList.forEach((caseEntity) => createOrUpdateMarker(caseEntity));
  }, [caseList, createOrUpdateMarker]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="live-map-container">
      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        Live Response Map
      </Typography>
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <Box className="map-board"> {/* /// ADDED */}
          <Box className="map-shell">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={caseList[0]?.location || defaultCenter}
              zoom={13}
              options={mapOptions}
              onLoad={handleMapLoad}
            />
            <Paper className="legend-card" elevation={6}> {/* /// ADDED */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Severity Legend
              </Typography>
              <Box className="legend-row">
                <span className="legend-dot high" />
                <Typography variant="caption">High priority</Typography>
              </Box>
              <Box className="legend-row">
                <span className="legend-dot medium" />
                <Typography variant="caption">Medium priority</Typography>
              </Box>
              <Box className="legend-row">
                <span className="legend-dot low" />
                <Typography variant="caption">Low priority</Typography>
              </Box>
            </Paper> {/* /// ADDED */}
            {caseList.map((caseEntity) => (
              <Paper
                key={`info-${caseEntity.id}`}
                className={`map-info-chip${caseEntity.id === selectedCaseId ? ' active' : ''}`}
                elevation={6}
                onClick={() => {
                  setSelectedCaseId(caseEntity.id);
                  if (caseEntity.location && mapRef.current) {
                    mapRef.current.panTo(caseEntity.location);
                    mapRef.current.setZoom(14);
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {caseEntity.unitLabel || caseEntity.id.toUpperCase()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {caseEntity.patientName || 'Patient'}
                </Typography>
                <Chip
                  label={(caseEntity.severity || 'LOW').toUpperCase()}
                  size="small"
                  color={severityChipColor[(caseEntity.severity || 'LOW').toUpperCase()] || 'default'}
                  className="map-info-chip__severity"
                />
              </Paper>
            ))}
          </Box>

          <Box className="case-panel"> {/* /// ADDED */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Active Patients
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tap a card to focus the map on that response.
            </Typography>
            <Box className="case-card-list">
              {caseList.length === 0 && (
                <Paper elevation={0} className="case-card empty">
                  <Typography variant="body2">No active patients available.</Typography>
                </Paper>
              )}
              {caseList.map((caseEntity) => {
                const sev = (caseEntity.severity || 'LOW').toUpperCase();
                const distance = caseEntity.location
                  ? `${kmToMiles(haversineKm(defaultCenter, caseEntity.location)).toFixed(1)} mi`
                  : '—';
                return (
                  <Paper
                    key={caseEntity.id}
                    elevation={caseEntity.id === selectedCaseId ? 10 : 3}
                    className={`case-card${caseEntity.id === selectedCaseId ? ' active' : ''}`}
                    onClick={() => {
                      setSelectedCaseId(caseEntity.id);
                      if (caseEntity.location && mapRef.current) {
                        mapRef.current.panTo(caseEntity.location);
                        mapRef.current.setZoom(14);
                      }
                    }}
                  >
                    <Box className="case-card-header">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {caseEntity.unitLabel || caseEntity.id.toUpperCase()}
                      </Typography>
                      <Chip label={`ETA: ${caseEntity.eta || '5 min'}`} size="small" color="warning" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {caseEntity.operator || 'Emily Chen'}
                    </Typography>
                    <Box className="case-card-row">
                      <span>Speed</span>
                      <strong>{caseEntity.speed || '40 mph'}</strong>
                    </Box>
                    <Box className="case-card-row">
                      <span>Location</span>
                      <strong>{caseEntity.intersection || 'Broadway & 42nd'}</strong>
                    </Box>
                    <Box className="case-card-row">
                      <span>Distance</span>
                      <strong>{distance}</strong>
                    </Box>
                    <Box className="case-card-row patient">
                      <span>Patient</span>
                      <strong>{caseEntity.patientName || 'James Wilson'}</strong>
                    </Box>
                    <Chip
                      label={sev}
                      size="small"
                      color={severityChipColor[sev] || 'default'}
                      className="case-card-chip"
                    />
                  </Paper>
                );
              })}
            </Box>
          </Box>
        </Box>
      </LoadScript>
    </Box>
  );
};

export default LiveMapPage;
