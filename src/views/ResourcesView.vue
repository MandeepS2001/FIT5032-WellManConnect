<script setup>
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
    <h2>Health & Resources</h2>
    <p class="text-muted">Dynamic list stored in LocalStorage.</p>
    <ul class="list-group">
      <li v-for="r in resources" :key="r.id" class="list-group-item d-flex justify-content-between align-items-center">
        <span>{{ r.title }}</span>
        <span class="badge bg-secondary">{{ r.category }}</span>
      </li>
    </ul>
  </div>
</template>


