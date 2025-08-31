// Centralized route definitions with authentication guards
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const Home = () => import('../views/HomeView.vue')
const Resources = () => import('../views/ResourcesView.vue')
const Tools = () => import('../views/ToolsView.vue')
const Appointments = () => import('../views/AppointmentsView.vue')
const Account = () => import('../views/AccountView.vue')
const SignUp = () => import('../views/SignUpView.vue')
const Login = () => import('../views/LoginView.vue')
const Admin = () => import('../views/AdminView.vue')
const Profile = () => import('../views/ProfileView.vue')
const Article = () => import('../views/ArticleView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public pages
    { path: '/', name: 'home', component: Home },
    { path: '/resources', name: 'resources', component: Resources },
    { path: '/article/:id', name: 'article', component: Article },
    { path: '/tools', name: 'tools', component: Tools },
    { path: '/appointments', name: 'appointments', component: Appointments },
    { path: '/signup', name: 'signup', component: SignUp },
    { path: '/login', name: 'login', component: Login },
    
    // Protected pages (require authentication)
    { 
      path: '/account', 
      name: 'account', 
      component: Account,
      meta: { requiresAuth: true }
    },
    { 
      path: '/profile', 
      name: 'profile', 
      component: Profile,
      meta: { requiresAuth: true }
    },
    
    // Admin pages (require admin role)
    { 
      path: '/admin', 
      name: 'admin', 
      component: Admin,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    
    // Catch all route
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if not already done
  if (!authStore.session) {
    authStore.initializeAuth()
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login with return URL
    next({ 
      name: 'login', 
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // Check if route requires admin role
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Redirect to home page with error message
    next({ 
      name: 'home',
      query: { error: 'access_denied' }
    })
    return
  }
  
  // If user is authenticated and trying to access login/signup, redirect to account
  if (authStore.isAuthenticated && (to.name === 'login' || to.name === 'signup')) {
    next({ name: 'account' })
    return
  }
  
  next()
})

export default router


