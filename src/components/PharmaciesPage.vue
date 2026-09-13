<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api.js'

const pharmacies = ref([])
const loading = ref(false)

const fetchPharmacies = async () => {
  loading.value = true
  try {
    const response = await api.get('/public/pharmacies')

    console.log('Pharmacies API response:', response.data)

    const payload = response.data?.data ?? response.data ?? []
    pharmacies.value = Array.isArray(payload) ? payload : []
  } catch (err) {
    console.error('Failed to load pharmacies:', err)
    console.log('Status:', err.response?.status)
    console.log('Response data:', err.response?.data)
    console.log('Error message:', err.message)
    pharmacies.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPharmacies()
})
</script>

<template>
  <v-container style="max-width: 1000px;" class="py-8">
    <h1 class="text-h4 font-weight-bold mb-1">Partner Pharmacies</h1>
    <div class="text-body-2 text-medium-emphasis mb-6">Browse verified local pharmacies listed on MediFind</div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row v-if="pharmacies.length > 0">
      <v-col v-for="p in pharmacies" :key="p.id" cols="12" md="4">
        <v-card variant="outlined" rounded="xl" class="pa-5">
          <v-icon icon="mdi-store" size="32" color="primary" class="mb-2" />
          <div class="text-h6 font-weight-bold">{{ p.name }}</div>
          <div class="text-body-2 text-medium-emphasis mb-3">{{ p.location || 'Nairobi' }}</div>
          <v-chip size="small" variant="tonal" color="primary">
            {{ p.stocks_count || 0 }} Medicines Listed
          </v-chip>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>