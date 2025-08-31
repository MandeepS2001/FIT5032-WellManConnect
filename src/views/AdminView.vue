<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// State
const activeTab = ref('dashboard')
const users = ref([])
const resources = ref([])
const appointments = ref([])
const isLoading = ref(true)

// User management
const selectedUser = ref(null)
const showUserModal = ref(false)
const userForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  role: 'user',
  isActive: true
})

// Content management
const newResource = reactive({
  title: '',
  category: '',
  content: '',
  author: '',
  tags: []
})

// Statistics
const stats = computed(() => {
  const totalUsers = users.value.length
  const activeUsers = users.value.filter(u => u.isActive !== false).length
  const adminUsers = users.value.filter(u => u.role === 'admin').length
  const premiumUsers = users.value.filter(u => u.role === 'premium').length
  const totalResources = resources.value.length
  const totalAppointments = appointments.value.length
  
  return {
    totalUsers,
    activeUsers,
    adminUsers,
    premiumUsers,
    totalResources,
    totalAppointments,
    userGrowth: Math.round((activeUsers / totalUsers) * 100) || 0
  }
})

// Load data
const loadData = async () => {
  isLoading.value = true
  
  try {
    // Load users
    const storedUsers = JSON.parse(localStorage.getItem('wellman_users') || '[]')
    users.value = storedUsers.map(user => ({
      ...user,
      isActive: user.isActive !== false,
      lastLoginFormatted: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
    }))
    
    // Load resources
    const storedResources = JSON.parse(localStorage.getItem('wellman_resources') || '[]')
    resources.value = storedResources
    
    // Load appointments
    const storedAppointments = JSON.parse(localStorage.getItem('wellman_appointments') || '[]')
    appointments.value = storedAppointments
    
  } catch (error) {
    console.error('Error loading admin data:', error)
  } finally {
    isLoading.value = false
  }
}

// User management functions
const editUser = (user) => {
  selectedUser.value = user
  userForm.firstName = user.firstName
  userForm.lastName = user.lastName
  userForm.email = user.email
  userForm.role = user.role
  userForm.isActive = user.isActive !== false
  showUserModal.value = true
}

const saveUser = () => {
  if (!selectedUser.value) return
  
  const userIndex = users.value.findIndex(u => u.id === selectedUser.value.id)
  if (userIndex !== -1) {
    users.value[userIndex] = {
      ...users.value[userIndex],
      ...userForm,
      updatedAt: new Date().toISOString()
    }
    
    // Update localStorage
    const allUsers = JSON.parse(localStorage.getItem('wellman_users') || '[]')
    const allUserIndex = allUsers.findIndex(u => u.id === selectedUser.value.id)
    if (allUserIndex !== -1) {
      allUsers[allUserIndex] = users.value[userIndex]
      localStorage.setItem('wellman_users', JSON.stringify(allUsers))
    }
    
    // Update current session if editing self
    if (selectedUser.value.id === authStore.currentUser?.id) {
      authStore.updateUserProfile({
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        role: userForm.role
      })
    }
  }
  
  showUserModal.value = false
  selectedUser.value = null
}

const deleteUser = (userId) => {
  if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    users.value = users.value.filter(u => u.id !== userId)
    
    // Update localStorage
    const allUsers = JSON.parse(localStorage.getItem('wellman_users') || '[]')
    const filteredUsers = allUsers.filter(u => u.id !== userId)
    localStorage.setItem('wellman_users', JSON.stringify(filteredUsers))
  }
}

const changeUserRole = (userId, newRole) => {
  const userIndex = users.value.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    users.value[userIndex].role = newRole
    
    // Update localStorage
    const allUsers = JSON.parse(localStorage.getItem('wellman_users') || '[]')
    const allUserIndex = allUsers.findIndex(u => u.id === userId)
    if (allUserIndex !== -1) {
      allUsers[allUserIndex].role = newRole
      localStorage.setItem('wellman_users', JSON.stringify(allUsers))
    }
    
    // Update current session if changing own role
    if (userId === authStore.currentUser?.id) {
      authStore.changeUserRole(newRole)
    }
  }
}

