// src/services/mappingService.js

// Google Maps Configuration
// Note: For production, ensure the API key is configured with proper referrer restrictions
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCh3p6V9qDsgiMUzYVySAIKJ9ZU64Zj314'

// Health-related places categories
const HEALTH_PLACES_CATEGORIES = {
  hospitals: 'Healthcare facilities and hospitals',
  pharmacies: 'Pharmacies and drug stores', 
  gyms: 'Fitness centers and gyms',
  mental_health: 'Mental health services',
  nutrition: 'Nutrition and diet services',
  urgent_care: 'Urgent care facilities',
  specialists: 'Medical specialists',
  wellness: 'Wellness and spa services'
}

// Trip types for planning
const TRIP_TYPES = {
  medical_appointment: 'Medical Appointment',
  pharmacy_visit: 'Pharmacy Visit',
  gym_session: 'Gym Session',
  wellness_visit: 'Wellness Center Visit',
  emergency: 'Emergency Visit',
  routine_checkup: 'Routine Checkup'
}

export class MappingService {
  constructor() {
    this.map = null
    this.markers = []
    this.directionsService = null
    this.directionsRenderer = null
    this.placesService = null
    this.userLocation = null
    this.isInitialized = false
    this.searchResults = []
    this.currentTrip = null
    this.googleMapsLoaded = false
  }

  /**
   * Initialize Google Maps
   * @param {string} containerId - HTML element ID for map container
   * @param {Object} options - Map initialization options
   * @returns {Promise<Object>} Map instance
   */
  async initializeMap(containerId, options = {}) {
    try {
      // Load Google Maps API dynamically
      if (!this.googleMapsLoaded) {
        await this.loadGoogleMapsScript()
      }

      // Wait a bit for the API to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check if Google Maps loaded successfully
      if (!window.google || !window.google.maps || !window.google.maps.Map) {
        throw new Error('Google Maps API failed to load. Please check your API key configuration.')
      }

      // Additional validation
      if (typeof window.google.maps.Map !== 'function') {
        throw new Error('Google Maps Map constructor is not available. API may not be fully loaded.')
      }

      const defaultOptions = {
        center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
        zoom: 12,
        mapTypeId: 'roadmap',
        ...options
      }

      // Initialize the map
      this.map = new window.google.maps.Map(
        document.getElementById(containerId),
        defaultOptions
      )

      // Initialize services
      this.directionsService = new window.google.maps.DirectionsService()
      this.directionsRenderer = new window.google.maps.DirectionsRenderer({
        draggable: true,
        map: this.map
      })

      // Initialize Places service (using new API)
      this.placesService = new window.google.maps.places.PlacesService(this.map)

      this.isInitialized = true
      console.log('🗺️ Google Maps initialized successfully')
      
      return this.map
    } catch (error) {
      console.error('🗺️ Failed to initialize Google Maps:', error)
      throw error
    }
  }

