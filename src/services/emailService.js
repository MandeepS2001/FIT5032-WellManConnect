/**
 * Email Service using SendGrid API
 * Handles email sending with attachments for WellMan Connect
 */

import sgMail from '@sendgrid/mail'

// SendGrid API Key - Use environment variable or fallback to demo key
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY || 'SG.demo-api-key-replace-with-actual'

// Configure SendGrid
sgMail.setApiKey(SENDGRID_API_KEY)

/**
 * Send email with attachment using SendGrid
 * @param {Object} emailData - Email data object
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.text - Plain text content
 * @param {string} emailData.html - HTML content
 * @param {Array} emailData.attachments - Array of attachment objects
 * @param {string} emailData.from - Sender email (optional)
 * @returns {Promise<Object>} SendGrid response
 */
export const sendEmailWithAttachment = async (emailData) => {
  // Check if SendGrid is properly configured
  if (!isEmailServiceConfigured()) {
    console.log('SendGrid not configured, using demo mode')
    return await sendDemoEmail(emailData)
  }

  try {
    const msg = {
      to: emailData.to,
      from: emailData.from || 'mdan0028@student.monash.edu',
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      attachments: emailData.attachments || []
    }

    const response = await sgMail.send(msg)
    console.log('Email sent successfully:', response[0].statusCode)
    return { success: true, messageId: response[0].headers['x-message-id'] }
  } catch (error) {
    console.error('SendGrid email error:', error)
    console.log('Falling back to demo mode due to SendGrid error')
    return await sendDemoEmail(emailData)
  }
}

/**
 * Send welcome email to new user
 * @param {string} userEmail - User email address
 * @param {string} userName - User name
 * @returns {Promise<Object>} Send result
 */
export const sendWelcomeEmail = async (userEmail, userName) => {
  const emailData = {
    to: userEmail,
    subject: 'Welcome to WellMan Connect!',
    text: `Hi ${userName},\n\nWelcome to WellMan Connect! We're excited to have you join our community.\n\nBest regards,\nThe WellMan Connect Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to WellMan Connect!</h2>
        <p>Hi ${userName},</p>
        <p>Welcome to WellMan Connect! We're excited to have you join our community focused on men's health and wellness.</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Access health resources and articles</li>
          <li>Track your wellness metrics</li>
          <li>Book appointments with healthcare providers</li>
          <li>Connect with our community</li>
        </ul>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The WellMan Connect Team</p>
      </div>
    `
  }

  return await sendEmailWithAttachment(emailData)
}

/**
 * Send appointment confirmation email with PDF attachment
 * @param {string} userEmail - User email address
 * @param {Object} appointmentData - Appointment details
 * @param {string} attachmentContent - Base64 encoded PDF content
 * @returns {Promise<Object>} Send result
 */
export const sendAppointmentConfirmation = async (userEmail, appointmentData, attachmentContent) => {
  const emailData = {
    to: userEmail,
    subject: `Appointment Confirmation - ${appointmentData.date}`,
    text: `Your appointment has been confirmed for ${appointmentData.date} at ${appointmentData.time} with ${appointmentData.provider}.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmation</h2>
        <p>Your appointment has been confirmed with the following details:</p>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Date:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${appointmentData.date}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Time:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${appointmentData.time}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Provider:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${appointmentData.provider}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Type:</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${appointmentData.type}</td>
          </tr>
        </table>
        <p>Please find your appointment details attached as a PDF.</p>
        <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
        <p>Best regards,<br>The WellMan Connect Team</p>
      </div>
    `,
    attachments: [
      {
        content: attachmentContent,
        filename: `appointment-confirmation-${appointmentData.id}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  }

  return await sendEmailWithAttachment(emailData)
}

/**
 * Send health report email with attachment
 * @param {string} userEmail - User email address
 * @param {Object} reportData - Report details
 * @param {string} attachmentContent - Base64 encoded report content
 * @returns {Promise<Object>} Send result
 */
export const sendHealthReport = async (userEmail, reportData, attachmentContent) => {
  const emailData = {
    to: userEmail,
    subject: `Your Health Report - ${reportData.date}`,
    text: `Your health report for ${reportData.date} is ready. Please find it attached.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Health Report</h2>
        <p>Dear ${reportData.userName},</p>
        <p>Your health report for ${reportData.date} is ready and attached to this email.</p>
        <p>Report Summary:</p>
        <ul>
          <li>Report Type: ${reportData.type}</li>
          <li>Generated: ${reportData.date}</li>
          <li>Status: ${reportData.status}</li>
        </ul>
        <p>Please review the attached report and contact your healthcare provider if you have any questions.</p>
        <p>Best regards,<br>The WellMan Connect Team</p>
      </div>
    `,
    attachments: [
      {
        content: attachmentContent,
        filename: `health-report-${reportData.id}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  }

  return await sendEmailWithAttachment(emailData)
}

/**
 * Send newsletter email
 * @param {Array} recipients - Array of recipient email addresses
 * @param {string} subject - Newsletter subject
 * @param {string} content - Newsletter content
 * @returns {Promise<Object>} Send result
 */
export const sendNewsletter = async (recipients, subject, content) => {
  const emailData = {
    to: recipients,
    subject: subject,
    text: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    html: content
  }

  return await sendEmailWithAttachment(emailData)
}

/**
 * Check if SendGrid is properly configured
 * @returns {boolean} True if SendGrid is configured
 */
export const isEmailServiceConfigured = () => {
  return SENDGRID_API_KEY !== 'SG.demo-api-key-replace-with-actual' && SENDGRID_API_KEY.length > 20
}

/**
 * Demo email function for testing without SendGrid
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} Demo response
 */
export const sendDemoEmail = async (emailData) => {
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  console.log('📧 Demo Email Sent:', {
    to: emailData.to,
    subject: emailData.subject,
    message: emailData.text || emailData.html,
    attachments: emailData.attachments?.length || 0
  })
  
  return {
    success: true,
    messageId: 'demo-' + Date.now(),
    demo: true
  }
}

/**
 * Create a mock PDF attachment for demo purposes
 * @param {string} content - PDF content as string
 * @returns {string} Base64 encoded PDF
 */
export const createMockPDFAttachment = (content) => {
  // This is a mock function for demo purposes
  // In a real application, you would use a PDF generation library
  const mockPDFContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(${content}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`
  
  return btoa(mockPDFContent)
}

export default {
  sendEmailWithAttachment,
  sendWelcomeEmail,
  sendAppointmentConfirmation,
  sendHealthReport,
  sendNewsletter,
  isEmailServiceConfigured,
  createMockPDFAttachment
}
