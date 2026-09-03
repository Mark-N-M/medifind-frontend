<script setup>
import { ref, onMounted } from 'vue'
import { stockService } from '@/services/stockService'

const stocks = ref([])
const availableMedicines = ref([])
const loading = ref(false)
const dialog = ref(false)
const isEditing = ref(false)
const currentId = ref(null)

const form = ref({
  medicine_id: null,
  price: '',
  in_stock: true
})

const fetchInventory = async () => {
  loading.value = true
  try {
    stocks.value = await stockService.getStocks()
    availableMedicines.value = await stockService.getGlobalMedicines()
  } catch (err) {
    console.error('Failed to load stock inventory:', err)
  } finally {
    loading.value = false
  }
}

const openModal = (item = null) => {
  if (item) {
    isEditing.value = true
    currentId.value = item.id
    form.value = {
      medicine_id: item.medicine_id,
      price: item.price,
      in_stock: Boolean(item.in_stock)
    }
  } else {
    isEditing.value = false
    currentId.value = null
    form.value = { medicine_id: null, price: '', in_stock: true }
  }
  dialog.value = true
}

const saveStock = async () => {
  try {
    if (isEditing.value) {
      await stockService.updateStock(currentId.value, {
        price: form.value.price,
        in_stock: form.value.in_stock
      })
    } else {
      await stockService.addStock(form.value)
    }
    dialog.value = false
    await fetchInventory()
  } catch (err) {
    console.error('Failed to save stock item:', err)
  }
}

const deleteItem = async (id) => {
  if (confirm('Remove this medicine from your pharmacy stock?')) {
    try {
      await stockService.deleteStock(id)
      await fetchInventory()
    } catch (err) {
      console.error('Failed to delete stock item:', err)
    }
  }
}

onMounted(() => {
  fetchInventory()
})
</script>

<template>
  <v-sheet color="background" min-height="100vh" class="py-10">
    <v-container style="max-width: 1000px;">
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold">Pharmacy Inventory</h1>
          <div class="text-body-2 text-medium-emphasis">Manage medicine stock and pricing</div>
        </div>

        <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" elevation="0" @click="openModal()">
          Add Stock Entry
        </v-btn>
      </div>

      <!-- Inventory Table -->
      <v-card variant="outlined" rounded="xl" class="pa-6">
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

        <v-table v-if="stocks.length > 0">
          <thead>
            <tr>
              <th class="text-left">Medicine Name</th>
              <th class="text-left">Generic Name</th>
              <th class="text-left">Category</th>
              <th class="text-left">Price (KES)</th>
              <th class="text-left">Availability</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in stocks" :key="item.id">
              <td class="font-weight-medium">{{ item.medicine?.name }}</td>
              <td class="text-medium-emphasis">{{ item.medicine?.generic_name || 'N/A' }}</td>
              <td>
                <v-chip size="small" variant="tonal" color="primary">
                  {{ item.medicine?.category || 'General' }}
                </v-chip>
              </td>
              <td>KES {{ item.price }}</td>
              <td>
                <v-chip size="small" :color="item.in_stock ? 'success' : 'error'" variant="tonal">
                  {{ item.in_stock ? 'In Stock' : 'Out of Stock' }}
                </v-chip>
              </td>
              <td class="text-center">
                <v-btn icon="mdi-pencil-outline" size="small" variant="text" color="primary" @click="openModal(item)" />
                <v-btn icon="mdi-trash-can-outline" size="small" variant="text" color="error" @click="deleteItem(item.id)" />
              </td>
            </tr>
          </tbody>
        </v-table>

        <div v-else-if="!loading" class="text-center text-medium-emphasis py-8">
          <v-icon icon="mdi-pill-off" size="48" class="mb-2" />
          <div>No stock entries recorded for your pharmacy yet.</div>
        </div>
      </v-card>

      <!-- Add/Edit Dialog -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card rounded="xl" class="pa-6">
          <v-card-title class="text-h6 font-weight-bold mb-4">
            {{ isEditing ? 'Edit Stock Entry' : 'Add Medicine to Stock' }}
          </v-card-title>

          <v-form @submit.prevent="saveStock">
            <v-select
              v-if="!isEditing"
              v-model="form.medicine_id"
              :items="availableMedicines"
              item-title="name"
              item-value="id"
              label="Select Medicine"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              class="mb-3"
              required
            />

            <v-text-field
              v-model="form.price"
              label="Price (KES)"
              type="number"
              step="0.01"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              class="mb-3"
              required
            />

            <v-switch
              v-model="form.in_stock"
              label="Available In Stock"
              color="primary"
              hide-details
              class="mb-4"
            />

            <div class="d-flex justify-end gap-2">
              <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
              <v-btn color="primary" type="submit" elevation="0" rounded="lg">
                {{ isEditing ? 'Update' : 'Save' }}
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-dialog>
    </v-container>
  </v-sheet>
</template>