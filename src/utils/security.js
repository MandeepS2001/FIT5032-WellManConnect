/**
 * Security utilities for WellMan Connect
 * Implements input sanitization, XSS protection, CSRF tokens, and security headers
 */

// CSRF Token Management
let csrfToken = null

/**
 * Generate a CSRF token
 * @returns {string} CSRF token
 */
export const generateCSRFToken = () => {
  const token = 'csrf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  csrfToken = token
  localStorage.setItem('wellman_csrf_token', token)
  return token
}

/**
 * Get current CSRF token
 * @returns {string|null} CSRF token or null if not set
 */
export const getCSRFToken = () => {
  if (!csrfToken) {
    csrfToken = localStorage.getItem('wellman_csrf_token')
  }
  return csrfToken
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} True if valid
 */
export const validateCSRFToken = (token) => {
  const storedToken = getCSRFToken()
  return token === storedToken
}

/**
 * Refresh CSRF token
 * @returns {string} New CSRF token
 */
export const refreshCSRFToken = () => {
  return generateCSRFToken()
}

// Input Sanitization
/**
 * Sanitize HTML content to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return input
  
  const div = document.createElement('div')
  div.textContent = input
  return div.innerHTML
}

/**
 * Sanitize user input for safe display
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate and sanitize email address
 * @param {string} email - Email to validate
 * @returns {string|null} Sanitized email or null if invalid
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return null
  
  const sanitized = email.toLowerCase().trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return emailRegex.test(sanitized) ? sanitized : null
}

/**
 * Validate and sanitize phone number
 * @param {string} phone - Phone number to validate
 * @returns {string|null} Sanitized phone or null if invalid
 */
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return null
  
  const sanitized = phone.replace(/[\s\-\(\)]/g, '')
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  
  return phoneRegex.test(sanitized) ? sanitized : null
}

/**
 * Sanitize password (basic validation)
 * @param {string} password - Password to validate
 * @returns {string|null} Password if valid, null otherwise
 */
export const sanitizePassword = (password) => {
  if (typeof password !== 'string') return null
  
  const sanitized = password.trim()
  
  // Basic password requirements
  if (sanitized.length < 8) return null
  if (!/(?=.*[a-z])/.test(sanitized)) return null
  if (!/(?=.*[A-Z])/.test(sanitized)) return null
  if (!/(?=.*\d)/.test(sanitized)) return null
  
  return sanitized
}

// XSS Protection
/**
 * Escape HTML entities to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeHTML = (text) => {
  if (typeof text !== 'string') return text
  
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  
  return text.replace(/[&<>"'/]/g, (match) => htmlEscapes[match])
}

/**
 * Validate URL to prevent XSS through malicious URLs
 * @param {string} url - URL to validate
 * @returns {string|null} Valid URL or null
 */
export const validateURL = (url) => {
  if (typeof url !== 'string') return null
  
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return url
  } catch {
    return null
  }
}

// Security Headers Configuration
/**
 * Configure security headers for the application
 * This would typically be done on the server side
 */
export const configureSecurityHeaders = () => {
  // In a real application, these headers would be set on the server
  const securityHeaders = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
  
  // For client-side, we can only set some headers
  // Most security headers need to be set on the server
  console.log('Security headers configuration (server-side implementation required):', securityHeaders)
  
  return securityHeaders
}

// Password Security
/**
 * Simple password hashing (use bcrypt in production)
 * @param {string} password - Password to hash
 * @returns {string} Hashed password
 */
export const hashPassword = (password) => {
  // This is a simple base64 encoding for demo purposes
  // In production, use bcrypt or similar
  return btoa(password)
}

/**
 * Verify password hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} True if password matches hash
 */
export const verifyPassword = (password, hash) => {
  // Simple verification for demo purposes
  // In production, use bcrypt.compare()
  return btoa(password) === hash
}

// Session Security
/**
 * Generate secure session ID
 * @returns {string} Secure session ID
 */
export const generateSessionID = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  const userAgent = navigator.userAgent ? navigator.userAgent.substring(0, 10) : 'unknown'
  
  return `session_${timestamp}_${random}_${btoa(userAgent).substr(0, 8)}`
}

/**
 * Validate session ID format
 * @param {string} sessionId - Session ID to validate
 * @returns {boolean} True if valid format
 */
