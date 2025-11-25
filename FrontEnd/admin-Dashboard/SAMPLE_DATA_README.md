# Sample Data Integration ✅

## Overview

Sample data has been added to the project so you can test the dashboard without needing all backend endpoints implemented.

## What's Included

### Sample Data (`src/utils/sampleData.js`)

1. **4 Sample Drivers**
   - 3 on-duty drivers with live locations
   - 1 off-duty driver
   - Includes: name, email, phone, ambulance number, status, location

2. **5 Sample Patients**
   - Various registration dates
   - Contact information included

3. **4 Sample Emergency Requests**
   - Different statuses: pending, accepted, in_progress, completed
   - Different severity levels: Critical, High, Medium, Low
   - Some assigned to drivers, some unassigned
   - Includes location coordinates for map display

4. **4 Sample Hospitals**
   - Hospital names and addresses
   - Total beds and available beds
   - Location coordinates

5. **Dashboard Metrics**
   - Pre-calculated metrics matching the sample data

## How It Works

### Automatic Fallback
The API service automatically uses sample data if:
- `VITE_USE_SAMPLE_DATA=true` in `.env` file (enabled by default)
- OR if the real API call fails

### Configuration

In `.env` file:
```env
# Use sample data (set to false to use real API)
VITE_USE_SAMPLE_DATA=true
```

### API Service Behavior

The `adminAPI` functions now:
1. Check if sample data mode is enabled
2. If enabled, return sample data with simulated delay
3. If disabled, try real API call
4. If API fails, automatically fallback to sample data

## Sample Data Details

### Drivers
- **John Smith** - AMB-001 - On Duty - Location: 28.6139, 77.2090
- **Sarah Johnson** - AMB-002 - On Duty - Location: 28.6140, 77.2091
- **Mike Wilson** - AMB-003 - Off Duty
- **Emily Davis** - AMB-004 - On Duty - Location: 28.6145, 77.2095

### Emergency Requests
- **e1** - Robert Brown - High severity - In Progress - Assigned to John Smith
- **e2** - Lisa Anderson - Medium severity - Accepted - Assigned to Sarah Johnson
- **e3** - David Lee - Critical severity - Pending - Unassigned
- **e4** - Maria Garcia - Low severity - Completed - Assigned to Emily Davis

### Hospitals
- City General Hospital - 200 beds (45 available)
- Regional Medical Center - 150 beds (12 available)
- Emergency Care Hospital - 100 beds (8 available)
- Community Health Center - 80 beds (25 available)

## Testing Features

### Live Map Page
- ✅ Shows 3 active drivers (blue markers)
- ✅ Shows 3 active emergencies (red markers)
- ✅ Click markers to see details
- ✅ Assign drivers to unassigned emergencies
- ✅ Info windows with driver/emergency details

### Dashboard
- ✅ Shows metrics: 4 drivers, 5 patients, 4 emergencies
- ✅ Color-coded stat cards
- ✅ Recent activity summary

### All Pages
- ✅ Drivers table with status chips
- ✅ Patients table with registration dates
- ✅ Emergencies table with status and actions
- ✅ Hospitals table with bed availability
- ✅ Complete request functionality works with sample data

## Switching to Real API

When your backend is ready:

1. Set in `.env`:
   ```env
   VITE_USE_SAMPLE_DATA=false
   ```

2. Restart the frontend server

3. The app will now use real API calls

4. If API fails, it will still fallback to sample data (helpful for development)

## Benefits

✅ **Test UI without backend** - See how everything looks and works
✅ **Automatic fallback** - Never breaks, always shows data
✅ **Realistic delays** - Simulates API response time
✅ **Easy switching** - One env variable to toggle
✅ **Development friendly** - Works offline, no backend needed

---

**Status: Sample Data Active ✅**
**Default: Sample data is enabled**
**To disable: Set `VITE_USE_SAMPLE_DATA=false` in `.env`**

