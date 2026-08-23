<script setup>
import { ref, computed } from 'vue'
import { usePharmaciesStore } from '../stores/pharmacies'
import { useStockStore } from '../stores/stock'
import { useMedicinesStore } from '../stores/medicines'

const pharmaciesStore = usePharmaciesStore()
const stockStore = useStockStore()
const medicinesStore = useMedicinesStore()

// State Controls
const searchQuery = ref('')
const selectedArea = ref('All areas')
const selectedSort = ref('Alphabetical (A-Z)')
const verifiedOnly = ref(false)
const viewMode = ref('grid') // 'grid' | 'map'

// Inventory Modal Control
const inventoryModal = ref(false)
const selectedPharmacy = ref(null)

const areaOptions = [
  'All areas',
  'CBD',
  'Eastleigh',
  'Karen',
  'Kilimani',
  'Lavington',
  'Westlands'
]

const sortOptions = [
  'Alphabetical (A-Z)',
  'Highest Rated',
  'Most Stocked'
]

// Check if any filter is actively applied
const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    selectedArea.value !== 'All areas' ||
    selectedSort.value !== 'Alphabetical (A-Z)' ||
    verifiedOnly.value
  )
})

function clearFilters() {
  searchQuery.value = ''
  selectedArea.value = 'All areas'
  selectedSort.value = 'Alphabetical (A-Z)'
  verifiedOnly.value = false
}