export const validateSessionID = (sessionId) => {
  if (typeof sessionId !== 'string') return false
  
  const sessionRegex = /^session_\d+_[a-z0-9]{9}_[A-Za-z0-9+/]{8}$/
  return sessionRegex.test(sessionId)
}

// Rate Limiting (Client-side simulation)
const rateLimitStore = new Map()

/**
 * Check if action is rate limited
 * @param {string} action - Action identifier
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if rate limited
 */
export const isRateLimited = (action, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now()
  const key = `rate_limit_${action}`
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { attempts: 0, resetTime: now + windowMs })
  }
  
  const record = rateLimitStore.get(key)
  
  // Reset if window has passed
  if (now > record.resetTime) {
    record.attempts = 0
    record.resetTime = now + windowMs
  }
  
  // Check if rate limited
  if (record.attempts >= maxAttempts) {
    return true
  }
  
  // Increment attempts
  record.attempts++
  return false
}

/**
 * Reset rate limit for an action
 * @param {string} action - Action identifier
 */
export const resetRateLimit = (action) => {
  const key = `rate_limit_${action}`
  rateLimitStore.delete(key)
}

// Input Validation
/**
 * Validate form data with security checks
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
export const validateFormData = (formData, rules) => {
  const errors = {}
  const sanitizedData = {}
  
  for (const [field, value] of Object.entries(formData)) {
    const rule = rules[field]
    if (!rule) continue
    
    // Sanitize input
    let sanitized = value
    if (rule.sanitize) {
      sanitized = rule.sanitize(value)
    }
    
    // Validate
    if (rule.required && (!sanitized || sanitized.trim() === '')) {
      errors[field] = `${field} is required`
      continue
    }
    
    if (sanitized && rule.pattern && !rule.pattern.test(sanitized)) {
      errors[field] = rule.message || `${field} is invalid`
      continue
    }
    
    if (sanitized && rule.minLength && sanitized.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`
      continue
    }
    
    if (sanitized && rule.maxLength && sanitized.length > rule.maxLength) {
      errors[field] = `${field} must be no more than ${rule.maxLength} characters`
      continue
    }
    
    sanitizedData[field] = sanitized
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  }
}

// Common validation rules
export const validationRules = {
  email: {
    required: true,
    sanitize: sanitizeEmail,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    sanitize: sanitizePassword,
    minLength: 8,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
  },
  phone: {
    required: true,
    sanitize: sanitizePhone,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Please enter a valid phone number'
  },
  name: {
    required: true,
    sanitize: sanitizeInput,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Name must contain only letters and spaces'
  }
}

// Security Audit
/**
 * Perform basic security audit
 * @returns {Object} Security audit results
 */
export const performSecurityAudit = () => {
  const audit = {
    timestamp: new Date().toISOString(),
    checks: {},
    recommendations: []
  }
  
  // Check for HTTPS
  audit.checks.https = window.location.protocol === 'https:'
  if (!audit.checks.https) {
    audit.recommendations.push('Use HTTPS in production')
  }
  
  // Check for secure cookies
  audit.checks.secureCookies = document.cookie.includes('secure')
  if (!audit.checks.secureCookies) {
    audit.recommendations.push('Use secure cookies in production')
  }
  
  // Check for CSP
  audit.checks.csp = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]')
  if (!audit.checks.csp) {
    audit.recommendations.push('Implement Content Security Policy')
  }
  
  // Check for CSRF token
  audit.checks.csrfToken = !!getCSRFToken()
  if (!audit.checks.csrfToken) {
    audit.recommendations.push('Generate CSRF token for forms')
  }
  
  return audit
}

// Export all security utilities
export default {
  // CSRF Token Management
  generateCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  refreshCSRFToken,
  
  // Input Sanitization
  sanitizeHTML,
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizePassword,
  
  // XSS Protection
  escapeHTML,
  validateURL,
  
  // Security Headers
  configureSecurityHeaders,
  
  // Password Security
  hashPassword,
  verifyPassword,
  
  // Session Security
  generateSessionID,
  validateSessionID,
  
  // Rate Limiting
  isRateLimited,
  resetRateLimit,
  
  // Input Validation
  validateFormData,
  validationRules,
  
  // Security Audit
  performSecurityAudit
}
