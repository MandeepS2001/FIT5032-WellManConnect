<script setup>
import { ref, onMounted, computed } from 'vue'
import { generateMockData, columnConfigs } from '../utils/dataTables'
import { exportService, exportFormats, exportUtils } from '../utils/exportService'
import ExportModal from '../components/ExportModal.vue'

// Reactive data
const activeTab = ref('users')
const isLoading = ref(true)
const error = ref(null)

// Table data
const usersData = ref([])
const appointmentsData = ref([])

// Search and filter states
const usersSearch = ref('')
const appointmentsSearch = ref('')
const currentUsersPage = ref(1)
const currentAppointmentsPage = ref(1)
const itemsPerPage = 10

// Sorting states
const usersSortColumn = ref('id')
const usersSortDirection = ref('asc')
const appointmentsSortColumn = ref('id')
const appointmentsSortDirection = ref('asc')

// Initialize data when component mounts
onMounted(() => {
  try {
    console.log('Loading table data...')
    
    // Load mock data
    usersData.value = generateMockData.users
    appointmentsData.value = generateMockData.appointments
    
    console.log('Table data loaded successfully')
    isLoading.value = false
    
  } catch (err) {
    console.error('Error loading table data:', err)
    error.value = err.message
    isLoading.value = false
  }
})

// Computed properties for filtered and sorted data
const filteredUsers = computed(() => {
  let filtered = usersData.value
  
  if (usersSearch.value) {
    const search = usersSearch.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.city.toLowerCase().includes(search) ||
      user.status.toLowerCase().includes(search)
    )
  }
  
  // Apply sorting
  return filtered.sort((a, b) => {
    let aVal = a[usersSortColumn.value]
    let bVal = b[usersSortColumn.value]
    
    // Handle string comparison
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (usersSortDirection.value === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })
})

