<script setup>
import { ref, computed } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')

const errors = ref({})

const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const isPasswordStrong = computed(() => password.value.length >= 6)

const submit = () => {
  errors.value = {}
  if (!name.value.trim()) errors.value.name = 'Name is required'
  if (!email.value.trim()) errors.value.email = 'Email is required'
  else if (!isEmailValid.value) errors.value.email = 'Enter a valid email address'
  if (!isPasswordStrong.value) errors.value.password = 'Password must be at least 6 characters'

  if (Object.keys(errors.value).length === 0) {
    const users = JSON.parse(localStorage.getItem('wmc_users') || '[]')
    users.push({ id: Date.now(), name: name.value.trim(), email: email.value.trim() })
    localStorage.setItem('wmc_users', JSON.stringify(users))
    alert('Account created locally for demo!')
    name.value = ''
    email.value = ''
    password.value = ''
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <h2>Create Account</h2>
      <form @submit.prevent="submit" novalidate>
        <div class="mb-3">
          <label class="form-label">Name</label>
          <input v-model="name" type="text" class="form-control" :class="{ 'is-invalid': errors.name }"/>
          <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" :class="{ 'is-invalid': errors.email }"/>
          <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" :class="{ 'is-invalid': errors.password }"/>
          <div class="form-text">At least 6 characters.</div>
          <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
        </div>
        <button class="btn btn-primary w-100" type="submit">Sign Up</button>
      </form>
    </div>
  </div>
</template>


