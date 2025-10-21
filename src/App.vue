<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useRoute } from 'vue-router'
import { focusManagement, ariaUtils, keyboardNavigation, motionAccessibility } from './utils/accessibility'

const authStore = useAuthStore()
const route = useRoute()

const isLoading = ref(true)
const mainContentRef = ref(null)

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

// Mobile menu collapse function
const collapseMobileMenu = async () => {
  // Wait for Vue to update the DOM
  await nextTick()
  
  // Add a small delay to ensure the navigation happens first
  setTimeout(() => {
    const navbarCollapse = document.getElementById('navbarNav')
    const navbarToggler = document.querySelector('.navbar-toggler')
    
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      // Method 1: Use Bootstrap's collapse method
      if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
        try {
          const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
            toggle: false
          })
          bsCollapse.hide()
        } catch (error) {
          console.log('Bootstrap collapse error, using fallback:', error)
          // Fallback to manual method
          navbarCollapse.classList.remove('show')
          if (navbarToggler) {
            navbarToggler.setAttribute('aria-expanded', 'false')
          }
        }
      } 
      // Method 2: Use data attributes to trigger collapse
      else if (navbarToggler) {
        navbarToggler.click()
      }
      // Method 3: Manual fallback
      else {
        navbarCollapse.classList.remove('show')
        navbarCollapse.classList.remove('collapsing')
        if (navbarToggler) {
          navbarToggler.setAttribute('aria-expanded', 'false')
        }
      }
    }
  }, 150)
}

// Accessibility functions
const handleSkipToContent = (event) => {
  event.preventDefault()
  if (mainContentRef.value) {
    focusManagement.setFocus(mainContentRef.value)
    ariaUtils.announce('Skipped to main content', 'polite')
  }
}

const handleKeyDown = (event) => {
  keyboardNavigation.handleEscapeKey(event, () => {
    // Handle escape key for closing modals, dropdowns, etc.
    const activeModal = document.querySelector('.modal.show')
    if (activeModal) {
      const closeButton = activeModal.querySelector('[data-bs-dismiss="modal"]')
      if (closeButton) closeButton.click()
    }
    
    const activeDropdown = document.querySelector('.dropdown-menu.show')
    if (activeDropdown) {
      const dropdownToggle = document.querySelector('[data-bs-toggle="dropdown"][aria-expanded="true"]')
      if (dropdownToggle) dropdownToggle.click()
    }
  })
}

// Watch for route changes to announce page changes to screen readers
watch(route, (newRoute) => {
  nextTick(() => {
    const pageTitle = document.title
    ariaUtils.announce(`Navigated to ${pageTitle}`, 'polite')
  })
})

