<script setup>
// Displays dynamic resources. First load seeds default data,
// then persists to LocalStorage so data survives reloads (BR B.2).
import { ref, onMounted } from 'vue'

const resources = ref([])

onMounted(() => {
  const stored = localStorage.getItem('wmc_resources')
  if (stored) {
    resources.value = JSON.parse(stored)
  } else {
    resources.value = [
      { id: 1, title: 'Fitness Basics', category: 'Fitness' },
      { id: 2, title: 'Nutrition for Busy Men', category: 'Nutrition' },
      { id: 3, title: 'Managing Stress', category: 'Mental Wellbeing' },
    ]
    localStorage.setItem('wmc_resources', JSON.stringify(resources.value))
  }
})
</script>

<template>
  <div>
    <div class="d-flex align-items-end justify-content-between mb-3">
      <div>
        <h2 class="mb-0">Health & Resources</h2>
        <small class="text-muted">Dynamic list stored in LocalStorage</small>
      </div>
      <RouterLink class="btn btn-sm btn-outline-primary" to="/tools">Open Goal Tracker</RouterLink>
    </div>
    <div class="row g-3">
      <div v-for="r in resources" :key="r.id" class="col-12 col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <span class="badge bg-secondary float-end">{{ r.category }}</span>
            <h5 class="card-title">{{ r.title }}</h5>
            <p class="card-text text-muted">Curated guidance tailored for men's health.</p>
            <button class="btn btn-outline-secondary btn-sm">Read</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


