<template>
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <!-- Welcome Header -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="me-3">
                <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                  <i class="bi bi-person-fill text-white fs-4"></i>
                </div>
              </div>
              <div>
                <h2 class="mb-1">Welcome, {{ currentUser?.firstName || 'User' }}!</h2>
                <p class="text-muted mb-0">{{ currentUser?.email }}</p>
                <span class="badge" :class="{
                  'bg-danger': isAdmin,
                  'bg-warning': isPremium,
                  'bg-secondary': !isAdmin && !isPremium
                }">
                  {{ isAdmin ? 'Admin' : isPremium ? 'Premium' : 'User' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mb-4">
          <div class="col-md-6 mb-3">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-person-gear text-primary fs-1 mb-3"></i>
                <h5 class="card-title">Profile Settings</h5>
                <p class="card-text text-muted">Update your personal information and preferences</p>
                <RouterLink to="/profile" class="btn btn-primary">
                  <i class="bi bi-gear me-2"></i>Manage Profile
                </RouterLink>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-3">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-calendar-check text-success fs-1 mb-3"></i>
                <h5 class="card-title">Appointments</h5>
                <p class="card-text text-muted">Book and manage your healthcare appointments</p>
                <RouterLink to="/appointments" class="btn btn-success">
                  <i class="bi bi-calendar-plus me-2"></i>Book Appointment
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Health Resources -->
        <div class="row mb-4">
          <div class="col-md-6 mb-3">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-book text-info fs-1 mb-3"></i>
                <h5 class="card-title">Health Resources</h5>
                <p class="card-text text-muted">Access articles, guides, and health information</p>
                <RouterLink to="/resources" class="btn btn-info">
                  <i class="bi bi-book-open me-2"></i>Browse Resources
                </RouterLink>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-3">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-tools text-warning fs-1 mb-3"></i>
                <h5 class="card-title">Health Tools</h5>
                <p class="card-text text-muted">Use calculators, trackers, and wellness tools</p>
                <RouterLink to="/tools" class="btn btn-warning">
                  <i class="bi bi-calculator me-2"></i>Use Tools
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Panel (if admin) -->
        <div v-if="isAdmin" class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body text-center">
                <i class="bi bi-shield-check text-danger fs-1 mb-3"></i>
                <h5 class="card-title">Admin Panel</h5>
                <p class="card-text text-muted">Manage users, view analytics, and configure system settings</p>
                <RouterLink to="/admin" class="btn btn-danger">
                  <i class="bi bi-gear-wide-connected me-2"></i>Admin Dashboard
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Information -->
        <div class="row">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0">
                  <i class="bi bi-info-circle me-2"></i>Account Information
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <table class="table table-borderless">
                      <tbody>
                        <tr>
                          <td><strong>Name:</strong></td>
                          <td>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{{ currentUser?.email }}</td>
                        </tr>
                        <tr>
                          <td><strong>Role:</strong></td>
                          <td>
                            <span class="badge" :class="{
                              'bg-danger': isAdmin,
                              'bg-warning': isPremium,
                              'bg-secondary': !isAdmin && !isPremium
                            }">
                              {{ isAdmin ? 'Administrator' : isPremium ? 'Premium User' : 'Standard User' }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="col-md-6">
                    <table class="table table-borderless">
                      <tbody>
                        <tr>
                          <td><strong>Member Since:</strong></td>
                          <td>{{ formatDate(currentUser?.createdAt) }}</td>
                        </tr>
                        <tr>
                          <td><strong>Last Login:</strong></td>
                          <td>{{ formatDate(currentUser?.lastLogin) }}</td>
                        </tr>
                        <tr>
                          <td><strong>Account Status:</strong></td>
                          <td>
                            <span class="badge bg-success">
                              <i class="bi bi-check-circle me-1"></i>Active
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Quick Links (Admin Only) -->
        <div v-if="isAdmin" class="row mt-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0">
                  <i class="bi bi-shield-check me-2"></i>Admin Tools
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4 mb-2">
                    <RouterLink to="/data-tables" class="btn btn-outline-primary w-100">
                      <i class="bi bi-table me-2"></i>Data Tables
                    </RouterLink>
                  </div>
                  <div class="col-md-4 mb-2">
                    <RouterLink to="/email" class="btn btn-outline-info w-100">
                      <i class="bi bi-envelope me-2"></i>Email Service
                    </RouterLink>
                  </div>
                  <div class="col-md-4 mb-2">
                    <RouterLink to="/email-composer" class="btn btn-outline-success w-100">
                      <i class="bi bi-pencil-square me-2"></i>Email Composer
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Regular User Quick Links -->
        <div v-if="!isAdmin" class="row mt-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-light">
                <h5 class="mb-0">
                  <i class="bi bi-link-45deg me-2"></i>Quick Links
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-2">
                    <RouterLink to="/resources" class="btn btn-outline-info w-100">
                      <i class="bi bi-book me-2"></i>Health Resources
                    </RouterLink>
                  </div>
                  <div class="col-md-6 mb-2">
                    <RouterLink to="/tools" class="btn btn-outline-warning w-100">
                      <i class="bi bi-tools me-2"></i>Health Tools
                    </RouterLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// Computed properties
const currentUser = computed(() => authStore.currentUser)
const isAdmin = computed(() => authStore.isAdmin)
const isPremium = computed(() => authStore.isPremium)

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return 'N/A'
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}
</style>