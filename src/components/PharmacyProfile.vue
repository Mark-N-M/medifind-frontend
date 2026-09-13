<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api.js'

const route = useRoute()
const router = useRouter()

const pharmacy = ref(null)
const medications = ref([])
const error = ref(null)

const fetchPharmacyProfile = async () => {
  const pharmacyId = route.params.id
  if (!pharmacyId) {
    error.value = 'Pharmacy ID is missing.'
    loading.value = false
    return
  }

  loading.value = true
  try {
    const response = await api.get(`/pharmacies/${pharmacyId}`)
    const data = response.data?.data || response.data
    
    pharmacy.value = data
    // Handles medications list if attached directly or nested inside stock
    medications.value = data.medications || data.stocks || []
  } catch (err) {
    console.error('Failed to load pharmacy profile:', err)
    error.value = 'Unable to load pharmacy details. Please try again.'
  } finally {
    loading.value = false
  }
}

const goToMedicineDetail = (medicineId) => {
  if (!medicineId) return
  router.push({
    name: 'medicine-detail',
    params: { id: medicineId }
  })
}

onMounted(() => {
  fetchPharmacyProfile()
})

const openDirections = () => {
  if (!pharmacy.value) return

  const { latitude, longitude, location, name } = pharmacy.value

  let mapsUrl = ''

  if (latitude && longitude) {
    // Exact GPS navigation target
    mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
  } else {
    // Address-based search fallback
    const query = encodeURIComponent(`${name} ${location || ''} Nairobi Kenya`)
    mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`
  }

  window.open(mapsUrl, '_blank')
}
</script>

<template>
  <v-container style="max-width: 1000px;" class="py-8">
    <!-- Back Button -->
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      @click="router.back()"
    >
      Back to Search
    </v-btn>

    <!-- Loading State -->
    <v-progress-linear v-if="loading" indeterminate color="primary" class="my-8" />

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" variant="tonal" rounded="xl" class="mb-6">
      {{ error }}
    </v-alert>

    <!-- Profile View -->
    <div v-else-if="pharmacy">
      <!-- Header Card -->
      <v-card variant="outlined" rounded="xl" class="pa-6 mb-8">
        <div class="d-flex justify-space-between align-start flex-wrap ga-4">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              {{ pharmacy.name || pharmacy.pharmacy_name || 'Unnamed Pharmacy' }}
            </h1>
            
            <div class="text-body-1 text-medium-emphasis mb-2 d-flex align-center">
              <v-icon icon="mdi-map-marker" size="small" class="mr-1" />
              <span>{{ pharmacy.location || pharmacy.address || 'Location unavailable' }}</span>
            </div>

            <!-- Phone Number Display with Fallback -->
            <div class="text-body-2 text-medium-emphasis d-flex align-center">
              <v-icon icon="mdi-phone" size="small" class="mr-1" />
              <span>{{ pharmacy.phone || 'No phone number listed' }}</span>
            </div>
          </div>

          <!-- Add this next to your phone/location details in PharmacyProfile.vue -->
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-navigation-variant-outline"
            size="small"
            rounded="lg"
            class="mt-3 text-none"
            @click="openDirections"
          >
            Get Directions
          </v-btn>

          <!-- Dynamic Verification Badge -->
          <v-chip
            :color="pharmacy.verified ? 'success' : 'grey'"
            size="large"
            variant="tonal"
            rounded="lg"
          >
            <v-icon :icon="pharmacy.verified ? 'mdi-check-decagram' : 'mdi-alert-circle-outline'" start />
            {{ pharmacy.verified ? 'Verified Pharmacy' : 'Unverified Listing' }}
          </v-chip>
        </div>
      </v-card>

      <!-- Inventory Title -->
      <h2 class="text-h5 font-weight-bold mb-4">
        Available Medication ({{ medications.length }})
      </h2>

      <!-- Medication Inventory List -->
      <v-row v-if="medications.length > 0">
        <v-col v-for="item in medications" :key="item.id" cols="12" md="6">
          <v-card variant="outlined" rounded="xl" class="pa-5 h-100 d-flex flex-column justify-space-between">
            <div>
              <div class="d-flex justify-space-between align-start mb-2">
                <div>
                  <div class="text-h6 font-weight-bold">
                    {{ item.medicine?.name || item.name || 'Unknown Medicine' }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ item.medicine?.generic_name || item.generic_name || 'N/A' }}
                  </div>
                </div>

                <v-chip color="primary" size="small" variant="tonal" class="font-weight-medium">
                  KES {{ item.price ? Number(item.price).toLocaleString() : '0' }}
                </v-chip>
              </div>
            </div>

            <div class="d-flex justify-space-between align-center mt-4">
              <v-chip
                :color="item.in_stock !== false && item.quantity !== 0 ? 'success' : 'error'"
                size="x-small"
                variant="tonal"
                class="font-weight-medium"
              >
                {{ item.in_stock !== false && item.quantity !== 0 ? 'In Stock' : 'Out of Stock' }}
              </v-chip>

              <v-btn
                variant="text"
                color="primary"
                size="small"
                append-icon="mdi-chevron-right"
                @click="goToMedicineDetail(item.medicine_id || item.medicine?.id || item.id)"
              >
                Details
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-card v-else variant="outlined" rounded="xl" class="pa-8 text-center text-medium-emphasis">
        No medication items listed for this pharmacy yet.
      </v-card>
    </div>
  </v-container>
</template>