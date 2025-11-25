// /// ADDED
import React, { useState } from 'react';
import { Paper, Typography, Stack, Chip, IconButton, Divider } from '@mui/material';
import ExpandLessRounded from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';

const severityColors = { 1: '#00FF00', 2: '#FFA500', 3: '#FF9800', 4: '#FF0000', 5: '#B71C1C' }; // /// ADDED
const labels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical', 5: 'Extreme' }; // /// ADDED

export default function ZonesLegend({ counts = { 1:0,2:0,3:0,4:0,5:0 } }) {
  const [open, setOpen] = useState(true);
  return (
    <Paper elevation={6} sx={{ p: 1.5, minWidth: 240, borderRadius: 2, boxShadow: 6 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: open ? 1 : 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Severity</Typography>
        <IconButton size="small" onClick={() => setOpen(!open)} aria-label="Toggle legend">
          {open ? <ExpandLessRounded /> : <ExpandMoreRounded />}
        </IconButton>
      </Stack>
      {open && (
        <>
          <Divider sx={{ mb: 1 }} />
          <Stack spacing={0.75}>
            {[1,2,3,4,5].map((lvl) => (
              <Stack key={lvl} direction="row" alignItems="center" spacing={1}>
                <span style={{ width: 12, height: 12, borderRadius: 999, display: 'inline-block', backgroundColor: severityColors[lvl], border: `2px solid ${severityColors[lvl]}` }} />
                <Typography variant="body2" sx={{ minWidth: 72 }}>{labels[lvl]}</Typography>
                <Chip size="small" label={counts[lvl] || 0} variant="outlined" sx={{ ml: 'auto' }} />
              </Stack>
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
}