import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/components/HomePage.vue'
import MedicineSearch from '@/components/MedicineSearch.vue'

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
  ],
})

export default router