<script setup>
import { ref, onMounted } from 'vue'

const stats = ref([
  { number: '10K+', label: 'Active Users' },
  { number: '500+', label: 'Health Articles' },
  { number: '95%', label: 'Satisfaction Rate' },
  { number: '24/7', label: 'Support Available' }
])

const features = ref([
  {
    icon: '🏃‍♂️',
    title: 'Fitness',
    description: 'Personalized workout plans and progress tracking'
  },
  {
    icon: '🥗',
    title: 'Nutrition',
    description: 'Expert dietary guidance and meal planning'
  },
  {
    icon: '🧠',
    title: 'Mental Wellbeing',
    description: 'Stress management and mental health support'
  },
  {
    icon: '📅',
    title: 'Appointments',
    description: 'Easy booking with healthcare professionals'
  }
])

const animatedStats = ref(false)

onMounted(() => {
  // Trigger animations when component mounts
  setTimeout(() => {
    animatedStats.value = true
  }, 300)
})
</script>

<template>
  <!-- Hero section with edge-to-edge design -->
  <div class="hero-edge-to-edge mb-5 slide-up">
    <div class="container">
      <div class="row align-items-center g-4">
        <div class="col-md-6">
          <span class="eyebrow">Empowering healthier lives</span>
          <h1>Empowering Men's Health, Anytime, Anywhere</h1>
          <p class="lead">Access evidence-based resources, track wellness goals, and connect with a supportive community dedicated to men's health.</p>
          <div class="d-flex gap-3 flex-wrap">
            <RouterLink to="/resources" class="btn btn-primary btn-lg">
              Explore Resources
            </RouterLink>
            <RouterLink to="/appointments" class="btn btn-outline-primary btn-lg">
              Book an Appointment
            </RouterLink>
          </div>

          <!-- Stats section -->
          <div class="stats">
            <div v-for="(stat, index) in stats" :key="index" class="stat">
              <div class="k">{{ stat.number }}</div>
              <div class="cap">{{ stat.label }}</div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-lg">
            <div class="ratio ratio-16x9 rounded overflow-hidden">
              <video class="w-100 h-100 object-fit-cover" autoplay muted loop playsinline aria-label="Men's health lifestyle video">
                <source src="/mens-health.mp4" type="video/mp4" />
                <p class="text-muted m-0">Your browser does not support the video tag.</p>
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Features section -->
  <div class="container">
    <div class="row g-4 mb-5">
      <div class="col-12">
        <h2 class="text-center mb-5">What We Offer</h2>
      </div>
      <div v-for="(feature, index) in features" :key="index" class="col-6 col-md-3">
        <div class="card h-100 hoverable text-center">
          <div class="card-body">
            <div class="display-4 mb-3">{{ feature.icon }}</div>
            <h5 class="card-title">{{ feature.title }}</h5>
            <p class="card-text text-muted small">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to action section -->
    <div class="row">
      <div class="col-12">
        <div class="card bg-primary text-white border-0 shadow-lg">
          <div class="card-body text-center py-5">
            <h3 class="mb-3">Ready to Start Your Health Journey?</h3>
            <p class="lead mb-4">Join thousands of men who are taking control of their health with WellMan Connect.</p>
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <RouterLink to="/signup" class="btn btn-light btn-lg">
                Get Started Free
              </RouterLink>
              <RouterLink to="/resources" class="btn btn-outline-light btn-lg">
                Learn More
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-edge-to-edge {
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--light) 100%);
  padding: 4rem 0;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  width: 100vw;
  position: relative;
  overflow: hidden;
}

.hero-edge-to-edge::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.hero-edge-to-edge h1 {
  color: var(--gray-900);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.hero-edge-to-edge .lead {
  color: var(--gray-600);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  margin-bottom: 2rem;
  max-width: 600px;
}

.eyebrow {
  display: inline-block;
  background: var(--success);
  color: var(--white);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.object-fit-cover {
  object-fit: cover;
}

.display-4 {
  font-size: 3rem;
}

@media (max-width: 768px) {
  .display-4 {
    font-size: 2.5rem;
  }
  
  .hero-edge-to-edge {
    text-align: center;
    padding: 3rem 0;
  }
  
  .hero-edge-to-edge .lead {
    margin-left: auto;
    margin-right: auto;
  }
}

@media (max-width: 576px) {
  .hero-edge-to-edge {
    padding: 2rem 0;
  }
  
  .hero-edge-to-edge h1 {
    font-size: 1.75rem;
  }
  
  .hero-edge-to-edge .lead {
    font-size: 1rem;
  }
}
</style>



