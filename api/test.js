// Simple test endpoint to verify serverless functions are working
export default async function handler(req, res) {
  console.log('🧪 Test API called:', req.method, req.url)
  
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  res.status(200).json({
    success: true,
    message: 'Test API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  })
}
