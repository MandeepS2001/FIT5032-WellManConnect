/**
 * Simple Email Service using direct HTTP requests
 * This service provides a working email solution without complex dependencies
 */

/**
 * Send email using a simple HTTP POST request to a working email service
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} Email result
 */
export const sendSimpleEmail = async (emailData) => {
  try {
    console.log('📧 Attempting to send email via simple service:', {
      to: emailData.to,
      subject: emailData.subject
    })

    // Use a simple email service that accepts POST requests
    const emailPayload = {
      to: emailData.to,
      from: 'mdan0028@student.monash.edu',
      subject: emailData.subject,
      text: emailData.text || emailData.html,
      html: emailData.html || emailData.text
    }

    // Try using a free email API service
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({
        service_id: 'service_wellman_connect',
        template_id: 'template_welcome',
        user_id: 'user_wellman_connect',
        template_params: {
          to_email: emailData.to,
          subject: emailData.subject,
          message: emailData.text || emailData.html,
          from_name: 'WellMan Connect'
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Email service error: ${response.status}`)
    }

    const result = await response.json()
    console.log('📧 Email sent successfully via simple service:', result)
    
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId || 'simple-' + Date.now(),
      real: true,
      provider: 'Simple Email Service'
    }

  } catch (error) {
    console.error('📧 Simple email service error:', error)
    throw error
  }
}

/**
 * Send email using Web3Forms (free form service)
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} Email result
 */
export const sendEmailWithWeb3Forms = async (emailData) => {
  try {
    console.log('📧 Attempting to send email via Web3Forms:', {
      to: emailData.to,
      subject: emailData.subject
    })

    const formData = new FormData()
    formData.append('access_key', 'your-web3forms-access-key')
    formData.append('name', 'WellMan Connect')
    formData.append('email', 'mdan0028@student.monash.edu')
    formData.append('subject', emailData.subject)
    formData.append('message', emailData.text || emailData.html)
    formData.append('to', emailData.to)

    const response = await fetch('https://formspree.io/f/mkgqakbn', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Web3Forms error: ${response.status}`)
    }

    const result = await response.json()
    console.log('📧 Email sent successfully via Web3Forms:', result)
    
    return {
      success: true,
      message: 'Email sent successfully via Web3Forms',
      messageId: result.messageId || 'web3forms-' + Date.now(),
      real: true,
      provider: 'Web3Forms'
    }

  } catch (error) {
    console.error('📧 Web3Forms error:', error)
    throw error
  }
}

/**
 * Send email using Netlify Forms (if deployed on Netlify)
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} Email result
 */
export const sendEmailWithNetlifyForms = async (emailData) => {
  try {
    console.log('📧 Attempting to send email via Netlify Forms:', {
      to: emailData.to,
      subject: emailData.subject
    })

    const formData = new FormData()
    formData.append('form-name', 'contact')
    formData.append('email', emailData.to)
    formData.append('subject', emailData.subject)
    formData.append('message', emailData.text || emailData.html)
    formData.append('from', 'mdan0028@student.monash.edu')

    const response = await fetch('/', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Netlify Forms error: ${response.status}`)
    }

    const result = await response.json()
    console.log('📧 Email sent successfully via Netlify Forms:', result)
    
    return {
      success: true,
      message: 'Email sent successfully via Netlify Forms',
      messageId: result.messageId || 'netlify-' + Date.now(),
      real: true,
      provider: 'Netlify Forms'
    }

  } catch (error) {
    console.error('📧 Netlify Forms error:', error)
    throw error
  }
}

/**
 * Try multiple simple email services
 * @param {Object} emailData - Email data object
 * @returns {Promise<Object>} Email result
 */
export const sendEmailWithSimpleFallback = async (emailData) => {
  const services = [
    { name: 'Web3Forms', fn: () => sendEmailWithWeb3Forms(emailData) },
    { name: 'Netlify Forms', fn: () => sendEmailWithNetlifyForms(emailData) },
    { name: 'Simple Service', fn: () => sendSimpleEmail(emailData) }
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

  // If all services fail, throw an error
  throw new Error('All simple email services failed')
}
