import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  generateSessionID, 
  validateSessionID, 
  hashPassword, 
  verifyPassword,
  generateCSRFToken,
  getCSRFToken,
  validateCSRFToken
} from '../utils/security'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  // State
  const session = ref(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => {
    if (!session.value) return false
    
    // Check if session has expired
    const now = new Date()
    const expiresAt = new Date(session.value.expiresAt)
    
    if (now > expiresAt) {
      logout()
      return false
    }
    
    return true
  })

  const currentUser = computed(() => {
    return session.value?.user || null
  })

  const userRole = computed(() => {
    return currentUser.value?.role || 'guest'
  })

  const isAdmin = computed(() => {
    return userRole.value === 'admin'
  })

  const isPremium = computed(() => {
    return userRole.value === 'premium'
  })

  const isUser = computed(() => {
    return userRole.value === 'user'
  })

  // Actions
  const initializeAuth = () => {
    try {
      const storedSession = localStorage.getItem('wellman_session')
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession)
        
        // Check if session has expired
        const now = new Date()
        const expiresAt = new Date(parsedSession.expiresAt)
        
        if (now <= expiresAt) {
          session.value = parsedSession
        } else {
          // Session expired, clear it
          logout()
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      logout()
    }
  }

  const login = (userData) => {
    const token = generateToken()
    const newSession = {
      token,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user',
        lastLogin: new Date().toISOString()
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }
    
    session.value = newSession
    localStorage.setItem('wellman_session', JSON.stringify(newSession))
    
    // Update user's last login in storage
    const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
    const userIndex = users.findIndex(u => u.id === userData.id)
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date().toISOString()
      localStorage.setItem('wellman_users', JSON.stringify(users))
    }
  }

  const logout = () => {
    session.value = null
    localStorage.removeItem('wellman_session')
    
    // Redirect to login page
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login')
    }
  }

  const refreshSession = () => {
    if (session.value) {
      const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      session.value.expiresAt = newExpiresAt
      localStorage.setItem('wellman_session', JSON.stringify(session.value))
    }
  }

  const updateUserProfile = (updates) => {
    if (session.value && session.value.user) {
      session.value.user = { ...session.value.user, ...updates }
      localStorage.setItem('wellman_session', JSON.stringify(session.value))
      
      // Also update in users array
      const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
      const userIndex = users.findIndex(u => u.id === session.value.user.id)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates }
        localStorage.setItem('wellman_users', JSON.stringify(users))
      }
    }
  }

  const changeUserRole = (newRole) => {
    if (session.value && session.value.user) {
      session.value.user.role = newRole
      localStorage.setItem('wellman_session', JSON.stringify(session.value))
      
      // Update in users array
      const users = JSON.parse(localStorage.getItem('wellman_users') || '[]')
      const userIndex = users.findIndex(u => u.id === session.value.user.id)
      if (userIndex !== -1) {
        users[userIndex].role = newRole
        localStorage.setItem('wellman_users', JSON.stringify(users))
      }
    }
  }

  // Utility functions
  const generateToken = () => {
    return generateSessionID()
  }

  const validateToken = (token) => {
    // Validate token format using security utilities
    return token && validateSessionID(token)
  }

  // Auto-refresh session every 30 minutes
  const startSessionRefresh = () => {
    setInterval(() => {
      if (isAuthenticated.value) {
        refreshSession()
      }
    }, 30 * 60 * 1000) // 30 minutes
  }

  return {
    // State
    session,
    isLoading,
    
    // Getters
    isAuthenticated,
    currentUser,
    userRole,
    isAdmin,
    isPremium,
    isUser,
    
    // Actions
    initializeAuth,
    login,
    logout,
    refreshSession,
    updateUserProfile,
    changeUserRole,
    validateToken,
    startSessionRefresh
  }
})
