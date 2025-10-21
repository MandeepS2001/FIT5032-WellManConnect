<template>
  <div class="map-view">
    <!-- Header Section -->
    <div class="container-fluid bg-primary text-white py-4 mb-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="h3 mb-2">
              <i class="bi bi-geo-alt-fill me-3" aria-hidden="true"></i>
              Health & Wellness Map
            </h1>
            <p class="mb-0 opacity-75">
              Find healthcare facilities, plan your health trips, and navigate to wellness destinations
            </p>
          </div>
          <div class="col-md-4 text-end">
            <div class="d-flex gap-2 justify-content-end">
              <button 
                class="btn btn-outline-light btn-sm"
                @click="getCurrentLocation"
                :disabled="isLoadingLocation"
                aria-label="Get current location"
              >
                <i class="bi bi-geo-alt" aria-hidden="true"></i>
                {{ isLoadingLocation ? 'Locating...' : 'My Location' }}
              </button>
              <button 
                class="btn btn-outline-light btn-sm"
                @click="toggleMapControls"
                aria-label="Toggle map controls"
              >
                <i class="bi bi-gear" aria-hidden="true"></i>
                Controls
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid">
      <div class="row">
        <!-- Left Sidebar -->
        <div class="col-lg-4 col-xl-3">
          <div class="sticky-top" style="top: 20px;">
            <!-- Search Section -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-search me-2" aria-hidden="true"></i>
                  Search Health Places
                </h5>
              </div>
              <div class="card-body">
                <!-- Search Input -->
                <div class="mb-3">
                  <label for="searchInput" class="form-label">Search for:</label>
                  <div class="input-group">
                    <input 
                      type="text" 
                      class="form-control" 
                      id="searchInput"
                      v-model="searchQuery"
                      placeholder="Hospitals, pharmacies, gyms..."
                      @keyup.enter="performSearch"
                      aria-describedby="searchHelp"
                    >
                    <button 
                      class="btn btn-primary" 
                      type="button"
                      @click="performSearch"
                      :disabled="!searchQuery.trim() || isLoading"
                      aria-label="Search health places"
                    >
                      <i class="bi bi-search" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div id="searchHelp" class="form-text">
                    Search for healthcare facilities, pharmacies, gyms, and wellness centers
                  </div>
                </div>

                <!-- Quick Search Buttons -->
                <div class="mb-3">
                  <label class="form-label">Quick Search:</label>
                  <div class="d-flex flex-wrap gap-2">
                    <button 
                      v-for="category in healthCategories" 
                      :key="category.key"
                      class="btn btn-outline-primary btn-sm"
                      @click="quickSearch(category.key)"
                      :disabled="isLoading"
                    >
                      <i :class="category.icon" aria-hidden="true"></i>
                      {{ category.name }}
                    </button>
                  </div>
                </div>

                <!-- Search Results -->
                <div v-if="searchResults.length > 0" class="search-results">
                  <h6 class="fw-semibold mb-3">
                    <i class="bi bi-list-ul me-2" aria-hidden="true"></i>
                    Search Results ({{ searchResults.length }})
                  </h6>
                  <div class="list-group list-group-flush">
                    <div 
                      v-for="(place, index) in searchResults" 
                      :key="place.id"
                      class="list-group-item list-group-item-action"
                      @click="selectPlace(place)"
                      :class="{ 'active': selectedPlace?.id === place.id }"
                      role="button"
                      tabindex="0"
                      @keyup.enter="selectPlace(place)"
                      :aria-label="`Select ${place.name}`"
                    >
                      <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                          <h6 class="mb-1 fw-semibold">{{ place.name }}</h6>
                          <p class="mb-1 text-muted small">{{ place.address }}</p>
                          <span class="badge bg-secondary small">{{ place.category }}</span>
                        </div>
                        <div class="ms-2">
                          <button 
                            class="btn btn-sm btn-outline-primary"
                            @click.stop="navigateToPlace(place)"
                            :disabled="!userLocation"
                            title="Navigate to this place"
                            aria-label="Navigate to this place"
                          >
                            <i class="bi bi-navigation" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Trip Planning Section -->
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-calendar-event me-2" aria-hidden="true"></i>
                  Plan Health Trip
                </h5>
              </div>
              <div class="card-body">
                <!-- Trip Type Selection -->
                <div class="mb-3">
                  <label for="tripType" class="form-label">Trip Type:</label>
                  <select 
                    id="tripType" 
                    class="form-select" 
                    v-model="tripForm.type"
                    aria-describedby="tripTypeHelp"
                  >
                    <option value="">Select trip type...</option>
                    <option 
                      v-for="(label, key) in tripTypes" 
                      :key="key" 
                      :value="key"
                    >
                      {{ label }}
                    </option>
                  </select>
                  <div id="tripTypeHelp" class="form-text">
                    Choose the type of health-related trip you're planning
                  </div>
                </div>

                <!-- Trip Name -->
                <div class="mb-3">
                  <label for="tripName" class="form-label">Trip Name:</label>
                  <input 
                    type="text" 
                    id="tripName" 
                    class="form-control" 
                    v-model="tripForm.name"
                    placeholder="e.g., Doctor Appointment"
                    aria-describedby="tripNameHelp"
                  >
                  <div id="tripNameHelp" class="form-text">
                    Give your trip a descriptive name
                  </div>
                </div>

                <!-- Scheduled Time -->
                <div class="mb-3">
                  <label for="scheduledTime" class="form-label">Scheduled Time:</label>
                  <input 
                    type="datetime-local" 
                    id="scheduledTime" 
                    class="form-control" 
                    v-model="tripForm.scheduledTime"
                    aria-describedby="scheduledTimeHelp"
                  >
                  <div id="scheduledTimeHelp" class="form-text">
                    When do you need to arrive at your destination?
                  </div>
                </div>

                <!-- Transportation Mode -->
                <div class="mb-3">
                  <label for="transportation" class="form-label">Transportation:</label>
                  <select 
                    id="transportation" 
                    class="form-select" 
                    v-model="tripForm.transportation"
                    aria-describedby="transportationHelp"
                  >
                    <option value="driving">Driving</option>
                    <option value="walking">Walking</option>
                    <option value="cycling">Cycling</option>
                    <option value="transit">Public Transit</option>
                  </select>
                  <div id="transportationHelp" class="form-text">
                    Choose your preferred mode of transportation
                  </div>
                </div>

                <!-- Trip Actions -->
                <div class="d-grid gap-2">
                  <button 
                    class="btn btn-primary"
                    @click="planTrip"
                    :disabled="!canPlanTrip || isPlanningTrip"
                    aria-label="Plan health trip"
                  >
                    <i class="bi bi-calendar-plus me-2" aria-hidden="true"></i>
                    {{ isPlanningTrip ? 'Planning...' : 'Plan Trip' }}
                  </button>
                  <button 
                    class="btn btn-outline-secondary"
                    @click="clearTrip"
                    :disabled="!currentTrip"
                    aria-label="Clear current trip"
                  >
                    <i class="bi bi-x-circle me-2" aria-hidden="true"></i>
                    Clear Trip
                  </button>
                </div>
              </div>
            </div>

            <!-- Current Trip Information -->
            <div v-if="currentTrip" class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
                  Trip Information
                </h5>
              </div>
              <div class="card-body">
                <div class="trip-info">
                  <h6 class="fw-semibold">{{ currentTrip.name }}</h6>
                  <p class="text-muted small mb-2">{{ tripTypes[currentTrip.type] }}</p>
                  
                  <div v-if="currentTrip.route" class="trip-details">
                    <div class="row g-2 mb-3">
                      <div class="col-6">
                        <div class="text-center p-2 bg-light rounded">
                          <i class="bi bi-clock text-primary d-block mb-1" aria-hidden="true"></i>
                          <small class="fw-semibold">{{ currentTrip.route.summary.duration }}</small>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="text-center p-2 bg-light rounded">
                          <i class="bi bi-arrow-right text-success d-block mb-1" aria-hidden="true"></i>
                          <small class="fw-semibold">{{ currentTrip.route.summary.distance }}</small>
                        </div>
                      </div>
                    </div>

                    <div v-if="currentTrip.trafficConditions" class="mb-3">
                      <div class="alert alert-info small">
                        <i class="bi bi-traffic-light me-2" aria-hidden="true"></i>
                        <strong>Traffic:</strong> {{ currentTrip.trafficConditions.description }}
                      </div>
                    </div>

                    <div v-if="currentTrip.alternativeRoutes?.length > 0" class="mb-3">
                      <h6 class="small fw-semibold mb-2">Alternative Routes:</h6>
                      <div class="list-group list-group-flush small">
                        <div 
                          v-for="(route, index) in currentTrip.alternativeRoutes" 
                          :key="index"
                          class="list-group-item px-0 py-2"
                        >
                          <div class="d-flex justify-content-between">
                            <span class="text-capitalize">{{ route.profile }}</span>
                            <span class="fw-semibold">{{ route.summary.duration }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Container -->
        <div class="col-lg-8 col-xl-9">
          <div class="card">
            <div class="card-body p-0">
              <!-- Map Loading State -->
              <div v-if="isLoadingMap" class="d-flex align-items-center justify-content-center" style="height: 600px;">
                <div class="text-center">
                  <div class="spinner-border text-primary mb-3" role="status" aria-hidden="true"></div>
                  <h5>Loading Map...</h5>
                  <p class="text-muted">Initializing MapBox and loading your location</p>
                </div>
              </div>

              <!-- Map Container -->
              <div 
                id="mapContainer" 
                class="map-container"
                :style="{ height: isLoadingMap ? '0px' : '600px' }"
                aria-label="Interactive map showing health facilities and routes"
              ></div>

              <!-- Map Controls Overlay -->
              <div v-if="showMapControls" class="map-controls-overlay">
                <div class="card">
                  <div class="card-header">
                    <h6 class="card-title mb-0">Map Controls</h6>
                  </div>
                  <div class="card-body">
                    <div class="d-grid gap-2">
                      <button 
                        class="btn btn-sm btn-outline-primary"
                        @click="clearMap"
                        aria-label="Clear all markers and routes"
                      >
                        <i class="bi bi-trash me-2" aria-hidden="true"></i>
                        Clear Map
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-secondary"
                        @click="fitMapToResults"
                        :disabled="searchResults.length === 0"
                        aria-label="Fit map to show all search results"
                      >
                        <i class="bi bi-arrows-fullscreen me-2" aria-hidden="true"></i>
                        Fit to Results
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-success"
                        @click="toggleTrafficLayer"
                        aria-label="Toggle traffic layer"
                      >
                        <i class="bi bi-traffic-light me-2" aria-hidden="true"></i>
                        {{ showTraffic ? 'Hide' : 'Show' }} Traffic
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="errorModalLabel">
              <i class="bi bi-exclamation-triangle me-2 text-warning" aria-hidden="true"></i>
              Error
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>{{ errorMessage }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { mappingService } from '../services/mappingService'

// Reactive data
const isLoadingMap = ref(true)
const isLoadingLocation = ref(false)
const isLoading = ref(false)
const isPlanningTrip = ref(false)
const showMapControls = ref(false)
const showTraffic = ref(false)
const errorMessage = ref('')

// Search data
const searchQuery = ref('')
const searchResults = ref([])
const selectedPlace = ref(null)

// Location data
const userLocation = ref(null)

// Trip planning data
const tripForm = ref({
  type: '',
  name: '',
  scheduledTime: '',
  transportation: 'driving'
})

const currentTrip = ref(null)

// Health categories for quick search
const healthCategories = ref([
  { key: 'hospitals', name: 'Hospitals', icon: 'bi bi-hospital' },
  { key: 'pharmacies', name: 'Pharmacies', icon: 'bi bi-capsule' },
  { key: 'gyms', name: 'Gyms', icon: 'bi bi-activity' },
  { key: 'mental_health', name: 'Mental Health', icon: 'bi bi-heart-pulse' },
  { key: 'nutrition', name: 'Nutrition', icon: 'bi bi-apple' },
  { key: 'urgent_care', name: 'Urgent Care', icon: 'bi bi-exclamation-triangle' },
  { key: 'specialists', name: 'Specialists', icon: 'bi bi-person-badge' },
  { key: 'wellness', name: 'Wellness', icon: 'bi bi-flower1' }
])

// Trip types
const tripTypes = ref({
  medical_appointment: 'Medical Appointment',
  pharmacy_pickup: 'Pharmacy Pickup',
  fitness_visit: 'Fitness Center Visit',
  mental_health: 'Mental Health Visit',
  wellness_visit: 'Wellness Center Visit',
  emergency: 'Emergency Visit',
  routine_checkup: 'Routine Checkup'
})

// Computed properties
const canPlanTrip = computed(() => {
  return tripForm.value.type && 
         tripForm.value.name && 
         tripForm.value.scheduledTime && 
         selectedPlace.value
})

// Methods
const initializeMap = async () => {
  try {
    isLoadingMap.value = true
    
    // Initialize the map
    await mappingService.initializeMap('mapContainer', {
      center: [-74.006, 40.7128], // Default to NYC
      zoom: 12
    })

    // Get user location
    await getCurrentLocation()
    
    isLoadingMap.value = false
    console.log('🗺️ Map initialized successfully')
  } catch (error) {
    console.error('🗺️ Failed to initialize map:', error)
    errorMessage.value = 'Failed to initialize map. Please check your internet connection and try again.'
    showErrorModal()
    isLoadingMap.value = false
  }
}

const getCurrentLocation = async () => {
  try {
    isLoadingLocation.value = true
    
    const location = await mappingService.getUserLocation()
    userLocation.value = location
    
    // Center map on user location
    if (mappingService.map) {
      mappingService.setMapView(location, 15)
    }
    
    console.log('📍 User location obtained:', location)
  } catch (error) {
    console.error('📍 Failed to get location:', error)
    errorMessage.value = 'Unable to get your current location. Please enable location services and try again.'
    showErrorModal()
  } finally {
    isLoadingLocation.value = false
  }
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  try {
    isLoading.value = true
    
    const results = await mappingService.searchHealthPlaces(
      searchQuery.value,
      'healthcare',
      userLocation.value
    )
    
    searchResults.value = results
    
    // Add markers to map
    if (results.length > 0) {
      mappingService.addMarkers(results)
    }
    
    console.log(`🔍 Search completed: ${results.length} results found`)
  } catch (error) {
    console.error('🔍 Search failed:', error)
    errorMessage.value = 'Search failed. Please check your internet connection and try again.'
    showErrorModal()
  } finally {
    isLoading.value = false
  }
}

const quickSearch = async (category) => {
  try {
    isLoading.value = true
    searchQuery.value = healthCategories.value.find(c => c.key === category)?.name || category
    
    const results = await mappingService.searchHealthFacilities(
      category,
      userLocation.value
    )
    
    searchResults.value = results
    
    // Add markers to map
    if (results.length > 0) {
      mappingService.addMarkers(results, { color: getCategoryColor(category) })
    }
    
    console.log(`🔍 Quick search completed for ${category}: ${results.length} results`)
  } catch (error) {
    console.error('🔍 Quick search failed:', error)
    errorMessage.value = 'Quick search failed. Please try again.'
    showErrorModal()
  } finally {
    isLoading.value = false
  }
}

const selectPlace = (place) => {
  selectedPlace.value = place
  
  // Center map on selected place
  if (mappingService.map) {
    mappingService.setMapView(place.coordinates, 16)
  }
  
  console.log('📍 Place selected:', place.name)
}

const navigateToPlace = async (place) => {
  if (!userLocation.value) {
    errorMessage.value = 'Please enable location services to get directions.'
    showErrorModal()
    return
  }
  
  try {
    const route = await mappingService.navigateToPlace(place.id)
    console.log('🧭 Navigation started to:', place.name)
  } catch (error) {
    console.error('🧭 Navigation failed:', error)
    errorMessage.value = 'Failed to get directions. Please try again.'
    showErrorModal()
  }
}

const planTrip = async () => {
  if (!canPlanTrip.value) return
  
  try {
    isPlanningTrip.value = true
    
    const tripData = {
      type: tripForm.value.type,
      name: tripForm.value.name,
      scheduledTime: tripForm.value.scheduledTime,
      transportation: tripForm.value.transportation,
      origin: userLocation.value,
      destination: selectedPlace.value.coordinates
    }
    
    // Create trip
    const trip = mappingService.createHealthTrip(tripData)
    
    // Get trip information with route
    const tripInfo = await mappingService.getTripInformation(trip)
    currentTrip.value = tripInfo
    
    // Add route to map
    if (tripInfo.route) {
      mappingService.addRoute(tripInfo.route, { color: '#dc3545' })
    }
    
    console.log('🏥 Trip planned successfully:', tripInfo)
  } catch (error) {
    console.error('🏥 Trip planning failed:', error)
    errorMessage.value = 'Failed to plan trip. Please try again.'
    showErrorModal()
  } finally {
    isPlanningTrip.value = false
  }
}

const clearTrip = () => {
  currentTrip.value = null
  mappingService.clearRoutes()
  
  // Reset form
  tripForm.value = {
    type: '',
    name: '',
    scheduledTime: '',
    transportation: 'driving'
  }
  
  console.log('🏥 Trip cleared')
}

const clearMap = () => {
  mappingService.clearMarkers()
  mappingService.clearRoutes()
  searchResults.value = []
  selectedPlace.value = null
  currentTrip.value = null
  
  console.log('🗺️ Map cleared')
}

const fitMapToResults = () => {
  if (searchResults.value.length > 0) {
    mappingService.fitMapToMarkers(searchResults.value)
  }
}

const toggleMapControls = () => {
  showMapControls.value = !showMapControls.value
}

const toggleTrafficLayer = () => {
  showTraffic.value = !showTraffic.value
  // In a real implementation, you would toggle traffic layer on the map
  console.log('🚦 Traffic layer toggled:', showTraffic.value)
}

const getCategoryColor = (category) => {
  const colors = {
    hospitals: '#dc3545',
    pharmacies: '#0d6efd',
    gyms: '#198754',
    mental_health: '#6f42c1',
    nutrition: '#fd7e14',
    urgent_care: '#ffc107',
    specialists: '#20c997',
    wellness: '#e83e8c'
  }
  return colors[category] || '#2563eb'
}

const showErrorModal = () => {
  const modal = new bootstrap.Modal(document.getElementById('errorModal'))
  modal.show()
}

// Lifecycle hooks
onMounted(async () => {
  await initializeMap()
})

onUnmounted(() => {
  if (mappingService.map) {
    mappingService.destroy()
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  border-radius: 0.375rem;
  overflow: hidden;
}

.map-controls-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 250px;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.trip-info {
  font-size: 0.9rem;
}

.trip-details {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
  margin-top: 1rem;
}

.list-group-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.list-group-item.active h6,
.list-group-item.active p {
  color: white;
}

.list-group-item.active .badge {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .map-container {
    height: 400px !important;
  }
  
  .map-controls-overlay {
    position: relative;
    top: auto;
    right: auto;
    margin: 1rem;
  }
  
  .sticky-top {
    position: relative !important;
    top: auto !important;
  }
}

/* Custom map popup styles */
:deep(.mapboxgl-popup-content) {
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

:deep(.mapboxgl-popup-close-button) {
  font-size: 1.5rem;
  padding: 0.5rem;
}

/* Loading states */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Form enhancements */
.form-control:focus,
.form-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
}

/* Button enhancements */
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

/* Card enhancements */
.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: box-shadow 0.15s ease-in-out;
}

.card:hover {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

/* Accessibility improvements */
.btn:focus,
.form-control:focus,
.form-select:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Animation for search results */
.search-results .list-group-item {
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
