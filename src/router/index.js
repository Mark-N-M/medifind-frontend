import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/HomePage.vue'
import MedicineSearch from '@/components/MedicineSearch.vue'
import PharmaciesPage from '../components/PharmaciesPage.vue'
import PharmacyProfile from '@/components/PharmacyProfile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
     {
      path: '/',
      component: HomePage,
    },
    {
      path: '/search',
      component: MedicineSearch,
    },
    {
      path: '/pharmacies',
      component: PharmaciesPage,
    },
   {
      path: '/pharmacy/:id',
      name: 'pharmacy-profile',
      component: PharmacyProfile,
    }
  ],
})

export default router