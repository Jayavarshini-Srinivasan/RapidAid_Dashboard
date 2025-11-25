// /// ADDED
import React from 'react'; // /// ADDED
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Chip, Divider } from '@mui/material'; // /// ADDED

const severityColors = { 1: '#4CAF50', 2: '#FFC107', 3: '#FF9800', 4: '#F44336', 5: '#B71C1C' }; // /// ADDED

export default function ZoneDetailsModal({ zone, onClose }) { // /// ADDED
  const open = Boolean(zone); // /// ADDED
  if (!open) return null; // /// ADDED
  const lvl = Number(zone.severity_level); // /// ADDED
  const color = severityColors[lvl] || '#4CAF50'; // /// ADDED
  return ( // /// ADDED
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth> // /// ADDED
      <DialogTitle> // /// ADDED
        <Stack direction="row" spacing={1} alignItems="center"> // /// ADDED
          <span style={{ width: 14, height: 14, borderRadius: 999, display: 'inline-block', backgroundColor: color, opacity: 0.8, border: `2px solid ${color}` }} /> // /// ADDED
          <Typography variant="h6">{zone.zone_name}</Typography> // /// ADDED
          <Chip label={zone.severity_label} size="small" sx={{ ml: 'auto', backgroundColor: color, color: '#fff' }} /> // /// ADDED
        </Stack> // /// ADDED
      </DialogTitle> // /// ADDED
      <DialogContent dividers> // /// ADDED
        <Stack spacing={1.25}> // /// ADDED
          <Typography variant="body2">Status: {zone.status}</Typography> // /// ADDED
          <Typography variant="body2">Radius: {Number(zone.radius)} meters</Typography> // /// ADDED
          <Typography variant="body2">Coordinates: {Number(zone.latitude).toFixed(4)}, {Number(zone.longitude).toFixed(4)}</Typography> // /// ADDED
          <Divider /> // /// ADDED
          <Typography variant="subtitle2">Description</Typography> // /// ADDED
          <Typography variant="body2">{zone.description || '—'}</Typography> // /// ADDED
          <Divider /> // /// ADDED
          <Typography variant="subtitle2">Metadata</Typography> // /// ADDED
          <Typography variant="body2">{JSON.stringify(zone.metadata || {}, null, 2)}</Typography> // /// ADDED
          <Divider /> // /// ADDED
          <Typography variant="caption">Created: {zone.created_at}</Typography> // /// ADDED
          <Typography variant="caption">Updated: {zone.updated_at}</Typography> // /// ADDED
        </Stack> // /// ADDED
      </DialogContent> // /// ADDED
      <DialogActions> // /// ADDED
        <Button onClick={onClose} variant="contained">Close</Button> // /// ADDED
      </DialogActions> // /// ADDED
    </Dialog> // /// ADDED
  ); // /// ADDED
} // /// ADDED