<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// State
const activeTab = ref('profile')
const isLoading = ref(false)
const showPasswordModal = ref(false)
const showDeleteModal = ref(false)

// Profile form
const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  bio: ''
})

// Password change form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Validation
const validation = reactive({
  firstName: { isValid: false, message: '' },
  lastName: { isValid: false, message: '' },
  email: { isValid: false, message: '' },
  phoneNumber: { isValid: false, message: '' },
  currentPassword: { isValid: false, message: '' },
  newPassword: { isValid: false, message: '' },
  confirmPassword: { isValid: false, message: '' }
})

// User stats
const userStats = computed(() => {
  const user = authStore.currentUser
  if (!user) return {}
  
  // Get user's data from localStorage
  const resources = JSON.parse(localStorage.getItem('wellman_resources') || '[]')
  const appointments = JSON.parse(localStorage.getItem('wellman_appointments') || '[]')
  const goals = JSON.parse(localStorage.getItem('wellman_goals') || '[]')
  
  const userResources = resources.filter(r => r.author === `${user.firstName} ${user.lastName}`)
  const userAppointments = appointments.filter(a => a.email === user.email)
  const userGoals = goals.filter(g => g.userId === user.id)
  
  return {
    resourcesCreated: userResources.length,
    appointmentsBooked: userAppointments.length,
    goalsSet: userGoals.length,
    memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'
  }
})

// Load user data
const loadUserData = () => {
  const user = authStore.currentUser
  if (user) {
    profileForm.firstName = user.firstName || ''
    profileForm.lastName = user.lastName || ''
    profileForm.email = user.email || ''
    profileForm.phoneNumber = user.phoneNumber || ''
    profileForm.dateOfBirth = user.dateOfBirth || ''
    profileForm.bio = user.bio || ''
  }
}

// Validation functions
const validateField = (field, value) => {
  switch (field) {
    case 'firstName':
      if (!value.trim()) {
        validation.firstName = { isValid: false, message: 'First name is required' }
        return false
      }
      validation.firstName = { isValid: true, message: '' }
      return true
      
    case 'lastName':
      if (!value.trim()) {
        validation.lastName = { isValid: false, message: 'Last name is required' }
        return false
      }
      validation.lastName = { isValid: true, message: '' }
      return true
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!value) {
        validation.email = { isValid: false, message: 'Email is required' }
        return false
      }
      if (!emailRegex.test(value)) {
        validation.email = { isValid: false, message: 'Please enter a valid email address' }
        return false
      }
      validation.email = { isValid: true, message: '' }
      return true
      
    case 'phoneNumber':
      if (!value) {
        validation.phoneNumber = { isValid: false, message: 'Phone number is required' }
        return false
      }
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '')
      if (!phoneRegex.test(cleanPhone)) {
        validation.phoneNumber = { isValid: false, message: 'Please enter a valid phone number' }
        return false
      }
      validation.phoneNumber = { isValid: true, message: '' }
      return true
      
    case 'currentPassword':
      if (!value) {
        validation.currentPassword = { isValid: false, message: 'Current password is required' }
        return false
      }
      validation.currentPassword = { isValid: true, message: '' }
      return true
      
    case 'newPassword':
      if (!value) {
        validation.newPassword = { isValid: false, message: 'New password is required' }
        return false
      }
      if (value.length < 8) {
        validation.newPassword = { isValid: false, message: 'Password must be at least 8 characters' }
        return false
      }
      validation.newPassword = { isValid: true, message: '' }
      return true
      
    case 'confirmPassword':
      if (!value) {
        validation.confirmPassword = { isValid: false, message: 'Please confirm your password' }
        return false
      }
      if (value !== passwordForm.newPassword) {
        validation.confirmPassword = { isValid: false, message: 'Passwords do not match' }
        return false
      }
      validation.confirmPassword = { isValid: true, message: '' }
      return true
  }
}

