<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Form data
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
  phoneNumber: '',
  agreeToTerms: false
})

// Validation state
const validation = reactive({
  firstName: { isValid: false, message: '' },
  lastName: { isValid: false, message: '' },
  email: { isValid: false, message: '' },
  password: { isValid: false, message: '' },
  confirmPassword: { isValid: false, message: '' },
  dateOfBirth: { isValid: false, message: '' },
  phoneNumber: { isValid: false, message: '' },
  agreeToTerms: { isValid: false, message: '' }
})

// Form state
const isSubmitting = ref(false)
const signupError = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const currentStep = ref(1)
const totalSteps = 3

// Validation functions
const validateFirstName = (firstName) => {
  if (!firstName.trim()) {
    validation.firstName = { isValid: false, message: 'First name is required' }
    return false
  }
  if (firstName.trim().length < 2) {
    validation.firstName = { isValid: false, message: 'First name must be at least 2 characters' }
    return false
  }
  validation.firstName = { isValid: true, message: '' }
  return true
}

const validateLastName = (lastName) => {
  if (!lastName.trim()) {
    validation.lastName = { isValid: false, message: 'Last name is required' }
    return false
  }
  if (lastName.trim().length < 2) {
    validation.lastName = { isValid: false, message: 'Last name must be at least 2 characters' }
    return false
  }
  validation.lastName = { isValid: true, message: '' }
  return true
}

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
  
  // Check if email already exists
  const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
  const existingUser = users.find(u => u.email === email)
  if (existingUser) {
    validation.email = { isValid: false, message: 'An account with this email already exists' }
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
  if (password.length < 8) {
    validation.password = { isValid: false, message: 'Password must be at least 8 characters' }
    return false
  }
  if (!/(?=.*[a-z])/.test(password)) {
    validation.password = { isValid: false, message: 'Password must contain at least one lowercase letter' }
    return false
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    validation.password = { isValid: false, message: 'Password must contain at least one uppercase letter' }
    return false
  }
  if (!/(?=.*\d)/.test(password)) {
    validation.password = { isValid: false, message: 'Password must contain at least one number' }
    return false
  }
  validation.password = { isValid: true, message: '' }
  return true
}

const validateConfirmPassword = (confirmPassword) => {
  if (!confirmPassword) {
    validation.confirmPassword = { isValid: false, message: 'Please confirm your password' }
    return false
  }
  if (confirmPassword !== formData.password) {
    validation.confirmPassword = { isValid: false, message: 'Passwords do not match' }
    return false
  }
  validation.confirmPassword = { isValid: true, message: '' }
  return true
}

const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    validation.dateOfBirth = { isValid: false, message: 'Date of birth is required' }
    return false
  }
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  if (age < 13 || age > 120) {
    validation.dateOfBirth = { isValid: false, message: 'Please enter a valid date of birth' }
    return false
  }
  validation.dateOfBirth = { isValid: true, message: '' }
  return true
}

const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    validation.phoneNumber = { isValid: false, message: 'Phone number is required' }
    return false
  }
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '')
  if (!phoneRegex.test(cleanPhone)) {
    validation.phoneNumber = { isValid: false, message: 'Please enter a valid phone number' }
    return false
  }
  validation.phoneNumber = { isValid: true, message: '' }
  return true
}

const validateTerms = (agreeToTerms) => {
  if (!agreeToTerms) {
    validation.agreeToTerms = { isValid: false, message: 'You must agree to the terms and conditions' }
    return false
  }
  validation.agreeToTerms = { isValid: true, message: '' }
  return true
}

// Real-time validation handlers
const handleFieldChange = (field, value) => {
  switch (field) {
    case 'firstName':
      validateFirstName(value)
      break
    case 'lastName':
      validateLastName(value)
      break
    case 'email':
      validateEmail(value)
      break
    case 'password':
      validatePassword(value)
      if (formData.confirmPassword) {
        validateConfirmPassword(formData.confirmPassword)
      }
      break
    case 'confirmPassword':
      validateConfirmPassword(value)
      break
    case 'dateOfBirth':
      validateDateOfBirth(value)
      break
    case 'phoneNumber':
      validatePhoneNumber(value)
      break
    case 'agreeToTerms':
      validateTerms(value)
      break
  }
  signupError.value = '' // Clear error when user types
}

