<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()

const isLoading = ref(true)

// Computed properties for dynamic navigation
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.currentUser)
const isAdmin = computed(() => authStore.isAdmin)
const isPremium = computed(() => authStore.isPremium)

// Error message from route query
const errorMessage = computed(() => {
  if (route.query.error === 'access_denied') {
    return 'Access denied. You do not have permission to view this page.'
  }
  return null
})

// Logout function
const handleLogout = () => {
  authStore.logout()
}

onMounted(() => {
  // Initialize authentication
  authStore.initializeAuth()
  
  // Start session refresh
  authStore.startSessionRefresh()
  
  // Simulate loading time for better UX
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})
</script>

<template>
  <!--
    Enhanced global layout with authentication:
    - Dynamic navbar based on authentication state
    - Role-based navigation items
    - Session management and logout functionality
    - Professional footer
  -->
  
  <!-- Error Alert -->
  <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show m-0" role="alert">
    <i class="bi bi-exclamation-triangle-fill me-2"></i>
    {{ errorMessage }}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>

  <nav class="navbar navbar-expand-lg sticky-top">
    <div class="container">
      <div class="navbar-brand">
        <span class="text-primary">WellMan</span> Connect
        <span class="badge bg-primary ms-2">Beta</span>
      </div>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Home</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/resources">Health & Resources</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/tools">Tools & Trackers</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/appointments">Book an Appointment</RouterLink>
          </li>
          
          <!-- Authenticated user navigation -->
          <li v-if="isAuthenticated" class="nav-item">
            <RouterLink class="nav-link" to="/account">My Account</RouterLink>
          </li>
          
          <!-- Admin navigation -->
          <li v-if="isAdmin" class="nav-item">
            <RouterLink class="nav-link" to="/admin">Admin Panel</RouterLink>
          </li>
        </ul>
        
        <!-- Authentication buttons -->
        <div class="d-flex gap-2 align-items-center">
          <!-- User info when authenticated -->
          <div v-if="isAuthenticated" class="d-flex align-items-center gap-2 me-3">
            <div class="text-end d-none d-md-block">
              <div class="small fw-semibold">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</div>
              <div class="small text-muted">
                <span class="badge" :class="{
                  'bg-danger': isAdmin,
                  'bg-warning': isPremium,
                  'bg-secondary': !isAdmin && !isPremium
                }">
                  {{ isAdmin ? 'Admin' : isPremium ? 'Premium' : 'User' }}
                </span>
              </div>
            </div>
            <div class="dropdown">
              <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-1"></i>
                <span class="d-none d-sm-inline">Menu</span>
              </button>
              <ul class="dropdown-menu">
                <li><RouterLink class="dropdown-item" to="/profile">
                  <i class="bi bi-person me-2"></i>Profile
                </RouterLink></li>
                <li><RouterLink class="dropdown-item" to="/account">
                  <i class="bi bi-gear me-2"></i>Settings
                </RouterLink></li>
                <li v-if="isAdmin"><RouterLink class="dropdown-item" to="/admin">
                  <i class="bi bi-shield-check me-2"></i>Admin Panel
                </RouterLink></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger" @click="handleLogout">
                  <i class="bi bi-box-arrow-right me-2"></i>Sign Out
                </button></li>
              </ul>
            </div>
          </div>
          
          <!-- Login/Signup when not authenticated -->
          <template v-else>
            <RouterLink to="/login" class="btn btn-outline-primary">
              Sign In
            </RouterLink>
            <RouterLink to="/signup" class="btn btn-primary">
              Sign Up
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>

  <!-- Loading overlay -->
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-spinner">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading WellMan Connect...</p>
    </div>
  </div>

  <!-- Main content -->
  <main class="container-xxl my-4 fade-in" v-else>
    <RouterView />
  </main>

  <!-- Footer -->
  <footer>
    <div class="container">
      <div class="row align-items-center">
        <div class="col-md-6">
          <div class="d-flex align-items-center">
            <strong>WellMan</strong> Connect — Empowering men's health through technology
          </div>
        </div>
        <div class="col-md-6 text-md-end">
          <nav class="d-flex gap-3 justify-content-md-end">
            <a href="#" class="text-muted text-decoration-none small">Privacy</a>
            <a href="#" class="text-muted text-decoration-none small">Terms</a>
            <a href="#" class="text-muted text-decoration-none small">Contact</a>
          </nav>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  text-align: center;
}

.dropdown-item {
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: var(--primary-light);
}

@media (max-width: 768px) {
  .navbar-nav .nav-link {
    padding: 0.5rem 0;
  }
}
</style>
