<script setup>
import { ref, reactive, computed } from 'vue'
import { 
  sendEmailWithAttachment, 
  sendWelcomeEmail, 
  sendAppointmentConfirmation, 
  sendHealthReport,
  createMockPDFAttachment,
  isEmailServiceConfigured,
  sendDemoEmail
} from '../services/emailService'

// Form data
const formData = reactive({
  to: '',
  subject: '',
  message: '',
  attachmentType: 'none'
})

// UI state
const isSubmitting = ref(false)
const emailResult = ref(null)
const selectedFile = ref(null)
const attachmentContent = ref('')

// Email templates
const emailTemplates = ref([
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Send welcome email to new users',
    subject: 'Welcome to WellMan Connect!',
    template: 'welcome'
  },
  {
    id: 'appointment',
    name: 'Appointment Confirmation',
    description: 'Send appointment confirmation with PDF attachment',
    subject: 'Appointment Confirmation',
    template: 'appointment'
  },
  {
    id: 'health-report',
    name: 'Health Report',
    description: 'Send health report with PDF attachment',
    subject: 'Your Health Report',
    template: 'health-report'
  },
  {
    id: 'custom',
    name: 'Custom Email',
    description: 'Send custom email with optional attachment',
    subject: '',
    template: 'custom'
  }
])

const selectedTemplate = ref(emailTemplates.value[0])

// Validation
const validation = reactive({
  to: { isValid: false, message: '' },
  subject: { isValid: false, message: '' },
  message: { isValid: false, message: '' }
})

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    validation.to = { isValid: false, message: 'Email is required' }
    return false
  }
  if (!emailRegex.test(email)) {
    validation.to = { isValid: false, message: 'Please enter a valid email address' }
    return false
  }
  validation.to = { isValid: true, message: '' }
  return true
}

const validateSubject = (subject) => {
  if (!subject) {
    validation.subject = { isValid: false, message: 'Subject is required' }
    return false
  }
  validation.subject = { isValid: true, message: '' }
  return true
}

const validateMessage = (message) => {
  if (!message) {
    validation.message = { isValid: false, message: 'Message is required' }
    return false
  }
  validation.message = { isValid: true, message: '' }
  return true
}

// Computed properties
const isFormValid = computed(() => {
  return validation.to.isValid && validation.subject.isValid && validation.message.isValid
})

const isEmailConfigured = computed(() => {
  return isEmailServiceConfigured()
})

// File handling
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      attachmentContent.value = e.target.result.split(',')[1] // Remove data:application/pdf;base64, prefix
    }
    reader.readAsDataURL(file)
  }
}

// Template selection
const selectTemplate = (template) => {
  selectedTemplate.value = template
  formData.subject = template.subject
  formData.attachmentType = template.template
  
  // Set default content based on template
  switch (template.template) {
    case 'welcome':
      formData.message = 'Hi there!\n\nWelcome to WellMan Connect! We\'re excited to have you join our community.\n\nBest regards,\nThe WellMan Connect Team'
      break
    case 'appointment':
      formData.message = 'Your appointment has been confirmed. Please find the details attached.'
      break
    case 'health-report':
      formData.message = 'Your health report is ready. Please find it attached.'
      break
    default:
      formData.message = ''
  }
}

// Email sending functions
const sendCustomEmail = async () => {
  try {
    const attachments = []
    
    if (selectedFile.value && attachmentContent.value) {
      attachments.push({
        content: attachmentContent.value,
        filename: selectedFile.value.name,
        type: selectedFile.value.type,
        disposition: 'attachment'
      })
    }
    
    const emailData = {
      to: formData.to,
      subject: formData.subject,
      text: formData.message,
      html: formData.message.replace(/\n/g, '<br>'),
      attachments: attachments
    }
    
    // Use demo email if SendGrid is not configured
    if (!isEmailConfigured.value) {
      return await sendDemoEmail(emailData)
    }
    
    const result = await sendEmailWithAttachment(emailData)
    return result
  } catch (error) {
    throw error
  }
}

