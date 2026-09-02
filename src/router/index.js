import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/HomePage.vue'
import MedicineSearch from '@/components/MedicineSearch.vue'
import PharmaciesPage from '../components/PharmaciesPage.vue'
import PharmacyProfile from '@/components/PharmacyProfile.vue'
import MedicineDetail from '@/components/MedicineDetail.vue'
import LoginView from '@/components/LoginView.vue'
import RegisterView from '@/components/RegisterView.vue'

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
      path: '/pending-approval',
      name: 'PendingApproval',
      component: () => import('@/components/PendingApprovalView.vue'),
    },
    {
      path: '/admin-dashboard',
      name: 'AdminDashboard',
      component: () => import('@/components/AdminDashboardView.vue'),
    },
  ],
})

export default router