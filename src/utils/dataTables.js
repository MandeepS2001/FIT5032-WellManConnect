/**
 * DataTables Utility for Interactive Tables
 * Handles sort, search, and pagination functionality
 */

// Mock data generator using Mockaroo-style data
export const generateMockData = {
  users: [
    { id: 1, name: 'John Smith', email: 'john.smith@email.com', age: 34, city: 'New York', status: 'Active', joinDate: '2023-01-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', age: 28, city: 'Los Angeles', status: 'Active', joinDate: '2023-02-20' },
    { id: 3, name: 'Mike Wilson', email: 'mike.wilson@email.com', age: 42, city: 'Chicago', status: 'Inactive', joinDate: '2023-01-08' },
    { id: 4, name: 'Emily Davis', email: 'emily.davis@email.com', age: 31, city: 'Houston', status: 'Active', joinDate: '2023-03-10' },
    { id: 5, name: 'David Brown', email: 'david.brown@email.com', age: 45, city: 'Phoenix', status: 'Active', joinDate: '2023-02-05' },
    { id: 6, name: 'Lisa Garcia', email: 'lisa.garcia@email.com', age: 29, city: 'Philadelphia', status: 'Inactive', joinDate: '2023-01-25' },
    { id: 7, name: 'Robert Martinez', email: 'robert.m@email.com', age: 38, city: 'San Antonio', status: 'Active', joinDate: '2023-03-01' },
    { id: 8, name: 'Jennifer Anderson', email: 'jennifer.a@email.com', age: 33, city: 'San Diego', status: 'Active', joinDate: '2023-02-15' },
    { id: 9, name: 'Christopher Taylor', email: 'chris.taylor@email.com', age: 40, city: 'Dallas', status: 'Inactive', joinDate: '2023-01-30' },
    { id: 10, name: 'Amanda Thomas', email: 'amanda.thomas@email.com', age: 27, city: 'San Jose', status: 'Active', joinDate: '2023-03-05' },
    { id: 11, name: 'Matthew Jackson', email: 'matt.jackson@email.com', age: 36, city: 'Austin', status: 'Active', joinDate: '2023-02-28' },
    { id: 12, name: 'Jessica White', email: 'jessica.white@email.com', age: 32, city: 'Jacksonville', status: 'Inactive', joinDate: '2023-01-12' },
    { id: 13, name: 'Daniel Harris', email: 'daniel.harris@email.com', age: 44, city: 'Fort Worth', status: 'Active', joinDate: '2023-03-15' },
    { id: 14, name: 'Ashley Martin', email: 'ashley.martin@email.com', age: 30, city: 'Columbus', status: 'Active', joinDate: '2023-02-10' },
    { id: 15, name: 'James Thompson', email: 'james.thompson@email.com', age: 39, city: 'Charlotte', status: 'Inactive', joinDate: '2023-01-18' }
  ],

  appointments: [
    { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Wilson', date: '2024-01-15', time: '10:00 AM', type: 'General Checkup', status: 'Confirmed' },
    { id: 2, patient: 'Emily Davis', doctor: 'Dr. Michael Brown', date: '2024-01-16', time: '2:30 PM', type: 'Specialist Consultation', status: 'Confirmed' },
    { id: 3, patient: 'David Brown', doctor: 'Dr. Lisa Garcia', date: '2024-01-17', time: '9:15 AM', type: 'Follow-up', status: 'Pending' },
    { id: 4, patient: 'Sarah Johnson', doctor: 'Dr. Robert Martinez', date: '2024-01-18', time: '11:45 AM', type: 'General Checkup', status: 'Confirmed' },
    { id: 5, patient: 'Mike Wilson', doctor: 'Dr. Jennifer Anderson', date: '2024-01-19', time: '3:00 PM', type: 'Specialist Consultation', status: 'Cancelled' },
    { id: 6, patient: 'Lisa Garcia', doctor: 'Dr. Christopher Taylor', date: '2024-01-20', time: '8:30 AM', type: 'Follow-up', status: 'Confirmed' },
    { id: 7, patient: 'Robert Martinez', doctor: 'Dr. Amanda Thomas', date: '2024-01-21', time: '1:15 PM', type: 'General Checkup', status: 'Pending' },
    { id: 8, patient: 'Jennifer Anderson', doctor: 'Dr. Matthew Jackson', date: '2024-01-22', time: '10:30 AM', type: 'Specialist Consultation', status: 'Confirmed' },
    { id: 9, patient: 'Christopher Taylor', doctor: 'Dr. Jessica White', date: '2024-01-23', time: '4:00 PM', type: 'Follow-up', status: 'Confirmed' },
    { id: 10, patient: 'Amanda Thomas', doctor: 'Dr. Daniel Harris', date: '2024-01-24', time: '9:45 AM', type: 'General Checkup', status: 'Pending' },
    { id: 11, patient: 'Matthew Jackson', doctor: 'Dr. Ashley Martin', date: '2024-01-25', time: '2:00 PM', type: 'Specialist Consultation', status: 'Confirmed' },
    { id: 12, patient: 'Jessica White', doctor: 'Dr. James Thompson', date: '2024-01-26', time: '11:30 AM', type: 'Follow-up', status: 'Cancelled' },
    { id: 13, patient: 'Daniel Harris', doctor: 'Dr. John Smith', date: '2024-01-27', time: '3:30 PM', type: 'General Checkup', status: 'Confirmed' },
    { id: 14, patient: 'Ashley Martin', doctor: 'Dr. Emily Davis', date: '2024-01-28', time: '8:00 AM', type: 'Specialist Consultation', status: 'Pending' },
    { id: 15, patient: 'James Thompson', doctor: 'Dr. David Brown', date: '2024-01-29', time: '12:15 PM', type: 'Follow-up', status: 'Confirmed' }
  ]
}

/**
 * Initialize DataTable with custom configuration
 * @param {string} tableId - Table element ID
 * @param {Array} columns - Column configuration
 * @param {Array} data - Table data
 * @param {Object} options - Additional DataTable options
 */
export const initializeDataTable = (tableId, columns, data, options = {}) => {
  const defaultOptions = {
    data: data,
    columns: columns,
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50],
    responsive: true,
    order: [[0, 'asc']],
    language: {
      search: 'Search:',
      lengthMenu: 'Show _MENU_ entries',
      info: 'Showing _START_ to _END_ of _TOTAL_ entries',
      paginate: {
        first: 'First',
        last: 'Last',
        next: 'Next',
        previous: 'Previous'
      }
    },
    dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>' +
         '<"row"<"col-sm-12"tr>>' +
         '<"row"<"col-sm-12 col-md-5"i><"col-sm-12 col-md-7"p>>',
    ...options
  }

  return $(`#${tableId}`).DataTable(defaultOptions)
}

