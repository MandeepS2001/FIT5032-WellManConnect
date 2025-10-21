# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCh3p6V9qDsgiMUzYVySAIKJ9ZU64Zj314

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC1WMywai3e2E17DNmZ88YNhCZsAZ8OXOA
VITE_FIREBASE_AUTH_DOMAIN=wellman-connect.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wellman-connect
VITE_FIREBASE_STORAGE_BUCKET=wellman-connect.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=241074085841
VITE_FIREBASE_APP_ID=1:241074085841:web:bda9710cb6dfa09ba78af0
VITE_FIREBASE_MEASUREMENT_ID=G-3NSH0FJ4QG

# SendGrid Configuration
VITE_SENDGRID_API_KEY=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
```

## Vercel Deployment

For Vercel deployment, these environment variables are already configured in `vercel.json`.

## Local Development

1. Create a `.env` file in the root directory
2. Copy the environment variables above
3. Restart the development server: `npm run dev`

## API Key Configuration

### Google Maps API Key
- Make sure the API key is configured in Google Cloud Console
- Add referrer restrictions for localhost: `http://localhost:5176/*`, `http://localhost:5175/*`
- Enable the following APIs:
  - Maps JavaScript API
  - Places API
  - Directions API

### Firebase Configuration
- All Firebase environment variables are already configured
- Firebase project is set up and ready to use

### SendGrid Configuration
- SendGrid API key is configured for email functionality
- Fallback to demo mode if API key is not valid
