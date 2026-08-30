<script setup>
import { ref, computed } from 'vue'
import { useMedicinesStore } from '../stores/medicines'
import { usePharmaciesStore } from '../stores/pharmacies'
import { useStockStore } from '../stores/stock'

const medicinesStore = useMedicinesStore()
const pharmaciesStore = usePharmaciesStore()
const stockStore = useStockStore()

// Controls
const searchQuery = ref('')
const selectedCategory = ref('All categories')
const selectedSort = ref('Lowest Price First')
const inStockOnly = ref(false)

// Track open state for expandable pharmacy drawers per medicine ID
const expandedMedicines = ref([])

const categoryOptions = [
  'All categories',
  'Antibiotics',
  'Pain Relief',
  'Chronic Care',
  'Vitamins',
  'Allergy',
]

const sortOptions = [
  'Lowest Price First',
  'Highest Price First',
  'Alphabetical (A-Z)',
]

// Fetch stock records for a specific medicine
function getStockForMedicine(medicineId) {
  const allStock = Object.values(stockStore.stock || {})
  return allStock.filter(entry => entry.medicine_id === medicineId)
}

// Fetch pharmacy details by ID
function getPharmacy(pharmacyId) {
  const pharmacies = Object.values(pharmaciesStore.pharmacies || {})
  return pharmacies.find(p => p.id === pharmacyId) || { name: 'Unknown Pharmacy', area: 'Nairobi' }
}

// Calculate starting lowest price for a medicine
function getLowestPrice(medicineId) {
  const stockList = getStockForMedicine(medicineId).filter(s => s.available && s.price > 0)
  if (!stockList.length) return null
  return Math.min(...stockList.map(s => s.price))
}

// Toggle expansion drawer for a medicine
function toggleExpand(medicineId) {
  const index = expandedMedicines.value.indexOf(medicineId)
  if (index > -1) {
    expandedMedicines.value.splice(index, 1)
  } else {
    expandedMedicines.value.push(medicineId)
  }
}

// Category Chip Colors
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

