// src/services/mappingService.js

// MapBox Configuration
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFuZGVlcGRhbmdzIiwiYSI6ImNsb2x5M3h2YjA0ZXEya3F6Z2V5eDZzN3QifQ.Z8KCWnylT3WwTO5vd_lIIg'
const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v11'

// Health-related places categories
const HEALTH_PLACES_CATEGORIES = {
  hospitals: 'Healthcare facilities and hospitals',
  pharmacies: 'Pharmacies and drug stores', 
  gyms: 'Fitness centers and gyms',
  mental_health: 'Mental health services',
  nutrition: 'Nutrition and diet services',
  urgent_care: 'Urgent care centers',
  specialists: 'Medical specialists',
  wellness: 'Wellness and spa centers'
}

// Trip types for men's health
const TRIP_TYPES = {
  medical_appointment: 'Medical Appointment',
  pharmacy_pickup: 'Pharmacy Pickup',
  fitness_visit: 'Fitness Center Visit',
  mental_health: 'Mental Health Visit',
  wellness_visit: 'Wellness Center Visit',
  emergency: 'Emergency Visit',
  routine_checkup: 'Routine Checkup'
}

export class MappingService {
  constructor() {
    this.map = null
    this.markers = []
    this.routes = []
    this.userLocation = null
    this.isInitialized = false
    this.searchResults = []
    this.currentTrip = null
  }

  /**
   * Initialize MapBox map
   * @param {string} containerId - HTML element ID for map container
   * @param {Object} options - Map initialization options
   * @returns {Promise<Object>} Map instance
   */
  async initializeMap(containerId, options = {}) {
    try {
      // Load MapBox GL JS dynamically
      if (!window.mapboxgl) {
        await this.loadMapBoxScript()
      }

      const defaultOptions = {
        container: containerId,
        style: MAPBOX_STYLE,
        center: [-74.006, 40.7128], // Default to NYC
        zoom: 12,
        accessToken: MAPBOX_ACCESS_TOKEN,
        ...options
      }

      this.map = new window.mapboxgl.Map(defaultOptions)
      
      // Add navigation controls
      this.map.addControl(new window.mapboxgl.NavigationControl(), 'top-right')
      
      // Add geolocate control
      this.map.addControl(new window.mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }), 'top-right')