// Generate Google Maps Directions URL with safe coordinate checking & fallback search
function getDirectionsUrl(pharmacy) {
  const lat = pharmacy.latitude || pharmacy.lat
  const lng = pharmacy.longitude || pharmacy.lng

  if (lat && lng) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }

  // Fallback if coordinates are missing/undefined
  const searchQuery = `${pharmacy.name || ''} ${pharmacy.address || ''} ${pharmacy.area || ''} Nairobi`.trim()
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`
}

// Calculate total stocked medicines for a pharmacy
function getPharmacyStock(pharmacyId) {
  const stockList = Object.values(stockStore.stock || {})
  return stockList.filter(s => s.pharmacy_id === pharmacyId && s.available && s.stock_count > 0)
}

// Map inventory items with medicine details
function getInventoryDetails(pharmacyId) {
  const stockItems = getPharmacyStock(pharmacyId)
  const medicines = Object.values(medicinesStore.medicines || {})

  return stockItems.map(item => {
    const med = medicines.find(m => m.id === item.medicine_id) || {}
    return {
      id: item.id,
      name: med.name || 'Unknown Medicine',
      dosage: med.dosage || med.genericName || '',
      price: item.price,
      stockCount: item.stock_count
    }
  })
}

function openInventoryModal(pharmacy) {
  selectedPharmacy.value = pharmacy
  inventoryModal.value = true
}

// Filtering and Sorting
const filteredPharmacies = computed(() => {
  let list = Object.values(pharmaciesStore.pharmacies || [])

  // Text Search
  if (searchQuery.value.trim() !== '') {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => 
      p.name?.toLowerCase().includes(q) || 
      p.area?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    )
  }

  // Area Filter
  if (selectedArea.value !== 'All areas') {
    list = list.filter(p => p.area?.toLowerCase() === selectedArea.value.toLowerCase())
  }

  // Verified Filter
  if (verifiedOnly.value) {
    list = list.filter(p => p.verified === true)
  }

  // Sorting Logic
  return list.sort((a, b) => {
    if (selectedSort.value === 'Highest Rated') {
      return (b.rating || 0) - (a.rating || 0)
    } else if (selectedSort.value === 'Most Stocked') {
      return getPharmacyStock(b.id).length - getPharmacyStock(a.id).length
    } else {
      return (a.name || '').localeCompare(b.name || '')
    }
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
          <router-link to="/search" class="text-body-2 text-medium-emphasis text-decoration-none mr-6">
            Search
          </router-link>
          <router-link to="/pharmacies" class="text-body-2 font-weight-medium text-primary text-decoration-none">
            Pharmacies
          </router-link>
        </div>
      </div>
    </v-container>

    <v-container class="pt-8" style="max-width: 1000px;">
      <!-- Title & View Mode Toggle -->
      <div class="d-flex justify-space-between align-start flex-wrap mb-6" style="gap: 16px;">
        <div>
          <div class="text-h3 font-weight-bold mb-2">Find verified pharmacies</div>
          <div class="text-body-1 text-medium-emphasis">
            Explore licensed pharmacies across Nairobi, check locations, contact info, and current stock status.
          </div>
        </div>

        <v-btn-toggle v-model="viewMode" mandatory color="primary" variant="outlined" density="comfortable" rounded="lg">
          <v-btn value="grid" prepend-icon="mdi-view-grid-outline" class="text-none">Grid</v-btn>
          <v-btn value="map" prepend-icon="mdi-map-outline" class="text-none">Map</v-btn>
        </v-btn-toggle>
      </div>

      <!-- Search Box -->
      <v-card variant="outlined" class="pa-2 mb-6 search-card" rounded="xl">
        <v-text-field
          v-model="searchQuery"
          placeholder="Search by pharmacy name or area, e.g. Westlands"
          variant="plain"
          hide-details
          clearable
          prepend-inner-icon="mdi-magnify"
          class="px-2"
        />
      </v-card>

      <!-- Filter Controls -->
      <v-card variant="outlined" class="pa-4 mb-6" rounded="lg">
        <v-row align="center" density="comfortable">
          <v-col cols="12" sm="4">
            <div class="text-caption text-medium-emphasis mb-1">Area</div>
            <v-select
              v-model="selectedArea"
              :items="areaOptions"
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
              v-model="verifiedOnly"
              label="Verified Only"
              color="primary"
              hide-details
              density="compact"
              inset
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- Results Stats & Reset Filters Button -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-body-2 text-medium-emphasis">
          {{ filteredPharmacies.length }} {{ filteredPharmacies.length === 1 ? 'pharmacy' : 'pharmacies' }} found
        </div>

        <v-btn
          v-if="hasActiveFilters"
          variant="text"
          color="error"
          density="compact"
          prepend-icon="mdi-filter-remove-outline"
          class="text-none font-weight-medium"
          @click="clearFilters"
        >
          Reset Filters
        </v-btn>
      </div>

      <!-- GRID VIEW -->
      <v-row v-if="viewMode === 'grid'">
        <v-col
          v-for="pharmacy in filteredPharmacies"
          :key="pharmacy.id"
          cols="12"
          md="6"
        >
          <v-card variant="outlined" rounded="lg" class="pa-5 h-100 d-flex flex-column justify-space-between">
            <div>
              <!-- Header & Verified Status -->
              <div class="d-flex justify-space-between align-start mb-1">
                <div>
                  <div class="d-flex align-center">
                    <span class="text-h6 font-weight-bold mr-2">{{ pharmacy.name }}</span>
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
                  <div class="text-caption text-medium-emphasis">{{ pharmacy.area }}</div>
                </div>

                <!-- Rating -->
                <v-chip size="small" variant="outlined" class="font-weight-bold">
                  <v-icon icon="mdi-star" color="amber-darken-2" start size="14" />
                  {{ pharmacy.rating || '4.5' }}
                </v-chip>
              </div>

              <!-- Location & Details -->
              <div class="mt-4">
                <div class="d-flex align-center text-body-2 text-medium-emphasis mb-1">
                  <v-icon icon="mdi-map-marker-outline" size="18" class="mr-2" />
                  {{ pharmacy.address }}
                </div>
                <div class="d-flex align-center text-body-2 text-medium-emphasis mb-1">
                  <v-icon icon="mdi-clock-outline" size="18" class="mr-2" />
                  {{ pharmacy.operatingHours || '8:00 AM - 9:00 PM' }}
                </div>
                <div class="d-flex align-center text-body-2 text-medium-emphasis mb-4">
                  <v-icon icon="mdi-package-variant-closed" size="18" class="mr-2" />
                  {{ getPharmacyStock(pharmacy.id).length }} medicines in stock
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-3 border-t d-flex align-center justify-space-between flex-wrap" style="gap: 8px;">
              <v-btn
                :href="`tel:${pharmacy.phone}`"
                variant="text"
                density="comfortable"
                prepend-icon="mdi-phone-outline"
                class="text-none px-2"
              >
                Call
              </v-btn>

              <v-btn
                :href="getDirectionsUrl(pharmacy)"
                target="_blank"
                variant="text"
                density="comfortable"
                prepend-icon="mdi-navigation-outline"
                class="text-none px-2"
              >
                Directions
              </v-btn>

              <v-btn
                color="primary"
                variant="flat"
                density="comfortable"
                prepend-icon="mdi-cube-outline"
                class="text-none rounded-lg px-3"
                @click="openInventoryModal(pharmacy)"
              >
                View Inventory
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- MAP VIEW -->
      <v-card v-else variant="outlined" rounded="lg" class="pa-4 text-center overflow-hidden">
        <div class="text-subtitle-1 font-weight-bold mb-2">Interactive Map — Nairobi Pharmacies</div>
        <div class="text-caption text-medium-emphasis mb-4">Showing {{ filteredPharmacies.length }} active locations</div>
        
        <v-responsive aspect-ratio="16/9" class="bg-grey-lighten-3 rounded-lg d-flex align-center justify-center">
          <div class="w-100 h-100 d-flex flex-column align-center justify-center pa-6" style="background: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e8e8e8 10px, #e8e8e8 20px);">
            <v-icon icon="mdi-map-marker-radius" size="48" color="primary" class="mb-2" />
            <div class="text-body-2 font-weight-medium text-grey-darken-2">Map Pins Loaded for Nairobi Region</div>
            <div class="d-flex flex-wrap justify-center mt-3" style="gap: 8px;">
              <v-chip
                v-for="p in filteredPharmacies"
                :key="p.id"
                color="primary"
                variant="elevated"
                size="small"
                class="cursor-pointer"
                @click="openInventoryModal(p)"
              >
                <v-icon icon="mdi-map-marker" start size="12" />
                {{ p.name }} ({{ p.area }})
              </v-chip>
            </div>
          </div>
        </v-responsive>
      </v-card>
    </v-container>

    <!-- INVENTORY MODAL -->
    <v-dialog v-model="inventoryModal" max-width="500px">
      <v-card rounded="xl" class="pa-4" v-if="selectedPharmacy">
        <div class="d-flex justify-space-between align-start mb-3">
          <div>
            <div class="text-h6 font-weight-bold">{{ selectedPharmacy.name }}</div>
            <div class="text-caption text-medium-emphasis">Top available medicines • {{ selectedPharmacy.area }}</div>
          </div>
          <v-btn icon="mdi-close" variant="text" density="compact" @click="inventoryModal = false" />
        </div>

        <v-divider class="mb-3" />

        <div v-if="getInventoryDetails(selectedPharmacy.id).length > 0">
          <div
            v-for="item in getInventoryDetails(selectedPharmacy.id)"
            :key="item.id"
            class="d-flex justify-space-between align-center py-2 border-b-dashed"
          >
            <div>
              <div class="text-subtitle-2 font-weight-bold">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.dosage }}</div>
            </div>
            <div class="text-right">
              <div class="text-subtitle-2 font-weight-bold text-primary">KES {{ item.price }}</div>
              <v-chip size="x-small" color="success" variant="tonal" class="font-weight-medium">
                {{ item.stockCount }} in stock
              </v-chip>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-6 text-medium-emphasis text-body-2">
          No stock records found for this pharmacy.
        </div>
      </v-card>
    </v-dialog>
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