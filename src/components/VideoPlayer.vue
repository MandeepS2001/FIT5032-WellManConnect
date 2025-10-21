<template>
  <div class="video-container position-relative">
    <!-- Try to load local video first -->
    <video 
      v-if="!showFallback"
      ref="videoElement"
      class="w-100 h-100 object-fit-cover" 
      autoplay 
      muted 
      loop 
      playsinline 
      preload="metadata"
      aria-label="Men's health lifestyle video"
      @error="handleVideoError"
      @loadeddata="handleVideoLoaded"
    >
      <source src="/mens-health.mp4" type="video/mp4" />
    </video>
    
    <!-- Fallback content when video fails -->
    <div v-else class="video-fallback d-flex align-items-center justify-content-center h-100 bg-primary text-white">
      <div class="text-center">
        <i class="bi bi-play-circle-fill display-1 mb-3"></i>
        <h4>Men's Health Video</h4>
        <p class="mb-0">Video temporarily unavailable</p>
        <small class="text-light">Experience our health resources below</small>
      </div>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="loading" class="video-loading position-absolute top-50 start-50 translate-middle text-center text-white">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading video...</span>
      </div>
      <p class="mt-2 mb-0">Loading video...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const videoElement = ref(null)
const showFallback = ref(false)
const loading = ref(true)

const handleVideoError = () => {
  console.log('Video failed to load, showing fallback content')
  showFallback.value = true
  loading.value = false
}

const handleVideoLoaded = () => {
  console.log('Video loaded successfully')
  loading.value = false
}

onMounted(() => {
  // Set a timeout to show fallback if video doesn't load within 5 seconds
  const timeout = setTimeout(() => {
    if (loading.value) {
      console.log('Video loading timeout, showing fallback')
      showFallback.value = true
      loading.value = false
    }
  }, 5000)

  // Clean up timeout when component unmounts
  onUnmounted(() => {
    clearTimeout(timeout)
  })
})
</script>

<style scoped>
.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-loading {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
  padding: 1rem;
}
</style>