onMounted(() => {
  // Initialize authentication
  authStore.initializeAuth()
  
  // Start session refresh
  authStore.startSessionRefresh()
  
  // Add global keyboard event listener
  document.addEventListener('keydown', handleKeyDown)
  
  // Apply reduced motion preferences
  if (motionAccessibility.prefersReducedMotion()) {
    document.body.classList.add('reduced-motion')
  }
  
  // Simulate loading time for better UX
  setTimeout(() => {
    isLoading.value = false
    ariaUtils.announce('Page loaded successfully', 'polite')
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
  <a 
    href="#main-content" 
    class="skip-link"
    @click="handleSkipToContent"
    aria-label="Skip to main content"
  >
    Skip to main content
  </a>
  
  <!-- Error Alert -->
  <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show m-0" role="alert" aria-live="assertive">
    <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
    {{ errorMessage }}
    <button 
      type="button" 
      class="btn-close" 
      data-bs-dismiss="alert"
      aria-label="Close error message"
    ></button>
  </div>

  <nav class="navbar navbar-expand-lg sticky-top" role="navigation" aria-label="Main navigation">
    <div class="container">
      <RouterLink to="/" class="navbar-brand">
        <span class="text-primary">WellMan</span> Connect
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle main navigation menu"
        aria-describedby="navbar-description"
      >
        <span class="navbar-toggler-icon" aria-hidden="true"></span>
        <span id="navbar-description" class="sr-only">Opens and closes the main navigation menu</span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0" role="menubar" aria-label="Main navigation menu">
          <li class="nav-item" role="none">
            <RouterLink 
              class="nav-link" 
              to="/" 
              @click="collapseMobileMenu"
              role="menuitem"
              aria-label="Go to home page"
            >
              Home
            </RouterLink>
          </li>
          <li class="nav-item" role="none">
            <RouterLink 
              class="nav-link" 
              to="/resources" 
              @click="collapseMobileMenu"
              role="menuitem"
              aria-label="View health resources and articles"
            >
              Health & Resources
            </RouterLink>
          </li>
          <li class="nav-item" role="none">
            <RouterLink 
              class="nav-link" 
              to="/tools" 
              @click="collapseMobileMenu"
              role="menuitem"
              aria-label="Access health tools and trackers"
            >
              Tools & Trackers
            </RouterLink>
          </li>
          <li class="nav-item" role="none">
            <RouterLink 
              class="nav-link" 
              to="/appointments" 
              @click="collapseMobileMenu"
              role="menuitem"
              aria-label="Book a healthcare appointment"
            >
              Book an Appointment
            </RouterLink>
          </li>
          <!-- Admin-only navigation items -->
          <li v-if="isAdmin" class="nav-item" role="none">
            <RouterLink 
              class="nav-link" 
              to="/data-tables" 
              @click="collapseMobileMenu"
              role="menuitem"
              aria-label="Access admin data tables (admin only)"
            >
              Data Tables
            </RouterLink>
          </li>
          <li v-if="isAdmin" class="nav-item" role="none">
            <RouterLink 
              class="nav-link" 
              to="/email" 
              @click="collapseMobileMenu"
              role="menuitem"
              aria-label="Access email service (admin only)"
            >
              Email Service
            </RouterLink>
          </li>
          <li v-if="isAdmin" class="nav-item" role="none">
            <RouterLink 
              class="nav-link" 
              to="/email-composer" 
              @click="collapseMobileMenu"
              role="menuitem"
              aria-label="Access email composer (admin only)"
            >
              Email Composer
            </RouterLink>
          </li>
          
          <!-- Authenticated user navigation -->
          <li v-if="isAuthenticated" class="nav-item" role="none">
            <RouterLink 
              class="nav-link" 
              to="/account" 
              @click="collapseMobileMenu"
              role="menuitem"
              aria-label="Access your account dashboard"
            >
              My Account
            </RouterLink>
          </li>
          
          <!-- Admin navigation -->
          <li v-if="isAdmin" class="nav-item" role="none">
            <RouterLink 
              class="nav-link" 
              to="/admin" 
              @click="collapseMobileMenu"
              role="menuitem"
              aria-label="Access admin panel (admin only)"
            >
              Admin Panel
            </RouterLink>
          </li>
        </ul>
        
        <!-- Authentication buttons -->
        <div class="d-flex gap-3 align-items-center justify-content-center" role="group" aria-label="User authentication and account actions">
          <!-- User info when authenticated -->
          <div v-if="isAuthenticated" class="d-flex align-items-center gap-2 me-3" role="group" aria-label="User account information">
            <div class="text-end d-none d-md-block">
              <div class="small fw-semibold" aria-label="User full name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</div>
              <div class="small text-muted">
                <span class="badge" :class="{
                  'bg-danger': isAdmin,
                  'bg-warning': isPremium,
                  'bg-secondary': !isAdmin && !isPremium
                }" role="status" :aria-label="`${isAdmin ? 'Administrator' : isPremium ? 'Premium' : 'Regular'} user status`">
                  {{ isAdmin ? 'Admin' : isPremium ? 'Premium' : 'User' }}
                </span>
              </div>
            </div>
            <div class="dropdown">
              <button 
                class="btn btn-outline-primary btn-sm dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="User account menu"
                aria-haspopup="true"
              >
                <i class="bi bi-person-circle me-1" aria-hidden="true"></i>
                <span class="d-none d-sm-inline">Menu</span>
              </button>
              <ul class="dropdown-menu" role="menu" aria-label="User account actions">
                <li role="none">
                  <RouterLink 
                    class="dropdown-item" 
                    to="/profile" 
                    @click="collapseMobileMenu"
                    role="menuitem"
                    aria-label="View and edit your profile"
                  >
                    <i class="bi bi-person me-2" aria-hidden="true"></i>Profile
                  </RouterLink>
                </li>
                <li role="none">
                  <RouterLink 
                    class="dropdown-item" 
                    to="/account" 
                    @click="collapseMobileMenu"
                    role="menuitem"
                    aria-label="Access account settings"
                  >
                    <i class="bi bi-gear me-2" aria-hidden="true"></i>Settings
                  </RouterLink>
                </li>
                <li v-if="isAdmin" role="none">
                  <RouterLink 
                    class="dropdown-item" 
                    to="/admin" 
                    @click="collapseMobileMenu"
                    role="menuitem"
                    aria-label="Access admin panel (admin only)"
                  >
                    <i class="bi bi-shield-check me-2" aria-hidden="true"></i>Admin Panel
                  </RouterLink>
                </li>
                <li><hr class="dropdown-divider" role="separator"></li>
                <li role="none">
                  <button 
                    class="dropdown-item text-danger" 
                    @click="handleLogout"
                    role="menuitem"
                    aria-label="Sign out of your account"
                  >
                    <i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Login/Signup when not authenticated -->
          <template v-else>
            <RouterLink 
              to="/login" 
              class="btn btn-outline-primary px-4"
              aria-label="Sign in to your account"
            >
              Sign In
            </RouterLink>
            <RouterLink 
              to="/signup" 
              class="btn btn-primary px-4"
              aria-label="Create a new account"
            >
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
  <main id="main-content" class="container-xxl my-4 fade-in" v-else role="main" ref="mainContentRef" aria-label="Main content">
    <RouterView />
  </main>

  <!-- Footer -->
  <footer role="contentinfo" aria-label="Site footer">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-md-6">
          <div class="d-flex align-items-center">
            <strong>WellMan</strong> Connect — <span aria-label="Empowering men's health through technology">Empowering men's health through technology</span>
          </div>
        </div>
        <div class="col-md-6 text-md-end">
          <nav class="d-flex gap-3 justify-content-md-end" role="navigation" aria-label="Footer navigation">
            <a href="#" class="text-muted text-decoration-none small" aria-label="Privacy policy">Privacy</a>
            <a href="#" class="text-muted text-decoration-none small" aria-label="Terms of service">Terms</a>
            <a href="#" class="text-muted text-decoration-none small" aria-label="Contact information">Contact</a>
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
  text-decoration: none;
}

.navbar-brand:hover {
  color: #111827 !important;
  text-decoration: none;
}

.navbar-nav .nav-link {
  color: #4b5563 !important;
  font-weight: 500;
  margin: 0 0.25rem;
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

/* Better alignment for auth buttons */
.d-flex.gap-3.align-items-center.justify-content-center {
  min-width: 200px;
  justify-content: flex-end !important;
}

/* Center the navigation menu */
.navbar-nav.mx-auto {
  margin-left: auto !important;
  margin-right: auto !important;
}

@media (max-width: 991px) {
  .d-flex.gap-3.align-items-center.justify-content-center {
    justify-content: center !important;
    width: 100%;
    margin-top: 1rem;
  }
  
  .navbar-nav.mx-auto {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
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
