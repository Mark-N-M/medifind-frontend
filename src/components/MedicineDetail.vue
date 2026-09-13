<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()

const loading = ref(true)
const medicine = ref(null)
const pharmacyStockList = ref([])

const pharmacySearch = ref('')
const selectedSort = ref('Price: Low to High')

const sortOptions = [
  'Price: Low to High',
  'Price: High to Low',
  'Alphabetical (A-Z)'
]

const medicineId = computed(() => route.params.id)

const fetchMedicineDetails = async () => {
  if (!medicineId.value) return
  
  loading.value = true
  try {
    // Hits existing backend route: GET /api/medicines/{medicineId}/pharmacies
    const response = await api.get(`/medicines/${medicineId.value}/pharmacies`)
    const stocks = response.data.data || []

    // Set top-level medicine details directly from payload
    medicine.value = response.data.medicine || (stocks.length > 0 ? stocks[0].medicine : null)

    // Populate pharmacy list with prices and location details
    pharmacyStockList.value = stocks.map(stock => ({
      id: stock.id,
      pharmacyId: stock.pharmacy_id || stock.pharmacy?.id,
      name: stock.pharmacy?.name || 'Unknown Pharmacy',
      area: stock.pharmacy?.location || 'Nairobi',
      verified: Boolean(stock.pharmacy?.verified),
      price: Number(stock.price),
      available: Boolean(stock.in_stock)
    }))

  } catch (err) {
    console.error('Failed to load pharmacy stocks:', err)
    medicine.value = null
    pharmacyStockList.value = []
  } finally {
    loading.value = false
  }
}

function getCategoryColor(category) {
  switch (category?.toLowerCase()) {
    case 'antibiotics': return 'emerald'
    case 'pain relief': return 'teal'
    case 'chronic care': return 'light-green'
    case 'vitamins': return 'green'
    case 'allergy': return 'light-blue'
    default: return 'grey'
  }
}

const filteredPharmacies = computed(() => {
  let list = [...pharmacyStockList.value]

  if (pharmacySearch.value.trim()) {
    const q = pharmacySearch.value.toLowerCase()
    list = list.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.area.toLowerCase().includes(q)
    )
  }

  return list.sort((a, b) => {
    if (selectedSort.value === 'Price: Low to High') return a.price - b.price
    if (selectedSort.value === 'Price: High to Low') return b.price - a.price
    if (selectedSort.value === 'Alphabetical (A-Z)') return a.name.localeCompare(b.name)
    return 0
  })
})

watch(() => route.params.id, fetchMedicineDetails)
onMounted(fetchMedicineDetails)
</script>