/**
 * Column configurations for different table types
 */
export const columnConfigs = {
  users: [
    { title: 'ID', data: 'id', width: '5%' },
    { title: 'Name', data: 'name', width: '20%' },
    { title: 'Email', data: 'email', width: '25%' },
    { title: 'Age', data: 'age', width: '8%' },
    { title: 'City', data: 'city', width: '15%' },
    { 
      title: 'Status', 
      data: 'status', 
      width: '12%',
      render: function(data, type, row) {
        const badgeClass = data === 'Active' ? 'bg-success' : 'bg-secondary'
        return `<span class="badge ${badgeClass}">${data}</span>`
      }
    },
    { title: 'Join Date', data: 'joinDate', width: '15%' }
  ],

  appointments: [
    { title: 'ID', data: 'id', width: '5%' },
    { title: 'Patient', data: 'patient', width: '18%' },
    { title: 'Doctor', data: 'doctor', width: '18%' },
    { title: 'Date', data: 'date', width: '12%' },
    { title: 'Time', data: 'time', width: '10%' },
    { title: 'Type', data: 'type', width: '20%' },
    { 
      title: 'Status', 
      data: 'status', 
      width: '12%',
      render: function(data, type, row) {
        let badgeClass = 'bg-secondary'
        if (data === 'Confirmed') badgeClass = 'bg-success'
        else if (data === 'Pending') badgeClass = 'bg-warning'
        else if (data === 'Cancelled') badgeClass = 'bg-danger'
        
        return `<span class="badge ${badgeClass}">${data}</span>`
      }
    }
  ]
}

/**
 * Create a searchable, sortable table with pagination
 * @param {string} containerId - Container element ID
 * @param {string} tableTitle - Table title
 * @param {string} tableType - Type of table ('users' or 'appointments')
 */
export const createInteractiveTable = (containerId, tableTitle, tableType) => {
  const data = generateMockData[tableType]
  const columns = columnConfigs[tableType]
  
  if (!data || !columns) {
    throw new Error(`Invalid table type: ${tableType}`)
  }

  const tableHtml = `
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">${tableTitle}</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table id="${tableType}-table" class="table table-striped table-hover">
            <thead class="table-dark">
              <tr></tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  `

  // Insert HTML into container
  document.getElementById(containerId).innerHTML = tableHtml

  // Initialize DataTable
  return initializeDataTable(`${tableType}-table`, columns, data)
}

/**
 * Export table data to CSV
 * @param {string} tableId - DataTable ID
 * @param {string} filename - Export filename
 */
export const exportTableToCSV = (tableId, filename = 'export') => {
  const table = $(`#${tableId}`).DataTable()
  const data = table.data().toArray()
  
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Get column headers
  const headers = table.settings()[0].aoColumns.map(col => col.title)
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n'
  data.forEach(row => {
    const values = Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    )
    csvContent += values.join(',') + '\n'
  })

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

/**
 * Add custom search functionality
 * @param {string} tableId - DataTable ID
 * @param {string} searchContainerId - Search input container ID
 */
export const addCustomSearch = (tableId, searchContainerId) => {
  const table = $(`#${tableId}`).DataTable()
  
  const searchHtml = `
    <div class="row mb-3">
      <div class="col-md-6">
        <label for="custom-search" class="form-label">Custom Search:</label>
        <input type="text" id="custom-search" class="form-control" placeholder="Search across all columns...">
      </div>
      <div class="col-md-6">
        <label class="form-label">Export:</label>
        <button class="btn btn-outline-primary btn-sm ms-2" onclick="exportTableToCSV('${tableId}', '${tableId}-export')">
          <i class="bi bi-download"></i> Export CSV
        </button>
      </div>
    </div>
  `
  
  document.getElementById(searchContainerId).innerHTML = searchHtml
  
  // Add search functionality
  document.getElementById('custom-search').addEventListener('keyup', function() {
    table.search(this.value).draw()
  })
}

export default {
  generateMockData,
  initializeDataTable,
  columnConfigs,
  createInteractiveTable,
  exportTableToCSV,
  addCustomSearch
}
