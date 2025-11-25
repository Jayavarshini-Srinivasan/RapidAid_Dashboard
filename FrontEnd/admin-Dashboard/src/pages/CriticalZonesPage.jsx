import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';  
import { GoogleMap, useLoadScript, Circle, InfoWindow, Marker } from '@react-google-maps/api';  
import { Box, Paper, Typography, CircularProgress, Chip, TextField, InputAdornment, IconButton, Snackbar, Alert, Stack, Button, Tooltip } from '@mui/material';  
import SearchIcon from '@mui/icons-material/Search';  
import RefreshRounded from '@mui/icons-material/RefreshRounded';  
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import { adminAPI } from '../services/api';  
import ZonesLegend from '../components/criticalZones/ZonesLegend';  
import ZoneDetailsModal from '../components/criticalZones/ZoneDetailsModal';  
import '../styles/CriticalZonesPage.css';  

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBV0HSC6CPK2w9URvH_FxNXPjBEG52BGcA';  
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';  
const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE_DATA === 'true';  

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '80vh' };  
const indiaCenter = { lat: 22.9734, lng: 78.6569 };  
const mapOptions = { zoomControl: true, streetViewControl: false, mapTypeControl: true, fullscreenControl: true };  

const severityColors = {  
  1: '#00FF00',  
  2: '#FFA500',  
  3: '#FF9800',  
  4: '#FF0000',  
  5: '#B71C1C',  
};  

// how many predictions to render at most to avoid overwhelming the map
const MAX_PREDICTIONS_TO_RENDER = Number(import.meta.env.VITE_MAX_PREDICTIONS) || 1000;

const severityLabelToNum = (label) => {
  if (label == null) return 1;
  if (typeof label === 'number') return label;
  const map = { Low: 1, Medium: 2, High: 3, Critical: 4, Extreme: 5 };
  return map[label] || 1;
};

const severityToRadius = (label) => {
  const map = { Low: 500, Medium: 1000, High: 1400, Critical: 2000, Extreme: 3000 };
  return map[label] || 1000;
};

