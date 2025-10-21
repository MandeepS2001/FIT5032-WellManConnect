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
    - Accessibility features and responsive design
  -->
  
  <!-- Skip to content link for screen readers -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  
  <!-- Error Alert -->
  <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show m-0" role="alert">
    <i class="bi bi-exclamation-triangle-fill me-2"></i>
    {{ errorMessage }}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>

  <nav class="navbar navbar-expand-lg sticky-top" role="navigation" aria-label="Main navigation">
    <div class="container">
      <div class="navbar-brand">
        <span class="text-primary">WellMan</span> Connect
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
        <ul class="navbar-nav me-auto mb-2 mb-lg-0" role="menubar">
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
          <!-- Admin-only navigation items -->
          <li v-if="isAdmin" class="nav-item">
            <RouterLink class="nav-link" to="/data-tables">Data Tables</RouterLink>
          </li>
          <li v-if="isAdmin" class="nav-item">
            <RouterLink class="nav-link" to="/email">Email Service</RouterLink>
          </li>
          <li v-if="isAdmin" class="nav-item">
            <RouterLink class="nav-link" to="/email-composer">Email Composer</RouterLink>
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
        <div class="d-flex gap-3 align-items-center">
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
            <RouterLink to="/login" class="btn btn-outline-primary px-4">
              Sign In
            </RouterLink>
            <RouterLink to="/signup" class="btn btn-primary px-4">
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
  <main id="main-content" class="container-xxl my-4 fade-in" v-else role="main">
    <RouterView />
  </main>

  <!-- Footer -->
  <footer role="contentinfo">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-md-6">
          <div class="d-flex align-items-center">
            <strong>WellMan</strong> Connect — Empowering men's health through technology
          </div>
        </div>
        <div class="col-md-6 text-md-end">
          <nav class="d-flex gap-3 justify-content-md-end" role="navigation" aria-label="Footer navigation">
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
/* Force light theme for navbar and footer to ensure readability */
.navbar {
  background: #ffffff !important;
  border-bottom: 1px solid #e5e7eb !important;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
}

.navbar-brand {
  color: #111827 !important;
  font-weight: 700;
}

.navbar-nav .nav-link {
  color: #4b5563 !important;
  font-weight: 500;
}

.navbar-nav .nav-link:hover {
  color: #2563eb !important;
  background-color: #dbeafe !important;
}

.navbar-nav .nav-link.router-link-active {
  color: #2563eb !important;
  background-color: #dbeafe !important;
  font-weight: 600;
}

/* Footer styling */
footer {
  background: #f9fafb !important;
  border-top: 1px solid #e5e7eb !important;
  color: #374151 !important;
}

footer a {
  color: #6b7280 !important;
}

footer a:hover {
  color: #2563eb !important;
}

footer strong {
  color: #111827 !important;
}

/* Button styling improvements */
.btn {
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.btn-outline-primary {
  border-width: 1.5px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.15);
}

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