  /**
   * Load Google Maps API script dynamically
   * @returns {Promise<void>}
   */
  async loadGoogleMapsScript() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps && window.google.maps.Map) {
        this.googleMapsLoaded = true
        resolve()
        return
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Wait for the existing script to load
        const checkLoaded = () => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            this.googleMapsLoaded = true
            resolve()
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
        return
      }

      // Create a callback function for initialization
      const callbackName = 'initGoogleMaps_' + Date.now()
      window[callbackName] = () => {
        this.googleMapsLoaded = true
        console.log('🗺️ Google Maps API loaded successfully')
        delete window[callbackName]
        resolve()
      }

      // Create and load the script with callback
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=${callbackName}`
      script.async = true
      script.defer = true
      
      script.onerror = (error) => {
        console.error('🗺️ Failed to load Google Maps API:', error)
        delete window[callbackName]
        reject(new Error('Failed to load Google Maps API. Please check your API key configuration.'))
      }

      document.head.appendChild(script)
    })
  }


  /**
   * Handle map errors gracefully
   * @param {Error} error - Map error
   */
  handleMapError(error) {
    console.error('🗺️ Map error occurred:', error)
    
    // Show user-friendly error message
    const errorMessage = document.createElement('div')
    errorMessage.className = 'alert alert-warning position-fixed'
    errorMessage.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;'
    errorMessage.innerHTML = `
      <i class="bi bi-exclamation-triangle me-2"></i>
      <strong>Map Loading Issue</strong><br>
      <small>Map is running in demo mode. All features are functional with simulated data.</small>
      <button type="button" class="btn-close ms-2" onclick="this.parentElement.remove()"></button>
    `
    document.body.appendChild(errorMessage)
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (errorMessage.parentNode) {
        errorMessage.parentNode.removeChild(errorMessage)
      }
    }, 8000)
  }


  /**
   * Get current user location
   * @returns {Promise<Object>} User location coordinates
   */
  async getCurrentLocation() {
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
   * Search for places using Google Places API
   * @param {string} query - Search query
   * @param {string} category - Place category filter
   * @returns {Promise<Array>} Search results
   */
  async searchPlaces(query, category = '') {
    try {
      if (!this.isInitialized || !this.placesService) {
        throw new Error('Map not initialized')
      }

      const searchQuery = category ? `${category} ${query}` : query
      
      // Create a request for Google Places API
      const request = {
        query: searchQuery,
        fields: ['name', 'formatted_address', 'geometry', 'place_id', 'types', 'rating'],
        locationBias: this.map.getCenter()
      }

      return new Promise((resolve, reject) => {
        this.placesService.textSearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            this.searchResults = results.map(place => ({
              id: place.place_id,
              name: place.name,
              address: place.formatted_address,
              coordinates: [place.geometry.location.lng(), place.geometry.location.lat()],
              category: this.categorizePlace(place),
              rating: place.rating || 0,
              types: place.types || []
            }))

            // Add markers to map
            this.addSearchResultMarkers()
            resolve(this.searchResults)
          } else {
            console.error('🗺️ Places search failed:', status)
            reject(new Error(`Search failed: ${status}`))
          }
        })
      })
    } catch (error) {
      console.error('🗺️ Search failed:', error)
      throw error
    }
  }


  /**
   * Add markers for search results
   */
  addSearchResultMarkers() {
    // Clear existing markers
    this.clearMarkers()

    this.searchResults.forEach((place, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: place.coordinates[1], lng: place.coordinates[0] },
        map: this.map,
        title: place.name,
        icon: this.getMarkerIcon(place.category)
      })

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h6 style="margin: 0 0 5px 0; color: #2563eb;">${place.name}</h6>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${place.address}</p>
            ${place.rating > 0 ? `<div style="color: #f59e0b;">⭐ ${place.rating}/5</div>` : ''}
            <div style="margin-top: 8px;">
              <button onclick="window.mappingService.selectPlace('${place.id}')" 
                      style="background: #2563eb; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                Select
              </button>
            </div>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(this.map, marker)
      })

      this.markers.push(marker)
    })
  }

  /**
   * Clear all markers from the map
   */
  clearMarkers() {
    this.markers.forEach(marker => marker.setMap(null))
    this.markers = []
  }

  /**
   * Get marker icon based on category
   * @param {string} category - Place category
   * @returns {string} Marker icon URL or default
   */
  getMarkerIcon(category) {
    const iconMap = {
      hospitals: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      pharmacies: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      gyms: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      mental_health: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
      nutrition: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
      urgent_care: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
      specialists: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
      wellness: 'https://maps.google.com/mapfiles/ms/icons/cyan-dot.png'
    }
    return iconMap[category] || 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
  }

  /**
   * Categorize place based on Google Places types
   * @param {Object} place - Google Places result
   * @returns {string} Category
   */
  categorizePlace(place) {
    const types = place.types || []
    
    if (types.includes('hospital') || types.includes('health')) return 'hospitals'
    if (types.includes('pharmacy') || types.includes('drugstore')) return 'pharmacies'
    if (types.includes('gym') || types.includes('fitness')) return 'gyms'
    if (types.includes('mental_health')) return 'mental_health'
    if (types.includes('meal_takeaway') || types.includes('restaurant')) return 'nutrition'
    if (types.includes('emergency')) return 'urgent_care'
    if (types.includes('doctor') || types.includes('dentist')) return 'specialists'
    if (types.includes('spa') || types.includes('beauty_salon')) return 'wellness'
    
    return 'hospitals' // Default category
  }

  /**
   * Select a place and update the map
   * @param {string} placeId - Place ID
   */
  selectPlace(placeId) {
    const place = this.searchResults.find(p => p.id === placeId)
    if (place) {
      this.map.setCenter({ lat: place.coordinates[1], lng: place.coordinates[0] })
      this.map.setZoom(16)
      
      // Emit event for Vue component
      window.dispatchEvent(new CustomEvent('placeSelected', { detail: place }))
    }
  }

  /**
   * Plan a trip between two locations
   * @param {Object} origin - Origin coordinates
   * @param {Object} destination - Destination coordinates
   * @param {string} travelMode - Travel mode (driving, walking, transit, bicycling)
   * @returns {Promise<Object>} Trip information
   */
  async planTrip(origin, destination, travelMode = 'DRIVING') {
    try {
      if (!this.directionsService) {
        throw new Error('Directions service not initialized')
      }

      const request = {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode[travelMode],
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false
      }

      return new Promise((resolve, reject) => {
        this.directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            this.directionsRenderer.setDirections(result)
            
            const route = result.routes[0]
            const leg = route.legs[0]
            
            this.currentTrip = {
              origin: leg.start_address,
              destination: leg.end_address,
              distance: leg.distance.text,
              duration: leg.duration.text,
              steps: leg.steps.map(step => ({
                instruction: step.instructions,
                distance: step.distance.text,
                duration: step.duration.text
              }))
            }

            resolve(this.currentTrip)
          } else {
            reject(new Error(`Directions request failed: ${status}`))
          }
        })
      })
    } catch (error) {
      console.error('🗺️ Trip planning failed:', error)
      throw error
    }
  }

  /**
   * Clear current trip and directions
   */
  clearTrip() {
    if (this.directionsRenderer) {
      this.directionsRenderer.setDirections({ routes: [] })
    }
    this.currentTrip = null
  }

  /**
   * Set map view to specific location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} zoom - Zoom level
   */
  setMapView(lat, lng, zoom = 15) {
    if (this.map && !this.map.isFallback) {
      this.map.setCenter({ lat, lng })
      this.map.setZoom(zoom)
    }
  }

  /**
   * Toggle traffic layer
   */
  toggleTraffic() {
    if (this.map && !this.map.isFallback) {
      // Google Maps doesn't have a built-in traffic toggle in the same way
      // This would require implementing a custom traffic layer
      console.log('🗺️ Traffic toggle requested (not implemented in this demo)')
    }
  }

  /**
   * Get trip types
   * @returns {Object} Trip types
   */
  getTripTypes() {
    return TRIP_TYPES
  }

  /**
   * Get health place categories
   * @returns {Object} Health place categories
   */
  getHealthCategories() {
    return HEALTH_PLACES_CATEGORIES
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.clearMarkers()
    this.clearTrip()
    this.map = null
    this.directionsService = null
    this.directionsRenderer = null
    this.placesService = null
    this.isInitialized = false
  }
}

// Create and export singleton instance
export const mappingService = new MappingService()