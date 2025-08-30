<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'

// Dynamic data from JavaScript structures (BR B.2)
const resources = ref([
  {
    id: 1,
    title: "Exercise Guidelines for Men",
    description: "Comprehensive guide to physical activity recommendations for men of all ages.",
    category: "Fitness",
    source: "Mayo Clinic",
    url: "https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/exercise/art-20048389",
    published: "2024-01-15",
    readTime: "8 min read",
    difficulty: "Beginner",
    rating: 4.8,
    tags: ["workout", "health", "fitness"]
  },
  {
    id: 2,
    title: "Nutrition Fundamentals for Men's Health",
    description: "Essential dietary guidelines and meal planning strategies for optimal health.",
    category: "Nutrition",
    source: "Harvard Health",
    url: "https://www.health.harvard.edu/mens-health/nutrition-for-mens-health",
    published: "2024-02-20",
    readTime: "12 min read",
    difficulty: "Intermediate",
    rating: 4.6,
    tags: ["diet", "nutrition", "meal-planning"]
  },
  {
    id: 3,
    title: "Mental Health and Stress Management",
    description: "Practical strategies for managing stress and maintaining mental wellbeing.",
    category: "Mental Wellbeing",
    source: "American Psychological Association",
    url: "https://www.apa.org/topics/stress",
    published: "2024-01-30",
    readTime: "10 min read",
    difficulty: "Beginner",
    rating: 4.9,
    tags: ["stress", "mental-health", "wellbeing"]
  },
  {
    id: 4,
    title: "Heart Health Prevention Strategies",
    description: "Evidence-based approaches to cardiovascular disease prevention in men.",
    category: "Preventive Care",
    source: "American Heart Association",
    url: "https://www.heart.org/en/health-topics/heart-attack/preventing-heart-attack",
    published: "2024-02-10",
    readTime: "15 min read",
    difficulty: "Intermediate",
    rating: 4.7,
    tags: ["heart-health", "prevention", "cardiovascular"]
  },
  {
    id: 5,
    title: "Sleep Optimization for Better Health",
    description: "How quality sleep impacts men's health and strategies for improvement.",
    category: "Mental Wellbeing",
    source: "National Sleep Foundation",
    url: "https://www.sleepfoundation.org/sleep-hygiene",
    published: "2024-02-05",
    readTime: "9 min read",
    difficulty: "Beginner",
    rating: 4.5,
    tags: ["sleep", "recovery", "health"]
  },
  {
    id: 6,
    title: "Prostate Health Awareness",
    description: "Important information about prostate health and screening recommendations.",
    category: "Preventive Care",
    source: "American Cancer Society",
    url: "https://www.cancer.org/cancer/prostate-cancer.html",
    published: "2024-01-25",
    readTime: "11 min read",
    difficulty: "Intermediate",
    rating: 4.4,
    tags: ["prostate", "screening", "prevention"]
  },
  {
    id: 7,
    title: "Building Healthy Relationships",
    description: "Guidance on maintaining healthy relationships and social connections.",
    category: "Mental Wellbeing",
    source: "Psychology Today",
    url: "https://www.psychologytoday.com/us/basics/relationships",
    published: "2024-02-15",
    readTime: "13 min read",
    difficulty: "Beginner",
    rating: 4.3,
    tags: ["relationships", "social", "communication"]
  },
  {
    id: 8,
    title: "Weight Management Strategies",
    description: "Sustainable approaches to maintaining a healthy weight and body composition.",
    category: "Nutrition",
    source: "CDC",
    url: "https://www.cdc.gov/healthyweight/index.html",
    published: "2024-01-20",
    readTime: "14 min read",
    difficulty: "Intermediate",
    rating: 4.6,
    tags: ["weight", "management", "health"]
  },
  {
    id: 9,
    title: "Work-Life Balance for Men",
    description: "Strategies for achieving balance between professional and personal life.",
    category: "Mental Wellbeing",
    source: "Harvard Business Review",
    url: "https://hbr.org/topic/work-life-balance",
    published: "2024-02-12",
    readTime: "16 min read",
    difficulty: "Advanced",
    rating: 4.2,
    tags: ["work-life", "balance", "productivity"]
  }
])

// Reactive state for filtering and search
const searchQuery = ref('')
const selectedCategory = ref('All')
const selectedDifficulty = ref('All')
const sortBy = ref('newest')