export default function CriticalZonesPage() {  
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });  
  const mapRef = useRef(null); // store google map instance
  const [zones, setZones] = useState([]);
  const [importedPreds, setImportedPreds] = useState([]); // predictions loaded from file
  const [filteredSeverity, setFilteredSeverity] = useState(new Set([1,2,3,4,5]));  
  const [search, setSearch] = useState('');  
  const [hoveredZoneId, setHoveredZoneId] = useState(null);  
  const [selectedZone, setSelectedZone] = useState(null);  
  const [loading, setLoading] = useState(false);  
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });  
  const pollRef = useRef(null);  
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [predictionsLoaded, setPredictionsLoaded] = useState(false);
  const clearPredictions = useCallback(() => {
    setImportedPreds([]);
    setPredictionsLoaded(false);
    setSnack({ open: true, message: 'Predictions cleared', severity: 'success' });
  }, []);

  // merged view of server zones + imported predictions (keeps predictions stable across refresh)
  const mergedZones = useMemo(() => {
    return [...(zones || []), ...(importedPreds || [])];
  }, [zones, importedPreds]);

  const hoveredZone = useMemo(() => mergedZones.find(z => z.zone_id === hoveredZoneId), [mergedZones, hoveredZoneId]);
  const selectedZoneMemo = useMemo(() => mergedZones.find(z => z.zone_id === selectedZone?.zone_id) || selectedZone, [mergedZones, selectedZone]);

  const fetchZones = useCallback(async (silent = false) => {  
    if (!silent) setLoading(true);  
    try {  
      const res = await adminAPI.getCriticalZones();  
      const data = res?.data?.data || [];  
      setZones(Array.isArray(data) ? data : []);  
      if (!silent) setSnack({ open: true, message: 'Zones updated', severity: 'success' });  
    } catch (e) {  
      setSnack({ open: true, message: e?.message || 'Failed to load zones', severity: 'error' });  
    } finally {  
      setLoading(false);  
    }  
  }, []);  

  useEffect(() => {  
    fetchZones();  
    pollRef.current = setInterval(() => { fetchZones(true); }, 45000);  
    return () => { if (pollRef.current) clearInterval(pollRef.current); };  
  }, [fetchZones]);  
  
  // load predictions from possible locations and merge as importedPreds
  const loadPredictions = useCallback(async () => {
    setPredictionsLoading(true);
    try {
      const baseCandidates = [
        '/output/predictions.json',
        `${window.location.origin}/output/predictions.json`,
        '/predictions.json',
        `${window.location.origin}/predictions.json`,
        `${API_BASE_URL.replace('/api', '')}/output/predictions.json`,
        `${API_BASE_URL.replace('/api', '')}/predictions.json`,
      ];

      let json = null;
      for (const url of baseCandidates) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          json = await res.json();
          break;
        } catch (_) { /* try next candidate */ }
      }

      if (!json || !Array.isArray(json.predictions)) {
        setSnack({ open: true, message: 'Predictions file not found or invalid', severity: 'error' });
        return;
      }

      const severityCodeToLabel = (code) => ({ 0: 'Critical', 1: 'Low', 2: 'Medium' }[code] || 'Low');
      const normalizeSeverity = (val) => {
        const s = String(val ?? '').trim().toLowerCase();
        if (s === 'critical' || s === 'crit') return 'Critical';
        if (s === 'medium' || s === 'med' || s === 'moderate') return 'Medium';
        if (s === 'low') return 'Low';
        if (s === 'high') return 'High';
        if (s === 'extreme') return 'Extreme';
        return 'Low';
      };
      const severityFromPrediction = (p) => normalizeSeverity(p.actual_severity ?? p.severity ?? severityCodeToLabel(p.actual_severity_code));

      // Build allowed labels set from current numeric filter
      const allowedLabelsSet = new Set(
        Array.from(filteredSeverity).map((lvl) => ({ 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical', 5: 'Extreme' }[lvl] || 'Low'))
      );

      const preds = Array.isArray(json.predictions) ? json.predictions : [];
      const filteredPreds = preds.filter((p) => {
        const lat = Number(p.latitude ?? p.lat ?? p.y);
        const lng = Number(p.longitude ?? p.lng ?? p.x);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
        const label = severityFromPrediction(p);
        if (!label || !allowedLabelsSet.has(label)) return false;
        return true;
      }).slice(0, MAX_PREDICTIONS_TO_RENDER);

      const predictionZones = filteredPreds.map((p, i) => {
        const lat = Number(p.latitude ?? p.lat ?? p.y);
        const lng = Number(p.longitude ?? p.lng ?? p.x);
        const sevLabel = severityFromPrediction(p);
        return {
          zone_id: `pred-${p.id ?? `${lat},${lng},${i}`}`,
          zone_name: `Prediction ${p.id ?? i + 1}`,
          latitude: lat,
          longitude: lng,
          radius: severityToRadius(sevLabel),
          severity_level: severityLabelToNum(sevLabel),
          severity_label: sevLabel,
          status: 'predicted',
          description: `Confidence: ${Number(p.confidence || 0).toFixed(3)}`,
          metadata: { probabilities: p.probabilities || {}, confidence: p.confidence },
          created_at: json.metadata?.generated_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      setImportedPreds((prevImported) => {
        const map = {};
        (prevImported || []).forEach((z) => { if (z && z.zone_id) map[z.zone_id] = z; });
        predictionZones.forEach((z) => { map[z.zone_id] = z; });
        return Object.values(map);
      });

      setSnack({ open: true, message: `Loaded ${predictionZones.length} predictions`, severity: 'success' });
      setPredictionsLoaded(true);

      // Optional: ensure map fits to new predictions promptly
      setTimeout(() => {
        if (!mapRef.current || !window.google) return;
        const list = predictionZones;
        if (!list.length) return;
        const bounds = new window.google.maps.LatLngBounds();
        list.forEach((z) => bounds.extend({ lat: z.latitude, lng: z.longitude }));
        try { mapRef.current.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 }); } catch (_) { /* ignore */ }
      }, 0);
    } catch (e) {
      console.warn('Failed to load predictions', e);
      setSnack({ open: true, message: e?.message || 'Failed to load predictions', severity: 'error' });
    } finally {
      setPredictionsLoading(false);
    }
  }, [filteredSeverity]);
  
  useEffect(() => {  
  loadPredictions();  
  }, [loadPredictions]);

  const filteredZones = useMemo(() => {  
    const s = search.trim().toLowerCase();  
    return mergedZones.filter((z) => {  
      const okSeverity = filteredSeverity.has(Number(z.severity_level));  
      const okSearch = !s || (z.zone_name || '').toLowerCase().includes(s);  
      return okSeverity && okSearch;  
    });  
  }, [mergedZones, filteredSeverity, search]);  

  const initialCenter = useMemo(() => {
    for (let i = 0; i < filteredZones.length; i++) {
      const lat = Number(filteredZones[i]?.latitude);
      const lng = Number(filteredZones[i]?.longitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lng };
      }
    }
    return indiaCenter;
  }, [filteredZones]);

  // auto-fit map to filtered zones
  useEffect(() => {
    if (!isLoaded || !mapRef.current || typeof window === 'undefined' || !window.google) return;
    if (!filteredZones || filteredZones.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    let hasLocation = false;
    filteredZones.forEach((z) => {
      const lat = Number(z.latitude);
      const lng = Number(z.longitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        bounds.extend({ lat, lng });
        hasLocation = true;
      }
    });
    if (!hasLocation) return;
    try {
      mapRef.current.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
    } catch (err) {
      try {
        mapRef.current.panTo({ lat: Number(filteredZones[0].latitude), lng: Number(filteredZones[0].longitude) });
        mapRef.current.setZoom(6);
      } catch (e) {/* ignore */}
    }
  }, [isLoaded, filteredZones]);

  const severityCounts = useMemo(() => {  
    const counts = { 1:0,2:0,3:0,4:0,5:0 };  
    mergedZones.forEach((z) => { const lvl = Number(z.severity_level); if (counts[lvl] != null) counts[lvl]++; });  
    return counts;  
  }, [mergedZones]);  

  const toggleSeverity = (lvl, event) => {
    setFilteredSeverity((prev) => {
      // Shift+Click isolates the selected severity
      if (event?.shiftKey) {
        return new Set([lvl]);
      }
      const next = new Set(prev);
      if (next.has(lvl)) next.delete(lvl); else next.add(lvl);
      // Prevent empty selection: revert to all
      if (next.size === 0) return new Set([1, 2, 3, 4, 5]);
      return next;
    });
  };  

  const handleCircleMouseOver = (zone) => { setHoveredZoneId(zone.zone_id); };  
  const handleCircleMouseOut = () => { setHoveredZoneId(null); };  
  const handleCircleClick = (zone) => {
    setSelectedZone(zone);
    if (mapRef.current && window.google && zone) {
      try {
        mapRef.current.panTo({ lat: Number(zone.latitude), lng: Number(zone.longitude) });
        mapRef.current.setZoom(Math.max(8, Math.floor(12 - (Number(zone.radius) / 2000))));
      } catch (e) { console.warn('Failed to pan/zoom to zone', e); }
    }
  };

  
  if (loadError) { 
    return (  
      <Box sx={{ p: 3 }}>  
        <Alert severity="error">Failed to load Google Maps</Alert>  
      </Box> 
    ); 
  } 

  return ( 
    <Box className="critical-zones-container">  
      <Box className="cz-header">  
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Critical Zones</Typography>  
        <Typography variant="body2" color="text.secondary">Monitor risk zones and hotspots across regions</Typography>  
      </Box>  

      <Paper elevation={3} sx={{ p: 2, mb: 2 }} className="cz-toolbar">  
        <Stack direction="row" spacing={2} alignItems="center" className="cz-toolbar-row">  
          <TextField 
            placeholder="Search zones by name" 
            size="small" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            InputProps={{ 
              startAdornment: ( 
                <InputAdornment position="start"> 
                  <SearchIcon />  
                </InputAdornment>  
              ),  
            }}  
            sx={{ width: 340 }}  
          />  
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>  
            {[1,2,3,4,5].map((lvl) => (
              <Tooltip key={lvl} title="Click to toggle. Shift+Click to show only this severity.">
                <Chip
                  label={`${['Low','Medium','High','Critical','Extreme'][lvl-1]} (${severityCounts[lvl] || 0})`}
                  onClick={(e) => toggleSeverity(lvl, e)}
                  color={filteredSeverity.has(lvl) ? 'primary' : 'default'}
                  variant={filteredSeverity.has(lvl) ? 'filled' : 'outlined'}
                  sx={{ borderColor: severityColors[lvl], color: filteredSeverity.has(lvl) ? '#fff' : severityColors[lvl], backgroundColor: filteredSeverity.has(lvl) ? severityColors[lvl] : 'transparent' }}
                />
              </Tooltip>
            ))}  
          </Stack>  
          <Box sx={{ flex: 1 }} />  
          <IconButton aria-label="Refresh zones" onClick={() => fetchZones()} disabled={loading}>  
            <RefreshRounded />  
          </IconButton>  
          <IconButton aria-label="Load predictions" onClick={() => loadPredictions()} disabled={loading || predictionsLoading} color={predictionsLoaded ? 'primary' : 'default'}>
            <CloudDownloadRounded />
          </IconButton>
          <IconButton aria-label="Clear predictions" onClick={() => clearPredictions()} disabled={predictionsLoading || !predictionsLoaded}>
            <ClearAllRounded />
          </IconButton>
         </Stack>  
       </Paper>  

      <Box className="cz-map-wrapper">  
        {!isLoaded && (  
          <Box className="cz-map-loading">  
            <CircularProgress />  
          </Box>  
        )}  
        {isLoaded && (  
          <>  
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={initialCenter}
              zoom={5}
              options={mapOptions}
              onLoad={(map) => {
                mapRef.current = map;
                if (filteredZones.length > 0) {
                  const bounds = new window.google.maps.LatLngBounds();
                  filteredZones.forEach((z) => bounds.extend({ lat: Number(z.latitude), lng: Number(z.longitude) }));
                  try { map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 }); } catch (err) { /* ignore */ }
                }
              }}
            >
              {(() => {
                const isModel = (z) => (z?.status === 'predicted') || (z?.metadata && z.metadata.zone_type === 'model');
                const modelPoints = filteredZones.filter(isModel);
                const areaZones = filteredZones.filter((z) => !isModel(z));

                const colorFromLabel = (label) => {
                  const l = (label || '').toString();
                  if (l === 'Critical') return '#FF0000';
                  if (l === 'Medium') return '#FFA500';
                  if (l === 'Low') return '#00FF00';
                  return severityColors[severityLabelToNum(label)] || '#00FF00';
                };

                const iconFor = (z) => ({
                  path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                  scale: 6,
                  fillColor: colorFromLabel(z.severity_label),
                  fillOpacity: 0.9,
                  strokeColor: colorFromLabel(z.severity_label),
                  strokeWeight: 1.5,
                });

                return (
                  <>
                    {modelPoints.map((z) => (
                      <Marker
                        key={`m_${z.zone_id}`}
                        position={{ lat: Number(z.latitude), lng: Number(z.longitude) }}
                        icon={iconFor(z)}
                        onClick={() => handleCircleClick(z)}
                      />
                    ))}
                    {areaZones.map((zone) => {
                      const isHovered = hoveredZoneId === zone.zone_id;
                      const color = severityColors[Number(zone.severity_level)] || '#4CAF50';
                      return (
                        <Circle
                          key={zone.zone_id}
                          center={{ lat: Number(zone.latitude), lng: Number(zone.longitude) }}
                          radius={Number(zone.radius) || 1000}
                          options={{
                            strokeColor: color,
                            strokeOpacity: 0.9,
                            strokeWeight: isHovered ? 3 : 1.5,
                            fillColor: color,
                            fillOpacity: isHovered ? 0.45 : 0.35,
                            clickable: true,
                            zIndex: isHovered ? 99999 : 1,
                          }}
                          onMouseOver={() => handleCircleMouseOver(zone)}
                          onMouseOut={handleCircleMouseOut}
                          onClick={() => handleCircleClick(zone)}
                        />
                      );
                    })}
                  </>
                );
              })()}
              {/* Hovered InfoWindow */}
              {hoveredZone && hoveredZone.latitude && hoveredZone.longitude && (
                <InfoWindow
                  position={{ lat: Number(hoveredZone.latitude), lng: Number(hoveredZone.longitude) }}
                  options={{ zIndex: 1000000 }}
                >
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{hoveredZone.zone_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{hoveredZone.severity_label}</Typography>
                  </Box>
                </InfoWindow>
              )}
              {/* Selected zone InfoWindow */}
              {selectedZoneMemo && selectedZoneMemo.latitude && selectedZoneMemo.longitude && (
                <InfoWindow
                  position={{ lat: Number(selectedZoneMemo.latitude), lng: Number(selectedZoneMemo.longitude) }}
                  onCloseClick={() => setSelectedZone(null)}
                >
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedZoneMemo.zone_name}</Typography>
                    <Typography variant="body2">Severity: {selectedZoneMemo.severity_label}</Typography>
                    <Button size="small" onClick={() => { setSelectedZone(selectedZoneMemo); }}>Details</Button>
                  </Box>
                </InfoWindow>
              )}
            </GoogleMap>
            {filteredZones.length === 0 && (  
              <Box className="cz-empty-overlay">  
                <Typography variant="body2" color="text.secondary">No zones to display</Typography>  
              </Box>  
            )}  
          </>  
         )}  

         <Box className="cz-legend">  
           <ZonesLegend counts={severityCounts} />  
         </Box>  
       </Box>  

      <ZoneDetailsModal zone={selectedZone} onClose={() => setSelectedZone(null)} />  

      <Snackbar  
        open={snack.open}  
        autoHideDuration={2500}  
        onClose={() => setSnack({ ...snack, open: false })}  
        message={snack.message}  
      />  
    </Box>  
  );  
}