const sendTemplateEmail = async () => {
  try {
    // Use demo email if SendGrid is not configured
    if (!isEmailConfigured.value) {
      const demoData = {
        to: formData.to,
        subject: formData.subject,
        text: formData.message,
        html: formData.message.replace(/\n/g, '<br>'),
        attachments: []
      }
      return await sendDemoEmail(demoData)
    }
    
    switch (selectedTemplate.value.template) {
      case 'welcome':
        return await sendWelcomeEmail(formData.to, 'New User')
      
      case 'appointment':
        const appointmentData = {
          id: 'APP-' + Date.now(),
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          provider: 'Dr. Smith',
          type: 'General Checkup'
        }
        const appointmentPDF = createMockPDFAttachment(`Appointment Confirmation\n\nDate: ${appointmentData.date}\nTime: ${appointmentData.time}\nProvider: ${appointmentData.provider}\nType: ${appointmentData.type}`)
        return await sendAppointmentConfirmation(formData.to, appointmentData, appointmentPDF)
      
      case 'health-report':
        const reportData = {
          id: 'RPT-' + Date.now(),
          date: new Date().toLocaleDateString(),
          userName: 'Test User',
          type: 'Annual Health Check',
          status: 'Normal'
        }
        const reportPDF = createMockPDFAttachment(`Health Report\n\nDate: ${reportData.date}\nPatient: ${reportData.userName}\nType: ${reportData.type}\nStatus: ${reportData.status}`)
        return await sendHealthReport(formData.to, reportData, reportPDF)
      
      default:
        return await sendCustomEmail()
    }
  } catch (error) {
    throw error
  }
}

// Main send email function
const handleSendEmail = async () => {
  // Validate form
  const emailValid = validateEmail(formData.to)
  const subjectValid = validateSubject(formData.subject)
  const messageValid = validateMessage(formData.message)
  
  if (!emailValid || !subjectValid || !messageValid) {
    return
  }
  
  isSubmitting.value = true
  emailResult.value = null
  
  try {
    let result
    
    if (selectedTemplate.value.template === 'custom') {
      result = await sendCustomEmail()
    } else {
      result = await sendTemplateEmail()
    }
    
    if (result.success) {
      const message = result.demo 
        ? `Demo email sent successfully! (Check console for details) Message ID: ${result.messageId}`
        : `Email sent successfully! Message ID: ${result.messageId}`
      
      emailResult.value = {
        type: 'success',
        message: message
      }
      
      // Reset form
      formData.to = ''
      formData.subject = ''
      formData.message = ''
      selectedFile.value = null
      attachmentContent.value = ''
    } else {
      throw new Error('Failed to send email')
    }
  } catch (error) {
    console.error('Email sending error:', error)
    emailResult.value = {
      type: 'error',
      message: `Failed to send email: ${error.message}`
    }
  } finally {
    isSubmitting.value = false
  }
}

// Real-time validation
const handleEmailChange = () => {
  validateEmail(formData.to)
}

const handleSubjectChange = () => {
  validateSubject(formData.subject)
}

