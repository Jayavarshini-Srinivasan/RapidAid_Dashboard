// /// ADDED LiveMapPage rebuilt for Firestore + Socket.IO real-time markers
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { Box, Chip, CircularProgress, Paper, Typography } from '@mui/material';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { setupSocketListeners } from '../services/socket';
import { sampleHospitals } from '../utils/sampleData'; // /// ADDED
import '../styles/LiveMapPage.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBV0HSC6CPK2w9URvH_FxNXPjBEG52BGcA';
const DEBUG = import.meta.env.VITE_DEBUG_MAP === 'true'; // /// ADDED
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // /// ADDED
const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE_DATA === 'true'; // /// ADDED
const mapContainerStyle = { width: '100%', height: '100%', minHeight: '80vh' };
const defaultCenter = { lat: 28.6139, lng: 77.209 };
const mapOptions = { zoomControl: true, streetViewControl: false, mapTypeControl: true, fullscreenControl: true };
const severityIcons = { HIGH: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', MEDIUM: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png', LOW: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' };
const accidentIcon = 'https://maps.google.com/mapfiles/kml/shapes/caution.png';
const patientIcon = 'https://maps.google.com/mapfiles/kml/shapes/ambulance.png';
const hospitalIcon = 'https://maps.google.com/mapfiles/kml/shapes/hospitals.png';
const severityChipColor = { HIGH: 'error', MEDIUM: 'warning', LOW: 'success' };
const severityLabelColor = { HIGH: '#ffffff', MEDIUM: '#000000', LOW: '#ffffff' };

const FALLBACK_CASES = [
  { id: 'case-delhi-a21', unitLabel: 'A21', driverName: 'Emily Chen', patientName: 'Aarav Sharma', patientPhone: '+91 98100 22111', intersection: 'Connaught Place, New Delhi', speed: '44 mph', eta: '5 min', location: { lat: 28.6328, lng: 77.2197 }, accidentLocation: { lat: 28.6345, lng: 77.2165 }, severity: 'HIGH' },
  { id: 'case-mumbai-b11', unitLabel: 'B11', driverName: 'Rohan Desai', patientName: 'Ishita Kapoor', patientPhone: '+91 98202 44333', intersection: 'Marine Drive, Mumbai', speed: '35 mph', eta: '8 min', location: { lat: 19.076, lng: 72.8777 }, accidentLocation: { lat: 19.079, lng: 72.880 }, severity: 'MEDIUM' },
  { id: 'case-bengaluru-c07', unitLabel: 'C07', driverName: 'Priya Nair', patientName: 'Sanjay Rao', patientPhone: '+91 98450 77889', intersection: 'MG Road, Bengaluru', speed: '38 mph', eta: '6 min', location: { lat: 12.9735, lng: 77.6082 }, accidentLocation: { lat: 12.9755, lng: 77.6030 }, severity: 'LOW' },
  { id: 'case-hyderabad-d14', unitLabel: 'D14', driverName: 'Ananya Reddy', patientName: 'Kabir Malhotra', patientPhone: '+91 98765 11223', intersection: 'HITEC City, Hyderabad', speed: '41 mph', eta: '7 min', location: { lat: 17.4474, lng: 78.3762 }, accidentLocation: { lat: 17.4490, lng: 78.3725 }, severity: 'HIGH' },
  { id: 'case-pune-e03', unitLabel: 'E03', driverName: 'Vikram Kulkarni', patientName: 'Neha Joshi', patientPhone: '+91 98600 55667', intersection: 'FC Road, Pune', speed: '39 mph', eta: '6 min', location: { lat: 18.5204, lng: 73.8567 }, accidentLocation: { lat: 18.5180, lng: 73.8590 }, severity: 'MEDIUM' },
  { id: 'case-chennai-f19', unitLabel: 'F19', driverName: 'Meera Krishnan', patientName: 'Arjun Iyer', patientPhone: '+91 98404 88990', intersection: 'T. Nagar, Chennai', speed: '37 mph', eta: '9 min', location: { lat: 13.0418, lng: 80.2337 }, accidentLocation: { lat: 13.0390, lng: 80.2350 }, severity: 'HIGH' },
  { id: 'case-ahmedabad-g05', unitLabel: 'G05', driverName: 'Kunal Patel', patientName: 'Pooja Shah', patientPhone: '+91 98790 22331', intersection: 'CG Road, Ahmedabad', speed: '33 mph', eta: '4 min', location: { lat: 23.0225, lng: 72.5714 }, accidentLocation: { lat: 23.0240, lng: 72.5690 }, severity: 'LOW' },
  { id: 'case-kolkata-h12', unitLabel: 'H12', driverName: 'Sourav Banerjee', patientName: 'Ananya Mukherjee', patientPhone: '+91 98300 11445', intersection: 'Park Street, Kolkata', speed: '36 mph', eta: '7 min', location: { lat: 22.5535, lng: 88.3507 }, accidentLocation: { lat: 22.5550, lng: 88.3530 }, severity: 'MEDIUM' },
  { id: 'case-jaipur-j08', unitLabel: 'J08', driverName: 'Aakash Singh', patientName: 'Meera Gupta', patientPhone: '+91 98765 11122', intersection: 'MI Road, Jaipur', speed: '40 mph', eta: '6 min', location: { lat: 26.9124, lng: 75.7873 }, accidentLocation: { lat: 26.914, lng: 75.789 }, severity: 'HIGH' },
  { id: 'case-chandigarh-k12', unitLabel: 'K12', driverName: 'Navdeep Kaur', patientName: 'Harpreet Singh', patientPhone: '+91 98765 33344', intersection: 'Sector 17, Chandigarh', speed: '34 mph', eta: '7 min', location: { lat: 30.741, lng: 76.768 }, accidentLocation: { lat: 30.743, lng: 76.772 }, severity: 'MEDIUM' },
];

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

const findNearestHospital = (accident, severity) => { // /// ADDED
  if (!accident) return null; // /// ADDED
  const needTrauma = (severity || 'LOW').toUpperCase() === 'HIGH'; // /// ADDED
  const list = needTrauma ? sampleHospitals.filter((h) => h.wards?.trauma) : sampleHospitals; // /// ADDED
  let best = null; let bestDist = Infinity; // /// ADDED
  list.forEach((h) => { // /// ADDED
    const dist = haversineKm(accident, { lat: h.location.lat, lng: h.location.lng }); // /// ADDED
    if (dist < bestDist) { best = h; bestDist = dist; } // /// ADDED
  }); // /// ADDED
  return best; // /// ADDED
}; // /// ADDED

const LiveMapPage = () => {
  const [cases, setCases] = useState({});
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [loading, setLoading] = useState(true);
  // If you want no location points (markers) on the map, set this to false.
  // Default is false to "remove location points" as requested; flip to true to show markers again.
  const [showMarkers] = useState(true); // /// ADDED
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const accidentMarkersRef = useRef({}); // /// ADDED
  const hospitalMarkersRef = useRef({}); // /// ADDED
  const routeLinesRef = useRef({}); // /// ADDED
  const [forceIframe, setForceIframe] = useState(false); // /// ADDED
  const REDUCED_ANIMATION = import.meta.env.VITE_REDUCE_ANIMATION !== 'false';
  const directionsServiceRef = useRef({});
  const directionsRendererRef = useRef({});

  const caseList = useMemo(() => Object.values(cases), [cases]);

  const animateMarkerMove = useCallback((marker, destination) => {
    if (!marker || !destination) return;
    if (REDUCED_ANIMATION) { marker.setPosition(destination); return; }
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
      marker.setPosition({ lat: lat + latDiff * 0.2, lng: lng + lngDiff * 0.2 });
      requestAnimationFrame(move);
    };
    move();
  }, [REDUCED_ANIMATION]);

  const createOrUpdateMarker = useCallback((caseEntity) => {
    if (!showMarkers) return;
    if (!mapRef.current || !window.google || !caseEntity?.location) {
      console.log('❌ Skipping marker: missing mapRef, google, or location');
      return;
    }
    const caseId = caseEntity.id;
    const severity = (caseEntity.severity || 'LOW').toUpperCase();
    const iconUrl = patientIcon;
    const existingMarker = markersRef.current[caseId];

    if (existingMarker) {
      animateMarkerMove(existingMarker, caseEntity.location);
      if (existingMarker.__severity !== severity) {
        existingMarker.setIcon({ url: iconUrl, scaledSize: new window.google.maps.Size(22, 22), anchor: new window.google.maps.Point(11, 11) });
        existingMarker.__severity = severity;
      }
      existingMarker.setTitle(`Case ${caseId} - ${severity}`);
      return;
    }

    const marker = new window.google.maps.Marker({
      position: caseEntity.location,
      map: mapRef.current,
      icon: { url: iconUrl, scaledSize: new window.google.maps.Size(22, 22), anchor: new window.google.maps.Point(11, 11) },
      title: `Patient ${caseId} - ${severity}`,
    });
    marker.__severity = severity;
    marker.addListener('click', () => {
      setSelectedCaseId(caseId);
    });
    markersRef.current[caseId] = marker;
    console.log('📍 Marker created for case', caseId, 'at', caseEntity.location);
  }, [animateMarkerMove]);

  const createOrUpdateAccidentMarker = useCallback((caseEntity) => { // /// ADDED
    if (!showMarkers) return; // /// ADDED
    if (!mapRef.current || !window.google || !caseEntity?.accidentLocation) return; // /// ADDED
    const caseId = caseEntity.id; // /// ADDED
    const existing = accidentMarkersRef.current[caseId]; // /// ADDED
    if (existing) { // /// ADDED
      existing.setPosition(caseEntity.accidentLocation); // /// ADDED
      return; // /// ADDED
    } // /// ADDED
    const marker = new window.google.maps.Marker({
      position: caseEntity.accidentLocation,
      map: mapRef.current,
      icon: {
        url: accidentIcon,
        scaledSize: new window.google.maps.Size(20, 20),
        anchor: new window.google.maps.Point(10, 10),
      },
      title: `Accident - ${formatLatLng(caseEntity.accidentLocation)}`,
    });
    accidentMarkersRef.current[caseId] = marker; // /// ADDED
  }, []); // /// ADDED

  const createOrUpdateHospitalMarker = useCallback((caseEntity, hospital) => { // /// ADDED
    if (!showMarkers) return; // /// ADDED
    if (!mapRef.current || !window.google || !hospital) return; // /// ADDED
    const caseId = caseEntity.id; // /// ADDED
    const existing = hospitalMarkersRef.current[caseId]; // /// ADDED
    const position = { lat: hospital.latitude, lng: hospital.longitude }; // /// ADDED
    if (existing) { // /// ADDED
      existing.setPosition(position); // /// ADDED
      existing.setTitle(`${hospital.name}`); // /// ADDED
      return; // /// ADDED
    } // /// ADDED
    const marker = new window.google.maps.Marker({
      position,
      map: mapRef.current,
      icon: {
        url: hospitalIcon,
        scaledSize: new window.google.maps.Size(20, 20),
        anchor: new window.google.maps.Point(10, 10),
      },
      title: `${hospital.name}`,
    });
    hospitalMarkersRef.current[caseId] = marker; // /// ADDED
  }, []); // /// ADDED

  const drawOrUpdateRoute = useCallback(async (caseEntity) => { // /// ADDED
    try { // /// ADDED
      if (!mapRef.current || !window.google) return; // /// ADDED
      if (!caseEntity.accidentLocation || !caseEntity.location) return; // /// ADDED
      const accident = caseEntity.accidentLocation; // /// ADDED
      const patient = caseEntity.location; // /// ADDED
      let hospitalId = caseEntity.destinationHospitalId; // /// ADDED
      let hospitalData = null; // /// ADDED
      if (!hospitalId) { // /// ADDED
        try { // /// ADDED
          const resp = await fetch(`${API_BASE_URL}/hospital/nearest?lat=${accident.lat}&lng=${accident.lng}&type=${(caseEntity.severity || 'LOW').toUpperCase() === 'HIGH' ? 'trauma' : ''}`); // /// ADDED
          const json = await resp.json(); // /// ADDED
          hospitalData = json.data?.hospital || null; // /// ADDED
          hospitalId = hospitalData?.id; // /// ADDED
        } catch (_) { // /// ADDED
          const typeFilter = (caseEntity.severity || 'LOW').toUpperCase() === 'HIGH' ? 'trauma' : null; // /// ADDED
          const list = typeFilter ? sampleHospitals.filter((h) => (h.wards?.trauma || typeFilter === null)) : sampleHospitals; // /// ADDED
          let best = null; let bestDist = Infinity; // /// ADDED
          list.forEach((h) => { // /// ADDED
            const dist = haversineKm(accident, { lat: h.location.lat, lng: h.location.lng }); // /// ADDED
            if (dist < bestDist) { best = h; bestDist = dist; } // /// ADDED
          }); // /// ADDED
          if (best) { // /// ADDED
            hospitalData = { id: best.id, name: best.name, latitude: best.location.lat, longitude: best.location.lng }; // /// ADDED
            hospitalId = best.id; // /// ADDED
          } // /// ADDED
        } // /// ADDED
      } else { // /// ADDED
        try { // /// ADDED
          const resp = await fetch(`${API_BASE_URL}/hospital/${hospitalId}`); // /// ADDED
          const json = await resp.json(); // /// ADDED
          hospitalData = json.data || null; // /// ADDED
        } catch (_) { // /// ADDED
          const best = sampleHospitals.find((h) => h.id === hospitalId) || sampleHospitals[0]; // /// ADDED
          if (best) hospitalData = { id: best.id, name: best.name, latitude: best.location.lat, longitude: best.location.lng }; // /// ADDED
        } // /// ADDED
      } // /// ADDED
      if (!hospitalData) return; // /// ADDED

      createOrUpdateHospitalMarker(caseEntity, hospitalData); // /// ADDED
      createOrUpdateAccidentMarker(caseEntity); // /// ADDED

      const origin = new window.google.maps.LatLng(accident.lat, accident.lng);
      const destination = new window.google.maps.LatLng(hospitalData.latitude, hospitalData.longitude);
      let ds = directionsServiceRef.current[caseEntity.id];
      let dr = directionsRendererRef.current[caseEntity.id];
      if (!ds) {
        ds = new window.google.maps.DirectionsService();
        directionsServiceRef.current[caseEntity.id] = ds;
      }
      if (!dr) {
        dr = new window.google.maps.DirectionsRenderer({ map: mapRef.current, suppressMarkers: true, preserveViewport: true, polylineOptions: { strokeColor: '#1976D2', strokeOpacity: 0.9, strokeWeight: 4 } });
        directionsRendererRef.current[caseEntity.id] = dr;
      }
      ds.route({ origin, destination, travelMode: window.google.maps.TravelMode.DRIVING, drivingOptions: { departureTime: new Date(), trafficModel: window.google.maps.TrafficModel.BEST_GUESS } }, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          dr.setDirections(result);
        } else {
          let poly = routeLinesRef.current[caseEntity.id];
          const path = [accident, { lat: hospitalData.latitude, lng: hospitalData.longitude }];
          if (!poly) {
            poly = new window.google.maps.Polyline({ path, geodesic: true, strokeColor: '#1976D2', strokeOpacity: 0.9, strokeWeight: 4, map: mapRef.current });
            routeLinesRef.current[caseEntity.id] = poly;
          } else {
            poly.setPath(path);
          }
        }
      });
    } catch (e) { // /// ADDED
      console.warn('Failed to draw route', e); // /// ADDED
    } // /// ADDED
  }, [createOrUpdateAccidentMarker, createOrUpdateHospitalMarker]); // /// ADDED

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
        if (USE_SAMPLE) { // /// ADDED
          const fallbackMap = {}; // /// ADDED
          FALLBACK_CASES.forEach((item) => { // /// ADDED
            const nearest = findNearestHospital(item.accidentLocation || item.location, item.severity); // /// ADDED
            const destinationHospitalId = nearest?.id || null; // /// ADDED
            fallbackMap[item.id] = { ...item, destinationHospitalId }; // /// ADDED
          }); // /// ADDED
          setCases(fallbackMap); // /// ADDED
          if (!selectedCaseId && FALLBACK_CASES.length > 0) setSelectedCaseId(FALLBACK_CASES[0].id); // /// ADDED
          return; // /// ADDED
        } // /// ADDED
        console.log('🔍 Fetching cases from Firestore...');
        let snapshot = await getDocs(collection(db, 'cases'));
        console.log('📦 Firestore cases snapshot:', snapshot.empty ? 'empty' : `${snapshot.docs.length} docs`);
        if (snapshot.empty) {
          try {
            if (!USE_SAMPLE) { // /// ADDED
              console.log('🌱 Seeding cases...');
              await fetch(`${API_BASE_URL}/case/seed`, { method: 'POST' });
            } // /// ADDED
            snapshot = await getDocs(collection(db, 'cases'));
            console.log('📦 After seed, cases:', snapshot.empty ? 'still empty' : `${snapshot.docs.length} docs`);
          } catch (err) {
            console.warn('Fallback to static cases due to seed error', err);
          }
        }

        if (snapshot.empty) {
          console.log('🔄 Using FALLBACK_CASES');
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
        console.log('✅ Cases loaded from Firestore:', Object.keys(initial).length);
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

    fetchCases().catch((err) => {
      console.error('fetchCases failed:', err);
      const fallbackMap = {};
      FALLBACK_CASES.forEach((item) => { fallbackMap[item.id] = item; });
      setCases(fallbackMap);
      if (!selectedCaseId && FALLBACK_CASES.length > 0) {
        setSelectedCaseId(FALLBACK_CASES[0].id);
      }
      setLoading(false);
    });

    let unsubscribe = null; // /// ADDED
    if (!USE_SAMPLE) { // /// ADDED
      unsubscribe = onSnapshot(collection(db, 'cases'), (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const payload = { id: change.doc.id, ...change.doc.data() };
          mergeCase(change.doc.id, payload);
          setTimeout(() => drawOrUpdateRoute({ id: change.doc.id, ...change.doc.data() }), 0); // /// ADDED
        });
      });
    } // /// ADDED

    let simTimer = null;

    const cleanupSockets = setupSocketListeners({
      onCaseLocationUpdate: ({ caseId, location }) => {
        if (!caseId || !location) return;
        mergeCase(caseId, { location });
        const c = { id: caseId, location, accidentLocation: cases[caseId]?.accidentLocation, destinationHospitalId: cases[caseId]?.destinationHospitalId, severity: cases[caseId]?.severity }; // /// ADDED
        drawOrUpdateRoute(c); // /// ADDED
      },
      onCaseSeverityUpdate: ({ caseId, severity }) => {
        if (!caseId || !severity) return;
        mergeCase(caseId, { severity });
      },
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (cleanupSockets) cleanupSockets();
      if (simTimer) clearInterval(simTimer);
      Object.values(markersRef.current).forEach((marker) => marker.setMap(null));
      markersRef.current = {};
    };
  }, [mergeCase, selectedCaseId]);

  useEffect(() => {
    if (!mapRef.current || !window.google) {
      if (DEBUG) console.log('❌ Map not ready: mapRef:', !!mapRef.current, 'google:', !!window.google); // /// ADDED
      return;
    }
    if (DEBUG) console.log('✅ Map ready, creating markers for', caseList.length, 'cases'); // /// ADDED
    // Delay to ensure map is fully initialized
    const timer = setTimeout(() => {
      if (showMarkers) caseList.forEach((caseEntity) => { createOrUpdateMarker(caseEntity); drawOrUpdateRoute(caseEntity); });
    }, 500);
    return () => clearTimeout(timer);
  }, [caseList, createOrUpdateMarker]);

  useEffect(() => { // /// ADDED
    const keyInvalid = !GOOGLE_MAPS_API_KEY || !GOOGLE_MAPS_API_KEY.startsWith('AIza'); // /// ADDED
    if (keyInvalid && !isLoaded) { setForceIframe(true); return; } // /// ADDED
    const timer = setTimeout(() => { if (!isLoaded) setForceIframe(true); }, 4000); // /// ADDED
    return () => clearTimeout(timer); // /// ADDED
  }, [isLoaded]); // /// ADDED

  // Debug: log when cases load
  useEffect(() => {
    if (DEBUG) console.log('📍 LiveMapPage cases loaded:', caseList.length, 'cases'); // /// ADDED
    if (caseList.length > 0) {
      if (DEBUG) console.log('📍 First case location:', caseList[0].location); // /// ADDED
      if (DEBUG) console.log('📍 Map ref ready:', !!mapRef.current, 'Google ready:', !!window.google); // /// ADDED
    }
  }, [caseList]);

  const handleMapLoad = useCallback((mapInstance) => {
    if (DEBUG) console.log('🗺️ GoogleMap loaded'); // /// ADDED
    mapRef.current = mapInstance;
    // Delay marker creation to ensure map is fully ready
    setTimeout(() => {
      if (DEBUG) console.log('🗺️ Creating markers after map load delay'); // /// ADDED
      if (showMarkers) caseList.forEach((caseEntity) => { createOrUpdateMarker(caseEntity); drawOrUpdateRoute(caseEntity); }); // /// ADDED
    }, 300);
  }, [caseList, createOrUpdateMarker]);

  return (
    <Box className="live-map-container">
      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        Live Response Map
      </Typography>
      <Box className="map-board">
        <Box className="map-shell">
          {(loadError || forceIframe) && (
            <Box className="map-fallback" sx={{ height: '80vh' }}>
              <iframe
                title="Map Fallback" // /// ADDED
                width="100%" // /// ADDED
                height="100%" // /// ADDED
                frameBorder="0" // /// ADDED
                src={`https://maps.google.com/maps?q=${(caseList[0]?.location?.lat||defaultCenter.lat)},${(caseList[0]?.location?.lng||defaultCenter.lng)}&z=13&output=embed`} // /// ADDED
                allowFullScreen // /// ADDED
              />
            </Box>
          )}
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={caseList[0]?.location || defaultCenter}
              zoom={13}
              options={mapOptions}
              onLoad={handleMapLoad}
            />
          )}
          {!isLoaded && !loadError && !forceIframe && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>Loading map...</Typography>
            </Box>
          )}
          <Paper className="legend-card" elevation={6}>
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
          </Paper>
          {caseList.map((caseEntity) => (
            <Paper
              key={`info-${caseEntity.id}`}
              className={`map-info-chip${caseEntity.id === selectedCaseId ? ' active' : ''}`}
              elevation={6}
              onClick={() => { setSelectedCaseId(caseEntity.id); if (mapRef.current && caseEntity.location) { mapRef.current.panTo(caseEntity.location); } }}
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

        <Box className="case-panel">
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Active Patients
          </Typography>
          {loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Loading cases...
            </Typography>
          )}
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
                  onClick={() => { setSelectedCaseId(caseEntity.id); if (mapRef.current && caseEntity.location) { mapRef.current.panTo(caseEntity.location); } }}
                >
                  <Box className="case-card-header">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {caseEntity.unitLabel || caseEntity.id.toUpperCase()}
                    </Typography>
                    <Chip label={`ETA: ${caseEntity.eta || '5 min'}`} size="small" color="warning" />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {caseEntity.driverName || caseEntity.operator || 'Assigned Driver'}
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
    </Box>
  );
};

export default LiveMapPage;
