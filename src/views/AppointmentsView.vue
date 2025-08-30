<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'

// Dynamic data structures (BR B.2)
const services = ref([
  {
    id: 1,
    name: 'General Practitioner',
    description: 'Routine check-ups, screenings, and general consultations',
    duration: 30,
    price: 85,
    icon: '👨‍⚕️',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  },
  {
    id: 2,
    name: 'Mental Health Specialist',
    description: 'Professional counselling and stress management support',
    duration: 50,
    price: 120,
    icon: '🧠',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timeSlots: ['09:00', '10:30', '14:00', '15:30', '17:00']
  },
  {
    id: 3,
    name: 'Fitness Coach',
    description: 'Personalised fitness plans and nutrition guidance',
    duration: 45,
    price: 95,
    icon: '💪',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    timeSlots: ['08:00', '09:30', '11:00', '14:00', '15:30', '17:00']
  }
])

// Booking form data
const bookingData = reactive({
  selectedService: null,
  selectedDate: '',
  selectedTime: '',
  patientInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    reason: ''
  },
  preferences: {
    reminderEmail: true,
    reminderSMS: false,
    notes: ''
  }
})

// Form validation state
const validation = reactive({
  selectedService: { isValid: false, message: '' },
  selectedDate: { isValid: false, message: '' },
  selectedTime: { isValid: false, message: '' },
  firstName: { isValid: false, message: '' },
  lastName: { isValid: false, message: '' },
  email: { isValid: false, message: '' },
  phone: { isValid: false, message: '' },
  reason: { isValid: false, message: '' }
})

// Booking state
const currentStep = ref(1)
const isSubmitting = ref(false)
const submitSuccess = ref(false)

// User booking history (persisted in LocalStorage)
const bookingHistory = ref([])
const userPreferences = reactive({
  preferredService: null,
  preferredTime: null,
  savedPatientInfo: null
})

// Computed properties
const availableDates = computed(() => {
  if (!bookingData.selectedService) return []
  
  const dates = []
  const today = new Date()
  const service = services.value.find(s => s.id === bookingData.selectedService)
  
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    
    if (service.availableDays.includes(dayName)) {
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: dayName,
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      })
    }
  }
  
  return dates
})

const availableTimes = computed(() => {
  if (!bookingData.selectedService || !bookingData.selectedDate) return []
  
  const service = services.value.find(s => s.id === bookingData.selectedService)
  return service.timeSlots
})

const selectedServiceDetails = computed(() => {
  return services.value.find(s => s.id === bookingData.selectedService)
})

const totalSteps = 4

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

const validatePhone = (phone) => {
  if (!phone) {
    validation.phone = { isValid: false, message: 'Phone number is required' }
    return false
  }
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    validation.phone = { isValid: false, message: 'Please enter a valid phone number' }
    return false
  }
  validation.phone = { isValid: true, message: '' }
  return true
}

