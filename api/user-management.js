// Vercel Serverless Function for User Management
// Demonstrates serverless architecture for user operations
// Benefits: Auto-scaling, pay-per-request, no server management

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    console.log('👤 User Management API called:', {
      method: req.method,
      action: req.body?.action || 'unknown'
    })

    const { action, userData, userId } = req.body

    switch (req.method) {
      case 'GET':
        // Get user analytics (serverless benefit: on-demand computation)
        const analytics = await generateUserAnalytics()
        res.status(200).json({
          success: true,
          analytics,
          timestamp: new Date().toISOString(),
          function: 'user-management'
        })
        break

      case 'POST':
        if (action === 'validate-user') {
          // Validate user data (serverless benefit: stateless validation)
          const validation = validateUserData(userData)
          res.status(200).json({
            success: true,
            validation,
            timestamp: new Date().toISOString(),
            function: 'user-management'
          })
        } else {
          res.status(400).json({ error: 'Invalid action' })
        }
        break

      case 'PUT':
        if (action === 'update-profile') {
          // Update user profile (serverless benefit: event-driven updates)
          const updateResult = await updateUserProfile(userId, userData)
          res.status(200).json({
            success: true,
            result: updateResult,
            timestamp: new Date().toISOString(),
            function: 'user-management'
          })
        } else {
          res.status(400).json({ error: 'Invalid action' })
        }
        break

      default:
        res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('👤 User Management API error:', error)
    res.status(500).json({ 
      error: 'User management operation failed', 
      details: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

// Helper functions demonstrating serverless benefits
async function generateUserAnalytics() {
  // Serverless benefit: Compute-intensive operations scale automatically
  // No need to provision servers for analytics computation
  
  const mockAnalytics = {
    totalUsers: Math.floor(Math.random() * 1000) + 500,
    activeUsers: Math.floor(Math.random() * 500) + 200,
    newUsersToday: Math.floor(Math.random() * 50) + 10,
    userEngagement: {
      averageSessionTime: '12.5 minutes',
      pagesPerSession: 4.2,
      bounceRate: '35%'
    },
    demographics: {
      ageGroups: {
        '18-25': 25,
        '26-35': 40,
        '36-45': 25,
        '46+': 10
      },
      locations: {
        'North America': 45,
        'Europe': 30,
        'Asia': 20,
        'Other': 5
      }
    },
    computedAt: new Date().toISOString(),
    processingTime: Math.random() * 100 + 50 // Simulate computation time
  }

  // Simulate async processing (serverless scales automatically)
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return mockAnalytics
}

function validateUserData(userData) {
  // Serverless benefit: Stateless validation - no memory persistence needed
  const errors = []
  const warnings = []

  if (!userData.email) {
    errors.push('Email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('Invalid email format')
  }

  if (!userData.firstName || userData.firstName.length < 2) {
    errors.push('First name must be at least 2 characters')
  }

  if (userData.age && (userData.age < 13 || userData.age > 120)) {
    warnings.push('Age seems unusual, please verify')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validatedAt: new Date().toISOString()
  }
}

async function updateUserProfile(userId, userData) {
  // Serverless benefit: Event-driven updates - function triggers on demand
  // No persistent connections or background processes needed
  
  console.log(`Updating profile for user ${userId}`)
  
  // Simulate database update
  await new Promise(resolve => setTimeout(resolve, 50))
  
  return {
    userId,
    updatedFields: Object.keys(userData),
    updatedAt: new Date().toISOString(),
    version: Math.floor(Math.random() * 100) + 1
  }
}