const filteredAppointments = computed(() => {
  let filtered = appointmentsData.value
  
  if (appointmentsSearch.value) {
    const search = appointmentsSearch.value.toLowerCase()
    filtered = filtered.filter(appointment => 
      appointment.patient.toLowerCase().includes(search) ||
      appointment.doctor.toLowerCase().includes(search) ||
      appointment.type.toLowerCase().includes(search) ||
      appointment.status.toLowerCase().includes(search)
    )
  }
  
  // Apply sorting
  return filtered.sort((a, b) => {
    let aVal = a[appointmentsSortColumn.value]
    let bVal = b[appointmentsSortColumn.value]
    
    // Handle string comparison
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (appointmentsSortDirection.value === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })
})

const paginatedUsers = computed(() => {
  const start = (currentUsersPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
})

const paginatedAppointments = computed(() => {
  const start = (currentAppointmentsPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAppointments.value.slice(start, end)
})

const totalUsersPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))
const totalAppointmentsPages = computed(() => Math.ceil(filteredAppointments.value.length / itemsPerPage))

// Tab switching
const switchTab = (tab) => {
  activeTab.value = tab
  // Reset pagination when switching tabs
  currentUsersPage.value = 1
  currentAppointmentsPage.value = 1
}

// Sorting functions
const sortUsers = (column) => {
  if (usersSortColumn.value === column) {
    usersSortDirection.value = usersSortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    usersSortColumn.value = column
    usersSortDirection.value = 'asc'
  }
  currentUsersPage.value = 1 // Reset to first page when sorting
}

const sortAppointments = (column) => {
  if (appointmentsSortColumn.value === column) {
    appointmentsSortDirection.value = appointmentsSortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    appointmentsSortColumn.value = column
    appointmentsSortDirection.value = 'asc'
  }
  currentAppointmentsPage.value = 1 // Reset to first page when sorting
}

const getSortIcon = (column, sortColumn, sortDirection) => {
  if (sortColumn !== column) return 'bi-arrow-down-up text-muted'
  return sortDirection === 'asc' ? 'bi-arrow-up text-primary' : 'bi-arrow-down text-primary'
}

// Refresh table data
const refreshTable = (tableType) => {
  try {
    if (tableType === 'users') {
      usersData.value = generateMockData.users
      currentUsersPage.value = 1
      usersSearch.value = ''
    } else if (tableType === 'appointments') {
      appointmentsData.value = generateMockData.appointments
      currentAppointmentsPage.value = 1
      appointmentsSearch.value = ''
    }
  } catch (error) {
    console.error('Error refreshing table:', error)
  }
}

// Pagination functions
const goToUsersPage = (page) => {
  if (page >= 1 && page <= totalUsersPages.value) {
    currentUsersPage.value = page
  }
}

const goToAppointmentsPage = (page) => {
  if (page >= 1 && page <= totalAppointmentsPages.value) {
    currentAppointmentsPage.value = page
  }
}

// Enhanced export functions with multiple format support
const showExportModal = () => {
  const modal = new bootstrap.Modal(document.getElementById('exportModal'))
  modal.show()
}

const handleExportComplete = (result) => {
  console.log('✅ Export completed successfully:', result)
  
  // Show success message with format-specific instructions
  const alert = document.createElement('div')
  alert.className = 'alert alert-success alert-dismissible fade show position-fixed'
  alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 350px;'
  
  let message = `
    <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
    <strong>Export Successful!</strong><br>
    ${result.recordCount} records exported as ${result.format.toUpperCase()}
  `
  
  // Add PDF-specific instructions
  if (result.format.toLowerCase() === 'pdf' && result.openedInWindow) {
    message += `
      <br><small class="text-muted">
        <i class="bi bi-info-circle me-1" aria-hidden="true"></i>
        PDF opened in new window. Use browser's "Print to PDF" to save.
      </small>
    `
  }
  
  alert.innerHTML = message + `
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `
  document.body.appendChild(alert)
  
  // Auto-remove after 8 seconds (longer for PDF instructions)
  const removeTime = result.format.toLowerCase() === 'pdf' ? 8000 : 5000
  setTimeout(() => {
    if (alert.parentNode) {
      alert.parentNode.removeChild(alert)
    }
  }, removeTime)
}

const handleExportError = (error) => {
  console.error('❌ Export failed:', error)
  // Show error message
  const alert = document.createElement('div')
  alert.className = 'alert alert-danger alert-dismissible fade show position-fixed'
  alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
  alert.innerHTML = `
    <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
    <strong>Export Failed!</strong><br>
    ${error.message || 'An error occurred during export'}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `
  document.body.appendChild(alert)
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.parentNode.removeChild(alert)
    }
  }, 8000)
}

// Quick export functions for individual formats
const quickExportCSV = async (data, filename) => {
  try {
    await exportUtils.quickCSVExport(data, filename)
    handleExportComplete({ recordCount: data.length, format: 'csv' })
  } catch (error) {
    handleExportError(error)
  }
}

const quickExportPDF = async (data, filename) => {
  try {
    await exportUtils.quickPDFExport(data, filename)
    handleExportComplete({ recordCount: data.length, format: 'pdf' })
  } catch (error) {
    handleExportError(error)
  }
}

const quickExportJSON = async (data, filename) => {
  try {
    await exportUtils.quickJSONExport(data, filename)
    handleExportComplete({ recordCount: data.length, format: 'json' })
  } catch (error) {
    handleExportError(error)
  }
}

// Legacy export functions (kept for backward compatibility)
const exportUsersToCSV = async () => {
  await quickExportCSV(filteredUsers.value, 'users-export')
}

