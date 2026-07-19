import { createRouter, createWebHistory } from 'vue-router'
import MedicineSearch from '@/components/MedicineSearch.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MedicineSearch,
    },
  ],
})

export default router