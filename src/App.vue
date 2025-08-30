<script setup>
import { ref, onMounted } from 'vue'

const isLoading = ref(true)

onMounted(() => {
  // Simulate loading time for better UX
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})
</script>

<template>
  <!--
    Clean, professional healthcare layout:
    - Simple, accessible navbar
    - Loading states and smooth animations
    - Professional footer
  -->
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
          <li class="nav-item">
            <RouterLink class="nav-link" to="/account">User Account</RouterLink>
          </li>
        </ul>
        <div class="d-flex gap-2">
          <RouterLink to="/signup" class="btn btn-primary">Sign Up</RouterLink>
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
}

.loading-spinner {
  text-align: center;
}
</style>
