import sgMail from '@sendgrid/mail'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const { to, subject, text, html, attachments } = req.body

  try {
    const msg = {
      to,
      from: 'noreply@wellmanconnect.com', // Use verified sender
      subject,
      text,
      html,
      attachments: attachments || []
    }

    await sgMail.send(msg)
    res.status(200).json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('SendGrid error:', error)
    res.status(500).json({ error: 'Failed to send email' })
  }
}
