<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMedicinesStore } from '../stores/medicines'
import { useStockStore } from '../stores/stock'
import { usePharmaciesStore } from '../stores/pharmacies'

const route = useRoute()
const medicinesStore = useMedicinesStore()
const stockStore = useStockStore()
const pharmaciesStore = usePharmaciesStore()

// Local state for filtering/sorting pharmacies within this view
const pharmacySearch = ref('')
const selectedSort = ref('Price: Low to High')

const sortOptions = [
  'Price: Low to High',
  'Price: High to Low',
  'Stock: High to Low',
  'Alphabetical (A-Z)'
]

// Parse route param dynamically
const medicineId = computed(() => Number(route.params.id) || route.params.id)

// Retrieve medicine record matching the route param
const medicine = computed(() => {
  const medicines = Object.values(medicinesStore.medicines || {})
  return medicines.find(m => m.id === medicineId.value) || null
})

// Category badge helper
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

// Map stock items to pharmacy details for this specific medicine
const pharmacyStockList = computed(() => {
  if (!medicine.value) return []

  const stockEntries = Object.values(stockStore.stock || {}).filter(
    s => s.medicine_id === medicine.value.id
  )
  const pharmacies = Object.values(pharmaciesStore.pharmacies || {})

  return stockEntries.map(stock => {
    const p = pharmacies.find(pharm => pharm.id === stock.pharmacy_id) || {}
    return {
      id: stock.id,
      pharmacyId: p.id,
      name: p.name || 'Unknown Pharmacy',
      area: p.area || 'Nairobi',
      address: p.address || '',
      verified: p.verified || false,
      price: stock.price,
      stockCount: stock.stock_count,
      available: stock.available && stock.stock_count > 0
    }
  })
})

// Search & Sort implementation for pharmacies stocking this medicine
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
    if (selectedSort.value === 'Stock: High to Low') return b.stockCount - a.stockCount
    if (selectedSort.value === 'Alphabetical (A-Z)') return a.name.localeCompare(b.name)
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
          <router-link to="/pharmacies" class="text-body-2 text-medium-emphasis text-decoration-none mr-6">
            Pharmacies
          </router-link>
          <span class="text-body-2 text-medium-emphasis cursor-pointer">Login</span>
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

      <!-- MEDICINE FOUND -->
      <template v-if="medicine">
        <!-- Medicine Header -->
        <div class="d-flex justify-space-between align-start flex-wrap mb-6" style="gap: 16px;">
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">{{ medicine.name }}</h1>
            <div class="text-body-1 text-medium-emphasis mb-3">
              {{ medicine.genericName }}
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
                placeholder="Search for another medicine..."
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

        <v-row v-if="filteredPharmacies.length > 0">
          <v-col
            v-for="item in filteredPharmacies"
            :key="item.id"
            cols="12"
            md="6"
          >
            <v-card variant="outlined" rounded="lg" class="pa-5 h-100 d-flex flex-column justify-space-between">
              <div>
                <!-- Pharmacy Name & Verification Badge -->
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

                <!-- Price and Availability Stock Badge -->
                <div class="d-flex justify-space-between align-end mt-6 mb-4">
                  <div class="text-h6 font-weight-bold text-primary">
                    KES {{ item.price }}
                  </div>

                  <v-chip
                    v-if="item.available"
                    size="small"
                    color="success"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    In stock · {{ item.stockCount }}
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

              <!-- View Pharmacy Action -->
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

        <v-card v-else variant="outlined" rounded="lg" class="pa-8 text-center">
          <v-icon icon="mdi-store-off-outline" size="40" color="grey" class="mb-2" />
          <div class="text-body-1 font-weight-medium text-medium-emphasis">
            No pharmacies found matching "{{ pharmacySearch }}"
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
.cursor-pointer {
  cursor: pointer;
}
</style>