/**
 * Alternative Email Service using multiple providers
 * This service provides fallback options when serverless functions fail
 */

// EmailJS configuration (alternative to SendGrid)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_placeholder'
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_placeholder'
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key_placeholder'

/**
 * Send email using EmailJS (client-side email service)
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} Email result
 */
export const sendEmailWithEmailJS = async (emailData) => {
  try {
    console.log('📧 Attempting to send email via EmailJS:', {
      to: emailData.to,
      subject: emailData.subject
    })

    // Check if EmailJS is available
    if (typeof window.emailjs === 'undefined') {
      throw new Error('EmailJS not loaded')
    }

    const templateParams = {
      to_email: emailData.to,
      subject: emailData.subject,
      message: emailData.text || emailData.html,
      from_name: 'WellMan Connect',
      reply_to: 'mdan0028@student.monash.edu'
    }

    const result = await window.emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    )

    console.log('📧 Email sent successfully via EmailJS:', result)
    return {
      success: true,
      message: 'Email sent successfully via EmailJS',
      messageId: result.text,
      real: true,
      provider: 'EmailJS'
    }

  } catch (error) {
    console.error('📧 EmailJS error:', error)
    throw error
  }
}

/**
 * Send email using Formspree (form-based email service)
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} Email result
 */
export const sendEmailWithFormspree = async (emailData) => {
  try {
    console.log('📧 Attempting to send email via Formspree:', {
      to: emailData.to,
      subject: emailData.subject
    })

    const formData = new FormData()
    formData.append('email', emailData.to)
    formData.append('subject', emailData.subject)
    formData.append('message', emailData.text || emailData.html)
    formData.append('_replyto', 'mdan0028@student.monash.edu')
    formData.append('_subject', `WellMan Connect: ${emailData.subject}`)

    // Try a different Formspree endpoint
    const response = await fetch('https://formspree.io/f/mkgqakbn', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Formspree error: ${response.status}`)
    }

    const result = await response.json()
    console.log('📧 Email sent successfully via Formspree:', result)
    
    return {
      success: true,
      message: 'Email sent successfully via Formspree',
      messageId: result.id || 'formspree-' + Date.now(),
      real: true,
      provider: 'Formspree'
    }

  } catch (error) {
    console.error('📧 Formspree error:', error)
    throw error
  }
}

/**
 * Try multiple email services in order of preference
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} Email result
 */
export const sendEmailWithFallback = async (emailData) => {
  const services = [
    { name: 'Serverless Function', fn: () => sendEmailWithServerless(emailData) },
    { name: 'EmailJS', fn: () => sendEmailWithEmailJS(emailData) },
    { name: 'Formspree', fn: () => sendEmailWithFormspree(emailData) }
  ]

  for (const service of services) {
    try {
      console.log(`📧 Trying ${service.name}...`)
      const result = await service.fn()
      console.log(`📧 Success with ${service.name}:`, result)
      return result
    } catch (error) {
      console.warn(`📧 ${service.name} failed:`, error.message)
      continue
    }
  }

  // If all services fail, return demo mode
  console.log('📧 All email services failed, falling back to demo mode')
  return await sendDemoEmail(emailData)
}

/**
 * Send email via serverless function (existing implementation)
 */
const sendEmailWithServerless = async (emailData) => {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  })

  if (!response.ok) {
    throw new Error(`Serverless function error: ${response.status}`)
  }

  return await response.json()
}

/**
 * Demo email fallback
 */
const sendDemoEmail = async (emailData) => {
  console.log('📧 Demo Email Sent Successfully!')
  console.log('📧 Recipient:', emailData.to)
  console.log('📧 Subject:', emailData.subject)
  console.log('📧 Attachments:', emailData.attachments?.length || 0)
  console.log('📧 Timestamp:', new Date().toISOString())
  console.log('📧 In production, this email would be delivered to the recipient\'s inbox')
  
  return {
    success: true,
    message: 'Demo email sent successfully',
    messageId: 'demo-' + Date.now(),
    real: false,
    provider: 'Demo'
  }
}

/**
 * Load EmailJS library dynamically
 */
export const loadEmailJS = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.emailjs !== 'undefined') {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
    script.onload = () => {
      window.emailjs.init(EMAILJS_PUBLIC_KEY)
      resolve()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}
