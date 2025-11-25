# RapidAid Full-Stack System

Complete production-ready Emergency Medical Services (EMS) system with Node.js backend, React Native mobile apps, and React web dashboard.

## 🏗️ Architecture

```
rapidaid-fullstack/
├── backend/              # Node.js + Express + Firestore
├── frontend/
│   ├── patient-app/      # React Native (Expo) - Patient App
│   ├── driver-app/       # React Native (Expo) - Driver App
│   └── admin-dashboard/  # React Web (Vite) - Admin Dashboard
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Firebase project with Firestore enabled
- Firebase Admin SDK credentials

### 1. Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or install individually
cd backend && npm install
cd ../frontend/patient-app && npm install
cd ../frontend/driver-app && npm install
cd ../frontend/admin-dashboard && npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

**Patient/Driver Apps** (`.env` or `app.json`):
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

**Admin Dashboard** (`.env`):
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Applications

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Patient App:**
```bash
cd frontend/patient-app
npm start
```

**Terminal 3 - Driver App:**
```bash
cd frontend/driver-app
npm start
```

**Terminal 4 - Admin Dashboard:**
```bash
cd frontend/admin-dashboard
npm run dev
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Patient
- `POST /api/patient/emergency` - Create emergency request
- `GET /api/patient/emergency` - Get my emergency
- `GET /api/patient/emergency/driver` - Get assigned driver
- `GET /api/patient/profile` - Get profile
- `PUT /api/patient/profile` - Update profile

### Driver
- `POST /api/driver/duty/toggle` - Toggle duty status
- `POST /api/driver/location` - Update location
- `GET /api/driver/requests/assigned` - Get assigned requests
- `GET /api/driver/requests/pending` - Get pending requests
- `POST /api/driver/requests/:id/accept` - Accept request
- `POST /api/driver/requests/:id/reject` - Reject request
- `POST /api/driver/requests/:id/complete` - Complete request
- `GET /api/driver/stats` - Get driver stats

### Admin
- `GET /api/admin/drivers` - List all drivers
- `GET /api/admin/patients` - List all patients
- `GET /api/admin/emergencies` - List all emergencies
- `GET /api/admin/dashboard/metrics` - Dashboard metrics

### ML (Placeholder)
- `GET /api/ml/placeholder` - ML endpoint placeholder

## 🔥 Firestore Collections

- `users` - User profiles (patients, drivers, admins)
- `emergencies` - Emergency requests
- `liveLocations` - Real-time driver locations

## 🔐 Authentication

All apps use Firebase Authentication with custom claims for roles:
- `patient` - Patient users
- `driver` - Driver/Paramedic users
- `admin` - Admin users

Backend verifies Firebase ID tokens via Firebase Admin SDK.

## 📱 Frontend Apps

### Patient App
- Request emergencies with location
- Track assigned ambulance in real-time
- View/edit medical profile

### Driver App
- Toggle on/off duty status
- View and accept/reject emergency requests
- Update live location to Firestore
- View assigned requests

### Admin Dashboard
- View all drivers, patients, emergencies
- Dashboard metrics
- Real-time updates via Firestore listeners

## 🔄 Real-Time Features

**Firestore Listeners:**
- Patient app listens to driver location: `onSnapshot(doc(db, "liveLocations", driverId))`
- Admin dashboard listens to all locations: `onSnapshot(collection(db, "liveLocations"))`
- Admin dashboard listens to emergencies: `onSnapshot(collection(db, "emergencies"))`

**Location Updates:**
- Driver app updates location to Firestore every 5 seconds when on duty
- Backend also receives location updates via API

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- Firebase Admin SDK
- Firestore

**Frontend:**
- React Native (Expo) - Mobile apps
- React + Vite - Admin dashboard
- Firebase SDK
- Axios for API calls

## 📦 Deployment

Each application can be deployed independently:
- Backend: Deploy to Heroku, Railway, or any Node.js hosting
- Patient/Driver Apps: Build with Expo and deploy to App Store/Play Store
- Admin Dashboard: Build with Vite and deploy to Vercel, Netlify, etc.

## 🔧 Development

All apps support hot reload:
- Backend: `npm run dev` (nodemon)
- Patient/Driver: Expo dev server
- Admin: Vite dev server

## 📄 License

Private project - Emergency Medical Services System

