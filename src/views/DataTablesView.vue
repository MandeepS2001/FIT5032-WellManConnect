<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createInteractiveTable, addCustomSearch, exportTableToCSV } from '../utils/dataTables'

// Reactive data
const usersTable = ref(null)
const appointmentsTable = ref(null)
const activeTab = ref('users')

// Initialize tables when component mounts
onMounted(() => {
  try {
    // Initialize users table
    usersTable.value = createInteractiveTable('users-table-container', 'Users Management', 'users')
    addCustomSearch('users-table', 'users-search-container')
    
    // Initialize appointments table
    appointmentsTable.value = createInteractiveTable('appointments-table-container', 'Appointments Management', 'appointments')
    addCustomSearch('appointments-table', 'appointments-search-container')
    
    // Make export function globally available
    window.exportTableToCSV = exportTableToCSV
    
  } catch (error) {
    console.error('Error initializing tables:', error)
  }
})

// Cleanup when component unmounts
onUnmounted(() => {
  if (usersTable.value) {
    usersTable.value.destroy()
  }
  if (appointmentsTable.value) {
    appointmentsTable.value.destroy()
  }
})

// Tab switching
const switchTab = (tab) => {
  activeTab.value = tab
}

// Refresh table data
const refreshTable = (tableType) => {
  try {
    if (tableType === 'users' && usersTable.value) {
      usersTable.value.ajax.reload()
    } else if (tableType === 'appointments' && appointmentsTable.value) {
      appointmentsTable.value.ajax.reload()
    }
  } catch (error) {
    console.error('Error refreshing table:', error)
  }
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

        <!-- Users Table Tab -->
        <div v-if="activeTab === 'users'" class="tab-content">
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <h4>Users Management</h4>
              <button class="btn btn-outline-secondary btn-sm" @click="refreshTable('users')">
                <i class="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>
          </div>
          
          <!-- Custom Search Container -->
          <div id="users-search-container"></div>
          
          <!-- Users Table Container -->
          <div id="users-table-container"></div>
        </div>

        <!-- Appointments Table Tab -->
        <div v-if="activeTab === 'appointments'" class="tab-content">
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <h4>Appointments Management</h4>
              <button class="btn btn-outline-secondary btn-sm" @click="refreshTable('appointments')">
                <i class="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>
          </div>
          
          <!-- Custom Search Container -->
          <div id="appointments-search-container"></div>
          
          <!-- Appointments Table Container -->
          <div id="appointments-table-container"></div>
        </div>
      </div>
    </div>
  </div>
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
</style>
