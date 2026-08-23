<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePharmaciesStore } from '../stores/pharmacies'
import { useStockStore } from '../stores/stock'
import { useMedicinesStore } from '../stores/medicines'

const route = useRoute()
const pharmaciesStore = usePharmaciesStore()
const stockStore = useStockStore()
const medicinesStore = useMedicinesStore()

const medicineSearch = ref('')

// Extract Pharmacy ID from URL parameter (/pharmacy/:id)
const pharmacyId = computed(() => route.params.id)

// Fetch matching pharmacy or fallback gracefully
const pharmacy = computed(() => {
  const list = Object.values(pharmaciesStore.pharmacies || {})
  return list.find(p => p.id === pharmacyId.value) || {
    id: pharmacyId.value,
    name: 'Pharmacy Profile',
    area: 'Nairobi',
    address: 'Location details unavailable',
    operatingHours: '8:00 AM - 8:00 PM',
    phone: '+254700000000',
    rating: 4.5,
    verified: false,
  }
})

// Safe Google Maps link calculation
function getDirectionsUrl(pharm) {
  const lat = pharm.latitude || pharm.lat
  const lng = pharm.longitude || pharm.lng

  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }
  const searchQuery = `${pharm.name || ''} ${pharm.address || ''} ${pharm.area || ''} Nairobi`.trim()
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`
}

// Category Badge Color
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

// Get stock items for current pharmacy
const pharmacyStock = computed(() => {
  const stockList = Object.values(stockStore.stock || {}).filter(
    s => s.pharmacy_id === pharmacyId.value
  )
  const medicines = Object.values(medicinesStore.medicines || {})

  return stockList.map(stockItem => {
    const med = medicines.find(m => m.id === stockItem.medicine_id) || {}
    return {
      id: stockItem.id,
      name: med.name || 'Unknown Medicine',
      genericName: med.genericName || med.dosage || '',
      category: med.category || 'General',
      price: stockItem.price,
      stockCount: stockItem.stock_count,
      available: stockItem.available && stockItem.stock_count > 0,
    }
  })
})

// Filter stock by search input
const filteredStock = computed(() => {
  if (!medicineSearch.value.trim()) return pharmacyStock.value

  const q = medicineSearch.value.toLowerCase()
  return pharmacyStock.value.filter(
    item =>
      item.name.toLowerCase().includes(q) ||
      item.genericName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  )
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
          <router-link to="/search" class="text-body-2 text-medium-emphasis text-decoration-none mr-6">
            Search
          </router-link>
          <router-link to="/pharmacies" class="text-body-2 font-weight-medium text-primary text-decoration-none">
            Pharmacies
          </router-link>
        </div>
      </div>
    </v-container>

    <v-container class="pt-6" style="max-width: 900px;">
      <!-- Back Navigation Link -->
      <div class="mb-6">
        <router-link
          to="/pharmacies"
          class="text-body-2 text-medium-emphasis text-decoration-none d-inline-flex align-center"
        >
          <v-icon icon="mdi-arrow-left" size="18" class="mr-1" />
          Back to Pharmacies
        </router-link>
      </div>

      <!-- Pharmacy Info Header -->
      <div class="d-flex justify-space-between align-start flex-wrap mb-6" style="gap: 16px;">
        <div>
          <div class="d-flex align-center mb-1">
            <h1 class="text-h4 font-weight-bold mr-2">{{ pharmacy.name }}</h1>
            <v-chip
              v-if="pharmacy.verified"
              size="x-small"
              color="primary"
              variant="tonal"
              class="font-weight-medium"
            >
              <v-icon icon="mdi-check-decagram" start size="12" /> Verified
            </v-chip>
          </div>

          <div class="text-body-2 text-medium-emphasis mb-2">
            <v-icon icon="mdi-map-marker-outline" size="16" class="mr-1" />
            {{ pharmacy.area }}
          </div>

          <div class="text-body-2 text-medium-emphasis mb-1">
            {{ pharmacy.address }}
          </div>

          <div class="text-body-2 text-medium-emphasis">
            <v-icon icon="mdi-clock-outline" size="16" class="mr-1" />
            {{ pharmacy.operatingHours || '8:00 AM - 8:00 PM' }}
          </div>
        </div>

        <!-- Rating Badge -->
        <v-chip size="default" variant="outlined" class="font-weight-bold pa-3">
          <v-icon icon="mdi-star" color="amber-darken-2" start size="18" />
          {{ pharmacy.rating || '4.5' }}
        </v-chip>
      </div>

      <!-- Contact Actions -->
      <div class="d-flex align-center mb-10" style="gap: 12px;">
        <v-btn
          :href="`tel:${pharmacy.phone}`"
          color="teal-darken-3"
          variant="flat"
          rounded="lg"
          prepend-icon="mdi-phone-outline"
          class="text-none px-6"
        >
          Call
        </v-btn>

        <v-btn
          :href="getDirectionsUrl(pharmacy)"
          target="_blank"
          variant="text"
          prepend-icon="mdi-navigation-outline"
          class="text-none"
        >
          Get Directions
        </v-btn>
      </div>

      <!-- Inventory Title & Search Bar -->
      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h5 font-weight-bold">Available Medicines</h2>
        <div class="text-body-2 text-medium-emphasis">
          {{ filteredStock.length }} listings tracked
        </div>
      </div>

      <v-card variant="outlined" class="pa-2 mb-6 search-card" rounded="xl">
        <v-text-field
          v-model="medicineSearch"
          placeholder="Filter medicines at this pharmacy"
          variant="plain"
          hide-details
          clearable
          prepend-inner-icon="mdi-magnify"
          class="px-2"
        />
      </v-card>

      <!-- Inventory Cards Grid -->
      <v-row v-if="filteredStock.length > 0">
        <v-col
          v-for="item in filteredStock"
          :key="item.id"
          cols="12"
          md="6"
        >
          <v-card variant="outlined" rounded="lg" class="pa-5 h-100 d-flex flex-column justify-space-between">
            <div>
              <div class="d-flex justify-space-between align-start mb-1">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.genericName }}</div>
                </div>

                <v-chip
                  size="x-small"
                  variant="tonal"
                  :color="getCategoryColor(item.category)"
                  class="font-weight-medium"
                >
                  {{ item.category }}
                </v-chip>
              </div>

              <div class="d-flex justify-space-between align-end mt-6">
                <div>
                  <div class="text-caption text-medium-emphasis">Price</div>
                  <div class="text-h6 font-weight-bold text-primary">
                    KES {{ item.price }}
                  </div>
                </div>

                <v-chip
                  v-if="item.available"
                  size="small"
                  color="success"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  {{ item.stockCount }} in stock
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
          </v-card>
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-card v-else variant="outlined" rounded="lg" class="pa-8 text-center">
        <v-icon icon="mdi-pill-off" size="40" color="grey" class="mb-2" />
        <div class="text-body-1 font-weight-medium text-medium-emphasis">
          No medicines found matching "{{ medicineSearch }}"
        </div>
      </v-card>
    </v-container>
  </v-sheet>
</template>

<style scoped>
.search-card {
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
}
</style>