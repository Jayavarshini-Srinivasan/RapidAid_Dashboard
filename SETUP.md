# Setup Guide

## Complete Project Structure

```
rapidaid-fullstack/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── patient.routes.js
│   │   │   ├── driver.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── ml.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── patient.controller.js
│   │   │   ├── driver.controller.js
│   │   │   └── admin.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── emergency.service.js
│   │   │   ├── driver.service.js
│   │   │   └── admin.service.js
│   │   ├── repositories/
│   │   │   ├── user.repository.js
│   │   │   ├── emergency.repository.js
│   │   │   └── driver.repository.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   └── role.middleware.js
│   │   ├── utils/
│   │   │   └── response.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .gitignore
│
├── frontend/
│   ├── patient-app/
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   │   ├── LoginScreen.jsx
│   │   │   │   ├── RegisterScreen.jsx
│   │   │   │   ├── HomeScreen.jsx
│   │   │   │   ├── RequestEmergencyScreen.jsx
│   │   │   │   ├── TrackAmbulanceScreen.jsx
│   │   │   │   └── ProfileScreen.jsx
│   │   │   ├── navigation/
│   │   │   │   └── AppNavigator.js
│   │   │   ├── services/
│   │   │   │   └── api.js
│   │   │   └── context/
│   │   │       └── AuthContext.js
│   │   ├── firebaseConfig.js
│   │   ├── App.js
│   │   ├── app.json
│   │   └── package.json
│   │
│   ├── driver-app/
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   │   ├── LoginScreen.jsx
│   │   │   │   ├── RegisterScreen.jsx
│   │   │   │   ├── DashboardScreen.jsx
│   │   │   │   ├── AssignedRequestsScreen.jsx
│   │   │   │   └── ProfileScreen.jsx
│   │   │   ├── navigation/
│   │   │   │   └── AppNavigator.js
│   │   │   ├── services/
│   │   │   │   └── api.js
│   │   │   └── context/
│   │   │       └── AuthContext.js
│   │   ├── firebaseConfig.js
│   │   ├── App.js
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── admin-dashboard/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── LoginPage.jsx
│       │   │   ├── DashboardPage.jsx
│       │   │   ├── DriversPage.jsx
│       │   │   ├── PatientsPage.jsx
│       │   │   └── EmergenciesPage.jsx
│       │   ├── components/
│       │   │   └── Layout.jsx
│       │   ├── services/
│       │   │   └── api.js
│       │   ├── context/
│       │   │   └── AuthContext.jsx
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── firebaseConfig.js
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
│
├── package.json
├── README.md
└── .gitignore
```

## Firebase Setup

1. Create Firebase project
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Generate Admin SDK credentials
5. Add Firebase config to all frontend apps

## Backend Environment Variables

Create `backend/.env`:
```
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

## Frontend Environment Variables

**Patient/Driver Apps** - Use Expo environment variables or update `app.json`:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_API_URL`

**Admin Dashboard** - Create `.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:5000/api
```

## Running the System

1. Start backend: `cd backend && npm run dev`
2. Start patient app: `cd frontend/patient-app && npm start`
3. Start driver app: `cd frontend/driver-app && npm start`
4. Start admin: `cd frontend/admin-dashboard && npm run dev`

## Testing Flow

1. Register as patient → Create emergency request
2. Register as driver → Toggle on duty → Accept request
3. Patient tracks driver location (Firestore listener)
4. Admin views all data in dashboard

