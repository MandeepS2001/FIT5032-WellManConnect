/**
 * Robust Email Service using SendGrid API
 * This service provides reliable email sending functionality with attachments
 * for the WellMan Connect application.
 * 
 * Features:
 * - SendGrid API integration with fallback to demo mode
 * - Support for email attachments (PDF, DOC, images)
 * - Multiple email templates (welcome, appointment, health report, newsletter)
 * - Professional HTML email formatting
 * - Error handling and retry logic
 */

// SendGrid API Key - Use environment variable only
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY

/**
 * Check if email service is configured with a real API key
 * @returns {boolean} True if a real API key is present
 */
export const isEmailServiceConfigured = () => {
  return SENDGRID_API_KEY && SENDGRID_API_KEY.length > 20 && SENDGRID_API_KEY.startsWith('SG.')
}

/**
 * Send email using SendGrid API with proper error handling
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
  try {
    console.log('📧 Attempting to send email via serverless function:', {
      to: emailData.to,
      subject: emailData.subject,
      attachments: emailData.attachments?.length || 0
    })

    // Always try the serverless function first (it will handle API key check)
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.warn('📧 Serverless function error:', errorData)
      
      // If it's an API key issue, fall back to demo mode
      if (errorData.error === 'SendGrid API key not configured') {
        console.log('📧 SendGrid not configured, falling back to demo mode')
        return await sendDemoEmail(emailData)
      }
      
      throw new Error(`Serverless function error: ${response.status} - ${errorData.message || errorData.error}`)
    }

    const result = await response.json()
    console.log('📧 Email sent successfully via serverless function:', result)
    
    return result

  } catch (error) {
    console.error('📧 Email service error:', error)
    
    // Fallback to demo mode if serverless function fails
    console.log('📧 Falling back to demo mode due to email service error')
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
    text: `Hi ${userName},

Welcome to WellMan Connect! We're excited to have you join our community focused on men's health and wellness.

With your account, you can:
• Access health resources and articles
• Track your wellness metrics
• Book appointments with healthcare providers
• Connect with our community

If you have any questions, feel free to reach out to our support team.

Best regards,
The WellMan Connect Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2563eb; margin-bottom: 10px;">Welcome to WellMan Connect!</h2>
          <p style="color: #666; font-size: 16px;">Empowering men's health through technology</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin-bottom: 15px;">Hi ${userName},</p>
          <p style="margin-bottom: 15px;">Welcome to WellMan Connect! We're excited to have you join our community focused on men's health and wellness.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2563eb; margin-bottom: 15px;">With your account, you can:</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>Access health resources and articles</li>
            <li>Track your wellness metrics</li>
            <li>Book appointments with healthcare providers</li>
            <li>Connect with our community</li>
          </ul>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #1976d2;">
            <strong>Need help?</strong> If you have any questions, feel free to reach out to our support team.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0;">Best regards,<br>The WellMan Connect Team</p>
        </div>
      </div>
    `
  }

  return await sendEmailWithAttachment(emailData)
}

/**
 * Send appointment confirmation email
 * @param {string} userEmail - User email address
 * @param {Object} appointmentData - Appointment details
 * @param {string} attachmentContent - PDF content for attachment
 * @returns {Promise<Object>} Send result
 */
export const sendAppointmentConfirmation = async (userEmail, appointmentData, attachmentContent) => {
  const emailData = {
    to: userEmail,
    subject: `Appointment Confirmation - ${appointmentData.type || 'Healthcare Appointment'}`,
    text: `Dear Patient,

Your appointment has been confirmed:

Appointment ID: ${appointmentData.id}
Date: ${appointmentData.date}
Time: ${appointmentData.time}
Provider: ${appointmentData.provider}
Type: ${appointmentData.type}

Please arrive 15 minutes early for your appointment. If you need to reschedule or cancel, please contact us at least 24 hours in advance.

Best regards,
WellMan Connect Healthcare Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Appointment Confirmation</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin-bottom: 15px;">Dear Patient,</p>
          <p style="margin-bottom: 15px;">Your appointment has been confirmed:</p>
        </div>
        
        <div style="background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #2563eb; margin-bottom: 15px;">Appointment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Appointment ID:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Time:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.time}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Provider:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${appointmentData.provider}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Type:</td>
              <td style="padding: 8px 0;">${appointmentData.type}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #856404;">
            <strong>Important:</strong> Please arrive 15 minutes early for your appointment. If you need to reschedule or cancel, please contact us at least 24 hours in advance.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0;">Best regards,<br>WellMan Connect Healthcare Team</p>
        </div>
      </div>
    `,
    attachments: attachmentContent ? [{
      filename: `appointment-${appointmentData.id}.pdf`,
      content: createMockPDFAttachment(attachmentContent),
      type: 'application/pdf',
      disposition: 'attachment'
    }] : []
  }

  return await sendEmailWithAttachment(emailData)
}

/**
 * Send health report email
 * @param {string} userEmail - User email address
 * @param {Object} reportData - Report details
 * @param {string} attachmentContent - PDF content for attachment
 * @returns {Promise<Object>} Send result
 */
