<script setup>
import { ref, onMounted } from 'vue'
import { stockService } from '@/services/stockService'
import axios from '@/services/api.js' 

const stocks = ref([])
const availableMedicines = ref([])
const pharmacy = ref(null)
const loading = ref(false)

// Add/Edit Stock Modal State
const dialog = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const form = ref({
  medicine_id: null,
  price: '',
  in_stock: true
})

// Request Medicine Modal State
const requestDialog = ref(false)
const requestSubmitting = ref(false)
const requestForm = ref({
  name: '',
  generic_name: '',
  category: ''
})
const requestMessage = ref('')

const loadPharmacyFromStorage = () => {
  try {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      pharmacy.value = parsedUser?.pharmacy || null
    }
  } catch (err) {
    console.error('Error parsing stored user:', err)
  }
}

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

const submitMedicineRequest = async () => {
  if (!requestForm.value.name) return
  requestSubmitting.value = true
  try {
    await axios.post('/api/medicine-requests', requestForm.value)
    requestMessage.value = 'Request submitted successfully! Waiting for admin approval.'
    requestForm.value = { name: '', generic_name: '', category: '' }
    setTimeout(() => {
      requestDialog.value = false
      requestMessage.value = ''
    }, 1500)
  } catch (err) {
    console.error('Failed to submit medicine request:', err)
  } finally {
    requestSubmitting.value = false
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
  loadPharmacyFromStorage()
  fetchInventory()
})
</script>

<template>
  <v-sheet color="background" min-height="100vh" class="py-10">
    <v-container style="max-width: 1000px;">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold">Pharmacy Inventory</h1>
          <div class="text-body-2 text-medium-emphasis">Manage medicine stock and pricing</div>
        </div>

        <div class="d-flex gap-2">
          <!-- Request New Medicine Button -->
          <v-btn 
            variant="outlined" 
            color="primary" 
            prepend-icon="mdi-plus-box-outline" 
            rounded="lg" 
            class="mr-2"
            @click="requestDialog = true"
          >
            Request New Medicine
          </v-btn>

          <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" elevation="0" @click="openModal()">
            Add Stock Entry
          </v-btn>
        </div>
      </div>

      <!-- Pharmacy Info Card -->
      <v-card v-if="pharmacy" variant="outlined" rounded="xl" class="pa-4 mb-6">
        <div class="text-subtitle-1 font-weight-bold">{{ pharmacy.name }}</div>
        <div class="text-body-2 text-medium-emphasis" v-if="pharmacy.location">{{ pharmacy.location }}</div>
      </v-card>

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

      <!-- Add/Edit Stock Dialog -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card rounded="xl" class="pa-6">
          <v-card-title class="text-h6 font-weight-bold mb-4">
            {{ isEditing ? 'Edit Stock Entry' : 'Add Medicine to Stock' }}
          </v-card-title>

          <v-form @submit.prevent="saveStock">
            <!-- Searchable Autocomplete -->
            <v-autocomplete
              v-if="!isEditing"
              v-model="form.medicine_id"
              :items="availableMedicines"
              item-title="name"
              item-value="id"
              label="Search & Select Medicine"
              placeholder="Type medicine name..."
              variant="outlined"
              rounded="lg"
              density="comfortable"
              class="mb-3"
              clearable
              required
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :subtitle="item.raw.generic_name || item.raw.category" />
              </template>
            </v-autocomplete>

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

      <!-- Request New Medicine Dialog -->
      <v-dialog v-model="requestDialog" max-width="500px">
        <v-card rounded="xl" class="pa-6">
          <v-card-title class="text-h6 font-weight-bold mb-2">
            Request New Medicine
          </v-card-title>
          <div class="text-caption text-medium-emphasis mb-4">
            Can't find a medicine in the search list? Submit a request for the Super Admin to add it.
          </div>

          <v-alert v-if="requestMessage" type="success" variant="tonal" class="mb-4" density="compact">
            {{ requestMessage }}
          </v-alert>

          <v-form @submit.prevent="submitMedicineRequest">
            <v-text-field
              v-model="requestForm.name"
              label="Medicine Name"
              placeholder="e.g. Amoxicillin 500mg"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              class="mb-3"
              required
            />

            <v-text-field
              v-model="requestForm.generic_name"
              label="Generic Name (Optional)"
              placeholder="e.g. Amoxicillin Trihydrate"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-model="requestForm.category"
              label="Category (Optional)"
              placeholder="e.g. Antibiotics"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              class="mb-4"
            />

            <div class="d-flex justify-end gap-2">
              <v-btn variant="text" @click="requestDialog = false">Cancel</v-btn>
              <v-btn color="primary" type="submit" elevation="0" rounded="lg" :loading="requestSubmitting">
                Submit Request
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-dialog>
    </v-container>
  </v-sheet>
</template>