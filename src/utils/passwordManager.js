/**
 * Centralized Password Management Utility
 * Ensures consistent password storage and verification across the application
 */

// Password storage format constants
export const PASSWORD_FORMATS = {
  BASE64: 'base64',
  PBKDF2: 'pbkdf2'
}

// Default password format for the application
export const DEFAULT_PASSWORD_FORMAT = PASSWORD_FORMATS.BASE64

/**
 * Encode password using the specified format
 * @param {string} password - Plain text password
 * @param {string} format - Password format (base64 or pbkdf2)
 * @returns {Promise<string>} Encoded password
 */
export const encodePassword = async (password, format = DEFAULT_PASSWORD_FORMAT) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string')
  }

  switch (format) {
    case PASSWORD_FORMATS.BASE64:
      return btoa(password)
    
    case PASSWORD_FORMATS.PBKDF2:
      // Import hashPassword from security utils
      const { hashPassword } = await import('./security.js')
      return await hashPassword(password)
    
    default:
      throw new Error(`Unsupported password format: ${format}`)
  }
}

/**
 * Verify password against stored encoded password
 * Automatically detects format and verifies accordingly
 * @param {string} plainPassword - Plain text password to verify
 * @param {string} encodedPassword - Stored encoded password
 * @returns {Promise<boolean>} True if password matches
 */
export const verifyPassword = async (plainPassword, encodedPassword) => {
  if (!plainPassword || !encodedPassword) {
    return false
  }

  try {
    // Detect password format
    if (encodedPassword.includes(':')) {
      // PBKDF2 format - contains salt:hash
      const { verifyPassword: pbkdf2Verify } = await import('./security.js')
      return await pbkdf2Verify(plainPassword, encodedPassword)
    } else {
      // Base64 format - decode and compare
      const decodedPassword = atob(encodedPassword)
      return decodedPassword === plainPassword
    }
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

/**
 * Create a user object with properly encoded password
 * @param {Object} userData - User data object
 * @param {string} format - Password format to use
 * @returns {Promise<Object>} User object with encoded password
 */
export const createUserWithPassword = async (userData, format = DEFAULT_PASSWORD_FORMAT) => {
  if (!userData.password) {
    throw new Error('Password is required for user creation')
  }

  const encodedPassword = await encodePassword(userData.password, format)
  
  return {
    ...userData,
    password: encodedPassword,
    passwordFormat: format,
    createdAt: userData.createdAt || new Date().toISOString()
  }
}

/**
 * Validate user password format consistency
 * @param {Object} user - User object to validate
 * @returns {boolean} True if password format is valid
 */
export const validateUserPassword = (user) => {
  if (!user || !user.password) {
    return false
  }

  // Check if password format is declared
  if (user.passwordFormat && !Object.values(PASSWORD_FORMATS).includes(user.passwordFormat)) {
    console.warn(`Invalid password format declared: ${user.passwordFormat}`)
    return false
  }

  // Validate password structure based on format
  if (user.passwordFormat === PASSWORD_FORMATS.PBKDF2) {
    return user.password.includes(':') && user.password.split(':').length === 2
  } else {
    // Base64 format - should be valid base64
    try {
      atob(user.password)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Migrate user password to new format
 * @param {Object} user - User object to migrate
 * @param {string} newFormat - Target password format
 * @returns {Promise<Object>} Updated user object
 */
export const migrateUserPassword = async (user, newFormat = DEFAULT_PASSWORD_FORMAT) => {
  if (!user || !user.password) {
    throw new Error('User or password not found')
  }

  // Decode current password
  let plainPassword
  if (user.password.includes(':')) {
    // PBKDF2 format - we can't decode this, so we can't migrate
    throw new Error('Cannot migrate PBKDF2 password without plain text')
  } else {
    // Base64 format
    plainPassword = atob(user.password)
  }

  // Encode with new format
  const newEncodedPassword = await encodePassword(plainPassword, newFormat)
  
  return {
    ...user,
    password: newEncodedPassword,
    passwordFormat: newFormat,
    passwordMigrated: new Date().toISOString()
  }
}

/**
 * Standardized user creation with password
 * @param {Object} userData - User data
 * @param {string} format - Password format
 * @returns {Promise<Object>} Created user object
 */
export const createStandardUser = async (userData, format = DEFAULT_PASSWORD_FORMAT) => {
  const user = await createUserWithPassword(userData, format)
  
  // Validate the created user
  if (!validateUserPassword(user)) {
    throw new Error('Created user password format is invalid')
  }
  
  return user
}

/**
 * Save user to localStorage with validation
 * @param {Object} user - User object to save
 * @param {string} storageKey - localStorage key (default: 'wellman_users')
 * @returns {boolean} True if saved successfully
 */
export const saveUserToStorage = (user, storageKey = 'wellman_users') => {
  if (!validateUserPassword(user)) {
    console.error('Cannot save user with invalid password format:', user)
    return false
  }

  try {
    const users = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const existingUserIndex = users.findIndex(u => u.email === user.email)
    
    if (existingUserIndex !== -1) {
      users[existingUserIndex] = user
    } else {
      users.push(user)
    }
    
    localStorage.setItem(storageKey, JSON.stringify(users))
    return true
  } catch (error) {
    console.error('Error saving user to storage:', error)
    return false
  }
}

/**
 * Load user from localStorage and validate password format
 * @param {string} email - User email
 * @param {string} storageKey - localStorage key (default: 'wellman_users')
 * @returns {Object|null} User object or null if not found
 */
export const loadUserFromStorage = (email, storageKey = 'wellman_users') => {
  try {
    const users = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const user = users.find(u => u.email === email)
    
    if (user && !validateUserPassword(user)) {
      console.warn(`User ${email} has invalid password format`)
      return null
    }
    
    return user || null
  } catch (error) {
    console.error('Error loading user from storage:', error)
    return null
  }
}

/**
 * Get password format statistics from localStorage
 * @param {string} storageKey - localStorage key (default: 'wellman_users')
 * @returns {Object} Statistics about password formats
 */
export const getPasswordFormatStats = (storageKey = 'wellman_users') => {
  try {
    const users = JSON.parse(localStorage.getItem(storageKey) || '[]')
    const stats = {
      total: users.length,
      base64: 0,
      pbkdf2: 0,
      invalid: 0,
      unknown: 0
    }
    
    users.forEach(user => {
      if (!user.password) {
        stats.invalid++
        return
      }
      
      if (user.password.includes(':')) {
        stats.pbkdf2++
      } else {
        stats.base64++
      }
      
      if (user.passwordFormat && !Object.values(PASSWORD_FORMATS).includes(user.passwordFormat)) {
        stats.unknown++
      }
    })
    
    return stats
  } catch (error) {
    console.error('Error getting password format stats:', error)
    return { total: 0, base64: 0, pbkdf2: 0, invalid: 0, unknown: 0 }
  }
}

// Export default password manager
export default {
  PASSWORD_FORMATS,
  DEFAULT_PASSWORD_FORMAT,
  encodePassword,
  verifyPassword,
  createUserWithPassword,
  validateUserPassword,
  migrateUserPassword,
  createStandardUser,
  saveUserToStorage,
  loadUserFromStorage,
  getPasswordFormatStats
}