<template>
  <v-sheet color="background" min-height="100vh" class="pb-12">
    <!-- Header Navigation -->
    <v-container class="py-4 border-b">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center text-primary font-weight-bold text-h6">
          <v-icon icon="mdi-pill" class="mr-2" color="primary" />
          MediFind
        </div>
        <div>
          <router-link to="/search" class="text-body-2 font-weight-medium text-primary text-decoration-none mr-6">
            Search
          </router-link>
          <router-link to="/pharmacies" class="text-body-2 text-medium-emphasis text-decoration-none mr-6">
            Pharmacies
          </router-link>
        </div>
      </div>
    </v-container>

    <v-container class="pt-6" style="max-width: 900px;">
      <!-- Back Navigation Link -->
      <div class="mb-6">
        <router-link
          to="/search"
          class="text-body-2 text-medium-emphasis text-decoration-none d-inline-flex align-center"
        >
          <v-icon icon="mdi-arrow-left" size="18" class="mr-1" />
          Back to Search
        </router-link>
      </div>

      <!-- LOADING STATE -->
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="48" />
        <div class="text-body-2 text-medium-emphasis mt-4">Loading medicine details...</div>
      </div>

      <!-- MEDICINE FOUND -->
      <template v-else-if="medicine">
        <!-- Medicine Header -->
        <div class="d-flex justify-space-between align-start flex-wrap mb-6" style="gap: 16px;">
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">{{ medicine.name }}</h1>
            <div class="text-body-1 text-medium-emphasis mb-3">
              {{ medicine.generic_name || medicine.genericName }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ pharmacyStockList.length }} {{ pharmacyStockList.length === 1 ? 'pharmacy' : 'pharmacies' }} currently stock this medicine
            </div>
          </div>

          <v-chip
            size="medium"
            variant="tonal"
            :color="getCategoryColor(medicine.category)"
            class="font-weight-medium"
          >
            {{ medicine.category }}
          </v-chip>
        </div>

        <!-- Filter & Sort Bar -->
        <v-row density="comfortable" align="center" class="mb-6">
          <v-col cols="12" sm="8">
            <v-card variant="outlined" class="pa-1 search-card" rounded="xl">
              <v-text-field
                v-model="pharmacySearch"
                placeholder="Search pharmacies by name or area..."
                variant="plain"
                hide-details
                clearable
                prepend-inner-icon="mdi-magnify"
                class="px-2"
              />
            </v-card>
          </v-col>
          <v-col cols="12" sm="4" class="d-flex justify-sm-end">
            <v-select
              v-model="selectedSort"
              :items="sortOptions"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              style="max-width: 200px;"
            />
          </v-col>
        </v-row>

        <!-- Pharmacy Cards Section -->
        <div class="text-h6 font-weight-bold mb-4">Available at these pharmacies</div>

        <!-- PHARMACIES LISTING MEDICINE WITH PRICES -->
        <v-row v-if="filteredPharmacies.length > 0">
          <v-col
            v-for="item in filteredPharmacies"
            :key="item.id"
            cols="12"
            md="6"
          >
            <v-card variant="outlined" rounded="lg" class="pa-5 h-100 d-flex flex-column justify-space-between">
              <div>
                <div class="d-flex justify-space-between align-start mb-1">
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">{{ item.name }}</div>
                    <div class="text-caption text-medium-emphasis">
                      <v-icon icon="mdi-map-marker-outline" size="14" class="mr-1" />
                      {{ item.area }}
                    </div>
                  </div>

                  <v-chip
                    v-if="item.verified"
                    size="x-small"
                    color="primary"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    <v-icon icon="mdi-check-decagram" start size="12" /> Verified
                  </v-chip>
                </div>

                <!-- Price and Availability display -->
                <div class="d-flex justify-space-between align-end mt-6 mb-4">
                  <div>
                    <div class="text-caption text-medium-emphasis">Price</div>
                    <div class="text-h6 font-weight-bold text-primary">
                      KES {{ item.price.toLocaleString() }}
                    </div>
                  </div>

                  <v-chip
                    v-if="item.available"
                    size="small"
                    color="success"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    In stock
                  </v-chip>
                  <v-chip
                    v-else
                    size="small"
                    color="grey"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    Out of stock
                  </v-chip>
                </div>
              </div>

              <v-btn
                :to="`/pharmacy/${item.pharmacyId}`"
                variant="outlined"
                block
                rounded="lg"
                class="text-none mt-2"
              >
                View Pharmacy
              </v-btn>
            </v-card>
          </v-col>
        </v-row>

        <!-- NO STOCKS MATCH SEARCH -->
        <v-card v-else-if="pharmacyStockList.length > 0" variant="outlined" rounded="lg" class="pa-8 text-center">
          <v-icon icon="mdi-store-off-outline" size="40" color="grey" class="mb-2" />
          <div class="text-body-1 font-weight-medium text-medium-emphasis">
            No pharmacies found matching "{{ pharmacySearch }}"
          </div>
        </v-card>

        <!-- NO PHARMACIES HAVE STOCKED THIS MEDICINE YET -->
        <v-card v-else variant="outlined" rounded="lg" class="pa-8 text-center">
          <v-icon icon="mdi-package-variant-closed text-medium-emphasis" size="40" color="grey" class="mb-2" />
          <div class="text-body-1 font-weight-medium text-medium-emphasis">
            No pharmacies currently have this medicine in stock.
          </div>
        </v-card>
      </template>

      <!-- NOT FOUND STATE -->
      <template v-else>
        <v-card variant="outlined" rounded="xl" class="pa-12 text-center my-8">
          <v-icon icon="mdi-file-document-outline" size="48" color="grey-lighten-1" class="mb-4" />
          <div class="text-h5 font-weight-bold mb-2">Medicine not found</div>
          <div class="text-body-1 text-medium-emphasis">
            This medicine is no longer listed on MediFind.
          </div>
        </v-card>
      </template>
    </v-container>
  </v-sheet>
</template>

<style scoped>
.search-card {
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
}
</style>