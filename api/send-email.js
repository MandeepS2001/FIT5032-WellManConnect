// Vercel Serverless Function for Email Sending
// This function runs server-side and can access SendGrid API without CORS issues

export default async function handler(req, res) {
  console.log('📧 Email API handler called:', {
    method: req.method,
    url: req.url,
    headers: req.headers
  })

  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    console.log('📧 Handling OPTIONS request')
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    console.log('📧 Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed', received: req.method })
  }

  try {
    console.log('📧 Email API called with:', req.body)
    
    // Get SendGrid API key from environment variables
    const SENDGRID_API_KEY = process.env.VITE_SENDGRID_API_KEY
    
    console.log('📧 SendGrid API Key check:', {
      hasKey: !!SENDGRID_API_KEY,
      keyLength: SENDGRID_API_KEY?.length || 0,
      keyPrefix: SENDGRID_API_KEY?.substring(0, 10) || 'none'
    })
    
    if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'SG.demo-api-key-replace-with-actual') {
      return res.status(400).json({ 
        error: 'SendGrid API key not configured',
        message: 'Please configure VITE_SENDGRID_API_KEY in Vercel environment variables',
        debug: {
          hasKey: !!SENDGRID_API_KEY,
          keyLength: SENDGRID_API_KEY?.length || 0
        }
      })
    }

    const { to, subject, text, html, attachments, from } = req.body

    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing required fields: to, subject' })
    }

    // Prepare email data for SendGrid
    const msg = {
      to,
      from: from || 'mdan0028@student.monash.edu', // Use verified sender
      subject,
      text,
      html,
      attachments: attachments || []
    }

    console.log('📧 Sending email via SendGrid:', {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      attachments: msg.attachments.length
    })

    // Send email using SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(msg)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('📧 SendGrid API error:', errorData)
      throw new Error(`SendGrid API error: ${response.status} - ${errorData}`)
    }

    const result = await response.json()
    console.log('📧 Email sent successfully via SendGrid:', result)
    
    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.message_id || 'sendgrid-' + Date.now(),
      real: true,
      provider: 'SendGrid'
    })

  } catch (error) {
    console.error('📧 Email API error:', error)
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    })
  }
}
