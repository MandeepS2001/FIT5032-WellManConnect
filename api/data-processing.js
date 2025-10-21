// Vercel Serverless Function for Data Processing
// Demonstrates serverless architecture for data-intensive operations
// Benefits: Auto-scaling, cost-effective, event-driven processing

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    console.log('📊 Data Processing API called:', {
      method: req.method,
      operation: req.body?.operation || 'unknown'
    })

    const { operation, data, options } = req.body

    switch (req.method) {
      case 'POST':
        if (operation === 'process-table-data') {
          // Process table data (serverless benefit: on-demand processing)
          const result = await processTableData(data, options)
          res.status(200).json({
            success: true,
            result,
            timestamp: new Date().toISOString(),
            function: 'data-processing'
          })
        } else if (operation === 'generate-report') {
          // Generate analytics report (serverless benefit: compute-intensive tasks)
          const report = await generateAnalyticsReport(data)
          res.status(200).json({
            success: true,
            report,
            timestamp: new Date().toISOString(),
            function: 'data-processing'
          })
        } else if (operation === 'export-data') {
          // Export data to various formats (serverless benefit: format conversion)
          const exportResult = await exportData(data, options)
          res.status(200).json({
            success: true,
            export: exportResult,
            timestamp: new Date().toISOString(),
            function: 'data-processing'
          })
        } else {
          res.status(400).json({ error: 'Invalid operation' })
        }
        break

      default:
        res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('📊 Data Processing API error:', error)
    res.status(500).json({ 
      error: 'Data processing operation failed', 
      details: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

// Helper functions demonstrating serverless architecture benefits

async function processTableData(data, options = {}) {
  // Serverless benefit: Auto-scaling for data processing workloads
  // Scales automatically based on data size and processing complexity
  
  console.log(`Processing ${data.length} records with options:`, options)
  
  const startTime = Date.now()
  
  // Simulate data processing operations
  const processedData = data.map((record, index) => {
    // Serverless benefit: Stateless processing - no shared state between requests
    const processed = {
      ...record,
      processedAt: new Date().toISOString(),
      processingId: `proc_${Date.now()}_${index}`,
      // Add computed fields
      computedScore: calculateHealthScore(record),
      riskLevel: assessRiskLevel(record),
      recommendations: generateRecommendations(record)
    }
    
    return processed
  })
  
  // Serverless benefit: Pay-per-execution - only pay for actual processing time
  const processingTime = Date.now() - startTime
  
  return {
    totalRecords: data.length,
    processedRecords: processedData.length,
    processingTimeMs: processingTime,
    averageTimePerRecord: processingTime / data.length,
    memoryUsage: process.memoryUsage(),
    processedData: options.includeData ? processedData : undefined
  }
}

async function generateAnalyticsReport(data) {
  // Serverless benefit: Event-driven analytics - triggered on demand
  // No need for scheduled batch jobs or persistent analytics servers
  
  console.log('Generating analytics report for:', data.length, 'records')
  
  const report = {
    summary: {
      totalRecords: data.length,
      generatedAt: new Date().toISOString(),
      reportId: `report_${Date.now()}`
    },
    statistics: {
      demographics: calculateDemographics(data),
      healthMetrics: calculateHealthMetrics(data),
      trends: identifyTrends(data),
      insights: generateInsights(data)
    },
    visualizations: {
      charts: generateChartData(data),
      graphs: generateGraphData(data)
    },
    recommendations: {
      actionable: generateActionableRecommendations(data),
      strategic: generateStrategicRecommendations(data)
    }
  }
  
  // Simulate complex analytics computation
  await new Promise(resolve => setTimeout(resolve, 200))
  
  return report
}

async function exportData(data, options) {
  // Serverless benefit: On-demand format conversion
  // No need to maintain export servers or batch processing systems
  
  const { format = 'csv', includeMetadata = true } = options
  
  console.log(`Exporting ${data.length} records to ${format} format`)
  
  let exportData
  let mimeType
  
  switch (format.toLowerCase()) {
    case 'csv':
      exportData = convertToCSV(data)
      mimeType = 'text/csv'
      break
    case 'json':
      exportData = JSON.stringify(data, null, 2)
      mimeType = 'application/json'
      break
    case 'xlsx':
      // Simulate Excel export (would use a library like xlsx in real implementation)
      exportData = `Excel export simulation for ${data.length} records`
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      break
    case 'pdf':
      // Generate PDF content (simplified implementation)
      exportData = generatePDFContent(data, options)
      mimeType = 'application/pdf'
      break
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
  
  return {
    format,
    mimeType,
    recordCount: data.length,
    fileSize: exportData.length,
    downloadUrl: `data:${mimeType};base64,${Buffer.from(exportData).toString('base64')}`,
    exportedAt: new Date().toISOString()
  }
}

// Utility functions for data processing
function calculateHealthScore(record) {
  // Simulate health score calculation
  const factors = [
    record.age ? Math.max(0, 100 - record.age) : 50,
    record.status === 'Active' ? 20 : 10,
    Math.random() * 30 + 20 // Random health factor
  ]
  return Math.round(factors.reduce((sum, factor) => sum + factor, 0) / factors.length)
}

function assessRiskLevel(record) {
  const score = calculateHealthScore(record)
  if (score >= 80) return 'Low'
  if (score >= 60) return 'Medium'
  return 'High'
}

function generateRecommendations(record) {
  const riskLevel = assessRiskLevel(record)
  const recommendations = []
  
  if (riskLevel === 'High') {
    recommendations.push('Schedule regular health checkups')
    recommendations.push('Consider lifestyle modifications')
  } else if (riskLevel === 'Medium') {
    recommendations.push('Maintain current health practices')
    recommendations.push('Monitor health metrics regularly')
  } else {
    recommendations.push('Continue current healthy lifestyle')
    recommendations.push('Share wellness practices with others')
  }
  
  return recommendations
}

function calculateDemographics(data) {
  // Simulate demographic analysis
  return {
    ageDistribution: { '18-30': 25, '31-45': 35, '46-60': 30, '60+': 10 },
    genderDistribution: { 'Male': 60, 'Female': 35, 'Other': 5 },
    locationDistribution: { 'Urban': 70, 'Suburban': 25, 'Rural': 5 }
  }
}

function calculateHealthMetrics(data) {
  return {
    averageHealthScore: Math.round(Math.random() * 20 + 70),
    riskDistribution: { 'Low': 40, 'Medium': 45, 'High': 15 },
    commonConditions: ['Hypertension', 'Diabetes', 'High Cholesterol']
  }
}

function identifyTrends(data) {
  return {
    positiveTrends: ['Increased physical activity', 'Better nutrition awareness'],
    areasOfConcern: ['Mental health support', 'Preventive care'],
    seasonalPatterns: ['Winter health dips', 'Summer wellness peaks']
  }
}

function generateInsights(data) {
  return {
    keyFindings: [
      'Users with regular checkups show 30% better health outcomes',
      'Mobile app usage correlates with improved health metrics',
      'Community features increase engagement by 45%'
    ],
    actionableInsights: [
      'Implement reminder system for health checkups',
      'Enhance mobile app features',
      'Develop community engagement tools'
    ]
  }
}

function generateChartData(data) {
  return {
    healthScoreDistribution: Array.from({length: 10}, (_, i) => ({
      range: `${i*10}-${(i+1)*10}`,
      count: Math.floor(Math.random() * data.length / 10)
    })),
    monthlyTrends: Array.from({length: 12}, (_, i) => ({
      month: new Date(2024, i).toLocaleString('default', { month: 'short' }),
      value: Math.floor(Math.random() * 100)
    }))
  }
}

function generateGraphData(data) {
  return {
    correlationMatrix: {
      ageVsHealth: -0.3,
      activityVsHealth: 0.7,
      checkupsVsHealth: 0.8
    },
    networkGraph: {
      nodes: data.slice(0, 10).map((record, i) => ({
        id: i,
        label: record.name || `User ${i}`,
        group: record.status || 'unknown'
      })),
      edges: []
    }
  }
}

function generateActionableRecommendations(data) {
  return [
    'Implement automated health reminders',
    'Create personalized wellness plans',
    'Develop peer support matching system'
  ]
}

function generateStrategicRecommendations(data) {
  return [
    'Expand telehealth services',
    'Integrate wearable device data',
    'Develop AI-powered health insights'
  ]
}

function convertToCSV(data) {
  if (!data.length) return ''
  
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(record => 
    Object.values(record).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  )
  
  return [headers, ...rows].join('\n')
}

function generatePDFContent(data, options = {}) {
  const { title = 'Data Export', subtitle = '', includeMetadata = true } = options
  
  if (!data.length) return ''
  
  const headers = Object.keys(data[0])
  const timestamp = new Date().toISOString()
  
  // Generate HTML content that can be converted to PDF
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
        .subtitle { font-size: 14px; color: #666; margin-bottom: 10px; }
        .metadata { font-size: 12px; color: #888; margin-bottom: 20px; background: #f8f9fa; padding: 10px; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #2563eb; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f8f9fa; }
        tr:hover { background-color: #e3f2fd; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
        .page-break { page-break-before: always; }
        @media print {
          body { margin: 0; }
          .page-break { page-break-before: always; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${title}</div>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
      </div>
      
      ${includeMetadata ? `
        <div class="metadata">
          <strong>Export Information:</strong><br>
          Generated: ${new Date().toLocaleString()}<br>
          Records: ${data.length}<br>
          Format: PDF<br>
          Serverless Function: data-processing
        </div>
      ` : ''}
      
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map((row, index) => `
            <tr>
              ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <strong>WellMan Connect Data Export</strong><br>
        Generated: ${new Date().toLocaleString()}<br>
        Total Records: ${data.length}<br>
        Export ID: EXP-${Date.now()}
      </div>
    </body>
    </html>
  `
  
  return htmlContent
}
