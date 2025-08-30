<script setup>
import { ref, reactive, computed } from 'vue'

// Form data with reactive validation
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

// Form submission state
const isSubmitting = ref(false)
const submitSuccess = ref(false)

// Validation functions
const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    validation[fieldName] = { isValid: false, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required` }
    return false
  }
  validation[fieldName] = { isValid: true, message: '' }
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
  validation.email = { isValid: true, message: '' }
  return true
}

const validatePassword = (password) => {
  if (!password) {
    validation.password = { isValid: false, message: 'Password is required' }
    return false
  }
  if (password.length < 8) {
    validation.password = { isValid: false, message: 'Password must be at least 8 characters long' }
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
  validation.password = { isValid: true, message: 'Strong password' }
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
  validation.confirmPassword = { isValid: true, message: 'Passwords match' }
  return true
}

const validatePhoneNumber = (phone) => {
  if (!phone) {
    validation.phoneNumber = { isValid: false, message: 'Phone number is required' }
    return false
  }
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    validation.phoneNumber = { isValid: false, message: 'Please enter a valid phone number' }
    return false
  }
  validation.phoneNumber = { isValid: true, message: '' }
  return true
}

const validateDateOfBirth = (date) => {
  if (!date) {
    validation.dateOfBirth = { isValid: false, message: 'Date of birth is required' }
    return false
  }
  const selectedDate = new Date(date)
  const today = new Date()
  const age = today.getFullYear() - selectedDate.getFullYear()
  if (age < 18) {
    validation.dateOfBirth = { isValid: false, message: 'You must be at least 18 years old' }
    return false
  }
  if (age > 120) {
    validation.dateOfBirth = { isValid: false, message: 'Please enter a valid date of birth' }
    return false
  }
  validation.dateOfBirth = { isValid: true, message: '' }
  return true
}

// Real-time validation handlers
const handleFirstNameChange = () => {
  validateRequired(formData.firstName, 'firstName')
}

const handleLastNameChange = () => {
  validateRequired(formData.lastName, 'lastName')
}

const handleEmailChange = () => {
  validateEmail(formData.email)
}

const handlePasswordChange = () => {
  validatePassword(formData.password)
  if (formData.confirmPassword) {
    validateConfirmPassword(formData.confirmPassword)
  }
}

const handleConfirmPasswordChange = () => {
  validateConfirmPassword(formData.confirmPassword)
}

const handlePhoneChange = () => {
  validatePhoneNumber(formData.phoneNumber)
}

const handleDateChange = () => {
  validateDateOfBirth(formData.dateOfBirth)
}

const handleTermsChange = () => {
  if (!formData.agreeToTerms) {
    validation.agreeToTerms = { isValid: false, message: 'You must agree to the terms and conditions' }
  } else {
    validation.agreeToTerms = { isValid: true, message: '' }
  }
}

// Computed properties
const isFormValid = computed(() => {
  return Object.values(validation).every(field => field.isValid)
})

const passwordStrength = computed(() => {
  if (!formData.password) return 0
  let strength = 0
  if (formData.password.length >= 8) strength++
  if (/(?=.*[a-z])/.test(formData.password)) strength++
  if (/(?=.*[A-Z])/.test(formData.password)) strength++
  if (/(?=.*\d)/.test(formData.password)) strength++
  if (/(?=.*[!@#$%^&*])/.test(formData.password)) strength++
  return strength
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'Very Weak'
  if (strength <= 2) return 'Weak'
  if (strength <= 3) return 'Fair'
  if (strength <= 4) return 'Good'
  return 'Strong'
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'danger'
  if (strength <= 2) return 'warning'
  if (strength <= 3) return 'info'
  if (strength <= 4) return 'primary'
  return 'success'
})

// Form submission
const handleSubmit = async () => {
  // Validate all fields
  const validations = [
    validateRequired(formData.firstName, 'firstName'),
    validateRequired(formData.lastName, 'lastName'),
    validateEmail(formData.email),
    validatePassword(formData.password),
    validateConfirmPassword(formData.confirmPassword),
    validatePhoneNumber(formData.phoneNumber),
    validateDateOfBirth(formData.dateOfBirth)
  ]

  if (!formData.agreeToTerms) {
    validation.agreeToTerms = { isValid: false, message: 'You must agree to the terms and conditions' }
  }

  if (!validations.every(v => v) || !formData.agreeToTerms) {
    return
  }

  isSubmitting.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Store user data in localStorage (BR B.2 - Dynamic Data)
    const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
    const newUser = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      password: btoa(formData.password) // Simple encoding for demo
    }
    users.push(newUser)
    localStorage.setItem('wellman_users', JSON.stringify(users))

    submitSuccess.value = true
    
    // Reset form after success
    setTimeout(() => {
      Object.keys(formData).forEach(key => {
        formData[key] = key === 'agreeToTerms' ? false : ''
      })
      Object.keys(validation).forEach(key => {
        validation[key] = { isValid: false, message: '' }
      })
      submitSuccess.value = false
    }, 3000)

  } catch (error) {
    console.error('Registration failed:', error)
  } finally {
    isSubmitting.value = false
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
            <!-- Success Message -->
            <div v-if="submitSuccess" class="alert alert-success d-flex align-items-center" role="alert">
              <i class="bi bi-check-circle-fill me-2"></i>
              <div>
                <strong>Success!</strong> Your account has been created successfully. You can now sign in.
              </div>
            </div>

            <form @submit.prevent="handleSubmit" novalidate>
              <div class="row">
                <!-- First Name -->
                <div class="col-md-6 mb-3">
                  <label for="firstName" class="form-label">First Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-valid': validation.firstName.isValid, 'is-invalid': !validation.firstName.isValid && validation.firstName.message }"
                    id="firstName"
                    v-model="formData.firstName"
                    @blur="handleFirstNameChange"
                    @input="handleFirstNameChange"
                    placeholder="Enter your first name"
                    required
                  >
                  <div class="invalid-feedback" v-if="!validation.firstName.isValid && validation.firstName.message">
                    {{ validation.firstName.message }}
                  </div>
                  <div class="valid-feedback" v-if="validation.firstName.isValid">
                    Looks good!
                  </div>
                </div>

                <!-- Last Name -->
                <div class="col-md-6 mb-3">
                  <label for="lastName" class="form-label">Last Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-valid': validation.lastName.isValid, 'is-invalid': !validation.lastName.isValid && validation.lastName.message }"
                    id="lastName"
                    v-model="formData.lastName"
                    @blur="handleLastNameChange"
                    @input="handleLastNameChange"
                    placeholder="Enter your last name"
                    required
                  >
                  <div class="invalid-feedback" v-if="!validation.lastName.isValid && validation.lastName.message">
                    {{ validation.lastName.message }}
                  </div>
                  <div class="valid-feedback" v-if="validation.lastName.isValid">
                    Looks good!
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label for="email" class="form-label">Email Address *</label>
                <input
                  type="email"
                  class="form-control"
                  :class="{ 'is-valid': validation.email.isValid, 'is-invalid': !validation.email.isValid && validation.email.message }"
                  id="email"
                  v-model="formData.email"
                  @blur="handleEmailChange"
                  @input="handleEmailChange"
                  placeholder="Enter your email address"
                  required
                >
                <div class="invalid-feedback" v-if="!validation.email.isValid && validation.email.message">
                  {{ validation.email.message }}
                </div>
                <div class="valid-feedback" v-if="validation.email.isValid">
                  Valid email address!
                </div>
              </div>

              <!-- Password -->
              <div class="mb-3">
                <label for="password" class="form-label">Password *</label>
                <input
                  type="password"
                  class="form-control"
                  :class="{ 'is-valid': validation.password.isValid, 'is-invalid': !validation.password.isValid && validation.password.message }"
                  id="password"
                  v-model="formData.password"
                  @blur="handlePasswordChange"
                  @input="handlePasswordChange"
                  placeholder="Create a strong password"
                  required
                >
                <div class="invalid-feedback" v-if="!validation.password.isValid && validation.password.message">
                  {{ validation.password.message }}
                </div>
                <div class="valid-feedback" v-if="validation.password.isValid">
                  {{ validation.password.message }}
                </div>
                
                <!-- Password Strength Indicator -->
                <div v-if="formData.password" class="mt-2">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <small class="text-muted">Password strength:</small>
                    <small :class="`text-${passwordStrengthColor}`">{{ passwordStrengthText }}</small>
                  </div>
                  <div class="progress" style="height: 4px;">
                    <div 
                      class="progress-bar" 
                      :class="`bg-${passwordStrengthColor}`"
                      :style="{ width: `${(passwordStrength / 5) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Confirm Password -->
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password *</label>
                <input
                  type="password"
                  class="form-control"
                  :class="{ 'is-valid': validation.confirmPassword.isValid, 'is-invalid': !validation.confirmPassword.isValid && validation.confirmPassword.message }"
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  @blur="handleConfirmPasswordChange"
                  @input="handleConfirmPasswordChange"
                  placeholder="Confirm your password"
                  required
                >
                <div class="invalid-feedback" v-if="!validation.confirmPassword.isValid && validation.confirmPassword.message">
                  {{ validation.confirmPassword.message }}
                </div>
                <div class="valid-feedback" v-if="validation.confirmPassword.isValid">
                  {{ validation.confirmPassword.message }}
                </div>
              </div>

              <div class="row">
                <!-- Phone Number -->
                <div class="col-md-6 mb-3">
                  <label for="phoneNumber" class="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    class="form-control"
                    :class="{ 'is-valid': validation.phoneNumber.isValid, 'is-invalid': !validation.phoneNumber.isValid && validation.phoneNumber.message }"
                    id="phoneNumber"
                    v-model="formData.phoneNumber"
                    @blur="handlePhoneChange"
                    @input="handlePhoneChange"
                    placeholder="Enter your phone number"
                    required
                  >
                  <div class="invalid-feedback" v-if="!validation.phoneNumber.isValid && validation.phoneNumber.message">
                    {{ validation.phoneNumber.message }}
                  </div>
                  <div class="valid-feedback" v-if="validation.phoneNumber.isValid">
                    Valid phone number!
                  </div>
                </div>

                <!-- Date of Birth -->
                <div class="col-md-6 mb-3">
                  <label for="dateOfBirth" class="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    class="form-control"
                    :class="{ 'is-valid': validation.dateOfBirth.isValid, 'is-invalid': !validation.dateOfBirth.isValid && validation.dateOfBirth.message }"
                    id="dateOfBirth"
                    v-model="formData.dateOfBirth"
                    @blur="handleDateChange"
                    @change="handleDateChange"
                    required
                  >
                  <div class="invalid-feedback" v-if="!validation.dateOfBirth.isValid && validation.dateOfBirth.message">
                    {{ validation.dateOfBirth.message }}
                  </div>
                  <div class="valid-feedback" v-if="validation.dateOfBirth.isValid">
                    Valid date of birth!
                  </div>
                </div>
              </div>

              <!-- Terms and Conditions -->
              <div class="mb-4">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    :class="{ 'is-valid': validation.agreeToTerms.isValid, 'is-invalid': !validation.agreeToTerms.isValid && validation.agreeToTerms.message }"
                    type="checkbox"
                    id="agreeToTerms"
                    v-model="formData.agreeToTerms"
                    @change="handleTermsChange"
                    required
                  >
                  <label class="form-check-label" for="agreeToTerms">
                    I agree to the <a href="#" class="text-primary">Terms and Conditions</a> and <a href="#" class="text-primary">Privacy Policy</a> *
                  </label>
                  <div class="invalid-feedback" v-if="!validation.agreeToTerms.isValid && validation.agreeToTerms.message">
                    {{ validation.agreeToTerms.message }}
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-primary w-100 btn-lg"
                :disabled="!isFormValid || isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
              </button>
            </form>

            <!-- Login Link -->
            <div class="text-center mt-4">
              <p class="mb-0">
                Already have an account? 
                <a href="#" class="text-primary fw-semibold">Sign In</a>
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
  background-color: var(--gray-200);
}

.form-check-input:checked {
  background-color: var(--primary);
  border-color: var(--primary);
}

.form-check-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
}

@media (max-width: 768px) {
  .card-body {
    padding: 1.5rem;
  }
}
</style>


