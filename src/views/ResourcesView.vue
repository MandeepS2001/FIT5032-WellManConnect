<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// State
const resources = ref([])
const filteredResources = ref([])
const selectedCategory = ref('all')
const searchQuery = ref('')
const sortBy = ref('newest')
const isLoading = ref(true)

// Rating system
const showRatingModal = ref(false)
const selectedResource = ref(null)
const ratingForm = reactive({
  rating: 5,
  review: '',
  helpful: false
})

// Review moderation
const pendingReviews = ref([])
const showModerationModal = ref(false)

// Categories
const categories = [
  { id: 'all', name: 'All Categories', icon: '📚' },
  { id: 'fitness', name: 'Fitness & Exercise', icon: '🏃‍♂️' },
  { id: 'nutrition', name: 'Nutrition & Diet', icon: '🥗' },
  { id: 'mental-health', name: 'Mental Health', icon: '🧠' },
  { id: 'preventive-care', name: 'Preventive Care', icon: '🩺' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🌱' }
]

// Sample resources with ratings
const sampleResources = [
  {
    id: 1,
    title: "The Complete Guide to Men's Fitness",
    category: "fitness",
    content: "A comprehensive guide covering strength training, cardio, and flexibility exercises specifically designed for men's health needs.",
    author: "Dr. Michael Johnson",
    createdAt: "2024-01-15",
    rating: 4.7,
    reviewCount: 128,
    readTime: "8 min read",
    tags: ["strength training", "cardio", "flexibility"],
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop"
  },
  {
    id: 2,
    title: "Nutrition Fundamentals for Optimal Health",
    category: "nutrition",
    content: "Essential nutrition principles, meal planning strategies, and dietary recommendations for maintaining peak physical and mental performance.",
    author: "Sarah Chen, RD",
    createdAt: "2024-01-10",
    rating: 4.9,
    reviewCount: 95,
    readTime: "12 min read",
    tags: ["meal planning", "macronutrients", "supplements"],
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop"
  },
  {
    id: 3,
    title: "Managing Stress and Anxiety in Modern Life",
    category: "mental-health",
    content: "Practical techniques for stress management, anxiety reduction, and maintaining mental wellbeing in today's fast-paced world.",
    author: "Dr. Emily Rodriguez",
    createdAt: "2024-01-08",
    rating: 4.6,
    reviewCount: 203,
    readTime: "10 min read",
    tags: ["stress management", "meditation", "anxiety"],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
  },
  {
    id: 4,
    title: "Preventive Health Screenings Every Man Should Know",
    category: "preventive-care",
    content: "Essential health screenings, check-ups, and preventive measures to catch potential health issues early and maintain optimal health.",
    author: "Dr. James Wilson",
    createdAt: "2024-01-05",
    rating: 4.8,
    reviewCount: 156,
    readTime: "15 min read",
    tags: ["health screenings", "preventive care", "check-ups"],
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop"
  },
  {
    id: 5,
    title: "Building Healthy Habits for Long-term Success",
    category: "lifestyle",
    content: "Strategies for developing sustainable healthy habits, breaking bad patterns, and creating lasting lifestyle changes.",
    author: "Mark Thompson",
    createdAt: "2024-01-03",
    rating: 4.5,
    reviewCount: 89,
    readTime: "6 min read",
    tags: ["habits", "lifestyle", "motivation"],
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=250&fit=crop"
  },
  {
    id: 6,
    title: "Advanced Strength Training Techniques",
    category: "fitness",
    content: "Advanced lifting techniques, periodization strategies, and programming for experienced lifters looking to break plateaus.",
    author: "Coach Alex Martinez",
    createdAt: "2024-01-01",
    rating: 4.4,
    reviewCount: 67,
    readTime: "14 min read",
    tags: ["strength training", "advanced", "periodization"],
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop"
  }
]

// Reviews data structure
const reviews = ref([])

// Computed properties
const filteredAndSortedResources = computed(() => {
  let filtered = resources.value

  // Filter by category
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(resource => resource.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(resource => 
      resource.title.toLowerCase().includes(query) ||
      resource.content.toLowerCase().includes(query) ||
      resource.author.toLowerCase().includes(query) ||
      resource.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Sort resources
  switch (sortBy.value) {
    case 'rating':
      filtered = [...filtered].sort((a, b) => b.rating - a.rating)
      break
    case 'popular':
      filtered = [...filtered].sort((a, b) => b.reviewCount - a.reviewCount)
      break
    case 'newest':
      filtered = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'oldest':
      filtered = [...filtered].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
  }

  return filtered
})

const averageRating = computed(() => {
  if (resources.value.length === 0) return 0
  const totalRating = resources.value.reduce((sum, resource) => sum + resource.rating, 0)
  return (totalRating / resources.value.length).toFixed(1)
})

const totalReviews = computed(() => {
  return resources.value.reduce((sum, resource) => sum + resource.reviewCount, 0)
})

// Rating system functions
const openRatingModal = (resource) => {
  if (!authStore.isAuthenticated) {
    alert('Please sign in to leave a review.')
    return
  }
  
  selectedResource.value = resource
  ratingForm.rating = 5
  ratingForm.review = ''
  ratingForm.helpful = false
  showRatingModal.value = true
}

const submitRating = async () => {
  if (!ratingForm.review.trim()) {
    alert('Please provide a review comment.')
    return
  }

  const newReview = {
    id: Date.now(),
    resourceId: selectedResource.value.id,
    userId: authStore.currentUser.id,
    userName: `${authStore.currentUser.firstName} ${authStore.currentUser.lastName}`,
    userEmail: authStore.currentUser.email,
    rating: ratingForm.rating,
    review: ratingForm.review.trim(),
    helpful: ratingForm.helpful,
    createdAt: new Date().toISOString(),
    status: authStore.isAdmin ? 'approved' : 'pending' // Auto-approve admin reviews
  }

  // Add review to localStorage
  const allReviews = JSON.parse(localStorage.getItem('wellman_reviews') || '[]')
  allReviews.push(newReview)
  localStorage.setItem('wellman_reviews', JSON.stringify(allReviews))

  // Update resource rating
  updateResourceRating(selectedResource.value.id)

  // Close modal
  showRatingModal.value = false
  selectedResource.value = null

  // Show success message
  alert('Thank you for your review! It will be visible once approved.')
}

const updateResourceRating = (resourceId) => {
  const allReviews = JSON.parse(localStorage.getItem('wellman_reviews') || '[]')
  const resourceReviews = allReviews.filter(review => 
    review.resourceId === resourceId && review.status === 'approved'
  )

  if (resourceReviews.length > 0) {
    const averageRating = resourceReviews.reduce((sum, review) => sum + review.rating, 0) / resourceReviews.length
    
    // Update resource in localStorage
    const allResources = JSON.parse(localStorage.getItem('wellman_resources') || '[]')
    const resourceIndex = allResources.findIndex(r => r.id === resourceId)
    
    if (resourceIndex !== -1) {
      allResources[resourceIndex].rating = Math.round(averageRating * 10) / 10
      allResources[resourceIndex].reviewCount = resourceReviews.length
      localStorage.setItem('wellman_resources', JSON.stringify(allResources))
      
      // Update local state
      const localResourceIndex = resources.value.findIndex(r => r.id === resourceId)
      if (localResourceIndex !== -1) {
        resources.value[localResourceIndex].rating = allResources[resourceIndex].rating
        resources.value[localResourceIndex].reviewCount = allResources[resourceIndex].reviewCount
      }
    }
  }
}

const getResourceReviews = (resourceId) => {
  const allReviews = JSON.parse(localStorage.getItem('wellman_reviews') || '[]')
  return allReviews.filter(review => 
    review.resourceId === resourceId && review.status === 'approved'
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

const markReviewHelpful = (reviewId) => {
  const allReviews = JSON.parse(localStorage.getItem('wellman_reviews') || '[]')
  const reviewIndex = allReviews.findIndex(r => r.id === reviewId)
  
  if (reviewIndex !== -1) {
    if (!allReviews[reviewIndex].helpfulCount) {
      allReviews[reviewIndex].helpfulCount = 0
    }
    allReviews[reviewIndex].helpfulCount++
    localStorage.setItem('wellman_reviews', JSON.stringify(allReviews))
  }
}

// Review moderation functions
const loadPendingReviews = () => {
  if (!authStore.isAdmin) return
  
  const allReviews = JSON.parse(localStorage.getItem('wellman_reviews') || '[]')
  pendingReviews.value = allReviews.filter(review => review.status === 'pending')
}

const approveReview = (reviewId) => {
  const allReviews = JSON.parse(localStorage.getItem('wellman_reviews') || '[]')
  const reviewIndex = allReviews.findIndex(r => r.id === reviewId)
  
  if (reviewIndex !== -1) {
    allReviews[reviewIndex].status = 'approved'
    localStorage.setItem('wellman_reviews', JSON.stringify(allReviews))
    
    // Update resource rating
    updateResourceRating(allReviews[reviewIndex].resourceId)
    
    // Reload pending reviews
    loadPendingReviews()
  }
}

const rejectReview = (reviewId) => {
  const allReviews = JSON.parse(localStorage.getItem('wellman_reviews') || '[]')
  const reviewIndex = allReviews.findIndex(r => r.id === reviewId)
  
  if (reviewIndex !== -1) {
    allReviews[reviewIndex].status = 'rejected'
    localStorage.setItem('wellman_reviews', JSON.stringify(allReviews))
    
    // Reload pending reviews
    loadPendingReviews()
  }
}

// Utility functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getCategoryIcon = (categoryId) => {
  const category = categories.find(cat => cat.id === categoryId)
  return category ? category.icon : '📚'
}

const getCategoryName = (categoryId) => {
  const category = categories.find(cat => cat.id === categoryId)
  return category ? category.name : 'Unknown'
}

// Load data
const loadData = async () => {
  isLoading.value = true
  
  try {
    // Load resources from localStorage or use sample data
    const storedResources = JSON.parse(localStorage.getItem('wellman_resources') || '[]')
    if (storedResources.length > 0) {
      resources.value = storedResources
    } else {
      resources.value = sampleResources
      localStorage.setItem('wellman_resources', JSON.stringify(sampleResources))
    }
    
    // Load reviews
    const storedReviews = JSON.parse(localStorage.getItem('wellman_reviews') || '[]')
    reviews.value = storedReviews
    
    // Load pending reviews for admin
    if (authStore.isAdmin) {
      loadPendingReviews()
    }
    
  } catch (error) {
    console.error('Error loading resources:', error)
    resources.value = sampleResources
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="container">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h2 mb-1">Health & Resources</h1>
            <p class="text-muted mb-0">Evidence-based articles and guides for men's health</p>
          </div>
          <div class="d-flex gap-2">
            <!-- Admin Moderation Button -->
            <button 
              v-if="authStore.isAdmin && pendingReviews.length > 0"
              class="btn btn-warning btn-sm"
              @click="showModerationModal = true"
            >
              <i class="bi bi-shield-check me-2"></i>
              Moderate Reviews ({{ pendingReviews.length }})
            </button>
            <button class="btn btn-primary btn-sm" @click="loadData">
              <i class="bi bi-arrow-clockwise me-2"></i>Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="h4 text-primary mb-1">{{ resources.length }}</div>
            <div class="small text-muted">Total Resources</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="h4 text-success mb-1">{{ averageRating }}</div>
            <div class="small text-muted">Average Rating</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="h4 text-info mb-1">{{ totalReviews }}</div>
            <div class="small text-muted">Total Reviews</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="h4 text-warning mb-1">{{ categories.length - 1 }}</div>
            <div class="small text-muted">Categories</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="row mb-4">
      <div class="col-md-8">
        <div class="d-flex gap-2 flex-wrap">
          <button
            v-for="category in categories"
            :key="category.id"
            class="btn"
            :class="selectedCategory === category.id ? 'btn-primary' : 'btn-outline-primary'"
            @click="selectedCategory = category.id"
          >
            <span class="me-2">{{ category.icon }}</span>
            {{ category.name }}
          </button>
        </div>
      </div>
      <div class="col-md-4">
        <div class="d-flex gap-2">
          <input
            type="text"
            class="form-control"
            placeholder="Search resources..."
            v-model="searchQuery"
          >
          <select class="form-select" v-model="sortBy" style="width: auto;">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading resources...</p>
    </div>

    <!-- Resources Grid -->
    <div v-else class="row g-4">
      <div 
        v-for="resource in filteredAndSortedResources" 
        :key="resource.id" 
        class="col-md-6 col-lg-4"
      >
        <div class="card h-100 border-0 shadow-sm hoverable">
          <img 
            :src="resource.image" 
            class="card-img-top" 
            :alt="resource.title"
            style="height: 200px; object-fit: cover;"
          >
          <div class="card-body d-flex flex-column">
            <div class="mb-2">
              <span class="badge bg-secondary me-2">{{ getCategoryIcon(resource.category) }} {{ getCategoryName(resource.category) }}</span>
              <small class="text-muted">{{ resource.readTime }}</small>
            </div>
            
            <h5 class="card-title">{{ resource.title }}</h5>
            <p class="card-text text-muted flex-grow-1">{{ resource.content.substring(0, 120) }}...</p>
            
            <div class="d-flex align-items-center mb-3">
              <div class="d-flex align-items-center me-3">
                <span class="text-warning me-1">★</span>
                <span class="fw-semibold">{{ resource.rating }}</span>
                <small class="text-muted ms-1">({{ resource.reviewCount }})</small>
              </div>
              <small class="text-muted">by {{ resource.author }}</small>
            </div>
            
            <div class="d-flex gap-2">
              <button class="btn btn-primary btn-sm flex-grow-1" @click="openRatingModal(resource)">
                <i class="bi bi-star me-2"></i>Rate & Review
              </button>
              <button class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-bookmark"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="!isLoading && filteredAndSortedResources.length === 0" class="text-center py-5">
      <i class="bi bi-search display-1 text-muted"></i>
      <h4 class="mt-3">No resources found</h4>
      <p class="text-muted">Try adjusting your search criteria or browse all categories.</p>
    </div>

    <!-- Rating Modal -->
    <div class="modal fade" :class="{ show: showRatingModal }" :style="{ display: showRatingModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Rate & Review</h5>
            <button type="button" class="btn-close" @click="showRatingModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedResource" class="mb-4">
              <h6>{{ selectedResource.title }}</h6>
              <p class="text-muted mb-0">{{ selectedResource.author }}</p>
            </div>
            
            <form @submit.prevent="submitRating">
              <div class="mb-3">
                <label class="form-label">Rating</label>
                <div class="d-flex align-items-center">
                  <div class="me-3">
                    <span class="h4 text-warning">{{ '★'.repeat(ratingForm.rating) }}{{ '☆'.repeat(5 - ratingForm.rating) }}</span>
                  </div>
                  <input 
                    type="range" 
                    class="form-range flex-grow-1" 
                    min="1" 
                    max="5" 
                    v-model="ratingForm.rating"
                    style="max-width: 200px;"
                  >
                  <span class="ms-2 fw-semibold">{{ ratingForm.rating }}/5</span>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Review</label>
                <textarea 
                  class="form-control" 
                  rows="4"
                  v-model="ratingForm.review"
                  placeholder="Share your thoughts about this resource..."
                  required
                ></textarea>
              </div>
              
              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="ratingForm.helpful" id="helpful">
                  <label class="form-check-label" for="helpful">
                    This resource was helpful to me
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showRatingModal = false">Cancel</button>
            <button type="button" class="btn btn-primary" @click="submitRating">Submit Review</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Moderation Modal -->
    <div class="modal fade" :class="{ show: showModerationModal }" :style="{ display: showModerationModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Review Moderation</h5>
            <button type="button" class="btn-close" @click="showModerationModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="pendingReviews.length === 0" class="text-center py-4">
              <i class="bi bi-check-circle text-success display-4"></i>
              <h5 class="mt-3">No pending reviews</h5>
              <p class="text-muted">All reviews have been moderated.</p>
            </div>
            
            <div v-else>
              <div v-for="review in pendingReviews" :key="review.id" class="card mb-3">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 class="mb-1">{{ review.userName }}</h6>
                      <div class="d-flex align-items-center">
                        <span class="text-warning me-2">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
                        <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
                      </div>
                    </div>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-success" @click="approveReview(review.id)">
                        <i class="bi bi-check"></i> Approve
                      </button>
                      <button class="btn btn-danger" @click="rejectReview(review.id)">
                        <i class="bi bi-x"></i> Reject
                      </button>
                    </div>
                  </div>
                  <p class="mb-2">{{ review.review }}</p>
                  <small class="text-muted">
                    Resource: {{ resources.find(r => r.id === review.resourceId)?.title }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Backdrops -->
    <div v-if="showRatingModal || showModerationModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<style scoped>
.hoverable {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.form-range::-webkit-slider-thumb {
  background: var(--primary);
}

.form-range::-moz-range-thumb {
  background: var(--primary);
}
</style>


