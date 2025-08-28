<script setup>
</script>

<template>
  <!-- Hero section wrapped in gradient container -->
  <div class="hero mb-4">
    <div class="row align-items-center g-4">
      <div class="col-md-6">
        <h1 class="display-5 fw-bold">Empowering Men's Health, Anytime, Anywhere</h1>
        <p class="lead lead-muted">Access resources, track goals, and connect with community.</p>
        <div class="d-flex gap-2">
          <RouterLink to="/resources" class="btn btn-primary btn-lg">Explore Resources</RouterLink>
          <RouterLink to="/appointments" class="btn btn-outline-primary btn-lg">Book an Appointment</RouterLink>
        </div>
      </div>
      <div class="col-md-6">
        <div class="ratio ratio-16x9 rounded shadow-sm overflow-hidden">
          <video class="w-100 h-100" autoplay muted loop playsinline aria-label="Men's health lifestyle video">
            <source src="/mens-health.mp4" type="video/mp4" />
            <p class="text-muted m-0">Your browser does not support the video tag.</p>
          </video>
        </div>
      </div>
    </div>
  </div>

  <hr class="my-5" />
  <div class="row text-center g-4">
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100 hoverable">
        <div class="card-body">
          <div class="display-6">🏃‍♂️</div>
          <h6 class="mt-2">Fitness</h6>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100 hoverable">
        <div class="card-body">
          <div class="display-6">🥗</div>
          <h6 class="mt-2">Nutrition</h6>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100 hoverable">
        <div class="card-body">
          <div class="display-6">🧠</div>
          <h6 class="mt-2">Mental Wellbeing</h6>
        </div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="card border-0 shadow-sm h-100 hoverable">
        <div class="card-body">
          <div class="display-6">📅</div>
          <h6 class="mt-2">Appointments</h6>
        </div>
      </div>
    </div>
  </div>
</template>