// Step validation
const isStepValid = (step) => {
  switch (step) {
    case 1:
      return validation.firstName.isValid && validation.lastName.isValid && validation.email.isValid
    case 2:
      return validation.password.isValid && validation.confirmPassword.isValid && validation.dateOfBirth.isValid && validation.phoneNumber.isValid
    case 3:
      return validation.agreeToTerms.isValid
    default:
      return false
  }
}

const nextStep = () => {
  if (isStepValid(currentStep.value)) {
    currentStep.value = Math.min(currentStep.value + 1, totalSteps)
  }
}

const prevStep = () => {
  currentStep.value = Math.max(currentStep.value - 1, 1)
}

// Computed properties
const isFormValid = computed(() => {
  return Object.values(validation).every(v => v.isValid)
})

const passwordStrength = computed(() => {
  const password = formData.password
  if (!password) return { score: 0, label: '', color: '' }
  
  let score = 0
  if (password.length >= 8) score++
  if (/(?=.*[a-z])/.test(password)) score++
  if (/(?=.*[A-Z])/.test(password)) score++
  if (/(?=.*\d)/.test(password)) score++
  if (/(?=.*[!@#$%^&*])/.test(password)) score++
  
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['danger', 'warning', 'info', 'success', 'success']
  
  return {
    score,
    label: labels[score - 1] || 'Very Weak',
    color: colors[score - 1] || 'danger'
  }
})

// Registration function
const handleSignup = async () => {
  // Validate all fields
  const validations = [
    validateFirstName(formData.firstName),
    validateLastName(formData.lastName),
    validateEmail(formData.email),
    validatePassword(formData.password),
    validateConfirmPassword(formData.confirmPassword),
    validateDateOfBirth(formData.dateOfBirth),
    validatePhoneNumber(formData.phoneNumber),
    validateTerms(formData.agreeToTerms)
  ]
  
  if (!validations.every(v => v)) {
    return
  }

  isSubmitting.value = true
  signupError.value = ''

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Create new user
    const newUser = {
      id: Date.now(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.toLowerCase(),
      password: btoa(formData.password), // Simple encoding (use bcrypt in production)
      dateOfBirth: formData.dateOfBirth,
      phoneNumber: formData.phoneNumber,
      role: 'user', // Default role
      createdAt: new Date().toISOString(),
      lastLogin: null
    }

    // Save user to localStorage
    const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
    users.push(newUser)
    localStorage.setItem('wellman_users', JSON.stringify(users))

    // Auto-login the user
    authStore.login(newUser)

    // Redirect to account page or intended destination
    const redirectPath = route.query.redirect || '/account'
    router.push(redirectPath)

  } catch (error) {
    console.error('Signup failed:', error)
    signupError.value = 'Registration failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Create demo admin account
const createDemoAdmin = async () => {
  const adminUser = {
    id: Date.now() + 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@wellman.com',
    password: btoa('Admin123!'),
    dateOfBirth: '1990-01-01',
    phoneNumber: '+1234567890',
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastLogin: null
  }

  const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
  const existingAdmin = users.find(u => u.email === adminUser.email)
  
  if (!existingAdmin) {
    users.push(adminUser)
    localStorage.setItem('wellman_users', JSON.stringify(users))
  }
}
</script>

<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-lg border-0">
          <div class="card-header text-center">
            <h2 class="mb-0">Create Your Account</h2>
            <p class="text-muted mb-0">Join WellMan Connect and start your health journey</p>
          </div>
          <div class="card-body p-4">
            <!-- Progress Bar -->
            <div class="progress mb-4" style="height: 4px;">
              <div 
                class="progress-bar" 
                :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
              ></div>
            </div>
            
            <div class="text-center mb-4">
              <span class="badge bg-primary me-2">Step {{ currentStep }} of {{ totalSteps }}</span>
            </div>

            <!-- Error Message -->
            <div v-if="signupError" class="alert alert-danger d-flex align-items-center" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <div>{{ signupError }}</div>
            </div>

            <form @submit.prevent="handleSignup" novalidate>
              <!-- Step 1: Basic Information -->
              <div v-if="currentStep === 1">
                <h5 class="mb-3">Basic Information</h5>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">First Name</label>
                    <input
                      type="text"
                      class="form-control"
                      :class="{ 'is-valid': validation.firstName.isValid, 'is-invalid': !validation.firstName.isValid && validation.firstName.message }"
                      id="firstName"
                      v-model="formData.firstName"
                      @blur="handleFieldChange('firstName', formData.firstName)"
                      @input="handleFieldChange('firstName', formData.firstName)"
                      placeholder="Enter your first name"
                      required
                    >
                    <div class="invalid-feedback" v-if="!validation.firstName.isValid && validation.firstName.message">
                      {{ validation.firstName.message }}
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input
                      type="text"
                      class="form-control"
                      :class="{ 'is-valid': validation.lastName.isValid, 'is-invalid': !validation.lastName.isValid && validation.lastName.message }"
                      id="lastName"
                      v-model="formData.lastName"
                      @blur="handleFieldChange('lastName', formData.lastName)"
                      @input="handleFieldChange('lastName', formData.lastName)"
                      placeholder="Enter your last name"
                      required
                    >
                    <div class="invalid-feedback" v-if="!validation.lastName.isValid && validation.lastName.message">
                      {{ validation.lastName.message }}
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email Address</label>
                  <input
                    type="email"
                    class="form-control"
                    :class="{ 'is-valid': validation.email.isValid, 'is-invalid': !validation.email.isValid && validation.email.message }"
                    id="email"
                    v-model="formData.email"
                    @blur="handleFieldChange('email', formData.email)"
                    @input="handleFieldChange('email', formData.email)"
                    placeholder="Enter your email address"
                    required
                  >
                  <div class="invalid-feedback" v-if="!validation.email.isValid && validation.email.message">
                    {{ validation.email.message }}
                  </div>
                </div>
              </div>

              <!-- Step 2: Security & Contact -->
              <div v-if="currentStep === 2">
                <h5 class="mb-3">Security & Contact</h5>
                
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-valid': validation.password.isValid, 'is-invalid': !validation.password.isValid && validation.password.message }"
                      id="password"
                      v-model="formData.password"
                      @blur="handleFieldChange('password', formData.password)"
                      @input="handleFieldChange('password', formData.password)"
                      placeholder="Create a strong password"
                      required
                    >
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showPassword = !showPassword"
                      :title="showPassword ? 'Hide password' : 'Show password'"
                    >
                      <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback" v-if="!validation.password.isValid && validation.password.message">
                    {{ validation.password.message }}
                  </div>
                  
                  <!-- Password Strength Indicator -->
                  <div v-if="formData.password" class="mt-2">
                    <div class="d-flex align-items-center gap-2">
                      <div class="progress flex-grow-1" style="height: 6px;">
                        <div 
                          class="progress-bar bg-{{ passwordStrength.color }}" 
                          :style="{ width: `${(passwordStrength.score / 5) * 100}%` }"
                        ></div>
                      </div>
                      <small class="text-{{ passwordStrength.color }}">{{ passwordStrength.label }}</small>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <div class="input-group">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-valid': validation.confirmPassword.isValid, 'is-invalid': !validation.confirmPassword.isValid && validation.confirmPassword.message }"
                      id="confirmPassword"
                      v-model="formData.confirmPassword"
                      @blur="handleFieldChange('confirmPassword', formData.confirmPassword)"
                      @input="handleFieldChange('confirmPassword', formData.confirmPassword)"
                      placeholder="Confirm your password"
                      required
                    >
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      :title="showConfirmPassword ? 'Hide password' : 'Show password'"
                    >
                      <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                  <div class="invalid-feedback" v-if="!validation.confirmPassword.isValid && validation.confirmPassword.message">
                    {{ validation.confirmPassword.message }}
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="dateOfBirth" class="form-label">Date of Birth</label>
                    <input
                      type="date"
                      class="form-control"
                      :class="{ 'is-valid': validation.dateOfBirth.isValid, 'is-invalid': !validation.dateOfBirth.isValid && validation.dateOfBirth.message }"
                      id="dateOfBirth"
                      v-model="formData.dateOfBirth"
                      @blur="handleFieldChange('dateOfBirth', formData.dateOfBirth)"
                      @change="handleFieldChange('dateOfBirth', formData.dateOfBirth)"
                      required
                    >
                    <div class="invalid-feedback" v-if="!validation.dateOfBirth.isValid && validation.dateOfBirth.message">
                      {{ validation.dateOfBirth.message }}
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="phoneNumber" class="form-label">Phone Number</label>
                    <input
                      type="tel"
                      class="form-control"
                      :class="{ 'is-valid': validation.phoneNumber.isValid, 'is-invalid': !validation.phoneNumber.isValid && validation.phoneNumber.message }"
                      id="phoneNumber"
                      v-model="formData.phoneNumber"
                      @blur="handleFieldChange('phoneNumber', formData.phoneNumber)"
                      @input="handleFieldChange('phoneNumber', formData.phoneNumber)"
                      placeholder="Enter your phone number"
                      required
                    >
                    <div class="invalid-feedback" v-if="!validation.phoneNumber.isValid && validation.phoneNumber.message">
                      {{ validation.phoneNumber.message }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 3: Terms & Conditions -->
              <div v-if="currentStep === 3">
                <h5 class="mb-3">Terms & Conditions</h5>
                
                <div class="mb-4">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      :class="{ 'is-valid': validation.agreeToTerms.isValid, 'is-invalid': !validation.agreeToTerms.isValid && validation.agreeToTerms.message }"
                      type="checkbox"
                      id="agreeToTerms"
                      v-model="formData.agreeToTerms"
                      @change="handleFieldChange('agreeToTerms', formData.agreeToTerms)"
                      required
                    >
                    <label class="form-check-label" for="agreeToTerms">
                      I agree to the <a href="#" class="text-primary">Terms of Service</a> and <a href="#" class="text-primary">Privacy Policy</a>
                    </label>
                    <div class="invalid-feedback" v-if="!validation.agreeToTerms.isValid && validation.agreeToTerms.message">
                      {{ validation.agreeToTerms.message }}
                    </div>
                  </div>
                </div>

                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  <strong>What happens next?</strong><br>
                  After creating your account, you'll have access to personalized health resources, appointment booking, and progress tracking tools.
                </div>
              </div>

              <!-- Navigation Buttons -->
              <div class="d-flex gap-2 mt-4">
                <button
                  v-if="currentStep > 1"
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="prevStep"
                >
                  <i class="bi bi-arrow-left me-2"></i>Previous
                </button>
                
                <button
                  v-if="currentStep < totalSteps"
                  type="button"
                  class="btn btn-primary"
                  @click="nextStep"
                  :disabled="!isStepValid(currentStep)"
                >
                  Next<i class="bi bi-arrow-right ms-2"></i>
                </button>
                
                <button
                  v-if="currentStep === totalSteps"
                  type="submit"
                  class="btn btn-primary btn-lg"
                  :disabled="!isFormValid || isSubmitting"
                >
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
                </button>
              </div>
            </form>

            <!-- Demo Account Creation -->
            <div class="text-center mt-4">
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                @click="createDemoAdmin"
              >
                <i class="bi bi-shield-check me-2"></i>Create Demo Admin
              </button>
            </div>

            <!-- Links -->
            <div class="text-center mt-4">
              <p class="mb-0">
                Already have an account? 
                <RouterLink to="/login" class="text-primary fw-semibold">Sign In</RouterLink>
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

.progress {
  border-radius: var(--border-radius-sm);
}

@media (max-width: 768px) {
  .card-body {
    padding: 1.5rem;
  }
}
</style>



