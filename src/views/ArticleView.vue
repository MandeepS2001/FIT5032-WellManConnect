<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const article = ref(null)
const isLoading = ref(true)
const showRatingModal = ref(false)
const showReviews = ref(false)
const isBookmarked = ref(false)

// Rating form
const ratingForm = reactive({
  rating: 5,
  review: '',
  helpful: false
})

// Reviews
const reviews = ref([])

// Computed properties
const averageRating = computed(() => {
  if (!article.value) return 0
  return article.value.rating
})

const reviewCount = computed(() => {
  if (!article.value) return 0
  return article.value.reviewCount
})

const relatedArticles = computed(() => {
  if (!article.value) return []
  
  const allResources = JSON.parse(localStorage.getItem('wellman_resources') || '[]')
  return allResources
    .filter(resource => 
      resource.id !== article.value.id && 
      resource.category === article.value.category
    )
    .slice(0, 3)
})

// Load article data
const loadArticle = async () => {
  isLoading.value = true
  
  try {
    const articleId = parseInt(route.params.id)
    const allResources = JSON.parse(localStorage.getItem('wellman_resources') || '[]')
    
    article.value = allResources.find(resource => resource.id === articleId)
    
    if (!article.value) {
      router.push('/resources')
      return
    }
    
    // Load reviews for this article
    loadReviews()
    
    // Check if article is bookmarked
    checkBookmarkStatus()
    
    // Add to reading history
    addToReadingHistory()
    
  } catch (error) {
    console.error('Error loading article:', error)
    router.push('/resources')
  } finally {
    isLoading.value = false
  }
}