const exportAppointmentsToCSV = async () => {
  try {
    console.log('📊 Attempting to export appointments via serverless function...')
    
    // Use serverless function for data processing
    const response = await fetch('/api/data-processing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation: 'export-data',
        data: filteredAppointments.value,
        options: { format: 'csv', includeMetadata: true }
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('📊 Data exported via serverless function:', result)
      
      // Download the processed data
      const data = filteredAppointments.value
      const headers = ['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Type', 'Status']
      const csvContent = [
        headers.join(','),
        ...data.map(appointment => [
          appointment.id,
          `"${appointment.patient}"`,
          `"${appointment.doctor}"`,
          appointment.date,
          appointment.time,
          `"${appointment.type}"`,
          appointment.status
        ].join(','))
      ].join('\n')
      
      downloadCSV(csvContent, 'appointments-export')
    } else {
      throw new Error('Serverless export failed')
    }
  } catch (error) {
    console.warn('📊 Serverless export failed, using local export:', error)
    // Fallback to local export
    const data = filteredAppointments.value
    const headers = ['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Type', 'Status']
    const csvContent = [
      headers.join(','),
      ...data.map(appointment => [
        appointment.id,
        `"${appointment.patient}"`,
        `"${appointment.doctor}"`,
        appointment.date,
        appointment.time,
        `"${appointment.type}"`,
        appointment.status
      ].join(','))
    ].join('\n')
    
    downloadCSV(csvContent, 'appointments-export')
  }
}

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="mb-0">Interactive Data Tables</h2>
          <div class="btn-group" role="group">
            <button 
              type="button" 
              class="btn" 
              :class="activeTab === 'users' ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchTab('users')"
            >
              <i class="bi bi-people me-2"></i>Users
            </button>
            <button 
              type="button" 
              class="btn" 
              :class="activeTab === 'appointments' ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchTab('appointments')"
            >
              <i class="bi bi-calendar-event me-2"></i>Appointments
            </button>
          </div>
        </div>

        <!-- Features Info Card -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="card-title mb-0">
              <i class="bi bi-info-circle me-2"></i>Interactive Table Features
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <div class="text-center">
                  <i class="bi bi-search display-4 text-primary mb-2"></i>
                  <h6>Search</h6>
                  <p class="text-muted small">Search across all columns or individual columns</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="text-center">
                  <i class="bi bi-arrow-down-up display-4 text-success mb-2"></i>
                  <h6>Sort</h6>
                  <p class="text-muted small">Click column headers to sort data</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="text-center">
                  <i class="bi bi-list-ol display-4 text-warning mb-2"></i>
                  <h6>Pagination</h6>
                  <p class="text-muted small">Navigate through pages with 10 rows per page</p>
                </div>
              </div>
              <div class="col-md-3">
                <div class="text-center">
                  <i class="bi bi-download display-4 text-info mb-2"></i>
                  <h6>Export</h6>
                  <p class="text-muted small">Export filtered data to CSV format</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading data tables...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          Error loading data tables: {{ error }}
          <button class="btn btn-outline-danger btn-sm ms-2" @click="location.reload()">
            <i class="bi bi-arrow-clockwise me-1"></i>Retry
          </button>
        </div>

        <!-- Users Table Tab -->
        <div v-else-if="activeTab === 'users'" class="tab-content">
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <h4>Users Management</h4>
              <div class="d-flex gap-2">
                <button 
                  class="btn btn-primary btn-sm" 
                  @click="showExportModal"
                  aria-label="Open export options for users data"
                >
                  <i class="bi bi-download me-1" aria-hidden="true"></i>Export Data
                </button>
                <div class="btn-group" role="group" aria-label="Quick export options">
                  <button 
                    class="btn btn-outline-success btn-sm" 
                    @click="quickExportCSV(filteredUsers, 'users-csv')"
                    title="Quick CSV Export"
                    aria-label="Quick CSV export of users data"
                  >
                    <i class="bi bi-filetype-csv" aria-hidden="true"></i>
                  </button>
                  <button 
                    class="btn btn-outline-danger btn-sm" 
                    @click="quickExportPDF(filteredUsers, 'users-pdf')"
                    title="Quick PDF Export"
                    aria-label="Quick PDF export of users data"
                  >
                    <i class="bi bi-file-earmark-pdf" aria-hidden="true"></i>
                  </button>
                  <button 
                    class="btn btn-outline-info btn-sm" 
                    @click="quickExportJSON(filteredUsers, 'users-json')"
                    title="Quick JSON Export"
                    aria-label="Quick JSON export of users data"
                  >
                    <i class="bi bi-file-earmark-code" aria-hidden="true"></i>
                  </button>
                </div>
                <button 
                  class="btn btn-outline-secondary btn-sm" 
                  @click="refreshTable('users')"
                  aria-label="Refresh users table data"
                >
                  <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>Refresh
                </button>
              </div>
            </div>
          </div>
          
          <!-- Search -->
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="users-search" class="form-label">Search Users:</label>
              <input 
                type="text" 
                id="users-search"
                class="form-control" 
                v-model="usersSearch"
                placeholder="Search by name, email, city, or status..."
              >
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <small class="text-muted">
                Showing {{ filteredUsers.length }} of {{ usersData.length }} users
              </small>
            </div>
          </div>
          
          <!-- Users Table -->
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead class="table-dark">
                    <tr>
                      <th class="sortable" @click="sortUsers('id')">
                        ID <i :class="getSortIcon('id', usersSortColumn, usersSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortUsers('name')">
                        Name <i :class="getSortIcon('name', usersSortColumn, usersSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortUsers('email')">
                        Email <i :class="getSortIcon('email', usersSortColumn, usersSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortUsers('age')">
                        Age <i :class="getSortIcon('age', usersSortColumn, usersSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortUsers('city')">
                        City <i :class="getSortIcon('city', usersSortColumn, usersSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortUsers('status')">
                        Status <i :class="getSortIcon('status', usersSortColumn, usersSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortUsers('joinDate')">
                        Join Date <i :class="getSortIcon('joinDate', usersSortColumn, usersSortDirection)"></i>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in paginatedUsers" :key="user.id">
                      <td>{{ user.id }}</td>
                      <td>{{ user.name }}</td>
                      <td>{{ user.email }}</td>
                      <td>{{ user.age }}</td>
                      <td>{{ user.city }}</td>
                      <td>
                        <span class="badge" :class="user.status === 'Active' ? 'bg-success' : 'bg-secondary'">
                          {{ user.status }}
                        </span>
                      </td>
                      <td>{{ user.joinDate }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Pagination -->
              <nav v-if="totalUsersPages > 1" class="mt-3">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: currentUsersPage === 1 }">
                    <button class="page-link" @click="goToUsersPage(currentUsersPage - 1)">Previous</button>
                  </li>
                  <li 
                    v-for="page in totalUsersPages" 
                    :key="page"
                    class="page-item" 
                    :class="{ active: currentUsersPage === page }"
                  >
                    <button class="page-link" @click="goToUsersPage(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentUsersPage === totalUsersPages }">
                    <button class="page-link" @click="goToUsersPage(currentUsersPage + 1)">Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <!-- Appointments Table Tab -->
        <div v-else-if="activeTab === 'appointments'" class="tab-content">
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <h4>Appointments Management</h4>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" @click="exportAppointmentsToCSV">
                  <i class="bi bi-download me-1"></i>Export CSV
                </button>
                <button class="btn btn-outline-secondary btn-sm" @click="refreshTable('appointments')">
                  <i class="bi bi-arrow-clockwise me-1"></i>Refresh
                </button>
              </div>
            </div>
          </div>
          
          <!-- Search -->
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="appointments-search" class="form-label">Search Appointments:</label>
              <input 
                type="text" 
                id="appointments-search"
                class="form-control" 
                v-model="appointmentsSearch"
                placeholder="Search by patient, doctor, type, or status..."
              >
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <small class="text-muted">
                Showing {{ filteredAppointments.length }} of {{ appointmentsData.length }} appointments
              </small>
            </div>
          </div>
          
          <!-- Appointments Table -->
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead class="table-dark">
                    <tr>
                      <th class="sortable" @click="sortAppointments('id')">
                        ID <i :class="getSortIcon('id', appointmentsSortColumn, appointmentsSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortAppointments('patient')">
                        Patient <i :class="getSortIcon('patient', appointmentsSortColumn, appointmentsSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortAppointments('doctor')">
                        Doctor <i :class="getSortIcon('doctor', appointmentsSortColumn, appointmentsSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortAppointments('date')">
                        Date <i :class="getSortIcon('date', appointmentsSortColumn, appointmentsSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortAppointments('time')">
                        Time <i :class="getSortIcon('time', appointmentsSortColumn, appointmentsSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortAppointments('type')">
                        Type <i :class="getSortIcon('type', appointmentsSortColumn, appointmentsSortDirection)"></i>
                      </th>
                      <th class="sortable" @click="sortAppointments('status')">
                        Status <i :class="getSortIcon('status', appointmentsSortColumn, appointmentsSortDirection)"></i>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="appointment in paginatedAppointments" :key="appointment.id">
                      <td>{{ appointment.id }}</td>
                      <td>{{ appointment.patient }}</td>
                      <td>{{ appointment.doctor }}</td>
                      <td>{{ appointment.date }}</td>
                      <td>{{ appointment.time }}</td>
                      <td>{{ appointment.type }}</td>
                      <td>
                        <span class="badge" :class="{
                          'bg-success': appointment.status === 'Confirmed',
                          'bg-warning': appointment.status === 'Pending',
                          'bg-danger': appointment.status === 'Cancelled',
                          'bg-secondary': appointment.status === 'Other'
                        }">
                          {{ appointment.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Pagination -->
              <nav v-if="totalAppointmentsPages > 1" class="mt-3">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: currentAppointmentsPage === 1 }">
                    <button class="page-link" @click="goToAppointmentsPage(currentAppointmentsPage - 1)">Previous</button>
                  </li>
                  <li 
                    v-for="page in totalAppointmentsPages" 
                    :key="page"
                    class="page-item" 
                    :class="{ active: currentAppointmentsPage === page }"
                  >
                    <button class="page-link" @click="goToAppointmentsPage(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentAppointmentsPage === totalAppointmentsPages }">
                    <button class="page-link" @click="goToAppointmentsPage(currentAppointmentsPage + 1)">Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Export Modal Component -->
  <ExportModal 
    :users-data="usersData"
    :appointments-data="appointmentsData"
    @export-complete="handleExportComplete"
    @export-error="handleExportError"
  />
</template>

<style scoped>
.card {
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.btn-group .btn {
  border-radius: 0.375rem;
}

.btn-group .btn:not(:last-child) {
  margin-right: 0.25rem;
}

.tab-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* DataTables customization */
:deep(.dataTables_wrapper) {
  font-size: 0.875rem;
}

:deep(.dataTables_filter) {
  margin-bottom: 1rem;
}

:deep(.dataTables_length) {
  margin-bottom: 1rem;
}

:deep(.dataTables_paginate .paginate_button) {
  border-radius: 0.375rem;
  margin: 0 0.125rem;
}

:deep(.dataTables_paginate .paginate_button.current) {
  background: var(--bs-primary) !important;
  border-color: var(--bs-primary) !important;
}

/* Responsive table styling */
:deep(.table-responsive) {
  border-radius: 0.375rem;
  overflow: hidden;
}

:deep(.table) {
  margin-bottom: 0;
}

:deep(.table thead th) {
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

:deep(.table tbody tr:hover) {
  background-color: rgba(0, 123, 255, 0.075);
}

/* Badge styling for status columns */
:deep(.badge) {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

/* Sortable column headers */
.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.sortable:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.sortable i {
  font-size: 0.8rem;
  margin-left: 0.25rem;
}
</style>