// User preferences and reading history (persisted in LocalStorage)
const userPreferences = reactive({
  favoriteResources: [],
  readingHistory: [],
  preferredCategories: [],
  lastVisit: null
})

// Computed properties for dynamic filtering
const filteredResources = computed(() => {
  let filtered = resources.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(resource => 
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Category filter
  if (selectedCategory.value !== 'All') {
    filtered = filtered.filter(resource => resource.category === selectedCategory.value)
  }

  // Difficulty filter
  if (selectedDifficulty.value !== 'All') {
    filtered = filtered.filter(resource => resource.difficulty === selectedDifficulty.value)
  }

  return filtered
})

const sortedResources = computed(() => {
  const filtered = [...filteredResources.value]
  
  switch (sortBy.value) {
    case 'newest':
      return filtered.sort((a, b) => new Date(b.published) - new Date(a.published))
    case 'oldest':
      return filtered.sort((a, b) => new Date(a.published) - new Date(b.published))
    case 'rating':
      return filtered.sort((a, b) => b.rating - a.rating)
    case 'readTime':
      return filtered.sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime))
    case 'title':
      return filtered.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return filtered
  }
})

const categories = computed(() => {
  const cats = ['All', ...new Set(resources.value.map(r => r.category))]
  return cats
})

const difficulties = computed(() => {
  const diffs = ['All', ...new Set(resources.value.map(r => r.difficulty))]
  return diffs
})

const resultsCount = computed(() => sortedResources.value.length)

// Load user preferences from LocalStorage
const loadUserPreferences = () => {
  try {
    const saved = localStorage.getItem('wellman_user_preferences')
    if (saved) {
      const parsed = JSON.parse(saved)
      Object.assign(userPreferences, parsed)
    }
  } catch (error) {
    console.error('Error loading user preferences:', error)
  }
}

// Save user preferences to LocalStorage
const saveUserPreferences = () => {
  try {
    userPreferences.lastVisit = new Date().toISOString()
    localStorage.setItem('wellman_user_preferences', JSON.stringify(userPreferences))
  } catch (error) {
    console.error('Error saving user preferences:', error)
  }
}

// Watch for changes and save to LocalStorage
watch(userPreferences, saveUserPreferences, { deep: true })

// User interaction functions
const toggleFavorite = (resourceId) => {
  const index = userPreferences.favoriteResources.indexOf(resourceId)
  if (index > -1) {
    userPreferences.favoriteResources.splice(index, 1)
  } else {
    userPreferences.favoriteResources.push(resourceId)
  }
}

const addToReadingHistory = (resource) => {
  const historyItem = {
    id: resource.id,
    title: resource.title,
    timestamp: new Date().toISOString()
  }
  
  // Remove if already exists and add to front
  userPreferences.readingHistory = userPreferences.readingHistory.filter(item => item.id !== resource.id)
  userPreferences.readingHistory.unshift(historyItem)
  
  // Keep only last 20 items
  if (userPreferences.readingHistory.length > 20) {
    userPreferences.readingHistory = userPreferences.readingHistory.slice(0, 20)
  }
}

const openArticle = (resource) => {
  addToReadingHistory(resource)
  window.open(resource.url, '_blank')
}

const isFavorite = (resourceId) => {
  return userPreferences.favoriteResources.includes(resourceId)
}

const getCategoryColor = (category) => {
  const colors = {
    'Fitness': 'primary',
    'Nutrition': 'success',
    'Mental Wellbeing': 'info',
    'Preventive Care': 'warning'
  }
  return colors[category] || 'secondary'
}

const getDifficultyColor = (difficulty) => {
  const colors = {
    'Beginner': 'success',
    'Intermediate': 'warning',
    'Advanced': 'danger'
  }
  return colors[difficulty] || 'secondary'
}

// Initialize on mount
onMounted(() => {
  loadUserPreferences()
})
</script>