// Filtered & Sorted Medicine Computation
const filteredMedicines = computed(() => {
  let list = Object.values(medicinesStore.medicines || [])

  // Search Filter
  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(m => 
      m.name?.toLowerCase().includes(q) || 
      m.genericName?.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q)
    )
  }

  // Category Filter
  if (selectedCategory.value !== 'All categories') {
    list = list.filter(m => m.category?.toLowerCase() === selectedCategory.value.toLowerCase())
  }

  // In Stock Filter
  if (inStockOnly.value) {
    list = list.filter(m => {
      const stockList = getStockForMedicine(m.id)
      return stockList.some(s => s.available && s.stock_count > 0)
    })
  }

  // Sorting Logic
  return list.sort((a, b) => {
    const priceA = getLowestPrice(a.id) ?? Infinity
    const priceB = getLowestPrice(b.id) ?? Infinity

    if (selectedSort.value === 'Lowest Price First') {
      return priceA - priceB
    } else if (selectedSort.value === 'Highest Price First') {
      return (priceB === Infinity ? -1 : priceB) - (priceA === Infinity ? -1 : priceA)
    } else if (selectedSort.value === 'Alphabetical (A-Z)') {
      return a.name.localeCompare(b.name)
    }
    return 0
  })
})
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
          <router-link to="/pharmacies" class="text-body-2 text-medium-emphasis text-decoration-none">
            Pharmacies
          </router-link>
        </div>
      </div>
    </v-container>

    <v-container class="pt-8" style="max-width: 1000px;">
      <!-- Hero Title -->
      <div class="text-h3 font-weight-bold mb-2">Search medicine</div>
      <div class="text-body-1 text-medium-emphasis mb-8">
        Search by brand, generic name or category, then compare prices and stock across verified Nairobi pharmacies.
      </div>

      <!-- Search Input Box -->
      <v-card variant="outlined" class="pa-2 mb-6 search-card" rounded="xl">
        <v-text-field
          v-model="searchQuery"
          placeholder="e.g. Amoxicillin, Panadol, Chronic Care"
          variant="plain"
          hide-details
          clearable
          prepend-inner-icon="mdi-magnify"
          class="px-2"
        />
      </v-card>

      <!-- Filter Controls Bar -->
      <v-card variant="outlined" class="pa-4 mb-8" rounded="lg">
        <v-row align="center" density="comfortable">
          <v-col cols="12" sm="4">
            <div class="text-caption text-medium-emphasis mb-1">Category</div>
            <v-select
              v-model="selectedCategory"
              :items="categoryOptions"
              variant="outlined"
              density="compact"
              hide-details
              rounded="md"
            />
          </v-col>

          <v-col cols="12" sm="4">
            <div class="text-caption text-medium-emphasis mb-1">Sort by</div>
            <v-select
              v-model="selectedSort"
              :items="sortOptions"
              variant="outlined"
              density="compact"
              hide-details
              rounded="md"
            />
          </v-col>

          <v-col cols="12" sm="4" class="d-flex justify-sm-end align-center pt-sm-5">
            <v-switch
              v-model="inStockOnly"
              label="In Stock Only"
              color="primary"
              hide-details
              density="compact"
              inset
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- Results Count -->
      <div class="text-body-2 text-medium-emphasis mb-4">
        {{ filteredMedicines.length }} medicines found
      </div>

      <!-- Medicine Grid -->
      <v-row>
        <v-col
          v-for="medicine in filteredMedicines"
          :key="medicine.id"
          cols="12"
          md="6"
        >
          <v-card variant="outlined" rounded="lg" class="pa-5 h-100 d-flex flex-column justify-space-between">
            <div>
              <!-- Medicine Header & Category Tag -->
              <div class="d-flex justify-space-between align-start mb-1">
                <div class="text-h6 font-weight-bold">{{ medicine.name }}</div>
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="getCategoryColor(medicine.category)"
                  class="font-weight-medium"
                >
                  {{ medicine.category }}
                </v-chip>
              </div>

              <!-- Generic Subtitle -->
              <div class="text-body-2 text-medium-emphasis mb-4">
                {{ medicine.genericName }}
              </div>

              <!-- Stock & Price Indicator -->
              <template v-if="getStockForMedicine(medicine.id).length > 0">
                <div class="d-flex align-center flex-wrap mb-4" style="gap: 6px;">
                  <span class="text-body-2 text-medium-emphasis">
                    Available at {{ getStockForMedicine(medicine.id).length }} 
                    {{ getStockForMedicine(medicine.id).length === 1 ? 'pharmacy' : 'pharmacies' }} near Nairobi
                  </span>
                  <v-chip
                    v-if="getLowestPrice(medicine.id)"
                    size="small"
                    color="primary"
                    variant="tonal"
                    class="font-weight-bold"
                  >
                    from KES {{ getLowestPrice(medicine.id) }}
                  </v-chip>
                </div>
              </template>

              <!-- Out of Stock Indicator -->
              <template v-else>
                <div class="text-body-2 text-medium-emphasis mb-4">
                  Currently out of stock across tracked pharmacies.
                </div>
              </template>
            </div>

            <!-- Action Buttons Footer -->
            <div>
              <div class="d-flex align-center justify-space-between flex-wrap pt-2" style="gap: 8px;">
                <v-btn
                  :to="`/medicines/${medicine.id}`"
                  variant="outlined"
                  color="primary"
                  density="comfortable"
                  prepend-icon="mdi-information-outline"
                  class="text-none rounded-lg"
                >
                  View Details
                </v-btn>

                <v-btn
                  v-if="getStockForMedicine(medicine.id).length > 0"
                  variant="text"
                  density="comfortable"
                  color="primary"
                  class="px-0 text-none font-weight-medium"
                  @click="toggleExpand(medicine.id)"
                >
                  {{ expandedMedicines.includes(medicine.id) ? 'Hide pharmacies' : `Show ${getStockForMedicine(medicine.id).length} pharmacies` }}
                  <v-icon :icon="expandedMedicines.includes(medicine.id) ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="ml-1" />
                </v-btn>
              </div>

              <!-- Expanded Pharmacy Details Drawer -->
              <v-expand-transition>
                <div v-show="expandedMedicines.includes(medicine.id)" class="mt-3 pt-3 border-t">
                  <div
                    v-for="stockItem in getStockForMedicine(medicine.id)"
                    :key="stockItem.id"
                    class="d-flex justify-space-between align-center py-2 border-b-dashed"
                  >
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">
                        {{ getPharmacy(stockItem.pharmacy_id).name }}
                        <v-icon
                          v-if="getPharmacy(stockItem.pharmacy_id).verified"
                          icon="mdi-check-decagram"
                          color="primary"
                          size="14"
                          class="ml-1"
                        />
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ getPharmacy(stockItem.pharmacy_id).area || 'Nairobi' }}
                      </div>
                    </div>

                    <div class="text-right">
                      <div class="text-subtitle-2 font-weight-bold text-primary">
                        KES {{ stockItem.price }}
                      </div>
                      <div class="text-caption" :class="stockItem.stock_count > 0 ? 'text-success' : 'text-error'">
                        {{ stockItem.stock_count > 0 ? `${stockItem.stock_count} in stock` : 'Out of stock' }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-expand-transition>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<style scoped>
.search-card {
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
}

.border-b-dashed {
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.border-b-dashed:last-child {
  border-bottom: none;
}
</style>