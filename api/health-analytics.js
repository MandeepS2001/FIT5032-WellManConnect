// Vercel Serverless Function for Health Analytics
// Demonstrates serverless architecture for health data processing and insights
// Benefits: Real-time processing, auto-scaling, event-driven analytics

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
    console.log('🏥 Health Analytics API called:', {
      method: req.method,
      operation: req.body?.operation || req.query?.operation || 'unknown'
    })

    const operation = req.body?.operation || req.query?.operation

    switch (req.method) {
      case 'GET':
        if (operation === 'dashboard-metrics') {
          // Get dashboard metrics (serverless benefit: real-time computation)
          const metrics = await generateDashboardMetrics()
          res.status(200).json({
            success: true,
            metrics,
            timestamp: new Date().toISOString(),
            function: 'health-analytics'
          })
        } else if (operation === 'health-trends') {
          // Get health trends (serverless benefit: on-demand trend analysis)
          const trends = await analyzeHealthTrends()
          res.status(200).json({
            success: true,
            trends,
            timestamp: new Date().toISOString(),
            function: 'health-analytics'
          })
        } else {
          res.status(400).json({ error: 'Invalid operation' })
        }
        break

      case 'POST':
        if (operation === 'predict-health-risk') {
          // Predict health risk (serverless benefit: ML inference on demand)
          const { userData } = req.body
          const prediction = await predictHealthRisk(userData)
          res.status(200).json({
            success: true,
            prediction,
            timestamp: new Date().toISOString(),
            function: 'health-analytics'
          })
        } else if (operation === 'generate-health-insights') {
          // Generate health insights (serverless benefit: complex analysis on demand)
          const { userData, timeframe } = req.body
          const insights = await generateHealthInsights(userData, timeframe)
          res.status(200).json({
            success: true,
            insights,
            timestamp: new Date().toISOString(),
            function: 'health-analytics'
          })
        } else {
          res.status(400).json({ error: 'Invalid operation' })
        }
        break

      default:
        res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('🏥 Health Analytics API error:', error)
    res.status(500).json({ 
      error: 'Health analytics operation failed', 
      details: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

// Helper functions demonstrating serverless architecture benefits

async function generateDashboardMetrics() {
  // Serverless benefit: Real-time metrics computation without persistent servers
  // Scales automatically based on data volume and computation complexity
  
  console.log('Generating dashboard metrics...')
  
  const startTime = Date.now()
  
  // Simulate real-time data aggregation
  const metrics = {
    overview: {
      totalUsers: Math.floor(Math.random() * 1000) + 500,
      activeUsers: Math.floor(Math.random() * 500) + 200,
      healthScore: Math.round(Math.random() * 20 + 70),
      riskAlerts: Math.floor(Math.random() * 20) + 5
    },
    healthMetrics: {
      averageBMI: (Math.random() * 10 + 20).toFixed(1),
      bloodPressure: {
        normal: Math.floor(Math.random() * 40) + 50,
        elevated: Math.floor(Math.random() * 20) + 10,
        high: Math.floor(Math.random() * 10) + 5
      },
      cholesterol: {
        optimal: Math.floor(Math.random() * 50) + 30,
        borderline: Math.floor(Math.random() * 30) + 15,
        high: Math.floor(Math.random() * 20) + 5
      }
    },
    engagement: {
      dailyActiveUsers: Math.floor(Math.random() * 100) + 50,
      weeklyRetention: Math.round(Math.random() * 20 + 70),
      averageSessionTime: Math.round(Math.random() * 10 + 15),
      featureUsage: {
        healthTracking: Math.floor(Math.random() * 80) + 60,
        appointmentBooking: Math.floor(Math.random() * 60) + 40,
        resourceAccess: Math.floor(Math.random() * 70) + 50
      }
    },
    demographics: {
      ageGroups: {
        '18-25': Math.floor(Math.random() * 25) + 15,
        '26-35': Math.floor(Math.random() * 35) + 25,
        '36-45': Math.floor(Math.random() * 30) + 20,
        '46-55': Math.floor(Math.random() * 20) + 10,
        '56+': Math.floor(Math.random() * 15) + 5
      },
      genderDistribution: {
        male: Math.floor(Math.random() * 20) + 55,
        female: Math.floor(Math.random() * 20) + 40,
        other: Math.floor(Math.random() * 5) + 2
      }
    },
    computedAt: new Date().toISOString(),
    processingTime: Date.now() - startTime
  }
  
  // Simulate async processing (serverless scales automatically)
  await new Promise(resolve => setTimeout(resolve, 150))
  
  return metrics
}

async function analyzeHealthTrends() {
  // Serverless benefit: Event-driven trend analysis
  // No need for scheduled batch jobs or persistent analytics servers
  
  console.log('Analyzing health trends...')
  
  const trends = {
    temporal: {
      dailyTrends: Array.from({length: 7}, (_, i) => ({
        day: new Date(Date.now() - (6-i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        healthScore: Math.round(Math.random() * 10 + 70),
        activeUsers: Math.floor(Math.random() * 50) + 100,
        newRegistrations: Math.floor(Math.random() * 20) + 5
      })),
      weeklyTrends: Array.from({length: 4}, (_, i) => ({
        week: `Week ${i + 1}`,
        averageHealthScore: Math.round(Math.random() * 8 + 72),
        userGrowth: Math.round(Math.random() * 15 + 5),
        engagementRate: Math.round(Math.random() * 20 + 70)
      }))
    },
    healthPatterns: {
      seasonalVariations: {
        winter: { riskIncrease: 15, commonIssues: ['Seasonal Depression', 'Vitamin D Deficiency'] },
        spring: { riskIncrease: 5, commonIssues: ['Allergies', 'Asthma Flares'] },
        summer: { riskIncrease: -5, commonIssues: ['Heat Stroke', 'Dehydration'] },
        fall: { riskIncrease: 10, commonIssues: ['Flu', 'Respiratory Issues'] }
      },
      demographicPatterns: {
        ageRelated: {
          '18-30': { focus: 'Preventive Care', risk: 'Low' },
          '31-50': { focus: 'Work-Life Balance', risk: 'Medium' },
          '51+': { focus: 'Chronic Disease Management', risk: 'High' }
        }
      }
    },
    predictiveInsights: {
      riskFactors: [
        'Sedentary lifestyle increasing among younger demographics',
        'Stress levels rising in urban populations',
        'Sleep quality declining across all age groups'
      ],
      opportunities: [
        'Mobile app engagement correlates with better health outcomes',
        'Community features show high user satisfaction',
        'Personalized recommendations increase compliance rates'
      ]
    },
    analyzedAt: new Date().toISOString(),
    confidence: Math.round(Math.random() * 20 + 80)
  }
  
  // Simulate complex trend analysis
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return trends
}

async function predictHealthRisk(userData) {
  // Serverless benefit: ML inference on demand
  // No need to maintain ML model servers or batch processing systems
  
  console.log('Predicting health risk for user:', userData.email || 'anonymous')
  
  const riskFactors = {
    age: userData.age || 35,
    bmi: userData.bmi || 25,
    bloodPressure: userData.bloodPressure || 'normal',
    cholesterol: userData.cholesterol || 'normal',
    familyHistory: userData.familyHistory || [],
    lifestyle: userData.lifestyle || 'moderate'
  }
  
  // Simulate ML-based risk calculation
  let riskScore = 0
  
  // Age factor
  if (riskFactors.age > 50) riskScore += 20
  else if (riskFactors.age > 40) riskScore += 10
  
  // BMI factor
  if (riskFactors.bmi > 30) riskScore += 25
  else if (riskFactors.bmi > 25) riskScore += 15
  
  // Blood pressure factor
  if (riskFactors.bloodPressure === 'high') riskScore += 20
  else if (riskFactors.bloodPressure === 'elevated') riskScore += 10
  
  // Cholesterol factor
  if (riskFactors.cholesterol === 'high') riskScore += 15
  
  // Family history factor
  riskScore += riskFactors.familyHistory.length * 5
  
  // Lifestyle factor
  if (riskFactors.lifestyle === 'sedentary') riskScore += 15
  else if (riskFactors.lifestyle === 'active') riskScore -= 10
  
  // Add some randomness to simulate model uncertainty
  riskScore += (Math.random() - 0.5) * 10
  riskScore = Math.max(0, Math.min(100, riskScore))
  
  const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low'
  
  const prediction = {
    riskScore: Math.round(riskScore),
    riskLevel,
    confidence: Math.round(Math.random() * 20 + 75),
    factors: {
      contributing: generateContributingFactors(riskFactors, riskScore),
      mitigating: generateMitigatingFactors(riskFactors, riskScore)
    },
    recommendations: generateRiskRecommendations(riskLevel, riskFactors),
    nextSteps: generateNextSteps(riskLevel),
    predictedAt: new Date().toISOString()
  }
  
  // Simulate ML inference time
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return prediction
}

async function generateHealthInsights(userData, timeframe = '30d') {
  // Serverless benefit: Complex analysis on demand
  // No need for scheduled insights generation or persistent analytics
  
  console.log(`Generating health insights for ${timeframe} timeframe`)
  
  const insights = {
    personalHealth: {
      overallTrend: Math.random() > 0.5 ? 'improving' : 'stable',
      keyMetrics: {
        healthScore: Math.round(Math.random() * 20 + 70),
        activityLevel: Math.round(Math.random() * 40 + 60),
        sleepQuality: Math.round(Math.random() * 30 + 70),
        stressLevel: Math.round(Math.random() * 40 + 30)
      },
      improvements: [
        'Increased daily step count by 15%',
        'Better sleep consistency',
        'Improved hydration tracking'
      ],
      concerns: [
        'Irregular meal times',
        'Increased screen time',
        'Reduced outdoor activities'
      ]
    },
    behavioralPatterns: {
      weeklyPatterns: {
        mostActive: ['Tuesday', 'Wednesday', 'Thursday'],
        leastActive: ['Sunday', 'Monday'],
        peakHealthScore: 'Wednesday',
        lowestHealthScore: 'Monday'
      },
      timePatterns: {
        bestSleepTime: '10:30 PM',
        mostProductiveHours: '9:00 AM - 11:00 AM',
        exercisePreference: 'Evening workouts'
      }
    },
    personalizedRecommendations: [
      'Schedule regular health checkups',
      'Implement consistent sleep schedule',
      'Increase outdoor activities on weekends',
      'Consider stress management techniques'
    ],
    goalProgress: {
      currentGoals: [
        { goal: '10,000 daily steps', progress: 75, status: 'on-track' },
        { goal: '8 hours sleep', progress: 60, status: 'needs-improvement' },
        { goal: '5 servings vegetables', progress: 90, status: 'exceeding' }
      ],
      suggestedGoals: [
        'Reduce screen time by 1 hour daily',
        'Practice mindfulness for 10 minutes',
        'Increase water intake to 8 glasses'
      ]
    },
    insights: {
      strengths: [
        'Excellent consistency in exercise routine',
        'Strong nutritional awareness',
        'Good social support network'
      ],
      opportunities: [
        'Sleep optimization',
        'Stress management',
        'Preventive healthcare'
      ]
    },
    generatedAt: new Date().toISOString(),
    timeframe,
    confidence: Math.round(Math.random() * 15 + 80)
  }
  
  // Simulate complex insight generation
  await new Promise(resolve => setTimeout(resolve, 250))
  
  return insights
}

// Utility functions for health analytics
function generateContributingFactors(riskFactors, riskScore) {
  const factors = []
  
  if (riskFactors.age > 50) factors.push('Age-related risk factors')
  if (riskFactors.bmi > 25) factors.push('Elevated BMI')
  if (riskFactors.bloodPressure === 'high') factors.push('High blood pressure')
  if (riskFactors.cholesterol === 'high') factors.push('High cholesterol')
  if (riskFactors.familyHistory.length > 0) factors.push('Family history of health conditions')
  if (riskFactors.lifestyle === 'sedentary') factors.push('Sedentary lifestyle')
  
  return factors
}

function generateMitigatingFactors(riskFactors, riskScore) {
  const factors = []
  
  if (riskFactors.age < 40) factors.push('Young age')
  if (riskFactors.bmi < 25) factors.push('Healthy BMI')
  if (riskFactors.bloodPressure === 'normal') factors.push('Normal blood pressure')
  if (riskFactors.cholesterol === 'normal') factors.push('Normal cholesterol')
  if (riskFactors.lifestyle === 'active') factors.push('Active lifestyle')
  
  return factors
}

function generateRiskRecommendations(riskLevel, riskFactors) {
  const recommendations = []
  
  if (riskLevel === 'High') {
    recommendations.push('Schedule immediate health consultation')
    recommendations.push('Implement comprehensive lifestyle changes')
    recommendations.push('Consider regular health monitoring')
  } else if (riskLevel === 'Medium') {
    recommendations.push('Focus on preventive care')
    recommendations.push('Maintain current healthy habits')
    recommendations.push('Schedule regular health checkups')
  } else {
    recommendations.push('Continue current healthy lifestyle')
    recommendations.push('Consider preventive measures')
    recommendations.push('Maintain regular health monitoring')
  }
  
  return recommendations
}

function generateNextSteps(riskLevel) {
  const steps = []
  
  if (riskLevel === 'High') {
    steps.push('Consult healthcare provider within 1 week')
    steps.push('Implement dietary changes')
    steps.push('Begin exercise program')
    steps.push('Monitor health metrics daily')
  } else if (riskLevel === 'Medium') {
    steps.push('Schedule health checkup within 1 month')
    steps.push('Review current health habits')
    steps.push('Set specific health goals')
  } else {
    steps.push('Continue current health practices')
    steps.push('Schedule routine health checkup')
    steps.push('Set new health challenges')
  }
  
  return steps
}