const handleMessageChange = () => {
  validateMessage(formData.message)
}
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="mb-0">Email Management</h2>
          <div class="badge" :class="isEmailConfigured ? 'bg-success' : 'bg-warning'">
            {{ isEmailConfigured ? 'SendGrid Configured' : 'SendGrid Not Configured' }}
          </div>
        </div>

        <!-- Email Service Status -->
        <div v-if="!isEmailConfigured" class="alert alert-warning" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>SendGrid Not Configured:</strong> To send emails, you need to configure your SendGrid API key in the environment variables.
          <a href="https://sendgrid.com/" target="_blank" class="alert-link ms-2">Get SendGrid API Key</a>
        </div>

        <!-- Email Templates -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="bi bi-envelope me-2"></i>Email Templates
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div 
                v-for="template in emailTemplates" 
                :key="template.id"
                class="col-md-6 col-lg-3 mb-3"
              >
                <div 
                  class="card h-100 template-card"
                  :class="{ 'border-primary': selectedTemplate.id === template.id }"
                  @click="selectTemplate(template)"
                  style="cursor: pointer;"
                >
                  <div class="card-body text-center">
                    <i class="bi bi-envelope display-6 text-primary mb-3"></i>
                    <h6 class="card-title">{{ template.name }}</h6>
                    <p class="card-text small text-muted">{{ template.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Email Form -->
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="bi bi-send me-2"></i>Send Email
            </h5>
          </div>
          <div class="card-body">
            <!-- Result Message -->
            <div v-if="emailResult" class="alert" :class="emailResult.type === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
              <i class="bi" :class="emailResult.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'" me-2></i>
              {{ emailResult.message }}
            </div>

            <form @submit.prevent="handleSendEmail" novalidate>
              <div class="row">
                <!-- Email Address -->
                <div class="col-md-6 mb-3">
                  <label for="emailTo" class="form-label">To Email Address</label>
                  <input
                    type="email"
                    class="form-control"
                    :class="{ 'is-valid': validation.to.isValid, 'is-invalid': !validation.to.isValid && validation.to.message }"
                    id="emailTo"
                    v-model="formData.to"
                    @blur="handleEmailChange"
                    @input="handleEmailChange"
                    placeholder="recipient@example.com"
                    required
                  >
                  <div class="invalid-feedback" v-if="!validation.to.isValid && validation.to.message">
                    {{ validation.to.message }}
                  </div>
                </div>

                <!-- Subject -->
                <div class="col-md-6 mb-3">
                  <label for="emailSubject" class="form-label">Subject</label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-valid': validation.subject.isValid, 'is-invalid': !validation.subject.isValid && validation.subject.message }"
                    id="emailSubject"
                    v-model="formData.subject"
                    @blur="handleSubjectChange"
                    @input="handleSubjectChange"
                    placeholder="Email subject"
                    required
                  >
                  <div class="invalid-feedback" v-if="!validation.subject.isValid && validation.subject.message">
                    {{ validation.subject.message }}
                  </div>
                </div>
              </div>

              <!-- Message -->
              <div class="mb-3">
                <label for="emailMessage" class="form-label">Message</label>
                <textarea
                  class="form-control"
                  :class="{ 'is-valid': validation.message.isValid, 'is-invalid': !validation.message.isValid && validation.message.message }"
                  id="emailMessage"
                  v-model="formData.message"
                  @blur="handleMessageChange"
                  @input="handleMessageChange"
                  rows="5"
                  placeholder="Enter your message here..."
                  required
                ></textarea>
                <div class="invalid-feedback" v-if="!validation.message.isValid && validation.message.message">
                  {{ validation.message.message }}
                </div>
              </div>

              <!-- File Attachment (for custom emails) -->
              <div v-if="selectedTemplate.template === 'custom'" class="mb-3">
                <label for="emailAttachment" class="form-label">Attachment (Optional)</label>
                <input
                  type="file"
                  class="form-control"
                  id="emailAttachment"
                  @change="handleFileSelect"
                  accept=".pdf,.doc,.docx,.txt"
                >
                <div class="form-text">
                  Supported formats: PDF, DOC, DOCX, TXT
                </div>
                <div v-if="selectedFile" class="mt-2">
                  <span class="badge bg-info">
                    <i class="bi bi-paperclip me-1"></i>{{ selectedFile.name }}
                  </span>
                </div>
              </div>

              <!-- Template Info -->
              <div v-if="selectedTemplate.template !== 'custom'" class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                <strong>{{ selectedTemplate.name }}:</strong> 
                {{ selectedTemplate.description }}
                <span v-if="selectedTemplate.template === 'appointment' || selectedTemplate.template === 'health-report'">
                  A PDF attachment will be automatically generated and included.
                </span>
              </div>

              <!-- Submit Button -->
              <div class="d-flex justify-content-between align-items-center">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="!isFormValid || isSubmitting || !isEmailConfigured"
                >
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="bi bi-send me-2"></i>
                  {{ isSubmitting ? 'Sending...' : 'Send Email' }}
                </button>
                
                <div class="text-muted small">
                  <i class="bi bi-shield-check me-1"></i>
                  Secure email delivery via SendGrid
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.template-card.border-primary {
  border-color: var(--bs-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.alert-link {
  text-decoration: none;
}

.alert-link:hover {
  text-decoration: underline;
}

/* Animation for result messages */
.alert {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* File input styling */
.form-control[type="file"] {
  padding: 0.375rem 0.75rem;
}

/* Badge styling */
.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .template-card {
    margin-bottom: 1rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
