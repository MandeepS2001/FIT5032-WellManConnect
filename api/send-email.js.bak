export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Import SendGrid dynamically
    const sgMail = (await import('@sendgrid/mail')).default
    
    sgMail.setApiKey(process.env.VITE_SENDGRID_API_KEY)

    const { to, subject, text, html, attachments, from } = req.body

    const msg = {
      to,
      from: from || 'mdan0028@student.monash.edu', // Use verified sender
      subject,
      text,
      html,
      attachments: attachments || []
    }

    const response = await sgMail.send(msg)
    console.log('Email sent successfully:', response[0].statusCode)
    
    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: response[0].headers['x-message-id']
    })
  } catch (error) {
    console.error('SendGrid error:', error)
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    })
  }
}