// Load reviews
const loadReviews = () => {
  const allReviews = JSON.parse(localStorage.getItem('wellman_reviews') || '[]')
  reviews.value = allReviews.filter(review => 
    review.resourceId === article.value.id && review.status === 'approved'
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// Add to reading history
const addToReadingHistory = () => {
  if (!authStore.isAuthenticated) return
  
  const history = JSON.parse(localStorage.getItem('wellman_reading_history') || '[]')
  const historyItem = {
    articleId: article.value.id,
    title: article.value.title,
    timestamp: new Date().toISOString()
  }
  
  // Remove if already exists and add to front
  const filteredHistory = history.filter(item => item.articleId !== article.value.id)
  filteredHistory.unshift(historyItem)
  
  // Keep only last 20 items
  if (filteredHistory.length > 20) {
    filteredHistory.splice(20)
  }
  
  localStorage.setItem('wellman_reading_history', JSON.stringify(filteredHistory))
}

// Check bookmark status
const checkBookmarkStatus = () => {
  if (!authStore.isAuthenticated) return
  
  const bookmarks = JSON.parse(localStorage.getItem('wellman_bookmarks') || '[]')
  isBookmarked.value = bookmarks.some(bookmark => 
    bookmark.articleId === article.value.id && bookmark.userId === authStore.currentUser.id
  )
}

// Toggle bookmark
const toggleBookmark = () => {
  if (!authStore.isAuthenticated) {
    alert('Please sign in to bookmark articles.')
    return
  }
  
  if (!article.value) {
    console.error('Article not loaded')
    return
  }
  
  const bookmarks = JSON.parse(localStorage.getItem('wellman_bookmarks') || '[]')
  
  if (isBookmarked.value) {
    // Remove bookmark
    const filteredBookmarks = bookmarks.filter(bookmark => 
      !(bookmark.articleId === article.value.id && bookmark.userId === authStore.currentUser.id)
    )
    localStorage.setItem('wellman_bookmarks', JSON.stringify(filteredBookmarks))
    isBookmarked.value = false
  } else {
    // Add bookmark
    const newBookmark = {
      id: Date.now(),
      articleId: article.value.id,
      userId: authStore.currentUser.id,
      timestamp: new Date().toISOString()
    }
    bookmarks.push(newBookmark)
    localStorage.setItem('wellman_bookmarks', JSON.stringify(bookmarks))
    isBookmarked.value = true
  }
}

// Rating functions
const openRatingModal = () => {
  if (!authStore.isAuthenticated) {
    alert('Please sign in to leave a review.')
    return
  }
  
  if (!article.value) {
    console.error('Article not loaded')
    return
  }
  
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

  if (!article.value) {
    console.error('Article not loaded')
    return
  }

  const newReview = {
    id: Date.now(),
    resourceId: article.value.id,
    userId: authStore.currentUser.id,
    userName: `${authStore.currentUser.firstName} ${authStore.currentUser.lastName}`,
    userEmail: authStore.currentUser.email,
    rating: ratingForm.rating,
    review: ratingForm.review.trim(),
    helpful: ratingForm.helpful,
    createdAt: new Date().toISOString(),
    status: authStore.isAdmin ? 'approved' : 'pending'
  }

  // Add review to localStorage
  const allReviews = JSON.parse(localStorage.getItem('wellman_reviews') || '[]')
  allReviews.push(newReview)
  localStorage.setItem('wellman_reviews', JSON.stringify(allReviews))

  // Update article rating
  updateArticleRating()

  // Close modal and reload reviews
  showRatingModal.value = false
  loadReviews()

  alert('Thank you for your review! It will be visible once approved.')
}

const updateArticleRating = () => {
  const allReviews = JSON.parse(localStorage.getItem('wellman_reviews') || '[]')
  const articleReviews = allReviews.filter(review => 
    review.resourceId === article.value.id && review.status === 'approved'
  )

  if (articleReviews.length > 0) {
    const averageRating = articleReviews.reduce((sum, review) => sum + review.rating, 0) / articleReviews.length
    
    // Update article in localStorage
    const allResources = JSON.parse(localStorage.getItem('wellman_resources') || '[]')
    const resourceIndex = allResources.findIndex(r => r.id === article.value.id)
    
    if (resourceIndex !== -1) {
      allResources[resourceIndex].rating = Math.round(averageRating * 10) / 10
      allResources[resourceIndex].reviewCount = articleReviews.length
      localStorage.setItem('wellman_resources', JSON.stringify(allResources))
      
      // Update local state
      article.value.rating = allResources[resourceIndex].rating
      article.value.reviewCount = allResources[resourceIndex].reviewCount
    }
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

const getCategoryIcon = (category) => {
  const icons = {
    'fitness': '🏃‍♂️',
    'nutrition': '🥗',
    'mental-health': '🧠',
    'preventive-care': '🩺',
    'lifestyle': '🌱'
  }
  return icons[category] || '📚'
}

const getCategoryName = (category) => {
  const names = {
    'fitness': 'Fitness & Exercise',
    'nutrition': 'Nutrition & Diet',
    'mental-health': 'Mental Health',
    'preventive-care': 'Preventive Care',
    'lifestyle': 'Lifestyle'
  }
  return names[category] || 'Unknown'
}

onMounted(() => {
  loadArticle()
})
</script>

<template>
  <div class="container">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading article...</p>
    </div>

    <!-- Article Content -->
    <div v-else-if="article" class="row">
      <!-- Main Article -->
      <div class="col-lg-8">
        <article class="article-content">
          <!-- Article Header -->
          <header class="article-header mb-4">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <RouterLink to="/resources">Resources</RouterLink>
                </li>
                <li class="breadcrumb-item">
                  <RouterLink :to="`/resources?category=${article.category}`">
                    {{ getCategoryName(article.category) }}
                  </RouterLink>
                </li>
                <li class="breadcrumb-item active" aria-current="page">{{ article.title }}</li>
              </ol>
            </nav>

            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1 class="article-title">{{ article.title }}</h1>
                <div class="article-meta">
                  <span class="badge bg-secondary me-2">
                    {{ getCategoryIcon(article.category) }} {{ getCategoryName(article.category) }}
                  </span>
                  <small class="text-muted">
                    <i class="bi bi-clock me-1"></i>{{ article.readTime }}
                  </small>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button 
                  class="btn btn-outline-primary btn-sm"
                  @click="toggleBookmark"
                  :title="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
                >
                  <i class="bi" :class="isBookmarked ? 'bi-bookmark-fill' : 'bi-bookmark'"></i>
                </button>
                <button class="btn btn-primary btn-sm" @click="openRatingModal">
                  <i class="bi bi-star me-2"></i>Rate & Review
                </button>
              </div>
            </div>

            <div class="article-author mb-3">
              <div class="d-flex align-items-center">
                <div class="avatar-placeholder me-3">
                  <i class="bi bi-person-circle text-primary"></i>
                </div>
                <div>
                  <div class="fw-semibold">{{ article.author }}</div>
                  <small class="text-muted">Published {{ formatDate(article.createdAt) }}</small>
                </div>
              </div>
            </div>

            <!-- Rating Summary -->
            <div class="rating-summary mb-4">
              <div class="d-flex align-items-center">
                <div class="stars me-2">
                  <span class="text-warning">{{ '★'.repeat(Math.floor(averageRating)) }}{{ '☆'.repeat(5 - Math.floor(averageRating)) }}</span>
                </div>
                <span class="fw-semibold me-2">{{ averageRating }}</span>
                <span class="text-muted me-3">({{ reviewCount }} reviews)</span>
                <button class="btn btn-link btn-sm p-0" @click="showReviews = !showReviews">
                  {{ showReviews ? 'Hide' : 'Show' }} reviews
                </button>
              </div>
            </div>
          </header>

          <!-- Article Image -->
          <div class="article-image mb-4">
            <img 
              :src="article.image" 
              :alt="article.title"
              class="img-fluid rounded"
              style="width: 100%; height: 300px; object-fit: cover;"
            >
          </div>

          <!-- Article Content -->
          <div class="article-body">
            <div class="content-text">
              <p>{{ article.content }}</p>
            </div>
          </div>

          <!-- Article Tags -->
          <div class="article-tags mt-4">
            <h6>Tags:</h6>
            <div class="d-flex flex-wrap gap-2">
              <span 
                v-for="tag in article.tags" 
                :key="tag"
                class="badge bg-light text-dark"
              >
                #{{ tag }}
              </span>
            </div>
          </div>

          <!-- Reviews Section -->
          <div v-if="showReviews" class="reviews-section mt-5">
            <h4>Reviews ({{ reviewCount }})</h4>
            
            <div v-if="reviews.length === 0" class="text-center py-4">
              <i class="bi bi-chat-dots text-muted display-4"></i>
              <p class="mt-3 text-muted">No reviews yet. Be the first to review this article!</p>
            </div>
            
            <div v-else>
              <div v-for="review in reviews.slice(0, 5)" :key="review.id" class="review-item card mb-3">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 class="mb-1">{{ review.userName }}</h6>
                      <div class="d-flex align-items-center">
                        <span class="text-warning me-2">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
                        <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
                      </div>
                    </div>
                  </div>
                  <p class="mb-0">{{ review.review }}</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Sidebar -->
      <div class="col-lg-4">
        <div class="sidebar">
          <!-- Related Articles -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Related Articles</h5>
            </div>
            <div class="card-body">
              <div v-for="related in relatedArticles" :key="related.id" class="related-article mb-3">
                <RouterLink :to="`/article/${related.id}`" class="text-decoration-none">
                  <div class="d-flex">
                    <img 
                      :src="related.image" 
                      :alt="related.title"
                      class="related-image me-3"
                      style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;"
                    >
                    <div>
                      <h6 class="mb-1">{{ related.title }}</h6>
                      <small class="text-muted">{{ related.readTime }}</small>
                    </div>
                  </div>
                </RouterLink>
              </div>
            </div>
          </div>

          <!-- Article Stats -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">Article Stats</h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-6">
                  <div class="h4 text-primary mb-1">{{ averageRating }}</div>
                  <div class="small text-muted">Average Rating</div>
                </div>
                <div class="col-6">
                  <div class="h4 text-success mb-1">{{ reviewCount }}</div>
                  <div class="small text-muted">Total Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rating Modal -->
    <div v-if="article" class="modal fade" :class="{ show: showRatingModal }" :style="{ display: showRatingModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Rate & Review</h5>
            <button type="button" class="btn-close" @click="showRatingModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <h6>{{ article.title }}</h6>
              <p class="text-muted mb-0">{{ article.author }}</p>
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
                  placeholder="Share your thoughts about this article..."
                  required
                ></textarea>
              </div>
              
              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="ratingForm.helpful" id="helpful">
                  <label class="form-check-label" for="helpful">
                    This article was helpful to me
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
    
    <!-- Modal Backdrop -->
    <div v-if="showRatingModal && article" class="modal-backdrop fade show"></div>
  </div>
</template>

<style scoped>
.article-content {
  max-width: 100%;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--gray-900);
}

.article-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.rating-summary {
  padding: 1rem;
  background-color: var(--light);
  border-radius: var(--border-radius);
}

.content-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--gray-700);
}

.review-item {
  border: 1px solid var(--gray-200);
}

.related-article:hover {
  background-color: var(--light);
  border-radius: var(--border-radius);
  padding: 0.5rem;
  margin: -0.5rem;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }
  
  .content-text {
    font-size: 1rem;
  }
}
</style>
