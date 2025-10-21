<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { verifyPassword, loadUserFromStorage } from '../utils/passwordManager'
import { signInWithFirebase } from '../services/firebaseAuth'
import { formAccessibility, ariaUtils, validationAccessibility, keyboardNavigation } from '../utils/accessibility'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Form data
const formData = reactive({
  email: '',
  password: ''
})

// Validation state
const validation = reactive({
  email: { isValid: false, message: '' },
  password: { isValid: false, message: '' }
})

// Form state
const isSubmitting = ref(false)
const loginError = ref('')
const showPassword = ref(false)

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    validation.email = { isValid: false, message: 'Email is required' }
    return false
  }
  if (!emailRegex.test(email)) {
    validation.email = { isValid: false, message: 'Please enter a valid email address' }
    return false
  }
  validation.email = { isValid: true, message: '' }
  return true
}

const validatePassword = (password) => {
  if (!password) {
    validation.password = { isValid: false, message: 'Password is required' }
    return false
  }
  validation.password = { isValid: true, message: '' }
  return true
}

// Real-time validation handlers
const handleEmailChange = () => {
  validateEmail(formData.email)
  loginError.value = '' // Clear error when user types
}

const handlePasswordChange = () => {
  validatePassword(formData.password)
  loginError.value = '' // Clear error when user types
}

// Computed properties
const isFormValid = computed(() => {
  return validation.email.isValid && validation.password.isValid
})

// Authentication functions
const generateToken = () => {
  return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

const handleLogin = async () => {
  // Validate form
  const emailValid = validateEmail(formData.email)
  const passwordValid = validatePassword(formData.password)
  
  if (!emailValid || !passwordValid) {
    return
  }

  isSubmitting.value = true
  loginError.value = ''

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Try Firebase authentication first
    try {
      const user = await signInWithFirebase(formData.email, formData.password)
      
      if (user) {
        // Firebase authentication successful
        authStore.login(user)
        
        // Update user's last login
        user.lastLogin = new Date().toISOString()
        
        // Redirect based on role or intended destination
        const redirectPath = route.query.redirect || (user.role === 'admin' ? '/admin' : '/account')
        router.push(redirectPath)
        return
      }
    } catch (firebaseError) {
      console.log('Firebase auth failed, trying local storage...', firebaseError.message)
    }

    // Fallback to local storage authentication
    const user = loadUserFromStorage(formData.email)

    if (!user) {
      loginError.value = 'Invalid email or password'
      return
    }

    // Verify password using centralized password manager
    const isValidPassword = await verifyPassword(formData.password, user.password)
    
    if (!isValidPassword) {
      loginError.value = 'Invalid email or password'
      return
    }

    // Create session using auth store
    authStore.login(user)
    
    // Update user's last login
    user.lastLogin = new Date().toISOString()
    localStorage.setItem('wellman_users', JSON.stringify(users))

    // Redirect based on role or intended destination
    const redirectPath = route.query.redirect || (user.role === 'admin' ? '/admin' : '/account')
    router.push(redirectPath)

  } catch (error) {
    console.error('Login failed:', error)
    loginError.value = 'Login failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const handleDemoLogin = async () => {
  formData.email = 'demo@wellman.com'
  formData.password = 'Demo123!'
  
  // Create demo user if it doesn't exist
  const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
  const demoUser = users.find(u => u.email === 'demo@wellman.com')
  
  if (!demoUser) {
    // Import password manager functions
    const { createStandardUser, saveUserToStorage } = await import('../utils/passwordManager')
    
    const demoUserData = {
      id: Date.now(),
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@wellman.com',
      password: 'Demo123!', // Plain text password - will be encoded by createStandardUser
      role: 'user',
      createdAt: new Date().toISOString()
    }
    
    const newDemoUser = await createStandardUser(demoUserData)
    saveUserToStorage(newDemoUser)
  }
  
  await handleLogin()
}
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-lg border-0">
          <div class="card-header text-center">
            <h1 class="mb-0" id="login-heading">Welcome Back</h1>
            <p class="text-muted mb-0">Sign in to your WellMan Connect account</p>
          </div>
          <div class="card-body p-4">
            <!-- Error Message -->
            <div v-if="loginError" class="alert alert-danger d-flex align-items-center" role="alert" aria-live="assertive">
              <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
              <div>{{ loginError }}</div>
            </div>

            <form @submit.prevent="handleLogin" novalidate role="form" aria-labelledby="login-heading">
              <!-- Email -->
              <div class="mb-3">
                <label for="loginEmail" class="form-label">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  :class="{ 'is-valid': validation.email.isValid, 'is-invalid': !validation.email.isValid && validation.email.message }"
                  id="loginEmail"
                  v-model="formData.email"
                  @blur="handleEmailChange"
                  @input="handleEmailChange"
                  placeholder="Enter your email address"
                  required
                  aria-required="true"
                  aria-describedby="email-error email-help"
                  aria-invalid="!validation.email.isValid && validation.email.message ? 'true' : 'false'"
                  autocomplete="email"
                >
                <div class="invalid-feedback" v-if="!validation.email.isValid && validation.email.message" id="email-error" role="alert">
                  {{ validation.email.message }}
                </div>
                <div id="email-help" class="form-text">Enter your registered email address</div>
              </div>

              <!-- Password -->
              <div class="mb-4">
                <label for="loginPassword" class="form-label">Password</label>
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-valid': validation.password.isValid, 'is-invalid': !validation.password.isValid && validation.password.message }"
                    id="loginPassword"
                    v-model="formData.password"
                    @blur="handlePasswordChange"
                    @input="handlePasswordChange"
                    placeholder="Enter your password"
                    required
                    aria-required="true"
                    aria-describedby="password-error password-help"
                    aria-invalid="!validation.password.isValid && validation.password.message ? 'true' : 'false'"
                    autocomplete="current-password"
                  >
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="showPassword = !showPassword"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    :title="showPassword ? 'Hide password' : 'Show password'"
                    :aria-pressed="showPassword"
                  >
                    <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'" aria-hidden="true"></i>
                  </button>
                </div>
                <div class="invalid-feedback" v-if="!validation.password.isValid && validation.password.message" id="password-error" role="alert">
                  {{ validation.password.message }}
                </div>
                <div id="password-help" class="form-text">Enter your account password</div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary w-100 btn-lg mb-3"
                :disabled="!isFormValid || isSubmitting"
                aria-describedby="submit-help"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isSubmitting ? 'Signing In...' : 'Sign In' }}
              </button>
              <div id="submit-help" class="form-text text-center">Click to sign in to your account</div>

              <!-- Demo Login -->
              <button
                type="button"
                class="btn btn-outline-secondary w-100 mb-3"
                @click="handleDemoLogin"
                :disabled="isSubmitting"
                aria-describedby="demo-help"
              >
                <i class="bi bi-play-circle me-2" aria-hidden="true"></i>Try Demo Account
              </button>
              <div id="demo-help" class="form-text text-center">Experience the app with a pre-configured demo account</div>
            </form>

            <!-- Links -->
            <div class="text-center">
              <p class="mb-2">
                <a href="#" class="text-primary text-decoration-none" aria-label="Reset your password">Forgot your password?</a>
              </p>
              <p class="mb-0">
                Don't have an account? 
                <RouterLink to="/signup" class="text-primary fw-semibold" aria-label="Create a new account">Sign Up</RouterLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: var(--border-radius-xl);
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
}

@media (max-width: 768px) {
  .card-body {
    padding: 1.5rem;
  }
}
</style>
