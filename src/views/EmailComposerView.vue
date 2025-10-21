<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">
              <i class="bi bi-envelope me-2"></i>
              Email Composer
            </h4>
            <div class="mt-2">
              <span class="badge" :class="isEmailServiceConfigured() ? 'bg-success' : 'bg-warning'">
                <i class="bi" :class="isEmailServiceConfigured() ? 'bi-check-circle' : 'bi-exclamation-triangle'"></i>
                {{ isEmailServiceConfigured() ? 'SendGrid Configured' : 'Demo Mode' }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <form @submit.prevent="sendEmail">
              <!-- Recipient -->
              <div class="mb-3">
                <label for="recipient" class="form-label">To:</label>
                <input
                  type="email"
                  class="form-control"
                  id="recipient"
                  v-model="emailForm.to"
                  required
                  placeholder="recipient@example.com"
                >
              </div>

              <!-- Subject -->
              <div class="mb-3">
                <label for="subject" class="form-label">Subject:</label>
                <input
                  type="text"
                  class="form-control"
                  id="subject"
                  v-model="emailForm.subject"
                  required
                  placeholder="Email subject"
                >
              </div>

              <!-- Email Template Selection -->
              <div class="mb-3">
                <label for="template" class="form-label">Email Template:</label>
                <select class="form-select" id="template" v-model="selectedTemplate" @change="loadTemplate">
                  <option value="custom">Custom Message</option>
                  <option value="welcome">Welcome Email</option>
                  <option value="appointment">Appointment Confirmation</option>
                  <option value="health-report">Health Report</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>

              <!-- Message Content -->
              <div class="mb-3">
                <label for="message" class="form-label">Message:</label>
                <textarea
                  class="form-control"
                  id="message"
                  v-model="emailForm.message"
                  rows="8"
                  required
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              <!-- File Attachments -->
              <div class="mb-3">
                <label for="attachments" class="form-label">Attachments:</label>
                <input
                  type="file"
                  class="form-control"
                  id="attachments"
                  multiple
                  @change="handleFileUpload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                >
                <div class="form-text">
                  Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB each)
                </div>
              </div>

              <!-- Preview Attachments -->
              <div v-if="emailForm.attachments.length > 0" class="mb-3">
                <h6>Selected Attachments:</h6>
                <div class="list-group">
                  <div
                    v-for="(file, index) in emailForm.attachments"
                    :key="index"
                    class="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <i class="bi bi-paperclip me-2"></i>
                      {{ file.name }}
                      <small class="text-muted ms-2">({{ formatFileSize(file.size) }})</small>
                    </div>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-danger"
                      @click="removeAttachment(index)"
                      title="Remove attachment"
                      aria-label="Remove attachment"
                    >
                      <i class="bi bi-x me-1"></i>Remove
                    </button>
                  </div>
                </div>
              </div>

              <!-- Send Button -->
              <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                <button
                  type="button"
                  class="btn btn-outline-secondary me-md-2"
                  @click="previewEmail"
                  :disabled="isSending"
                >
                  <i class="bi bi-eye me-2"></i>Preview
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSending"
                >
                  <i class="bi bi-send me-2"></i>
                  {{ isSending ? 'Sending...' : 'Send Email' }}
                </button>
              </div>
            </form>

            <!-- Email Preview Modal -->
            <div class="modal fade" id="emailPreviewModal" tabindex="-1">
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Email Preview</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="email-preview">
                      <div class="mb-3">
                        <strong>To:</strong> {{ emailForm.to }}
                      </div>
                      <div class="mb-3">
                        <strong>Subject:</strong> {{ emailForm.subject }}
                      </div>
                      <div class="mb-3">
                        <strong>Attachments:</strong>
                        <span v-if="emailForm.attachments.length === 0" class="text-muted">None</span>
                        <ul v-else class="mb-0">
                          <li v-for="file in emailForm.attachments" :key="file.name">
                            {{ file.name }} ({{ formatFileSize(file.size) }})
                          </li>
                        </ul>
                      </div>
                      <div class="border-top pt-3">
                        <strong>Message:</strong>
                        <div class="mt-2 p-3 bg-light rounded">
                          <pre class="mb-0">{{ emailForm.message }}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="sendEmail">Send Email</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { sendEmailWithAttachment, sendWelcomeEmail, sendAppointmentConfirmation, sendHealthReport, sendNewsletter, isEmailServiceConfigured } from '../services/emailService'

// Form data
const emailForm = reactive({
  to: '',
  subject: '',
  message: '',
  attachments: []
})

const selectedTemplate = ref('custom')
const isSending = ref(false)

