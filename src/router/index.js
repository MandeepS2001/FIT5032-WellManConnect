// Centralized route definitions. Each route lazy-loads its view component
// to keep initial bundle small and improve performance.
import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../views/HomeView.vue')
const Resources = () => import('../views/ResourcesView.vue')
const Tools = () => import('../views/ToolsView.vue')
const Appointments = () => import('../views/AppointmentsView.vue')
const Account = () => import('../views/AccountView.vue')
const SignUp = () => import('../views/SignUpView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public pages
    { path: '/', name: 'home', component: Home },
    { path: '/resources', name: 'resources', component: Resources },
    { path: '/tools', name: 'tools', component: Tools },
    { path: '/appointments', name: 'appointments', component: Appointments },
    { path: '/account', name: 'account', component: Account },
    { path: '/signup', name: 'signup', component: SignUp },
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router


