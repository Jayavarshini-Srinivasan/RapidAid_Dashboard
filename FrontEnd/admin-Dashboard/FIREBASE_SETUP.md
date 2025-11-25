# Firebase Web App Configuration Setup

## Error: "auth/api-key-not-valid"

This error occurs because the Firebase Web App API key is missing from the `.env` file.

## How to Get Your Firebase Web App Config

### Step 1: Go to Firebase Console
Visit: https://console.firebase.google.com/project/rapidaid-8a617/settings/general

### Step 2: Find Your Web App
- Scroll down to the "Your apps" section
- Look for a web app (</> icon)
- If you don't have one, click "Add app" and select "Web" (</>)

### Step 3: Copy the Config Values
You'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "rapidaid-8a617.firebaseapp.com",
  projectId: "rapidaid-8a617",
  storageBucket: "rapidaid-8a617.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Step 4: Update .env File
Add these three values to `frontend/admin-dashboard/.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Step 5: Restart Frontend Server
After updating the `.env` file:
1. Stop the frontend server (Ctrl+C)
2. Restart it: `npm run dev`

## Current .env File Status

✅ VITE_FIREBASE_PROJECT_ID=rapidaid-8a617
✅ VITE_FIREBASE_AUTH_DOMAIN=rapidaid-8a617.firebaseapp.com
✅ VITE_FIREBASE_STORAGE_BUCKET=rapidaid-8a617.appspot.com
✅ VITE_API_URL=http://localhost:5000/api

❌ VITE_FIREBASE_API_KEY (MISSING - REQUIRED)
❌ VITE_FIREBASE_MESSAGING_SENDER_ID (MISSING - REQUIRED)
❌ VITE_FIREBASE_APP_ID (MISSING - REQUIRED)

## Alternative: Get from Firebase Console Directly

1. Go to: https://console.firebase.google.com/project/rapidaid-8a617/settings/general/web
2. Click on your web app (or create one)
3. Copy the `apiKey`, `messagingSenderId`, and `appId` values
4. Share them and I'll update the .env file for you!