// Template messages
const templates = {
  welcome: {
    subject: 'Welcome to WellMan Connect!',
    message: `Hi there!

Welcome to WellMan Connect! We're excited to have you join our community focused on men's health and wellness.

With your account, you can:
• Access health resources and articles
• Track your wellness metrics
• Book appointments with healthcare providers
• Connect with our community

If you have any questions, feel free to reach out to our support team.

Best regards,
The WellMan Connect Team`
  },
  appointment: {
    subject: 'Appointment Confirmation - WellMan Connect',
    message: `Dear Patient,

Your appointment has been confirmed:

Date: [DATE]
Time: [TIME]
Provider: [PROVIDER]
Type: [APPOINTMENT_TYPE]

Please arrive 15 minutes early for your appointment. If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Best regards,
WellMan Connect Healthcare Team`
  },
  'health-report': {
    subject: 'Your Health Report - WellMan Connect',
    message: `Dear Patient,

Please find attached your health report from your recent visit.

Key Findings:
• Overall Health Status: [STATUS]
• Recommendations: [RECOMMENDATIONS]
• Next Steps: [NEXT_STEPS]

If you have any questions about your report, please don't hesitate to contact our healthcare team.

Best regards,
WellMan Connect Healthcare Team`
  },
  newsletter: {
    subject: 'WellMan Connect Newsletter - Health Tips & Updates',
    message: `Hi there!

Here are this month's health tips and updates from WellMan Connect:

📈 Health Tip of the Month:
[HEALTH_TIP]

🏥 New Services:
[NEW_SERVICES]

📚 Featured Articles:
[FEATURED_ARTICLES]

Stay healthy and connected!

Best regards,
The WellMan Connect Team`
  }
}

// Load template
const loadTemplate = () => {
  if (selectedTemplate.value !== 'custom' && templates[selectedTemplate.value]) {
    const template = templates[selectedTemplate.value]
    emailForm.subject = template.subject
    emailForm.message = template.message
  }
}

// Handle file upload
const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  
  files.forEach(file => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert(`File ${file.name} is too large. Maximum size is 10MB.`)
      return
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      alert(`File ${file.name} is not a supported format.`)
      return
    }
    
    emailForm.attachments.push(file)
  })
}

// Remove attachment
const removeAttachment = (index) => {
  emailForm.attachments.splice(index, 1)
}

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Preview email
const previewEmail = () => {
  const modal = new bootstrap.Modal(document.getElementById('emailPreviewModal'))
  modal.show()
}

// Send email
const sendEmail = async () => {
  if (!emailForm.to || !emailForm.subject || !emailForm.message) {
    alert('Please fill in all required fields.')
    return
  }

  isSending.value = true

  try {
    // Convert attachments to base64
    const attachments = await Promise.all(
      emailForm.attachments.map(async file => ({
        filename: file.name,
        content: await fileToBase64(file),
        type: file.type,
        disposition: 'attachment'
      }))
    )

    const emailData = {
      to: emailForm.to,
      subject: emailForm.subject,
      text: emailForm.message,
      html: emailForm.message.replace(/\n/g, '<br>'),
      attachments: attachments
    }

    let result
    switch (selectedTemplate.value) {
      case 'welcome':
        result = await sendWelcomeEmail(emailForm.to, 'User')
        break
      case 'appointment':
        result = await sendAppointmentConfirmation(emailForm.to, {
          id: 'APP-' + Date.now(),
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          provider: 'Dr. Smith',
          type: 'General Checkup'
        }, 'mock-pdf-content')
        break
      case 'health-report':
        result = await sendHealthReport(emailForm.to, {
          id: 'RPT-' + Date.now(),
          date: new Date().toLocaleDateString(),
          userName: 'Patient',
          type: 'Annual Health Check',
          status: 'Normal'
        }, 'mock-pdf-content')
        break
      case 'newsletter':
        result = await sendNewsletter(emailForm.to, {
          month: new Date().toLocaleDateString('en-US', { month: 'long' }),
          year: new Date().getFullYear()
        })
        break
      default:
        result = await sendEmailWithAttachment(emailData)
    }

    if (result.success) {
      alert('Email sent successfully!')
      // Reset form
      emailForm.to = ''
      emailForm.subject = ''
      emailForm.message = ''
      emailForm.attachments = []
      selectedTemplate.value = 'custom'
    } else {
      alert('Failed to send email. Please try again.')
    }
  } catch (error) {
    console.error('Error sending email:', error)
    alert('An error occurred while sending the email.')
  } finally {
    isSending.value = false
  }
}

// Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = error => reject(error)
  })
}
</script>

<style scoped>
.email-preview {
  font-family: Arial, sans-serif;
}

.email-preview pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
