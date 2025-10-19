/**
 * Firebase Configuration
 * External Authentication Service for WellMan Connect
 */

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration
// Your actual Firebase project configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC1WMywai3e2E17DNmZ88YNhCZsAZ8OXOA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wellman-connect.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wellman-connect",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wellman-connect.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "241074085841",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:241074085841:web:bda9710cb6dfa09ba78af0",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3NSH0FJ4QG"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Firebase Analytics and get a reference to the service
export const analytics = getAnalytics(app)

// Export the app instance
export default app