// Update profile
const updateProfile = async () => {
  // Validate all fields
  const validations = [
    validateField('firstName', profileForm.firstName),
    validateField('lastName', profileForm.lastName),
    validateField('email', profileForm.email),
    validateField('phoneNumber', profileForm.phoneNumber)
  ]
  
  if (!validations.every(v => v)) {
    return
  }
  
  isLoading.value = true
  
  try {
    // Update user profile
    authStore.updateUserProfile({
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      email: profileForm.email.toLowerCase(),
      phoneNumber: profileForm.phoneNumber,
      dateOfBirth: profileForm.dateOfBirth,
      bio: profileForm.bio
    })
    
    // Show success message
    alert('Profile updated successfully!')
    
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('Failed to update profile. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// Change password
const changePassword = async () => {
  // Validate password fields
  const validations = [
    validateField('currentPassword', passwordForm.currentPassword),
    validateField('newPassword', passwordForm.newPassword),
    validateField('confirmPassword', passwordForm.confirmPassword)
  ]
  
  if (!validations.every(v => v)) {
    return
  }
  
  isLoading.value = true
  
  try {
    // Verify current password
    const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
    const currentUser = users.find(u => u.id === authStore.currentUser?.id)
    
    if (!currentUser) {
      alert('User not found')
      return
    }
    
    const storedPassword = atob(currentUser.password)
    if (storedPassword !== passwordForm.currentPassword) {
      alert('Current password is incorrect')
      return
    }
    
    // Update password
    currentUser.password = btoa(passwordForm.newPassword)
    localStorage.setItem('wellman_users', JSON.stringify(users))
    
    // Clear form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    
    showPasswordModal.value = false
    alert('Password changed successfully!')
    
  } catch (error) {
    console.error('Error changing password:', error)
    alert('Failed to change password. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// Delete account
const deleteAccount = async () => {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return
  }
  
  isLoading.value = true
  
  try {
    // Remove user from localStorage
    const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
    const filteredUsers = users.filter(u => u.id !== authStore.currentUser?.id)
    localStorage.setItem('wellman_users', JSON.stringify(filteredUsers))
    
    // Logout user
    authStore.logout()
    
  } catch (error) {
    console.error('Error deleting account:', error)
    alert('Failed to delete account. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// Export user data
const exportUserData = () => {
  const user = authStore.currentUser
  if (!user) return
  
  // Get user's data
  const resources = JSON.parse(localStorage.getItem('wellman_resources') || '[]')
  const appointments = JSON.parse(localStorage.getItem('wellman_appointments') || '[]')
  const goals = JSON.parse(localStorage.getItem('wellman_goals') || '[]')
  
  const userData = {
    profile: user,
    resources: resources.filter(r => r.author === `${user.firstName} ${user.lastName}`),
    appointments: appointments.filter(a => a.email === user.email),
    goals: goals.filter(g => g.userId === user.id),
    exportedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wellman-user-data-${user.email}-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  loadUserData()
})
</script>

<template>
  <div class="container">
    <div class="row">
      <!-- Sidebar -->
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <div class="avatar-placeholder">
                <i class="bi bi-person-circle display-1 text-primary"></i>
              </div>
            </div>
            <h5 class="mb-1">{{ authStore.currentUser?.firstName }} {{ authStore.currentUser?.lastName }}</h5>
            <p class="text-muted mb-2">{{ authStore.currentUser?.email }}</p>
            <span class="badge" :class="{
              'bg-danger': authStore.isAdmin,
              'bg-warning': authStore.isPremium,
              'bg-secondary': authStore.isUser
            }">
              {{ authStore.isAdmin ? 'Admin' : authStore.isPremium ? 'Premium' : 'User' }}
            </span>
          </div>
        </div>
        
        <!-- Navigation -->
        <div class="card border-0 shadow-sm mt-3">
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <button 
                class="list-group-item list-group-item-action border-0"
                :class="{ active: activeTab === 'profile' }"
                @click="activeTab = 'profile'"
              >
                <i class="bi bi-person me-2"></i>Profile
              </button>
              <button 
                class="list-group-item list-group-item-action border-0"
                :class="{ active: activeTab === 'security' }"
                @click="activeTab = 'security'"
              >
                <i class="bi bi-shield-lock me-2"></i>Security
              </button>
              <button 
                class="list-group-item list-group-item-action border-0"
                :class="{ active: activeTab === 'activity' }"
                @click="activeTab = 'activity'"
              >
                <i class="bi bi-activity me-2"></i>Activity
              </button>
              <button 
                class="list-group-item list-group-item-action border-0"
                :class="{ active: activeTab === 'data' }"
                @click="activeTab = 'data'"
              >
                <i class="bi bi-database me-2"></i>Data & Privacy
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="col-md-9">
        <!-- Profile Tab -->
        <div v-if="activeTab === 'profile'">
          <div class="card border-0 shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">Profile Information</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="updateProfile">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">First Name</label>
                    <input
                      type="text"
                      class="form-control"
                      :class="{ 'is-valid': validation.firstName.isValid, 'is-invalid': !validation.firstName.isValid && validation.firstName.message }"
                      v-model="profileForm.firstName"
                      @blur="validateField('firstName', profileForm.firstName)"
                      required
                    >
                    <div class="invalid-feedback" v-if="!validation.firstName.isValid && validation.firstName.message">
                      {{ validation.firstName.message }}
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Last Name</label>
                    <input
                      type="text"
                      class="form-control"
                      :class="{ 'is-valid': validation.lastName.isValid, 'is-invalid': !validation.lastName.isValid && validation.lastName.message }"
                      v-model="profileForm.lastName"
                      @blur="validateField('lastName', profileForm.lastName)"
                      required
                    >
                    <div class="invalid-feedback" v-if="!validation.lastName.isValid && validation.lastName.message">
                      {{ validation.lastName.message }}
                    </div>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Email Address</label>
                    <input
                      type="email"
                      class="form-control"
                      :class="{ 'is-valid': validation.email.isValid, 'is-invalid': !validation.email.isValid && validation.email.message }"
                      v-model="profileForm.email"
                      @blur="validateField('email', profileForm.email)"
                      required
                    >
                    <div class="invalid-feedback" v-if="!validation.email.isValid && validation.email.message">
                      {{ validation.email.message }}
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Phone Number</label>
                    <input
                      type="tel"
                      class="form-control"
                      :class="{ 'is-valid': validation.phoneNumber.isValid, 'is-invalid': !validation.phoneNumber.isValid && validation.phoneNumber.message }"
                      v-model="profileForm.phoneNumber"
                      @blur="validateField('phoneNumber', profileForm.phoneNumber)"
                      required
                    >
                    <div class="invalid-feedback" v-if="!validation.phoneNumber.isValid && validation.phoneNumber.message">
                      {{ validation.phoneNumber.message }}
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Date of Birth</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="profileForm.dateOfBirth"
                  >
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Bio</label>
                  <textarea
                    class="form-control"
                    rows="3"
                    v-model="profileForm.bio"
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  {{ isLoading ? 'Updating...' : 'Update Profile' }}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <!-- Security Tab -->
        <div v-if="activeTab === 'security'">
          <div class="card border-0 shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">Security Settings</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>Change Password</h6>
                  <p class="text-muted small">Update your password to keep your account secure.</p>
                  <button class="btn btn-outline-primary" @click="showPasswordModal = true">
                    <i class="bi bi-key me-2"></i>Change Password
                  </button>
                </div>
                <div class="col-md-6">
                  <h6>Two-Factor Authentication</h6>
                  <p class="text-muted small">Add an extra layer of security to your account.</p>
                  <button class="btn btn-outline-secondary" disabled>
                    <i class="bi bi-shield-check me-2"></i>Coming Soon
                  </button>
                </div>
              </div>
              
              <hr class="my-4">
              
              <div class="row">
                <div class="col-md-6">
                  <h6>Active Sessions</h6>
                  <p class="text-muted small">Manage your active login sessions.</p>
                  <div class="d-flex align-items-center">
                    <i class="bi bi-check-circle text-success me-2"></i>
                    <span>Current session (This device)</span>
                  </div>
                </div>
                <div class="col-md-6">
                  <h6>Account Deletion</h6>
                  <p class="text-muted small">Permanently delete your account and all associated data.</p>
                  <button class="btn btn-outline-danger" @click="showDeleteModal = true">
                    <i class="bi bi-trash me-2"></i>Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Activity Tab -->
        <div v-if="activeTab === 'activity'">
          <div class="card border-0 shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">Account Activity</h5>
            </div>
            <div class="card-body">
              <div class="row g-3 mb-4">
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-primary mb-1">{{ userStats.resourcesCreated }}</div>
                    <div class="small text-muted">Resources Created</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-success mb-1">{{ userStats.appointmentsBooked }}</div>
                    <div class="small text-muted">Appointments Booked</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-info mb-1">{{ userStats.goalsSet }}</div>
                    <div class="small text-muted">Goals Set</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="text-center">
                    <div class="h4 text-warning mb-1">{{ userStats.memberSince }}</div>
                    <div class="small text-muted">Member Since</div>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <h6>Recent Activity</h6>
                  <div class="list-group list-group-flush">
                    <div class="list-group-item d-flex align-items-center">
                      <i class="bi bi-person-check text-success me-3"></i>
                      <div>
                        <div class="fw-semibold">Profile Updated</div>
                        <small class="text-muted">Last updated: {{ userStats.lastLogin }}</small>
                      </div>
                    </div>
                    <div class="list-group-item d-flex align-items-center">
                      <i class="bi bi-box-arrow-in-right text-primary me-3"></i>
                      <div>
                        <div class="fw-semibold">Account Created</div>
                        <small class="text-muted">Created: {{ userStats.memberSince }}</small>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <h6>Account Information</h6>
                  <div class="list-group list-group-flush">
                    <div class="list-group-item d-flex justify-content-between">
                      <span>Account Type</span>
                      <span class="badge" :class="{
                        'bg-danger': authStore.isAdmin,
                        'bg-warning': authStore.isPremium,
                        'bg-secondary': authStore.isUser
                      }">
                        {{ authStore.isAdmin ? 'Admin' : authStore.isPremium ? 'Premium' : 'User' }}
                      </span>
                    </div>
                    <div class="list-group-item d-flex justify-content-between">
                      <span>Last Login</span>
                      <span>{{ userStats.lastLogin }}</span>
                    </div>
                    <div class="list-group-item d-flex justify-content-between">
                      <span>Member Since</span>
                      <span>{{ userStats.memberSince }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Data & Privacy Tab -->
        <div v-if="activeTab === 'data'">
          <div class="card border-0 shadow-sm">
            <div class="card-header">
              <h5 class="mb-0">Data & Privacy</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>Export Your Data</h6>
                  <p class="text-muted small">Download a copy of all your data including profile, resources, and activity.</p>
                  <button class="btn btn-outline-primary" @click="exportUserData">
                    <i class="bi bi-download me-2"></i>Export Data
                  </button>
                </div>
                <div class="col-md-6">
                  <h6>Privacy Settings</h6>
                  <p class="text-muted small">Control how your data is used and shared.</p>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="emailNotifications" checked>
                    <label class="form-check-label" for="emailNotifications">
                      Email notifications
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="dataSharing" checked>
                    <label class="form-check-label" for="dataSharing">
                      Allow data sharing for research
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Password Change Modal -->
    <div class="modal fade" :class="{ show: showPasswordModal }" :style="{ display: showPasswordModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Change Password</h5>
            <button type="button" class="btn-close" @click="showPasswordModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label class="form-label">Current Password</label>
                <input
                  type="password"
                  class="form-control"
                  :class="{ 'is-valid': validation.currentPassword.isValid, 'is-invalid': !validation.currentPassword.isValid && validation.currentPassword.message }"
                  v-model="passwordForm.currentPassword"
                  @blur="validateField('currentPassword', passwordForm.currentPassword)"
                  required
                >
                <div class="invalid-feedback" v-if="!validation.currentPassword.isValid && validation.currentPassword.message">
                  {{ validation.currentPassword.message }}
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">New Password</label>
                <input
                  type="password"
                  class="form-control"
                  :class="{ 'is-valid': validation.newPassword.isValid, 'is-invalid': !validation.newPassword.isValid && validation.newPassword.message }"
                  v-model="passwordForm.newPassword"
                  @blur="validateField('newPassword', passwordForm.newPassword)"
                  required
                >
                <div class="invalid-feedback" v-if="!validation.newPassword.isValid && validation.newPassword.message">
                  {{ validation.newPassword.message }}
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Confirm New Password</label>
                <input
                  type="password"
                  class="form-control"
                  :class="{ 'is-valid': validation.confirmPassword.isValid, 'is-invalid': !validation.confirmPassword.isValid && validation.confirmPassword.message }"
                  v-model="passwordForm.confirmPassword"
                  @blur="validateField('confirmPassword', passwordForm.confirmPassword)"
                  required
                >
                <div class="invalid-feedback" v-if="!validation.confirmPassword.isValid && validation.confirmPassword.message">
                  {{ validation.confirmPassword.message }}
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showPasswordModal = false">Cancel</button>
            <button type="button" class="btn btn-primary" @click="changePassword" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isLoading ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Account Modal -->
    <div class="modal fade" :class="{ show: showDeleteModal }" :style="{ display: showDeleteModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">Delete Account</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
            </div>
            <p>Are you sure you want to delete your account? This will:</p>
            <ul>
              <li>Permanently delete your profile</li>
              <li>Remove all your resources and appointments</li>
              <li>Delete all your activity data</li>
              <li>Cancel any active subscriptions</li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn btn-danger" @click="deleteAccount" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isLoading ? 'Deleting...' : 'Delete Account' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Backdrops -->
    <div v-if="showPasswordModal || showDeleteModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<style scoped>
.avatar-placeholder {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-group-item.active {
  background-color: var(--primary);
  border-color: var(--primary);
}

.list-group-item:hover {
  background-color: var(--light);
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
