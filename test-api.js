// Test script to verify serverless function locally
import fetch from 'node-fetch'

const testEmail = async () => {
  try {
    console.log('🧪 Testing email API locally...')
    
    const response = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
        html: '<p>This is a test email</p>'
      })
    })
    
    console.log('📧 Response status:', response.status)
    console.log('📧 Response headers:', Object.fromEntries(response.headers.entries()))
    
    const result = await response.text()
    console.log('📧 Response body:', result)
    
  } catch (error) {
    console.error('🧪 Test failed:', error)
  }
}

testEmail()