      // Add scale control
      this.map.addControl(new window.mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'imperial'
      }), 'bottom-left')

      this.isInitialized = true
      console.log('🗺️ MapBox map initialized successfully')
      
      return this.map
    } catch (error) {
      console.error('🗺️ Failed to initialize map:', error)
      throw error
    }
  }

  /**
   * Load MapBox GL JS script dynamically
   * @returns {Promise<void>}
   */
  async loadMapBoxScript() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.mapboxgl) {
        resolve()
        return
      }

      // Load CSS
      const cssLink = document.createElement('link')
      cssLink.rel = 'stylesheet'
      cssLink.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css'
      document.head.appendChild(cssLink)

      // Load JS
      const script = document.createElement('script')
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'
      script.onload = () => {
        console.log('🗺️ MapBox GL JS loaded successfully')
        resolve()
      }
      script.onerror = () => {
        console.error('🗺️ Failed to load MapBox GL JS')
        reject(new Error('Failed to load MapBox GL JS'))
      }
      document.head.appendChild(script)
    })
  }

  /**
   * Get user's current location
   * @returns {Promise<Object>} User location coordinates
   */
  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          console.log('📍 User location obtained:', this.userLocation)
          resolve(this.userLocation)
        },
        (error) => {
          console.error('📍 Failed to get user location:', error)
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    })
  }

  /**
   * Search for health-related places
   * @param {string} query - Search query
   * @param {string} category - Health category to search
   * @param {Object} location - Search location (lat, lng)
   * @returns {Promise<Array>} Search results
   */
  async searchHealthPlaces(query, category = 'healthcare', location = null) {
    try {
      if (!this.map) {
        throw new Error('Map not initialized')
      }

      const searchLocation = location || this.userLocation
      if (!searchLocation) {
        throw new Error('No location provided for search')
      }

      // Use MapBox Geocoding API for place search
      const searchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
      
      const params = new URLSearchParams({
        access_token: MAPBOX_ACCESS_TOKEN,
        proximity: `${searchLocation.longitude},${searchLocation.latitude}`,
        types: 'poi',
        limit: 10
      })

      const response = await fetch(`${searchUrl}?${params}`)
      const data = await response.json()

      if (data.features) {
        this.searchResults = data.features.map(feature => ({
          id: feature.id,
          name: feature.place_name,
          coordinates: {
            latitude: feature.center[1],
            longitude: feature.center[0]
          },
          address: feature.place_name,
          category: category,
          relevance: feature.relevance,
          properties: feature.properties
        }))

        console.log(`🔍 Found ${this.searchResults.length} health places`)
        return this.searchResults
      }

      return []
    } catch (error) {
      console.error('🔍 Failed to search health places:', error)
      throw error
    }
  }

  /**
   * Search for specific health facility types
   * @param {string} facilityType - Type of health facility
   * @param {Object} location - Search location
   * @returns {Promise<Array>} Search results
 natal
  async searchHealthFacilities(facilityType, location = null) {
    const searchQueries = {
      hospitals: 'hospital emergency medical center',
      pharmacies: 'pharmacy drug store medication',
      gyms: 'gym fitness center workout',
      mental_health: 'mental health counseling therapy',
      nutrition: 'nutritionist dietitian healthy food',
      urgent_care: 'urgent care walk-in clinic',
      specialists: 'doctor specialist medical clinic',
      wellness: 'wellness spa massage therapy'
    }

    const query = searchQueries[facilityType] || facilityType
    return this.searchHealthPlaces(query, facilityType, location)
  }

  /**
   * Add markers to map
   * @param {Array} places - Places to mark
   * @param {Object} options - Marker options
   */
  addMarkers(places, options = {}) {
    if (!this.map) return

    // Clear existing markers
    this.clearMarkers()

    places.forEach((place, index) => {
      const marker = new window.mapboxgl.Marker({
        color: options.color || '#2563eb',
        scale: options.scale || 1
      })
        .setLngLat([place.coordinates.longitude, place.coordinates.latitude])
        .setPopup(
          new window.mapboxgl.Popup({ offset: 25 })
            .setHTML(this.createMarkerPopup(place, options))
        )
        .addTo(this.map)

      this.markers.push(marker)
    })

    // Fit map to show all markers
    if (places.length > 0) {
      this.fitMapToMarkers(places)
    }
  }

  /**
   * Create marker popup content
   * @param {Object} place - Place data
   * @param {Object} options - Popup options
   * @returns {string} HTML content
   */
  createMarkerPopup(place, options = {}) {
    return `
      <div class="map-popup">
        <h6 class="fw-bold mb-2">${place.name}</h6>
        <p class="text-muted small mb-2">${place.address}</p>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary" onclick="window.mappingService.navigateToPlace('${place.id}')">
            <i class="bi bi-navigation me-1"></i>Navigate
          </button>
          <button class="btn btn-sm btn-outline-secondary" onclick="window.mappingService.getPlaceDetails('${place.id}')">
            <i class="bi bi-info-circle me-1"></i>Details
          </button>
        </div>
      </div>
    `
  }

  /**
   * Clear all markers from map
   */
  clearMarkers() {
    this.markers.forEach(marker => marker.remove())
    this.markers = []
  }

  /**
   * Fit map to show all markers
   * @param {Array} places - Places to fit
   */
  fitMapToMarkers(places) {
    if (!this.map || places.length === 0) return

    const bounds = new window.mapboxgl.LngLatBounds()
    places.forEach(place => {
      bounds.extend([place.coordinates.longitude, place.coordinates.latitude])
    })

    this.map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    })
  }

  /**
   * Get directions between two points
   * @param {Object} origin - Origin coordinates
   * @param {Object} destination - Destination coordinates
   * @param {string} profile - Routing profile (driving, walking, cycling)
   * @returns {Promise<Object>} Route data
   */
  async getDirections(origin, destination, profile = 'driving') {
    try {
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`
      
      const params = new URLSearchParams({
        access_token: MAPBOX_ACCESS_TOKEN,
        geometries: 'geojson',
        overview: 'full',
        steps: 'true',
        annotations: 'duration,distance'
      })

      const response = await fetch(`${directionsUrl}?${params}`)
      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const routeData = {
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry,
          steps: route.legs[0].steps,
          summary: {
            distance: this.formatDistance(route.distance),
            duration: this.formatDuration(route.duration),
            profile: profile
          }
        }

        console.log(`🧭 Route calculated: ${routeData.summary.distance}, ${routeData.summary.duration}`)
        return routeData
      }

      throw new Error('No route found')
    } catch (error) {
      console.error('🧭 Failed to get directions:', error)
      throw error
    }
  }

  /**
   * Add route to map
   * @param {Object} route - Route data
   * @param {Object} options - Route display options
   */
  addRoute(route, options = {}) {
    if (!this.map || !route.geometry) return

    const routeId = `route-${Date.now()}`
    
    // Add route source
    this.map.addSource(routeId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: route.geometry
      }
    })

    // Add route layer
    this.map.addLayer({
      id: routeId,
      type: 'line',
      source: routeId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': options.color || '#2563eb',
        'line-width': options.width || 4,
        'line-opacity': options.opacity || 0.8
      }
    })

    this.routes.push(routeId)
    console.log('🧭 Route added to map')
  }

  /**
   * Clear all routes from map
   */
  clearRoutes() {
    this.routes.forEach(routeId => {
      if (this.map.getLayer(routeId)) {
        this.map.removeLayer(routeId)
      }
      if (this.map.getSource(routeId)) {
        this.map.removeSource(routeId)
      }
    })
    this.routes = []
  }

  /**
   * Navigate to a specific place
   * @param {string} placeId - Place ID to navigate to
   */
  async navigateToPlace(placeId) {
    const place = this.searchResults.find(p => p.id === placeId)
    if (!place || !this.userLocation) return

    try {
      const route = await this.getDirections(this.userLocation, place.coordinates)
      this.clearRoutes()
      this.addRoute(route)
      
      // Center map on destination
      this.map.flyTo({
        center: [place.coordinates.longitude, place.coordinates.latitude],
        zoom: 15,
        essential: true
      })

      console.log(`🧭 Navigating to ${place.name}`)
      return route
    } catch (error) {
      console.error('🧭 Navigation failed:', error)
      throw error
    }
  }

  /**
   * Create a health trip
   * @param {Object} tripData - Trip information
   * @returns {Object} Trip object
   */
  createHealthTrip(tripData) {
    const trip = {
      id: `trip-${Date.now()}`,
      type: tripData.type || 'medical_appointment',
      name: tripData.name || 'Health Trip',
      origin: tripData.origin,
      destination: tripData.destination,
      scheduledTime: tripData.scheduledTime,
      duration: tripData.duration,
      notes: tripData.notes || '',
      status: 'planned',
      createdAt: new Date().toISOString(),
      reminders: tripData.reminders || [],
      estimatedCost: tripData.estimatedCost,
      transportation: tripData.transportation || 'driving'
    }

    this.currentTrip = trip
    console.log('🏥 Health trip created:', trip)
    return trip
  }

  /**
   * Get trip information and route
   * @param {Object} trip - Trip object
   * @returns {Promise<Object>} Trip with route information
   */
  async getTripInformation(trip) {
    if (!trip.origin || !trip.destination) {
      throw new Error('Trip must have origin and destination')
    }

    try {
      const route = await this.getDirections(trip.origin, trip.destination, trip.transportation)
      
      const tripInfo = {
        ...trip,
        route: route,
        estimatedArrival: this.calculateArrivalTime(trip.scheduledTime, route.duration),
        trafficConditions: await this.getTrafficConditions(route),
        alternativeRoutes: await this.getAlternativeRoutes(trip.origin, trip.destination, trip.transportation)
      }

      console.log('🏥 Trip information calculated:', tripInfo)
      return tripInfo
    } catch (error) {
      console.error('🏥 Failed to get trip information:', error)
      throw error
    }
  }

  /**
   * Get traffic conditions for route
   * @param {Object} route - Route data
   * @returns {Promise<Object>} Traffic conditions
   */
  async getTrafficConditions(route) {
    // Simulate traffic conditions (in real implementation, use traffic API)
    const conditions = ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)]
    const delay = conditions === 'heavy' ? Math.random() * 300 : conditions === 'moderate' ? Math.random() * 120 : 0

    return {
      condition: conditions,
      delay: Math.round(delay),
      description: this.getTrafficDescription(conditions, delay)
    }
  }

  /**
   * Get alternative routes
   * @param {Object} origin - Origin coordinates
   * @param {Object} destination - Destination coordinates
   * @param {string} profile - Routing profile
   * @returns {Promise<Array>} Alternative routes
   */
  async getAlternativeRoutes(origin, destination, profile = 'driving') {
    try {
      const alternatives = []
      
      // Get different routing profiles
      const profiles = profile === 'driving' ? ['walking', 'cycling'] : ['driving']
      
      for (const altProfile of profiles) {
        try {
          const route = await this.getDirections(origin, destination, altProfile)
          alternatives.push({
            ...route,
            profile: altProfile,
            summary: {
              ...route.summary,
              profile: altProfile
            }
          })
        } catch (error) {
          console.warn(`Alternative route failed for ${altProfile}:`, error)
        }
      }

      return alternatives
    } catch (error) {
      console.error('Failed to get alternative routes:', error)
      return []
    }
  }

  /**
   * Calculate arrival time
   * @param {string} scheduledTime - Scheduled departure time
   * @param {number} duration - Trip duration in seconds
   * @returns {string} Estimated arrival time
   */
  calculateArrivalTime(scheduledTime, duration) {
    const departure = new Date(scheduledTime)
    const arrival = new Date(departure.getTime() + (duration * 1000))
    return arrival.toISOString()
  }

  /**
   * Get traffic description
   * @param {string} condition - Traffic condition
   * @param {number} delay - Delay in seconds
   * @returns {string} Traffic description
   */
  getTrafficDescription(condition, delay) {
    const descriptions = {
      light: 'Light traffic - normal travel time',
      moderate: `Moderate traffic - ${Math.round(delay / 60)} minutes delay`,
      heavy: `Heavy traffic - ${Math.round(delay / 60)} minutes delay`
    }
    return descriptions[condition] || 'Unknown traffic conditions'
  }

  /**
   * Format distance
   * @param {number} meters - Distance in meters
   * @returns {string} Formatted distance
   */
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }

  /**
   * Format duration
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  /**
   * Get place details
   * @param {string} placeId - Place ID
   * @returns {Promise<Object>} Place details
   */
  async getPlaceDetails(placeId) {
    try {
      const place = this.searchResults.find(p => p.id === placeId)
      if (!place) {
        throw new Error('Place not found')
      }

      // In a real implementation, you would fetch detailed information
      // from a places API like Google Places or Foursquare
      const details = {
        ...place,
        phone: 'Available on request',
        hours: 'Mon-Fri: 9AM-5PM',
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 100) + 10,
        website: 'https://example.com',
        services: this.getHealthServices(place.category)
      }

      console.log('📍 Place details retrieved:', details)
      return details
    } catch (error) {
      console.error('📍 Failed to get place details:', error)
      throw error
    }
  }

  /**
   * Get health services for place category
   * @param {string} category - Place category
   * @returns {Array} Available services
   */
  getHealthServices(category) {
    const services = {
      hospitals: ['Emergency Care', 'Surgery', 'Diagnostics', 'Specialized Care'],
      pharmacies: ['Prescription Filling', 'Health Consultations', 'Vaccinations', 'Health Screening'],
      gyms: ['Personal Training', 'Group Classes', 'Cardio Equipment', 'Strength Training'],
      mental_health: ['Counseling', 'Therapy Sessions', 'Support Groups', 'Crisis Intervention'],
      nutrition: ['Diet Planning', 'Nutritional Counseling', 'Meal Planning', 'Weight Management'],
      urgent_care: ['Minor Injuries', 'Illness Treatment', 'X-rays', 'Lab Tests'],
      specialists: ['Specialized Consultations', 'Diagnostic Procedures', 'Treatment Plans', 'Follow-up Care'],
      wellness: ['Massage Therapy', 'Stress Management', 'Relaxation Techniques', 'Wellness Programs']
    }
    return services[category] || ['General Health Services']
  }

  /**
   * Set map center and zoom
   * @param {Object} coordinates - Center coordinates
   * @param {number} zoom - Zoom level
   */
  setMapView(coordinates, zoom = 12) {
    if (!this.map) return

    this.map.flyTo({
      center: [coordinates.longitude, coordinates.latitude],
      zoom: zoom,
      essential: true
    })
  }

  /**
   * Destroy map instance
   */
  destroy() {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
    this.clearMarkers()
    this.clearRoutes()
    this.isInitialized = false
  }
}

// Export utility functions
export const mappingUtils = {
  /**
   * Quick health place search
   * @param {string} query - Search query
   * @param {Object} location - Search location
   * @returns {Promise<Array>} Search results
   */
  async quickHealthSearch(query, location = null) {
    const service = new MappingService()
    return service.searchHealthPlaces(query, 'healthcare', location)
  },

  /**
   * Quick directions
   * @param {Object} origin - Origin coordinates
   * @param {Object} destination - Destination coordinates
   * @returns {Promise<Object>} Route data
   */
  async quickDirections(origin, destination) {
    const service = new MappingService()
    return service.getDirections(origin, destination)
  },

  /**
   * Get current location
   * @returns {Promise<Object>} User location
   */
  async getCurrentLocation() {
    const service = new MappingService()
    return service.getUserLocation()
  }
}

// Default mapping service instance
export const mappingService = new MappingService()

// Make service globally available
if (typeof window !== 'undefined') {
  window.mappingService = mappingService
}

export default mappingService
