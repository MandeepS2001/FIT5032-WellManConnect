/**
 * Firebase Configuration
 * External Authentication Service for WellMan Connect
 */

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
// Note: In production, these should be environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBxQ5qR8vN3mP2oL1rT4sE9uI6wX7cY8z", // Demo API key - replace with actual
  authDomain: "wellman-connect-demo.firebaseapp.com",
  projectId: "wellman-connect-demo",
  storageBucket: "wellman-connect-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Export the app instance
export default app
