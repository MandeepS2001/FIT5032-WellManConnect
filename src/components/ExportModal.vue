<template>
  <!-- Export Modal Component for BR E.4 -->
  <div 
    class="modal fade" 
    id="exportModal" 
    tabindex="-1" 
    aria-labelledby="exportModalLabel" 
    aria-hidden="true"
    role="dialog"
  >
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exportModalLabel">
            <i class="bi bi-download me-2" aria-hidden="true"></i>
            Export Data
          </h5>
          <button 
            type="button" 
            class="btn-close" 
            data-bs-dismiss="modal" 
            aria-label="Close export modal"
          ></button>
        </div>
        
        <div class="modal-body">
          <!-- Export Progress (shown during export) -->
          <div v-if="isExporting" class="export-progress mb-4">
            <div class="d-flex align-items-center mb-3">
              <div class="spinner-border spinner-border-sm text-primary me-3" role="status" aria-hidden="true"></div>
              <div>
                <h6 class="mb-1">Exporting Data...</h6>
                <p class="text-muted mb-0 small">{{ currentStep }}</p>
              </div>
            </div>
            
            <div class="progress mb-2" style="height: 8px;">
              <div 
                class="progress-bar progress-bar-striped progress-bar-animated" 
                role="progressbar" 
                :style="{ width: progress + '%' }"
                :aria-valuenow="progress"
                aria-valuemin="0" 
                aria-valuemax="100"
                :aria-label="`Export progress: ${progress}%`"
              ></div>
            </div>
            
            <div class="d-flex justify-content-between small text-muted">
              <span>Step {{ currentStepIndex }} of {{ totalSteps }}</span>
              <span>{{ progress }}%</span>
            </div>
          </div>

          <!-- Export Options (shown when not exporting) -->
          <div v-else>
            <!-- Data Selection -->
            <div class="mb-4">
              <label class="form-label fw-semibold">
                <i class="bi bi-database me-2" aria-hidden="true"></i>
                Select Data to Export
              </label>
              <div class="row g-2">
                <div class="col-md-6">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="exportUsers" 
                      v-model="selectedData.users"
                      aria-describedby="exportUsersHelp"
                    >
                    <label class="form-check-label" for="exportUsers">
                      Users Data
                      <span class="badge bg-secondary ms-2">{{ dataCounts.users }}</span>
                    </label>
                    <div id="exportUsersHelp" class="form-text small">
                      Export user information and profiles
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="exportAppointments" 
                      v-model="selectedData.appointments"
                      aria-describedby="exportAppointmentsHelp"
                    >
                    <label class="form-check-label" for="exportAppointments">
                      Appointments Data
                      <span class="badge bg-secondary ms-2">{{ dataCounts.appointments }}</span>
                    </label>
                    <div id="exportAppointmentsHelp" class="form-text small">
                      Export appointment bookings and schedules
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Export Format Selection -->
            <div class="mb-4">
              <label class="form-label fw-semibold">
                <i class="bi bi-file-earmark me-2" aria-hidden="true"></i>
                Export Format
              </label>
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="card h-100 export-format-card" :class="{ 'selected': selectedFormat === 'csv' }">
                    <div class="card-body text-center">
                      <input 
                        type="radio" 
                        class="btn-check" 
                        name="exportFormat" 
                        id="formatCSV" 
                        value="csv"
                        v-model="selectedFormat"
                      >
                      <label class="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center" for="formatCSV">
                        <i class="bi bi-filetype-csv fs-2 mb-2" aria-hidden="true"></i>
                        <strong>CSV</strong>
                        <small class="text-muted">Comma-separated values</small>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card h-100 export-format-card" :class="{ 'selected': selectedFormat === 'pdf' }">
                    <div class="card-body text-center">
                      <input 
                        type="radio" 
                        class="btn-check" 
                        name="exportFormat" 
                        id="formatPDF" 
                        value="pdf"
                        v-model="selectedFormat"
                      >
                      <label class="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center" for="formatPDF">
                        <i class="bi bi-file-earmark-pdf fs-2 mb-2" aria-hidden="true"></i>
                        <strong>PDF</strong>
                        <small class="text-muted">Portable Document Format</small>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card h-100 export-format-card" :class="{ 'selected': selectedFormat === 'json' }">
                    <div class="card-body text-center">
                      <input 
                        type="radio" 
                        class="btn-check" 
                        name="exportFormat" 
                        id="formatJSON" 
                        value="json"
                        v-model="selectedFormat"
                      >
                      <label class="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center" for="formatJSON">
                        <i class="bi bi-file-earmark-code fs-2 mb-2" aria-hidden="true"></i>
                        <strong>JSON</strong>
                        <small class="text-muted">JavaScript Object Notation</small>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card h-100 export-format-card" :class="{ 'selected': selectedFormat === 'xlsx' }">
                    <div class="card-body text-center">
                      <input 
                        type="radio" 
                        class="btn-check" 
                        name="exportFormat" 
                        id="formatExcel" 
                        value="xlsx"
                        v-model="selectedFormat"
                      >
                      <label class="btn btn-outline-primary w-100 h-100 d-flex flex-column justify-content-center" for="formatExcel">
                        <i class="bi bi-file-earmark-excel fs-2 mb-2" aria-hidden="true"></i>
                        <strong>Excel</strong>
                        <small class="text-muted">Microsoft Excel workbook</small>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Export Options -->
            <div class="mb-4">
              <label class="form-label fw-semibold">
                <i class="bi bi-gear me-2" aria-hidden="true"></i>
                Export Options
              </label>
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="includeMetadata" 
                      v-model="exportOptions.includeMetadata"
                    >
                    <label class="form-check-label" for="includeMetadata">
                      Include Metadata
                    </label>
                    <div class="form-text small">
                      Add export information and timestamps
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="includeCalculatedFields" 
                      v-model="exportOptions.includeCalculatedFields"
                    >
                    <label class="form-check-label" for="includeCalculatedFields">
                      Include Calculated Fields
                    </label>
                    <div class="form-text small">
                      Add computed values and export IDs
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filename Input -->
            <div class="mb-4">
              <label for="exportFilename" class="form-label fw-semibold">
                <i class="bi bi-file-text me-2" aria-hidden="true"></i>
                Filename
              </label>
              <div class="input-group">
                <input 
                  type="text" 
                  class="form-control" 
                  id="exportFilename"
                  v-model="exportOptions.filename"
                  placeholder="Enter filename"
                  aria-describedby="filenameHelp"
                >
                <span class="input-group-text" id="filenameHelp">
                  {{ getFileExtension() }}
                </span>
              </div>
              <div id="filenameHelp" class="form-text">
                File will be saved as: {{ exportOptions.filename }}{{ getFileExtension() }}
              </div>
            </div>

            <!-- Export Summary -->
            <div class="alert alert-info">
              <h6 class="alert-heading">
                <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
                Export Summary
              </h6>
              <ul class="mb-0">
                <li><strong>Format:</strong> {{ selectedFormat.toUpperCase() }}</li>
                <li><strong>Records:</strong> {{ totalSelectedRecords }}</li>
                <li><strong>Estimated Size:</strong> {{ estimatedFileSize }}</li>
                <li><strong>Export Time:</strong> {{ estimatedExportTime }}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            data-bs-dismiss="modal"
            :disabled="isExporting"
            aria-label="Cancel export"
          >
            <i class="bi bi-x-circle me-2" aria-hidden="true"></i>
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            @click="handleExport"
            :disabled="!canExport || isExporting"
            aria-label="Start export process"
          >
            <i class="bi bi-download me-2" aria-hidden="true"></i>
            {{ isExporting ? 'Exporting...' : 'Export Data' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { exportService, exportFormats } from '../utils/exportService'

// Props
const props = defineProps({
  usersData: {
    type: Array,
    default: () => []
  },
  appointmentsData: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['export-complete', 'export-error'])

// Reactive data
const isExporting = ref(false)
const progress = ref(0)
const currentStep = ref('')
const currentStepIndex = ref(0)
const totalSteps = ref(0)

const selectedData = ref({
  users: true,
  appointments: true
})

const selectedFormat = ref('csv')

const exportOptions = ref({
  filename: 'wellman-export',
  includeMetadata: true,
  includeCalculatedFields: false
})

// Computed properties
const dataCounts = computed(() => ({
  users: props.usersData.length,
  appointments: props.appointmentsData.length
}))

const totalSelectedRecords = computed(() => {
  let total = 0
  if (selectedData.value.users) total += props.usersData.length
  if (selectedData.value.appointments) total += props.appointmentsData.length
  return total
})

const canExport = computed(() => {
  return totalSelectedRecords.value > 0 && selectedFormat.value
})

const estimatedFileSize = computed(() => {
  const records = totalSelectedRecords.value
  const format = selectedFormat.value
  
  let estimatedBytes = 0
  
  switch (format) {
    case 'csv':
      estimatedBytes = records * 100 // Average 100 bytes per record
      break
    case 'json':
      estimatedBytes = records * 150 // JSON is more verbose
      break
    case 'pdf':
      estimatedBytes = records * 200 + 5000 // PDF has overhead
      break
    case 'xlsx':
      estimatedBytes = records * 120 + 3000 // Excel has overhead
      break
  }
  
  if (estimatedBytes < 1024) return `${estimatedBytes} B`
  if (estimatedBytes < 1024 * 1024) return `${(estimatedBytes / 1024).toFixed(1)} KB`
  return `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`
})

const estimatedExportTime = computed(() => {
  const records = totalSelectedRecords.value
  if (records < 100) return '< 1 second'
  if (records < 1000) return '1-2 seconds'
  if (records < 10000) return '2-5 seconds'
  return '5+ seconds'
})

// Methods
const getFileExtension = () => {
  switch (selectedFormat.value) {
    case 'csv': return '.csv'
    case 'pdf': return '.pdf'
    case 'json': return '.json'
    case 'xlsx': return '.xlsx'
    default: return ''
  }
}

const getSelectedData = () => {
  const data = []
  
  if (selectedData.value.users) {
    data.push(...props.usersData.map(item => ({ ...item, _dataset: 'users' })))
  }
  
  if (selectedData.value.appointments) {
    data.push(...props.appointmentsData.map(item => ({ ...item, _dataset: 'appointments' })))
  }
  
  return data
}

const handleExport = async () => {
  if (!canExport.value || isExporting.value) return
  
  try {
    isExporting.value = true
    progress.value = 0
    currentStep.value = 'Preparing export...'
    
    // Get selected data
    const data = getSelectedData()
    
    // Set up progress monitoring
    const progressInterval = setInterval(() => {
      const exportProgress = exportService.getProgress()
      progress.value = exportProgress.progress
      currentStep.value = exportProgress.currentStep
      currentStepIndex.value = exportProgress.currentStepIndex
      totalSteps.value = exportProgress.totalSteps
    }, 100)
    
    // Perform export
    const result = await exportService.exportData(data, selectedFormat.value, {
      filename: exportOptions.value.filename,
      includeMetadata: exportOptions.value.includeMetadata,
      includeCalculatedFields: exportOptions.value.includeCalculatedFields,
      title: 'WellMan Connect Data Export',
      subtitle: `Exported on ${new Date().toLocaleDateString()}`
    })
    
    // Clear progress monitoring
    clearInterval(progressInterval)
    
    // Emit success event
    emit('export-complete', result)
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('exportModal'))
    if (modal) modal.hide()
    
  } catch (error) {
    console.error('Export failed:', error)
    emit('export-error', error)
    
    // Clear progress monitoring
    clearInterval(progressInterval)
    isExporting.value = false
  }
}

// Watch for format changes to update filename
watch(selectedFormat, (newFormat) => {
  if (!exportOptions.value.filename.endsWith(getFileExtension())) {
    const baseName = exportOptions.value.filename.replace(/\.[^/.]+$/, '')
    exportOptions.value.filename = baseName
  }
})

// Generate default filename based on current date
const generateDefaultFilename = () => {
  const date = new Date().toISOString().split('T')[0]
  return `wellman-export-${date}`
}

// Initialize default filename
exportOptions.value.filename = generateDefaultFilename()
</script>

<style scoped>
.export-format-card {
  transition: all 0.2s ease;
  cursor: pointer;
}

.export-format-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.export-format-card.selected {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
}

.btn-check:checked + .btn {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}

.export-progress {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.progress {
  border-radius: 4px;
}

.form-check-input:checked {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.alert-info {
  border-left: 4px solid var(--bs-info);
}

/* Accessibility improvements */
.form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
}

.btn:focus {
  box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
}

/* Responsive design */
@media (max-width: 768px) {
  .export-format-card .btn {
    padding: 0.5rem;
  }
  
  .export-format-card .fs-2 {
    font-size: 1.5rem !important;
  }
}
</style>
