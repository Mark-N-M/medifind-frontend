<script setup>
import { useMedicinesStore } from '../stores/medicines'
import { usePharmaciesStore } from '../stores/pharmacies'
import { useStockStore } from '../stores/stock'

const medicinesStore = useMedicinesStore()
const pharmaciesStore = usePharmaciesStore()
const stockStore = useStockStore()

const medicines = medicinesStore.medicines
const pharmacies = pharmaciesStore.pharmacies
const stock = stockStore.stock

function getStockForMedicine(medicineId) {
  return Object.values(stock).filter(entry => entry.medicine_id === medicineId)
}

function getPharmacyName(pharmacyId) {
  const pharmacy = Object.values(pharmacies).find(p => p.id === pharmacyId)
  return pharmacy ? pharmacy.name : 'Unknown Pharmacy'
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <div class="text-h5 text-center mb-6">Find Your Medicine</div>
      </v-col>
    </v-row>

    <v-row v-for="medicine in medicines" :key="medicine.id">
      <v-col cols="12">
        <v-card class="pa-4">
          <div class="text-h6">{{ medicine.name }}</div>
          <div class="text-caption text-grey">{{ medicine.genericName }} — {{ medicine.category }}</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>