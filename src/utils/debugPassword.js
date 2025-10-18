/**
 * Debug utilities for password management
 * Helps developers understand password format consistency
 */

import { getPasswordFormatStats } from './passwordManager.js'

/**
 * Display password format statistics in console
 */
export const debugPasswordFormats = () => {
  const stats = getPasswordFormatStats()
  
  console.group('🔐 Password Format Statistics')
  console.log(`Total users: ${stats.total}`)
  console.log(`Base64 format: ${stats.base64}`)
  console.log(`PBKDF2 format: ${stats.pbkdf2}`)
  console.log(`Invalid formats: ${stats.invalid}`)
  console.log(`Unknown formats: ${stats.unknown}`)
  
  if (stats.invalid > 0 || stats.unknown > 0) {
    console.warn('⚠️ Found inconsistent password formats!')
    console.log('Recommendation: Use createStandardUser() for all new user creation')
  } else {
    console.log('✅ All passwords are in consistent format')
  }
  console.groupEnd()
  
  return stats
}

/**
 * Validate all users in localStorage
 */
export const validateAllUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
    const issues = []
    
    users.forEach((user, index) => {
      if (!user.password) {
        issues.push(`User ${index}: Missing password`)
      } else if (!user.email) {
        issues.push(`User ${index}: Missing email`)
      } else if (user.password.includes(':') && !user.passwordFormat) {
        issues.push(`User ${index} (${user.email}): PBKDF2 format but no format declared`)
      } else if (!user.password.includes(':') && !user.passwordFormat) {
        issues.push(`User ${index} (${user.email}): Base64 format but no format declared`)
      }
    })
    
    if (issues.length > 0) {
      console.group('⚠️ Password Validation Issues')
      issues.forEach(issue => console.warn(issue))
      console.groupEnd()
    } else {
      console.log('✅ All users have valid password formats')
    }
    
    return issues
  } catch (error) {
    console.error('Error validating users:', error)
    return ['Error validating users']
  }
}

/**
 * Get detailed user information for debugging
 */
export const debugUserDetails = (email) => {
  try {
    const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
    const user = users.find(u => u.email === email)
    
    if (!user) {
      console.log(`❌ User ${email} not found`)
      return null
    }
    
    console.group(`👤 User Details: ${email}`)
    console.log('Password format:', user.password.includes(':') ? 'PBKDF2' : 'Base64')
    console.log('Declared format:', user.passwordFormat || 'Not declared')
    console.log('Password length:', user.password.length)
    console.log('Has password format field:', !!user.passwordFormat)
    console.log('User object:', user)
    console.groupEnd()
    
    return user
  } catch (error) {
    console.error('Error getting user details:', error)
    return null
  }
}

/**
 * Comprehensive password system health check
 */
export const passwordSystemHealthCheck = () => {
  console.group('🏥 Password System Health Check')
  
  const stats = debugPasswordFormats()
  const issues = validateAllUsers()
  
  console.log('\n📊 Summary:')
  console.log(`Total users: ${stats.total}`)
  console.log(`Issues found: ${issues.length}`)
  
  if (issues.length === 0) {
    console.log('✅ Password system is healthy!')
  } else {
    console.log('⚠️ Password system needs attention')
    console.log('Recommendations:')
    console.log('1. Use createStandardUser() for all new user creation')
    console.log('2. Consider migrating existing users to consistent format')
    console.log('3. Add passwordFormat field to existing users')
  }
  
  console.groupEnd()
  
  return {
    stats,
    issues,
    healthy: issues.length === 0
  }
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.debugPasswordFormats = debugPasswordFormats
  window.validateAllUsers = validateAllUsers
  window.debugUserDetails = debugUserDetails
  window.passwordSystemHealthCheck = passwordSystemHealthCheck
}

export default {
  debugPasswordFormats,
  validateAllUsers,
  debugUserDetails,
  passwordSystemHealthCheck
}