// Step navigation
const nextStep = () => {
  if (currentStep.value === 1) {
    if (!bookingData.selectedService) {
      validation.selectedService = { isValid: false, message: 'Please select a service' }
      return
    }
    validation.selectedService = { isValid: true, message: '' }
  } else if (currentStep.value === 2) {
    if (!bookingData.selectedDate) {
      validation.selectedDate = { isValid: false, message: 'Please select a date' }
      return
    }
    if (!bookingData.selectedTime) {
      validation.selectedTime = { isValid: false, message: 'Please select a time' }
      return
    }
    validation.selectedDate = { isValid: true, message: '' }
    validation.selectedTime = { isValid: true, message: '' }
  } else if (currentStep.value === 3) {
    const validations = [
      validateRequired(bookingData.patientInfo.firstName, 'firstName'),
      validateRequired(bookingData.patientInfo.lastName, 'lastName'),
      validateEmail(bookingData.patientInfo.email),
      validatePhone(bookingData.patientInfo.phone),
      validateRequired(bookingData.patientInfo.reason, 'reason')
    ]
    
    if (!validations.every(v => v)) return
  }
  
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Service selection
const selectService = (serviceId) => {
  bookingData.selectedService = serviceId
  bookingData.selectedDate = ''
  bookingData.selectedTime = ''
  validation.selectedService = { isValid: true, message: '' }
}

// Date and time selection
const selectDate = (date) => {
  bookingData.selectedDate = date
  bookingData.selectedTime = ''
  validation.selectedDate = { isValid: true, message: '' }
}

const selectTime = (time) => {
  bookingData.selectedTime = time
  validation.selectedTime = { isValid: true, message: '' }
}

// Form submission
const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create booking object
    const booking = {
      id: Date.now(),
      service: selectedServiceDetails.value,
      date: bookingData.selectedDate,
      time: bookingData.selectedTime,
      patientInfo: { ...bookingData.patientInfo },
      preferences: { ...bookingData.preferences },
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }
    
    // Save to LocalStorage (BR B.2 - Dynamic Data)
    bookingHistory.value.push(booking)
    localStorage.setItem('wellman_bookings', JSON.stringify(bookingHistory.value))
    
    // Update user preferences
    userPreferences.preferredService = bookingData.selectedService
    userPreferences.preferredTime = bookingData.selectedTime
    userPreferences.savedPatientInfo = { ...bookingData.patientInfo }
    localStorage.setItem('wellman_user_preferences', JSON.stringify(userPreferences))
    
    submitSuccess.value = true
    
    // Reset form after success
    setTimeout(() => {
      Object.assign(bookingData, {
        selectedService: null,
        selectedDate: '',
        selectedTime: '',
        patientInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          reason: ''
        },
        preferences: {
          reminderEmail: true,
          reminderSMS: false,
          notes: ''
        }
      })
      currentStep.value = 1
      submitSuccess.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Booking failed:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Load data from LocalStorage
const loadData = () => {
  try {
    const savedBookings = localStorage.getItem('wellman_bookings')
    if (savedBookings) {
      bookingHistory.value = JSON.parse(savedBookings)
    }
    
    const savedPreferences = localStorage.getItem('wellman_user_preferences')
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences)
      if (prefs.savedPatientInfo) {
        Object.assign(bookingData.patientInfo, prefs.savedPatientInfo)
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

// Initialize on mount
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="container">
    <!-- Page Header -->
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="mb-2">Book an Appointment</h1>
        <p class="text-muted mb-0">Schedule your health consultation with our specialists</p>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="submitSuccess" class="row mb-4">
      <div class="col-12">
        <div class="alert alert-success d-flex align-items-center" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>
          <div>
            <strong>Booking Confirmed!</strong> Your appointment has been scheduled successfully. 
            You will receive a confirmation email shortly.
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Main Booking Form -->
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="mb-0">Appointment Booking</h4>
              <div class="d-flex gap-2">
                <span 
                  v-for="step in totalSteps" 
                  :key="step"
                  class="badge"
                  :class="step <= currentStep ? 'bg-primary' : 'bg-secondary'"
                >
                  {{ step }}
                </span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <!-- Step 1: Service Selection -->
            <div v-if="currentStep === 1">
              <h5 class="mb-3">Select a Service</h5>
              <div class="row g-3">
                <div v-for="service in services" :key="service.id" class="col-md-6">
                  <div 
                    class="card h-100 cursor-pointer"
                    :class="{ 'border-primary': bookingData.selectedService === service.id }"
                    @click="selectService(service.id)"
                  >
                    <div class="card-body text-center">
                      <div class="display-4 mb-2">{{ service.icon }}</div>
                      <h6 class="card-title">{{ service.name }}</h6>
                      <p class="card-text text-muted small">{{ service.description }}</p>
                      <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-light text-dark">{{ service.duration }} min</span>
                        <span class="fw-bold text-primary">${{ service.price }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="!validation.selectedService.isValid" class="text-danger mt-2">
                {{ validation.selectedService.message }}
              </div>
            </div>

            <!-- Step 2: Date and Time Selection -->
            <div v-if="currentStep === 2">
              <h5 class="mb-3">Select Date & Time</h5>
              
              <!-- Date Selection -->
              <div class="mb-4">
                <label class="form-label">Available Dates</label>
                <div class="row g-2">
                  <div v-for="date in availableDates" :key="date.date" class="col-md-3 col-sm-6">
                    <button
                      class="btn w-100"
                      :class="bookingData.selectedDate === date.date ? 'btn-primary' : 'btn-outline-primary'"
                      @click="selectDate(date.date)"
                    >
                      <div class="small">{{ date.dayName }}</div>
                      <div class="fw-bold">{{ date.display }}</div>
                    </button>
                  </div>
                </div>
                <div v-if="!validation.selectedDate.isValid" class="text-danger mt-2">
                  {{ validation.selectedDate.message }}
                </div>
              </div>

              <!-- Time Selection -->
              <div v-if="bookingData.selectedDate">
                <label class="form-label">Available Times</label>
                <div class="row g-2">
                  <div v-for="time in availableTimes" :key="time" class="col-md-2 col-sm-4 col-6">
                    <button
                      class="btn"
                      :class="bookingData.selectedTime === time ? 'btn-primary' : 'btn-outline-primary'"
                      @click="selectTime(time)"
                    >
                      {{ time }}
                    </button>
                  </div>
                </div>
                <div v-if="!validation.selectedTime.isValid" class="text-danger mt-2">
                  {{ validation.selectedTime.message }}
                </div>
              </div>
            </div>

            <!-- Step 3: Patient Information -->
            <div v-if="currentStep === 3">
              <h5 class="mb-3">Patient Information</h5>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">First Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-valid': validation.firstName.isValid, 'is-invalid': !validation.firstName.isValid && validation.firstName.message }"
                    v-model="bookingData.patientInfo.firstName"
                    @blur="validateRequired(bookingData.patientInfo.firstName, 'firstName')"
                    placeholder="Enter your first name"
                  >
                  <div class="invalid-feedback">{{ validation.firstName.message }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Last Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-valid': validation.lastName.isValid, 'is-invalid': !validation.lastName.isValid && validation.lastName.message }"
                    v-model="bookingData.patientInfo.lastName"
                    @blur="validateRequired(bookingData.patientInfo.lastName, 'lastName')"
                    placeholder="Enter your last name"
                  >
                  <div class="invalid-feedback">{{ validation.lastName.message }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Email *</label>
                  <input
                    type="email"
                    class="form-control"
                    :class="{ 'is-valid': validation.email.isValid, 'is-invalid': !validation.email.isValid && validation.email.message }"
                    v-model="bookingData.patientInfo.email"
                    @blur="validateEmail(bookingData.patientInfo.email)"
                    placeholder="Enter your email"
                  >
                  <div class="invalid-feedback">{{ validation.email.message }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Phone *</label>
                  <input
                    type="tel"
                    class="form-control"
                    :class="{ 'is-valid': validation.phone.isValid, 'is-invalid': !validation.phone.isValid && validation.phone.message }"
                    v-model="bookingData.patientInfo.phone"
                    @blur="validatePhone(bookingData.patientInfo.phone)"
                    placeholder="Enter your phone number"
                  >
                  <div class="invalid-feedback">{{ validation.phone.message }}</div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label">Date of Birth</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="bookingData.patientInfo.dateOfBirth"
                  >
                </div>
                
                <div class="col-12">
                  <label class="form-label">Reason for Visit *</label>
                  <textarea
                    class="form-control"
                    :class="{ 'is-valid': validation.reason.isValid, 'is-invalid': !validation.reason.isValid && validation.reason.message }"
                    v-model="bookingData.patientInfo.reason"
                    @blur="validateRequired(bookingData.patientInfo.reason, 'reason')"
                    rows="3"
                    placeholder="Please describe your reason for the appointment"
                  ></textarea>
                  <div class="invalid-feedback">{{ validation.reason.message }}</div>
                </div>
              </div>
            </div>

            <!-- Step 4: Confirmation -->
            <div v-if="currentStep === 4">
              <h5 class="mb-3">Confirm Your Booking</h5>
              <div class="card bg-light">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <h6>Appointment Details</h6>
                      <p class="mb-1"><strong>Service:</strong> {{ selectedServiceDetails?.name }}</p>
                      <p class="mb-1"><strong>Date:</strong> {{ new Date(bookingData.selectedDate).toLocaleDateString() }}</p>
                      <p class="mb-1"><strong>Time:</strong> {{ bookingData.selectedTime }}</p>
                      <p class="mb-1"><strong>Duration:</strong> {{ selectedServiceDetails?.duration }} minutes</p>
                      <p class="mb-0"><strong>Price:</strong> ${{ selectedServiceDetails?.price }}</p>
                    </div>
                    <div class="col-md-6">
                      <h6>Patient Information</h6>
                      <p class="mb-1">{{ bookingData.patientInfo.firstName }} {{ bookingData.patientInfo.lastName }}</p>
                      <p class="mb-1">{{ bookingData.patientInfo.email }}</p>
                      <p class="mb-1">{{ bookingData.patientInfo.phone }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="d-flex justify-content-between mt-4">
              <button
                v-if="currentStep > 1"
                class="btn btn-outline-secondary"
                @click="prevStep"
              >
                <i class="bi bi-arrow-left me-1"></i>Previous
              </button>
              <div></div>
              
              <button
                v-if="currentStep < totalSteps"
                class="btn btn-primary"
                @click="nextStep"
              >
                Next<i class="bi bi-arrow-right ms-1"></i>
              </button>
              
              <button
                v-if="currentStep === totalSteps"
                class="btn btn-success"
                @click="handleSubmit"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ isSubmitting ? 'Confirming...' : 'Confirm Booking' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">
        <!-- Booking Summary -->
        <div class="card mb-4">
          <div class="card-header">
            <h6 class="mb-0">Booking Summary</h6>
          </div>
          <div class="card-body">
            <div v-if="selectedServiceDetails" class="text-center mb-3">
              <div class="display-4">{{ selectedServiceDetails.icon }}</div>
              <h6>{{ selectedServiceDetails.name }}</h6>
              <p class="text-muted small">{{ selectedServiceDetails.description }}</p>
            </div>
            
            <div v-if="bookingData.selectedDate" class="mb-3">
              <div class="d-flex justify-content-between">
                <span>Date:</span>
                <strong>{{ new Date(bookingData.selectedDate).toLocaleDateString() }}</strong>
              </div>
            </div>
            
            <div v-if="bookingData.selectedTime" class="mb-3">
              <div class="d-flex justify-content-between">
                <span>Time:</span>
                <strong>{{ bookingData.selectedTime }}</strong>
              </div>
            </div>
            
            <div v-if="selectedServiceDetails" class="mb-3">
              <div class="d-flex justify-content-between">
                <span>Duration:</span>
                <strong>{{ selectedServiceDetails.duration }} minutes</strong>
              </div>
              <div class="d-flex justify-content-between">
                <span>Price:</span>
                <strong class="text-primary">${{ selectedServiceDetails.price }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Bookings -->
        <div v-if="bookingHistory.length > 0" class="card">
          <div class="card-header">
            <h6 class="mb-0">Recent Bookings</h6>
          </div>
          <div class="card-body">
            <div v-for="booking in bookingHistory.slice(0, 3)" :key="booking.id" class="mb-3 pb-3 border-bottom">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="mb-1">{{ booking.service.name }}</h6>
                  <small class="text-muted">
                    {{ new Date(booking.date).toLocaleDateString() }} at {{ booking.time }}
                  </small>
                </div>
                <span class="badge bg-success">Confirmed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: var(--transition);
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card.border-primary {
  border-width: 2px;
}

@media (max-width: 768px) {
  .col-md-3 {
    margin-bottom: 0.5rem;
  }
  
  .col-md-2 {
    margin-bottom: 0.5rem;
  }
}
</style>