// Content management functions
const addResource = () => {
  if (!newResource.title || !newResource.content) return
  
  const resource = {
    id: Date.now(),
    ...newResource,
    author: authStore.currentUser?.firstName + ' ' + authStore.currentUser?.lastName,
    createdAt: new Date().toISOString(),
    rating: 0,
    reviewCount: 0
  }
  
  resources.value.push(resource)
  
  // Update localStorage
  const allResources = JSON.parse(localStorage.getItem('wellman_resources') || '[]')
  allResources.push(resource)
  localStorage.setItem('wellman_resources', JSON.stringify(allResources))
  
  // Reset form
  Object.keys(newResource).forEach(key => {
    if (Array.isArray(newResource[key])) {
      newResource[key] = []
    } else {
      newResource[key] = ''
    }
  })
}

const deleteResource = (resourceId) => {
  if (confirm('Are you sure you want to delete this resource?')) {
    resources.value = resources.value.filter(r => r.id !== resourceId)
    
    // Update localStorage
    const allResources = JSON.parse(localStorage.getItem('wellman_resources') || '[]')
    const filteredResources = allResources.filter(r => r.id !== resourceId)
    localStorage.setItem('wellman_resources', JSON.stringify(filteredResources))
  }
}

// Export data
const exportData = () => {
  const data = {
    users: users.value,
    resources: resources.value,
    appointments: appointments.value,
    exportedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wellman-admin-export-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0">Admin Dashboard</h1>
        <p class="text-muted mb-0">Manage users, content, and system settings</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" @click="exportData">
          <i class="bi bi-download me-2"></i>Export Data
        </button>
        <button class="btn btn-primary" @click="loadData">
          <i class="bi bi-arrow-clockwise me-2"></i>Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading admin data...</p>
    </div>

    <div v-else>
      <!-- Statistics Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-2">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="h4 text-primary mb-1">{{ stats.totalUsers }}</div>
              <div class="small text-muted">Total Users</div>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="h4 text-success mb-1">{{ stats.activeUsers }}</div>
              <div class="small text-muted">Active Users</div>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="h4 text-danger mb-1">{{ stats.adminUsers }}</div>
              <div class="small text-muted">Admins</div>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="h4 text-warning mb-1">{{ stats.premiumUsers }}</div>
              <div class="small text-muted">Premium Users</div>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="h4 text-info mb-1">{{ stats.totalResources }}</div>
              <div class="small text-muted">Resources</div>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="h4 text-secondary mb-1">{{ stats.totalAppointments }}</div>
              <div class="small text-muted">Appointments</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'dashboard' }"
            @click="activeTab = 'dashboard'"
          >
            <i class="bi bi-speedometer2 me-2"></i>Dashboard
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'users' }"
            @click="activeTab = 'users'"
          >
            <i class="bi bi-people me-2"></i>User Management
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'content' }"
            @click="activeTab = 'content'"
          >
            <i class="bi bi-file-text me-2"></i>Content Management
          </button>
        </li>
        <li class="nav-item">
          <button 
            class="nav-link" 
            :class="{ active: activeTab === 'appointments' }"
            @click="activeTab = 'appointments'"
          >
            <i class="bi bi-calendar-check me-2"></i>Appointments
          </button>
        </li>
      </ul>

      <!-- Dashboard Tab -->
      <div v-if="activeTab === 'dashboard'">
        <div class="row">
          <div class="col-md-8">
            <div class="card border-0 shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">Recent Activity</h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="user in users.slice(0, 5)" :key="user.id">
                        <td>{{ user.firstName }} {{ user.lastName }}</td>
                        <td>
                          <span class="badge bg-primary">Account Created</span>
                        </td>
                        <td>{{ user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">Quick Actions</h5>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <button class="btn btn-outline-primary" @click="activeTab = 'users'">
                    <i class="bi bi-person-plus me-2"></i>Add User
                  </button>
                  <button class="btn btn-outline-success" @click="activeTab = 'content'">
                    <i class="bi bi-plus-circle me-2"></i>Add Resource
                  </button>
                  <button class="btn btn-outline-info" @click="exportData">
                    <i class="bi bi-download me-2"></i>Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Management Tab -->
      <div v-if="activeTab === 'users'">
        <div class="card border-0 shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">User Management</h5>
            <button class="btn btn-primary btn-sm" @click="editUser({})">
              <i class="bi bi-person-plus me-2"></i>Add User
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>{{ user.firstName }} {{ user.lastName }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <select 
                        class="form-select form-select-sm" 
                        :value="user.role"
                        @change="changeUserRole(user.id, $event.target.value)"
                        :disabled="user.id === authStore.currentUser?.id"
                      >
                        <option value="user">User</option>
                        <option value="premium">Premium</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span class="badge" :class="user.isActive ? 'bg-success' : 'bg-secondary'">
                        {{ user.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>{{ user.lastLoginFormatted }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" @click="editUser(user)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button 
                          class="btn btn-outline-danger" 
                          @click="deleteUser(user.id)"
                          :disabled="user.id === authStore.currentUser?.id"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Management Tab -->
      <div v-if="activeTab === 'content'">
        <div class="row">
          <div class="col-md-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">Add New Resource</h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="addResource">
                  <div class="mb-3">
                    <label class="form-label">Title</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="newResource.title"
                      required
                    >
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Category</label>
                    <select class="form-select" v-model="newResource.category" required>
                      <option value="">Select category</option>
                      <option value="fitness">Fitness</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="mental-health">Mental Health</option>
                      <option value="preventive-care">Preventive Care</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Content</label>
                    <textarea 
                      class="form-control" 
                      rows="4"
                      v-model="newResource.content"
                      required
                    ></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">
                    <i class="bi bi-plus-circle me-2"></i>Add Resource
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <div class="card border-0 shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">Manage Resources</h5>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Author</th>
                        <th>Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="resource in resources" :key="resource.id">
                        <td>{{ resource.title }}</td>
                        <td>
                          <span class="badge bg-secondary">{{ resource.category }}</span>
                        </td>
                        <td>{{ resource.author }}</td>
                        <td>
                          <div class="d-flex align-items-center">
                            <span class="text-warning me-1">★</span>
                            {{ resource.rating.toFixed(1) }}
                            <small class="text-muted ms-1">({{ resource.reviewCount }})</small>
                          </div>
                        </td>
                        <td>
                          <button class="btn btn-outline-danger btn-sm" @click="deleteResource(resource.id)">
                            <i class="bi bi-trash"></i>
                          </button>
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

      <!-- Appointments Tab -->
      <div v-if="activeTab === 'appointments'">
        <div class="card border-0 shadow-sm">
          <div class="card-header">
            <h5 class="mb-0">Appointment Management</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Service</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="appointment in appointments" :key="appointment.id">
                    <td>{{ appointment.name }}</td>
                    <td>{{ appointment.service }}</td>
                    <td>{{ new Date(appointment.dateTime).toLocaleString() }}</td>
                    <td>
                      <span class="badge bg-primary">{{ appointment.status || 'Scheduled' }}</span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-success">
                          <i class="bi bi-check"></i>
                        </button>
                        <button class="btn btn-outline-danger">
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Edit Modal -->
    <div class="modal fade" :class="{ show: showUserModal }" :style="{ display: showUserModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedUser?.id ? 'Edit User' : 'Add User' }}</h5>
            <button type="button" class="btn-close" @click="showUserModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">First Name</label>
                  <input type="text" class="form-control" v-model="userForm.firstName" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Last Name</label>
                  <input type="text" class="form-control" v-model="userForm.lastName" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" v-model="userForm.email" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Role</label>
                <select class="form-select" v-model="userForm.role" required>
                  <option value="user">User</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" v-model="userForm.isActive" id="userActive">
                  <label class="form-check-label" for="userActive">
                    Active Account
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showUserModal = false">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveUser">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Backdrop -->
    <div v-if="showUserModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<style scoped>
.nav-tabs .nav-link {
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--gray-600);
}

.nav-tabs .nav-link.active {
  border-bottom-color: var(--primary);
  color: var(--primary);
  background: none;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: var(--gray-700);
}

.form-select-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
