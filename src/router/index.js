import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/HomePage.vue'
import MedicineSearch from '@/components/MedicineSearch.vue'
import PharmaciesPage from '../components/PharmaciesPage.vue'
import PharmacyProfile from '@/components/PharmacyProfile.vue'
import MedicineDetail from '@/components/MedicineDetail.vue'
import LoginView from '@/components/LoginView.vue'
import RegisterView from '@/components/RegisterView.vue'
import UserProfile from '@/components/UserProfile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/search',
      name: 'search',
      component: MedicineSearch,
    },
    {
      path: '/pharmacies',
      name: 'pharmacies',
      component: PharmaciesPage,
    },
    {
      path: '/pharmacy/:id',
      name: 'pharmacy-profile',
      component: PharmacyProfile,
    },
    {
      path: '/medicines/:id',
      name: 'medicine-detail',
      component: MedicineDetail,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/profile',
      name: 'Profile',
      component: UserProfile,
    },
    {
      path: '/pending-approval',
      name: 'PendingApproval',
      component: () => import('@/components/PendingApprovalView.vue'),
    },
    {
      path: '/admin-dashboard',
      name: 'AdminDashboard',
      component: () => import('@/components/AdminDashboardView.vue'),
      beforeEnter: (to, from, next) => {
        // 1. Fetch current token and user from localStorage
        const token = localStorage.getItem('token')
        const user = JSON.parse(localStorage.getItem('user') || '{}')

        // 2. Check if user is logged in
        if (!token) {
          return next('/login')
        }

        // 3. Check if user role is explicitly 'admin'
        if (user.role !== 'admin') {
          return next('/') // Redirect patients/pharmacists to home
        }

        // 4. Access granted
        next()
      }
    },
    {
      path: '/pharmacist-dashboard',
      name: 'PharmacistDashboard',
      component: () => import('@/components/PharmacistDashboardView.vue'),
      beforeEnter: (to, from, next) => {
        const token = localStorage.getItem('token')
        const user = JSON.parse(localStorage.getItem('user') || '{}')

        if (!token) {
          return next('/login')
        }

        if (user.role !== 'pharmacist') {
          return next('/')
        }

        next()
      }
    },
  ],
})

export default router