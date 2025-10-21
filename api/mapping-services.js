// Vercel Serverless Function for Mapping Services
// Demonstrates serverless architecture for geolocation-based functionality
// Benefits: Auto-scaling, cost-effective, location-aware processing

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
    const { operation, data } = req.body

    switch (req.method) {
      case 'POST':
        if (operation === 'search-health-places') {
          // Search for health-related places (serverless benefit: location-aware processing)
          const result = await searchHealthPlaces(data)
          res.status(200).json({
            success: true,
            result,
            timestamp: new Date().toISOString(),
            function: 'mapping-services'
          })
        } else if (operation === 'get-directions') {
          // Get directions between locations (serverless benefit: route optimization)
          const result = await getDirections(data)
          res.status(200).json({
            success: true,
            result,
            timestamp: new Date().toISOString(),
            function: 'mapping-services'
          })
        } else if (operation === 'analyze-trip') {
          // Analyze trip information (serverless benefit: complex calculations)
          const result = await analyzeTrip(data)
          res.status(200).json({
            success: true,
            result,
            timestamp: new Date().toISOString(),
            function: 'mapping-services'
          })
        } else if (operation === 'get-traffic-conditions') {
          // Get traffic conditions (serverless benefit: real-time data processing)
          const result = await getTrafficConditions(data)
          res.status(200).json({
            success: true,
            result,
            timestamp: new Date().toISOString(),
            function: 'mapping-services'
          })
        } else {
          res.status(400).json({ error: 'Invalid operation' })
        }
        break

      default:
        res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('🗺️ Mapping Services API error:', error)
    res.status(500).json({ 
      error: 'Mapping operation failed', 
      details: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

// Helper functions demonstrating serverless architecture benefits

async function searchHealthPlaces(data) {
  // Serverless benefit: Location-aware processing
  // Scales automatically based on search radius and complexity
  
  const { query, location, category, radius = 5000 } = data
  
  console.log(`Searching for ${category} places near ${location.latitude}, ${location.longitude}`)
  
  // Simulate health places search with realistic data
  const healthPlaces = generateMockHealthPlaces(location, category, radius)
  
  // Filter by query if provided
  const filteredPlaces = query ? 
    healthPlaces.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.category.toLowerCase().includes(query.toLowerCase())
    ) : healthPlaces
  
  return {
    places: filteredPlaces,
    totalCount: filteredPlaces.length,
    searchRadius: radius,
    category: category,
    searchCenter: location
  }
}

async function getDirections(data) {
  // Serverless benefit: Route optimization and calculation
  // Handles complex routing algorithms without client-side processing
  
  const { origin, destination, profile = 'driving' } = data
  
  console.log(`Calculating ${profile} route from ${origin.latitude}, ${origin.longitude} to ${destination.latitude}, ${destination.longitude}`)
  
  // Simulate route calculation
  const route = calculateMockRoute(origin, destination, profile)
  
  return {
    route: route,
    summary: {
      distance: formatDistance(route.distance),
      duration: formatDuration(route.duration),
      profile: profile
    },
    alternatives: await getAlternativeRoutes(origin, destination, profile)
  }
}

async function analyzeTrip(data) {
  // Serverless benefit: Complex trip analysis and optimization
  // Processes multiple data points and provides intelligent insights
  
  const { trip, userPreferences } = data
  
  console.log(`Analyzing trip: ${trip.name} (${trip.type})`)
  
  // Simulate trip analysis
  const analysis = {
    optimalDepartureTime: calculateOptimalDepartureTime(trip),
    estimatedCost: calculateTripCost(trip),
    healthRecommendations: getHealthRecommendations(trip),
    weatherImpact: await getWeatherImpact(trip),
    trafficForecast: await getTrafficForecast(trip),
    alternativeTransportation: getAlternativeTransportation(trip),
    reminders: generateTripReminders(trip)
  }
  
  return {
    tripId: trip.id,
    analysis: analysis,
    recommendations: generateRecommendations(analysis),
    confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
  }
}

async function getTrafficConditions(data) {
  // Serverless benefit: Real-time data processing
  // Fetches and processes current traffic conditions
  
  const { route, time } = data
  
  console.log(`Getting traffic conditions for route at ${time}`)
  
  // Simulate traffic data
  const conditions = {
    current: generateTrafficCondition('current'),
    predicted: generateTrafficCondition('predicted'),
    historical: generateTrafficCondition('historical'),
    incidents: generateTrafficIncidents(),
    delays: calculateDelays(route)
  }
  
  return {
    conditions: conditions,
    lastUpdated: new Date().toISOString(),
    reliability: Math.random() * 0.2 + 0.8 // 80-100% reliability
  }
}

// Utility functions for mock data generation

function generateMockHealthPlaces(center, category, radius) {
  const categories = {
    hospitals: [
      { name: 'City General Hospital', type: 'Emergency Care' },
      { name: 'Metro Medical Center', type: 'Specialized Care' },
      { name: 'University Hospital', type: 'Teaching Hospital' }
    ],
    pharmacies: [
      { name: 'HealthPlus Pharmacy', type: '24/7 Pharmacy' },
      { name: 'MediCare Drug Store', type: 'Prescription Services' },
      { name: 'QuickCare Pharmacy', type: 'Walk-in Services' }
    ],
    gyms: [
      { name: 'FitLife Gym', type: 'Full Service Gym' },
      { name: 'CrossFit Central', type: 'CrossFit Training' },
      { name: 'Yoga Studio Plus', type: 'Yoga & Wellness' }
    ],
    mental_health: [
      { name: 'MindCare Counseling', type: 'Mental Health Services' },
      { name: 'Wellness Therapy Center', type: 'Therapy & Counseling' },
      { name: 'Mental Health Clinic', type: 'Specialized Care' }
    ]
  }
  
  const places = categories[category] || categories.hospitals
  const result = []
  
  places.forEach((place, index) => {
    // Generate random coordinates within radius
    const angle = (index * 2 * Math.PI) / places.length
    const distance = Math.random() * radius
    const latOffset = (distance / 111000) * Math.cos(angle) // Rough conversion
    const lngOffset = (distance / 111000) * Math.sin(angle)
    
    result.push({
      id: `place-${category}-${index}`,
      name: place.name,
      category: category,
      type: place.type,
      coordinates: {
        latitude: center.latitude + latOffset,
        longitude: center.longitude + lngOffset
      },
      address: `${Math.floor(Math.random() * 9999) + 1} Health St, City, State`,
      phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      hours: 'Mon-Fri: 9AM-5PM, Sat: 9AM-2PM',
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviews: Math.floor(Math.random() * 100) + 10,
      distance: Math.round(distance),
      services: generateHealthServices(category)
    })
  })
  
  return result
}

function calculateMockRoute(origin, destination, profile) {
  // Calculate distance using Haversine formula
  const distance = calculateDistance(origin, destination)
  
  // Calculate duration based on profile
  const baseSpeed = {
    driving: 50, // km/h
    walking: 5,  // km/h
    cycling: 15  // km/h
  }
  
  const speed = baseSpeed[profile] || baseSpeed.driving
  const duration = (distance / speed) * 3600 // Convert to seconds
  
  return {
    distance: distance * 1000, // Convert to meters
    duration: duration,
    profile: profile,
    geometry: {
      type: 'LineString',
      coordinates: [
        [origin.longitude, origin.latitude],
        [destination.longitude, destination.latitude]
      ]
    },
    steps: generateRouteSteps(origin, destination, profile)
  }
}

function calculateDistance(point1, point2) {
  const R = 6371 // Earth's radius in km
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function generateRouteSteps(origin, destination, profile) {
  const steps = []
  const stepCount = Math.floor(Math.random() * 5) + 3
  
  for (let i = 0; i < stepCount; i++) {
    steps.push({
      instruction: `Step ${i + 1}: ${generateStepInstruction(profile)}`,
      distance: Math.floor(Math.random() * 1000) + 100,
      duration: Math.floor(Math.random() * 300) + 60
    })
  }
  
  return steps
}

function generateStepInstruction(profile) {
  const instructions = {
    driving: [
      'Continue straight on Main Street',
      'Turn right onto Health Avenue',
      'Take the second exit at the roundabout',
      'Merge onto Highway 101'
    ],
    walking: [
      'Walk straight for 200 meters',
      'Cross the street at the pedestrian crossing',
      'Turn left onto the walking path',
      'Continue on the sidewalk'
    ],
    cycling: [
      'Follow the bike lane',
      'Turn right at the bike path intersection',
      'Continue on the dedicated cycling route',
      'Use the bike lane on the right side'
    ]
  }
  
  const profileInstructions = instructions[profile] || instructions.driving
  return profileInstructions[Math.floor(Math.random() * profileInstructions.length)]
}

async function getAlternativeRoutes(origin, destination, profile) {
  const alternatives = []
  const altProfiles = profile === 'driving' ? ['walking', 'cycling'] : ['driving']
  
  for (const altProfile of altProfiles) {
    const route = calculateMockRoute(origin, destination, altProfile)
    alternatives.push({
      ...route,
      summary: {
        distance: formatDistance(route.distance),
        duration: formatDuration(route.duration),
        profile: altProfile
      }
    })
  }
  
  return alternatives
}

function calculateOptimalDepartureTime(trip) {
  const scheduledTime = new Date(trip.scheduledTime)
  const bufferTime = 30 * 60 * 1000 // 30 minutes buffer
  const optimalTime = new Date(scheduledTime.getTime() - bufferTime)
  
  return optimalTime.toISOString()
}

function calculateTripCost(trip) {
  const baseCosts = {
    medical_appointment: 0,
    pharmacy_pickup: 5,
    fitness_visit: 15,
    mental_health: 0,
    wellness_visit: 50,
    emergency: 0,
    routine_checkup: 0
  }
  
  const baseCost = baseCosts[trip.type] || 0
  const transportationCost = trip.transportation === 'driving' ? Math.random() * 10 + 5 : 0
  
  return {
    base: baseCost,
    transportation: transportationCost,
    total: baseCost + transportationCost
  }
}

function getHealthRecommendations(trip) {
  const recommendations = {
    medical_appointment: [
      'Bring your insurance card and ID',
      'Arrive 15 minutes early for check-in',
      'Bring a list of current medications'
    ],
    pharmacy_pickup: [
      'Bring your prescription',
      'Check if your insurance covers the medication',
      'Ask about generic alternatives'
    ],
    fitness_visit: [
      'Bring a water bottle',
      'Wear comfortable workout clothes',
      'Consider bringing a towel'
    ],
    mental_health: [
      'Bring any relevant medical records',
      'Prepare questions about your treatment',
      'Consider bringing a support person if needed'
    ]
  }
  
  return recommendations[trip.type] || ['Prepare necessary documents and arrive on time']
}

async function getWeatherImpact(trip) {
  const weatherConditions = ['sunny', 'rainy', 'snowy', 'cloudy']
  const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)]
  
  return {
    condition: condition,
    impact: getWeatherImpactDescription(condition),
    recommendations: getWeatherRecommendations(condition)
  }
}

function getWeatherImpactDescription(condition) {
  const impacts = {
    sunny: 'No impact on travel time',
    rainy: 'Potential 10-15% increase in travel time',
    snowy: 'Potential 20-30% increase in travel time',
    cloudy: 'No impact on travel time'
  }
  return impacts[condition] || 'No impact on travel time'
}

function getWeatherRecommendations(condition) {
  const recommendations = {
    sunny: ['Apply sunscreen if walking or cycling'],
    rainy: ['Bring an umbrella or raincoat', 'Allow extra travel time'],
    snowy: ['Check road conditions', 'Allow significant extra travel time', 'Consider alternative transportation'],
    cloudy: ['No special preparations needed']
  }
  return recommendations[condition] || ['No special preparations needed']
}

async function getTrafficForecast(trip) {
  const scheduledTime = new Date(trip.scheduledTime)
  const hour = scheduledTime.getHours()
  
  let trafficLevel = 'light'
  if (hour >= 7 && hour <= 9) trafficLevel = 'heavy' // Morning rush
  else if (hour >= 17 && hour <= 19) trafficLevel = 'heavy' // Evening rush
  else if (hour >= 11 && hour <= 14) trafficLevel = 'moderate' // Lunch time
  
  return {
    level: trafficLevel,
    estimatedDelay: getTrafficDelay(trafficLevel),
    recommendations: getTrafficRecommendations(trafficLevel)
  }
}

function getTrafficDelay(level) {
  const delays = {
    light: 0,
    moderate: Math.floor(Math.random() * 10) + 5,
    heavy: Math.floor(Math.random() * 20) + 15
  }
  return delays[level] || 0
}

function getTrafficRecommendations(level) {
  const recommendations = {
    light: ['Normal travel time expected'],
    moderate: ['Allow 5-15 minutes extra travel time'],
    heavy: ['Allow 15-30 minutes extra travel time', 'Consider alternative routes']
  }
  return recommendations[level] || ['Normal travel time expected']
}

function getAlternativeTransportation(trip) {
  const alternatives = {
    driving: ['Public transit', 'Rideshare', 'Walking', 'Cycling'],
    walking: ['Public transit', 'Rideshare', 'Driving'],
    cycling: ['Public transit', 'Rideshare', 'Driving', 'Walking'],
    transit: ['Driving', 'Rideshare', 'Walking', 'Cycling']
  }
  
  return alternatives[trip.transportation] || ['Driving', 'Walking', 'Public transit']
}

function generateTripReminders(trip) {
  const reminders = [
    {
      time: new Date(new Date(trip.scheduledTime).getTime() - 24 * 60 * 60 * 1000).toISOString(),
      message: `Reminder: ${trip.name} is scheduled for tomorrow`,
      type: 'advance'
    },
    {
      time: new Date(new Date(trip.scheduledTime).getTime() - 2 * 60 * 60 * 1000).toISOString(),
      message: `Reminder: ${trip.name} is in 2 hours`,
      type: 'advance'
    },
    {
      time: new Date(new Date(trip.scheduledTime).getTime() - 30 * 60 * 1000).toISOString(),
      message: `Time to leave for ${trip.name}`,
      type: 'departure'
    }
  ]
  
  return reminders
}

function generateRecommendations(analysis) {
  const recommendations = []
  
  if (analysis.trafficForecast.level === 'heavy') {
    recommendations.push('Consider leaving earlier due to heavy traffic')
  }
  
  if (analysis.weatherImpact.condition === 'rainy' || analysis.weatherImpact.condition === 'snowy') {
    recommendations.push('Check weather conditions and plan accordingly')
  }
  
  if (analysis.estimatedCost.total > 50) {
    recommendations.push('Consider cost-effective transportation alternatives')
  }
  
  return recommendations
}

function generateTrafficCondition(type) {
  const conditions = ['light', 'moderate', 'heavy']
  const condition = conditions[Math.floor(Math.random() * conditions.length)]
  
  return {
    level: condition,
    description: getTrafficDescription(condition),
    confidence: Math.random() * 0.3 + 0.7
  }
}

function getTrafficDescription(level) {
  const descriptions = {
    light: 'Light traffic - normal travel time',
    moderate: 'Moderate traffic - expect some delays',
    heavy: 'Heavy traffic - significant delays expected'
  }
  return descriptions[level] || 'Unknown traffic conditions'
}

function generateTrafficIncidents() {
  const incidents = []
  const incidentCount = Math.floor(Math.random() * 3)
  
  for (let i = 0; i < incidentCount; i++) {
    incidents.push({
      id: `incident-${i}`,
      type: ['accident', 'construction', 'road closure'][Math.floor(Math.random() * 3)],
      description: 'Traffic incident affecting route',
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      location: `Location ${i + 1}`
    })
  }
  
  return incidents
}

function calculateDelays(route) {
  return {
    current: Math.floor(Math.random() * 300),
    predicted: Math.floor(Math.random() * 600),
    historical: Math.floor(Math.random() * 180)
  }
}

function generateHealthServices(category) {
  const services = {
    hospitals: ['Emergency Care', 'Surgery', 'Diagnostics', 'Specialized Care'],
    pharmacies: ['Prescription Filling', 'Health Consultations', 'Vaccinations'],
    gyms: ['Personal Training', 'Group Classes', 'Cardio Equipment'],
    mental_health: ['Counseling', 'Therapy Sessions', 'Support Groups'],
    nutrition: ['Diet Planning', 'Nutritional Counseling', 'Meal Planning'],
    urgent_care: ['Minor Injuries', 'Illness Treatment', 'X-rays'],
    specialists: ['Specialized Consultations', 'Diagnostic Procedures'],
    wellness: ['Massage Therapy', 'Stress Management', 'Relaxation Techniques']
  }
  return services[category] || ['General Health Services']
}

function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
