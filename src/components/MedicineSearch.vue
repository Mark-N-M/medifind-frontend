<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api.js'

const router = useRouter()

const searchQuery = ref('')
const selectedCategory = ref('All categories')
const inStockOnly = ref(false)
const medicines = ref([])
const loading = ref(false)

const categories = ['All categories', 'Pain Relief', 'Antibiotic', 'Allergy', 'Chronic Care']

const fetchMedicines = async () => {
  loading.value = true
  try {
    const response = await api.get('/search/medicines', {
      params: {
        q: searchQuery.value,
        category: selectedCategory.value,
        in_stock_only: inStockOnly.value
      }
    })
    medicines.value = response.data?.data || response.data
  } catch (err) {
    console.error('Failed to fetch search results:', err)
  } finally {
    loading.value = false
  }
}

// Navigates directly to /pharmacy/:id for the selected pharmacy
const goToPharmacy = (pharmacy) => {
  const pharmacyId = pharmacy?.pharmacy_id || pharmacy?.id || pharmacy?.pharmacy?.id

  if (!pharmacyId) {
    console.error('Missing pharmacy ID from item:', pharmacy)
    return
  }

  router.push({
    name: 'pharmacy-profile',
    params: { id: pharmacyId }
  })
}

const goToMedicineDetail = (medicineId) => {
  if (!medicineId) {
    console.error('Medicine ID is missing:', medicineId)
    return
  }

  router.push({
    name: 'medicine-detail',
    params: { id: medicineId }
  })
}

watch([searchQuery, selectedCategory, inStockOnly], () => {
  fetchMedicines()
})

onMounted(() => {
  fetchMedicines()
})
</script>

<template>
  <v-container style="max-width: 1000px;" class="py-8">
    <h1 class="text-h4 font-weight-bold mb-1">Search medicine</h1>
    <div class="text-body-2 text-medium-emphasis mb-6">
      Search by brand, generic name or category, then compare prices across verified Nairobi pharmacies.
    </div>

    <!-- Search Input -->
    <v-text-field
      v-model="searchQuery"
      placeholder="e.g. Amoxicillin, Panadol, Chronic Care"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      rounded="lg"
      clearable
      class="mb-4"
    />

    <!-- Filter Bar -->
    <v-card variant="outlined" rounded="xl" class="pa-4 mb-6 d-flex align-center gap-4 flex-wrap">
      <v-select
        v-model="selectedCategory"
        :items="categories"
        label="Category"
        variant="outlined"
        density="compact"
        hide-details
        style="max-width: 200px;"
      />
      <v-switch
        v-model="inStockOnly"
        label="In Stock Only"
        color="primary"
        hide-details
      />
    </v-card>

    <div class="text-subtitle-2 mb-4">{{ medicines.length }} medicines found</div>

    <!-- Loading Indicator -->
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <!-- Results Grid -->
    <v-row v-else>
      <v-col v-for="med in medicines" :key="med.id" cols="12" md="6">
        <v-card variant="outlined" rounded="xl" class="pa-5 h-100 d-flex flex-column justify-space-between">
          <div>
            <div class="d-flex justify-space-between align-start mb-1">
              <div>
                <div class="text-h6 font-weight-bold">{{ med.name }}</div>
                <div class="text-body-2 text-medium-emphasis mb-2">{{ med.generic_name || 'N/A' }}</div>
              </div>
              <v-chip size="small" variant="tonal" color="primary">{{ med.category || 'General' }}</v-chip>
            </div>

            <div v-if="med.available_pharmacies_count > 0" class="text-body-2 mb-2">
              Available at {{ med.available_pharmacies_count }} pharmacies near Nairobi
              <div class="mt-1">
                <v-chip color="success" size="small" variant="tonal">from KES {{ med.lowest_price }}</v-chip>
              </div>
            </div>
            <div v-else class="text-body-2 text-medium-emphasis font-italic mb-2">
              Currently out of stock across tracked pharmacies
            </div>
          </div>

          <div>
            <!-- View Details Link -->
            <v-btn
              variant="text"
              color="primary"
              size="small"
              class="mb-2 px-0"
              append-icon="mdi-arrow-right"
              @click.stop="goToMedicineDetail(med.id)"
            >
              View Medicine Details
            </v-btn>

            <!-- Expandable Pharmacies Accordion -->
            <v-expansion-panels variant="accordion">
              <v-expansion-panel title="Show pharmacies" rounded="lg">
                <v-expansion-panel-text class="pa-0">
                  <v-list density="compact" nav>
                    <v-list-item 
                      v-for="(p, i) in med.pharmacies" 
                      :key="i"
                      link
                      class="px-2"
                      @click.stop="goToPharmacy(p)"
                    >
                      <v-list-item-title class="font-weight-medium">
                        {{ p.pharmacy_name || p.name }}
                      </v-list-item-title>
                      
                      <v-list-item-subtitle>
                        {{ p.location }} — <strong>KES {{ p.price }}</strong>
                      </v-list-item-subtitle>

                      <template v-slot:append>
                        <v-icon icon="mdi-chevron-right" size="small" color="primary" />
                      </template>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>