<template>
  <div class="container">
    <!-- Page Header -->
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="mb-2">Health & Resources</h1>
        <p class="text-muted mb-0">Evidence-based guidance from leading health institutions</p>
      </div>
    </div>

    <!-- Search and Filter Controls -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row g-3">
              <!-- Search -->
              <div class="col-md-6">
                <label for="searchInput" class="form-label">Search Resources</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    id="searchInput"
                    v-model="searchQuery"
                    placeholder="Search by title, description, or tags..."
                  >
                </div>
              </div>

              <!-- Category Filter -->
              <div class="col-md-2">
                <label for="categoryFilter" class="form-label">Category</label>
                <select class="form-select" id="categoryFilter" v-model="selectedCategory">
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>

              <!-- Difficulty Filter -->
              <div class="col-md-2">
                <label for="difficultyFilter" class="form-label">Difficulty</label>
                <select class="form-select" id="difficultyFilter" v-model="selectedDifficulty">
                  <option v-for="difficulty in difficulties" :key="difficulty" :value="difficulty">
                    {{ difficulty }}
                  </option>
                </select>
              </div>

              <!-- Sort By -->
              <div class="col-md-2">
                <label for="sortBy" class="form-label">Sort By</label>
                <select class="form-select" id="sortBy" v-model="sortBy">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="readTime">Quickest Read</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <p class="mb-0">
            <strong>{{ resultsCount }}</strong> resource{{ resultsCount !== 1 ? 's' : '' }} found
          </p>
          <div class="d-flex gap-2">
            <button 
              class="btn btn-outline-primary btn-sm"
              @click="searchQuery = ''; selectedCategory = 'All'; selectedDifficulty = 'All'"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resources Grid -->
    <div class="row g-4">
      <div v-for="resource in sortedResources" :key="resource.id" class="col-md-6 col-lg-4">
        <div class="card h-100 hoverable">
          <div class="card-body">
            <!-- Resource Header -->
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="badge" :class="`bg-${getCategoryColor(resource.category)}`">
                {{ resource.category }}
              </div>
              <button
                class="btn btn-sm btn-outline-secondary"
                @click="toggleFavorite(resource.id)"
                :class="{ 'btn-primary': isFavorite(resource.id) }"
                :title="isFavorite(resource.id) ? 'Remove from favorites' : 'Add to favorites'"
              >
                <i class="bi" :class="isFavorite(resource.id) ? 'bi-heart-fill' : 'bi-heart'"></i>
              </button>
            </div>

            <!-- Resource Title -->
            <h5 class="card-title mb-2">{{ resource.title }}</h5>
            
            <!-- Resource Description -->
            <p class="card-text text-muted mb-3">{{ resource.description }}</p>

            <!-- Resource Meta -->
            <div class="row g-2 mb-3">
              <div class="col-6">
                <small class="text-muted">
                  <i class="bi bi-clock me-1"></i>{{ resource.readTime }}
                </small>
              </div>
              <div class="col-6">
                <small class="text-muted">
                  <i class="bi bi-star-fill text-warning me-1"></i>{{ resource.rating }}
                </small>
              </div>
            </div>

            <!-- Difficulty and Source -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="badge" :class="`bg-${getDifficultyColor(resource.difficulty)}`">
                {{ resource.difficulty }}
              </span>
              <small class="text-muted">{{ resource.source }}</small>
            </div>

            <!-- Tags -->
            <div class="mb-3">
              <div class="d-flex flex-wrap gap-1">
                <span 
                  v-for="tag in resource.tags.slice(0, 3)" 
                  :key="tag"
                  class="badge bg-light text-dark"
                  style="font-size: 0.7rem;"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-2">
              <button 
                class="btn btn-primary btn-sm flex-fill"
                @click="openArticle(resource)"
              >
                <i class="bi bi-box-arrow-up-right me-1"></i>Read Article
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results Message -->
    <div v-if="resultsCount === 0" class="row">
      <div class="col-12">
        <div class="text-center py-5">
          <i class="bi bi-search display-4 text-muted mb-3"></i>
          <h4 class="text-muted">No resources found</h4>
          <p class="text-muted">Try adjusting your search criteria or filters</p>
          <button 
            class="btn btn-primary"
            @click="searchQuery = ''; selectedCategory = 'All'; selectedDifficulty = 'All'"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Reading History Section (if available) -->
    <div v-if="userPreferences.readingHistory.length > 0" class="row mt-5">
      <div class="col-12">
        <h3 class="mb-3">Recently Viewed</h3>
        <div class="row g-3">
          <div v-for="historyItem in userPreferences.readingHistory.slice(0, 3)" :key="historyItem.id" class="col-md-4">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="card-title">{{ historyItem.title }}</h6>
                <small class="text-muted">
                  Viewed {{ new Date(historyItem.timestamp).toLocaleDateString() }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  transition: var(--transition-slow);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .col-md-2 {
    margin-bottom: 1rem;
  }
  
  .card-body {
    padding: 1rem;
  }
}
</style>


