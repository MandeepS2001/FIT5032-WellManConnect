/**
 * Firebase Authentication Service
 * Handles external authentication for WellMan Connect
 */

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data
 */
export const signInWithFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    const userData = userDoc.exists() ? userDoc.data() : {}
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      ...userData
    }
  } catch (error) {
    console.error('Firebase sign in error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Create new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} userData - Additional user data
 * @returns {Promise<Object>} User data
 */
export const signUpWithFirebase = async (email, password, userData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Update user profile
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    })
    
    // Save additional user data to Firestore
    const userDocData = {
      uid: user.uid,
      email: user.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      phoneNumber: userData.phoneNumber,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
    
    await setDoc(doc(db, 'users', user.uid), userDocData)
    
    return userDocData
  } catch (error) {
    console.error('Firebase sign up error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOutFromFirebase = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Firebase sign out error:', error)
    throw new Error('Failed to sign out')
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const resetPasswordWithFirebase = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error('Firebase password reset error:', error)
    throw new Error(getFirebaseErrorMessage(error.code))
  }
}

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get additional user data from Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.exists() ? userDoc.data() : {}
        
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          ...userData
        })
      } catch (error) {
        console.error('Error fetching user data:', error)
        callback(null)
      }
    } else {
      callback(null)
    }
  })
}

/**
 * Get current user data
 * @returns {Object|null} Current user data or null
 */
export const getCurrentFirebaseUser = () => {
  const user = auth.currentUser
  if (!user) return null
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified
  }
}

/**
 * Convert Firebase error codes to user-friendly messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'No user found with this email address.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/requires-recent-login': 'Please sign in again to perform this action.'
  }
  
  return errorMessages[errorCode] || 'An authentication error occurred.'
}

/**
 * Check if Firebase is properly configured
 * @returns {boolean} True if Firebase is configured
 */
export const isFirebaseConfigured = () => {
  return !!(auth && db)
}

export default {
  signInWithFirebase,
  signUpWithFirebase,
  signOutFromFirebase,
  resetPasswordWithFirebase,
  onAuthStateChange,
  getCurrentFirebaseUser,
  isFirebaseConfigured
}