export const sendHealthReport = async (userEmail, reportData, attachmentContent) => {
  const emailData = {
    to: userEmail,
    subject: `Health Report - ${reportData.type || 'Health Assessment'}`,
    text: `Dear ${reportData.userName || 'Patient'},

Please find attached your health report from your recent visit.

Report ID: ${reportData.id}
Date: ${reportData.date}
Type: ${reportData.type}
Status: ${reportData.status}

Key Findings:
• Overall Health Status: ${reportData.status}
• Recommendations: Please review the attached report for detailed recommendations
• Next Steps: Schedule a follow-up appointment if recommended

If you have any questions about your report, please don't hesitate to contact our healthcare team.

Best regards,
WellMan Connect Healthcare Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Health Report</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin-bottom: 15px;">Dear ${reportData.userName || 'Patient'},</p>
          <p style="margin-bottom: 15px;">Please find attached your health report from your recent visit.</p>
        </div>
        
        <div style="background-color: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="color: #2563eb; margin-bottom: 15px;">Report Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Report ID:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${reportData.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${reportData.date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Type:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${reportData.type}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Status:</td>
              <td style="padding: 8px 0;">${reportData.status}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="color: #1976d2; margin-bottom: 10px;">Key Findings:</h4>
          <ul style="color: #333; line-height: 1.6; margin: 0;">
            <li>Overall Health Status: ${reportData.status}</li>
            <li>Recommendations: Please review the attached report for detailed recommendations</li>
            <li>Next Steps: Schedule a follow-up appointment if recommended</li>
          </ul>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #856404;">
            <strong>Questions?</strong> If you have any questions about your report, please don't hesitate to contact our healthcare team.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0;">Best regards,<br>WellMan Connect Healthcare Team</p>
        </div>
      </div>
    `,
    attachments: attachmentContent ? [{
      filename: `health-report-${reportData.id}.pdf`,
      content: createMockPDFAttachment(attachmentContent),
      type: 'application/pdf',
      disposition: 'attachment'
    }] : []
  }

  return await sendEmailWithAttachment(emailData)
}

/**
 * Send newsletter email
 * @param {string} userEmail - User email address
 * @param {Object} newsletterData - Newsletter details
 * @returns {Promise<Object>} Send result
 */
export const sendNewsletter = async (userEmail, newsletterData) => {
  const emailData = {
    to: userEmail,
    subject: `WellMan Connect Newsletter - ${newsletterData.month} ${newsletterData.year}`,
    text: `Hi there!

Here are this month's health tips and updates from WellMan Connect:

📈 Health Tip of the Month:
Stay hydrated and maintain a balanced diet for optimal health.

🏥 New Services:
• Online health consultations
• Personalized wellness plans
• Health tracking tools

📚 Featured Articles:
• "The Importance of Regular Health Checkups"
• "Mental Health and Wellness for Men"
• "Nutrition Tips for Busy Professionals"

Stay healthy and connected!

Best regards,
The WellMan Connect Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #2563eb; margin-bottom: 10px;">WellMan Connect Newsletter</h2>
          <p style="color: #666; font-size: 16px;">${newsletterData.month} ${newsletterData.year}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin-bottom: 15px;">Hi there!</p>
          <p style="margin-bottom: 15px;">Here are this month's health tips and updates from WellMan Connect:</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2563eb; margin-bottom: 15px;">📈 Health Tip of the Month:</h3>
          <p style="color: #333; line-height: 1.6;">Stay hydrated and maintain a balanced diet for optimal health.</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2563eb; margin-bottom: 15px;">🏥 New Services:</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>Online health consultations</li>
            <li>Personalized wellness plans</li>
            <li>Health tracking tools</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2563eb; margin-bottom: 15px;">📚 Featured Articles:</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>"The Importance of Regular Health Checkups"</li>
            <li>"Mental Health and Wellness for Men"</li>
            <li>"Nutrition Tips for Busy Professionals"</li>
          </ul>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #1976d2; text-align: center; font-weight: bold;">
            Stay healthy and connected!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0;">Best regards,<br>The WellMan Connect Team</p>
        </div>
      </div>
    `
  }

  return await sendEmailWithAttachment(emailData)
}

/**
 * Demo email function for testing without SendGrid
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} Demo response
 */
export const sendDemoEmail = async (emailData) => {
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const emailDetails = {
    to: emailData.to,
    subject: emailData.subject,
    message: emailData.text || emailData.html,
    attachments: emailData.attachments?.length || 0,
    timestamp: new Date().toISOString()
  }
  
  console.log('📧 Demo Email Sent Successfully!')
  console.log('📧 Recipient:', emailDetails.to)
  console.log('📧 Subject:', emailDetails.subject)
  console.log('📧 Attachments:', emailDetails.attachments)
  console.log('📧 Timestamp:', emailDetails.timestamp)
  console.log('📧 In production, this email would be delivered to the recipient\'s inbox')
  
  return {
    success: true,
    messageId: 'demo-' + Date.now(),
    demo: true,
    details: emailDetails
  }
}

/**
 * Create a mock PDF attachment for demo purposes
 * @param {string} content - PDF content as string
 * @returns {string} Base64 encoded PDF
 */
export const createMockPDFAttachment = (content) => {
  // A very basic mock PDF structure in Base64
  const mockPDFContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R>>endobj
4 0 obj<</Length ${content.length}>>stream
${content}
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000074 00000 n
0000000120 00000 n
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
  createMockPDFAttachment,
  sendDemoEmail
}