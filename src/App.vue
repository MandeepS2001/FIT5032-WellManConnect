<script setup>
</script>

<template>
  <!--
    Global layout:
    - Responsive Bootstrap navbar with RouterLinks
    - Main container displaying current route via <RouterView>
    - Simple footer. Layout ensures minimum viewport height for content.
  -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
    <div class="container">
      <a class="navbar-brand fw-bold" href="#">
        <span class="text-primary">WellMan</span> Connect
      </a>
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
          <li class="nav-item"><RouterLink class="nav-link" to="/">Home</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/resources">Health & Resources</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/tools">Tools & Trackers</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/appointments">Book an Appointment</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/account">User Account</RouterLink></li>
        </ul>
        <div class="d-flex gap-2">
          <RouterLink to="/signup" class="btn btn-primary">Sign Up</RouterLink>
        </div>
      </div>
    </div>
  </nav>
  <main class="container-xxl my-4">
    <RouterView />
  </main>
  <footer class="bg-light py-3 mt-auto">
    <div class="container text-center small">© {{ new Date().getFullYear() }} WellMan Connect</div>
  </footer>
  
</template>

<style scoped>
main {
  min-height: 70vh;
}
</style>
