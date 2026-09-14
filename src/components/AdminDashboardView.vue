<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api.js'

const activeTab = ref('pharmacists') // Options: 'pharmacists', 'medicine_requests', 'catalog'

// Pharmacist Approvals State
const pendingPharmacists = ref([])
const pharmacistsLoading = ref(false)

// Medicine Requests State
const requests = ref([])
const requestsLoading = ref(false)

const actionLoading = ref(null)
const alertMessage = ref('')
const alertType = ref('success')

// Computed checks
const hasPendingRequests = computed(() => requests.value.some(r => r.status === 'pending'))

// Fetch Pending Pharmacist Registrations
const fetchPendingPharmacists = async () => {
  pharmacistsLoading.value = true
  try {
    const response = await api.get('/admin/pending-pharmacists')
    pendingPharmacists.value = response.data.users || response.data || []
  } catch (err) {
    showAlert('Failed to fetch pending pharmacist accounts.', 'error')
  } finally {
    pharmacistsLoading.value = false
  }
}

// Approve / Reject Pharmacist Account
const approvePharmacist = async (userId) => {
  actionLoading.value = userId
  try {
    await api.patch(`/admin/pharmacists/${userId}/approve`)
    showAlert('Pharmacist account approved successfully!', 'success')
    await fetchPendingPharmacists()
  } catch (err) {
    showAlert('Failed to approve pharmacist account.', 'error')
  } finally {
    actionLoading.value = null
  }
}

const rejectPharmacist = async (userId) => {
  if (!confirm('Reject and disable this pharmacist application?')) return
  actionLoading.value = userId
  try {
    await api.patch(`/admin/pharmacists/${userId}/reject`)
    showAlert('Pharmacist account rejected.', 'warning')
    await fetchPendingPharmacists()
  } catch (err) {
    showAlert('Failed to reject pharmacist account.', 'error')
  } finally {
    actionLoading.value = null
  }
}

// Fetch Medicine Requests
const fetchRequests = async () => {
  requestsLoading.value = true
  try {
    const response = await api.get('/admin/medicine-requests')
    requests.value = response.data
  } catch (err) {
    showAlert('Failed to fetch medicine requests.', 'error')
  } finally {
    requestsLoading.value = false
  }
}

const approveMedicineRequest = async (id) => {
  actionLoading.value = id
  try {
    const response = await api.patch(`/admin/medicine-requests/${id}/approve`)
    showAlert(response.data.message || 'Request approved!', 'success')
    await fetchRequests()
  } catch (err) {
    showAlert('Failed to approve request.', 'error')
  } finally {
    actionLoading.value = null
  }
}

const rejectMedicineRequest = async (id) => {
  if (!confirm('Reject this medicine request?')) return
  actionLoading.value = id
  try {
    const response = await api.patch(`/admin/medicine-requests/${id}/reject`)
    showAlert('Medicine request rejected.', 'warning')
    await fetchRequests()
  } catch (err) {
    showAlert('Failed to reject request.', 'error')
  } finally {
    actionLoading.value = null
  }
}

// Global Catalog State
const catalogMedicines = ref([])
const catalogLoading = ref(false)

// Edit dialog state
const editDialog = ref(false)
const editingMedicine = ref({ id: null, name: '', generic_name: '', category: '' })

const fetchCatalog = async () => {
  catalogLoading.value = true
  try {
    const response = await api.get('/medicines')
    catalogMedicines.value = response.data || []
  } catch (err) {
    showAlert('Failed to fetch medicine catalog.', 'error')
  } finally {
    catalogLoading.value = false
  }
}

const openEditDialog = (medicine) => {
  editingMedicine.value = {
    id: medicine.id,
    name: medicine.name,
    generic_name: medicine.generic_name || '',
    category: medicine.category || '',
  }
  editDialog.value = true
}

const saveMedicineEdit = async () => {
  actionLoading.value = editingMedicine.value.id
  try {
    await api.put(`/admin/medicines/${editingMedicine.value.id}`, {
      name: editingMedicine.value.name,
      generic_name: editingMedicine.value.generic_name,
      category: editingMedicine.value.category,
    })
    showAlert('Medicine updated successfully!', 'success')
    editDialog.value = false
    await fetchCatalog()
  } catch (err) {
    showAlert('Failed to update medicine.', 'error')
  } finally {
    actionLoading.value = null
  }
}

const deleteMedicine = async (medicine) => {
  if (!confirm(`Delete "${medicine.name}" from the catalog? This cannot be undone.`)) return
  actionLoading.value = medicine.id
  try {
    await api.delete(`/admin/medicines/${medicine.id}`)
    showAlert('Medicine deleted from catalog.', 'warning')
    await fetchCatalog()
  } catch (err) {
    showAlert('Failed to delete medicine.', 'error')
  } finally {
    actionLoading.value = null
  }
}

const showAlert = (msg, type = 'success') => {
  alertMessage.value = msg
  alertType.value = type
  setTimeout(() => { alertMessage.value = '' }, 3000)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'approved': return 'success'
    case 'rejected': return 'error'
    default: return 'warning'
  }
}

onMounted(() => {
  fetchPendingPharmacists()
  fetchRequests()
  fetchCatalog()
})
</script>

<template>
  <v-sheet color="background" min-height="100vh" class="py-10">
    <v-container style="max-width: 1100px;">
      <!-- Dashboard Header -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold">Super Admin Dashboard</h1>
          <div class="text-body-2 text-medium-emphasis">Manage account approvals, medicine catalog, and requests</div>
        </div>
      </div>

      <!-- Feedback Alert -->
      <v-alert v-if="alertMessage" :type="alertType" variant="tonal" class="mb-4" density="compact">
        {{ alertMessage }}
      </v-alert>

      <!-- Navigation Tabs -->
      <v-tabs v-model="activeTab" color="primary" class="mb-6">
        <v-tab value="pharmacists">
          Pharmacist Approvals
          <v-chip v-if="pendingPharmacists.length > 0" size="x-small" color="error" class="ml-2">
            {{ pendingPharmacists.length }}
          </v-chip>
        </v-tab>
        <v-tab value="medicine_requests">Medicine Requests</v-tab>
        <v-tab value="catalog">Global Catalog</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">

        <!-- TAB 1: Pharmacist Account Approvals -->
        <v-window-item value="pharmacists">
          <v-card variant="outlined" rounded="xl" class="pa-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-h6 font-weight-bold">Pending Pharmacist Accounts</div>
                <div class="text-caption text-medium-emphasis">Review and approve new pharmacist registrations before granting dashboard access</div>
              </div>
              <v-btn icon="mdi-refresh" variant="text" size="small" @click="fetchPendingPharmacists" :loading="pharmacistsLoading" />
            </div>

            <v-progress-linear v-if="pharmacistsLoading" indeterminate color="primary" class="mb-4" />

            <v-table v-if="pendingPharmacists.length > 0">
              <thead>
                <tr>
                  <th class="text-left">Pharmacist Name</th>
                  <th class="text-left">Email</th>
                  <th class="text-left">Pharmacy Name</th>
                  <th class="text-left">Location</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in pendingPharmacists" :key="user.id">
                  <td class="font-weight-bold">{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td class="text-medium-emphasis">{{ user.pharmacy?.name || user.pharmacy_name || 'N/A' }}</td>
                  <td class="text-medium-emphasis">{{ user.pharmacy?.location || user.location || 'N/A' }}</td>
                  <td class="text-center">
                    <v-btn 
                      size="small" 
                      color="success" 
                      variant="tonal" 
                      class="mr-2 text-none"
                      :loading="actionLoading === user.id"
                      @click="approvePharmacist(user.id)"
                    >
                      Approve
                    </v-btn>
                    <v-btn 
                      size="small" 
                      color="error" 
                      variant="tonal"
                      class="text-none"
                      :loading="actionLoading === user.id"
                      @click="rejectPharmacist(user.id)"
                    >
                      Reject
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <div v-else-if="!pharmacistsLoading" class="text-center text-medium-emphasis py-8">
              <v-icon icon="mdi-account-check-outline" color="success" size="48" class="mb-2" />
              <div class="text-h6 font-weight-bold text-high-emphasis">All caught up!</div>
              <div class="text-body-2">There are currently no pending pharmacist accounts to review.</div>
            </div>
          </v-card>
        </v-window-item>

        <!-- TAB 2: Medicine Requests -->
        <v-window-item value="medicine_requests">
          <v-card variant="outlined" rounded="xl" class="pa-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-h6 font-weight-bold">Pharmacist Medicine Requests</div>
                <div class="text-caption text-medium-emphasis">Approve requests to instantly create global entries in the medicine database</div>
              </div>
              <v-btn icon="mdi-refresh" variant="text" size="small" @click="fetchRequests" :loading="requestsLoading" />
            </div>

            <v-progress-linear v-if="requestsLoading" indeterminate color="primary" class="mb-4" />

            <v-alert
              v-if="!requestsLoading && !hasPendingRequests && requests.length > 0"
              type="success"
              variant="tonal"
              class="mb-4"
              density="compact"
              icon="mdi-check-circle-outline"
            >
              <strong>All caught up!</strong> There are currently no pending requests requiring approval.
            </v-alert>

            <v-table v-if="requests.length > 0">
              <thead>
                <tr>
                  <th class="text-left">Requested Medicine</th>
                  <th class="text-left">Generic Name</th>
                  <th class="text-left">Category</th>
                  <th class="text-left">Pharmacist</th>
                  <th class="text-left">Pharmacy</th>
                  <th class="text-left">Status</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="req in requests" :key="req.id">
                  <td class="font-weight-bold">{{ req.name }}</td>
                  <td class="text-medium-emphasis">{{ req.generic_name || '—' }}</td>
                  <td>
                    <v-chip size="small" variant="tonal" color="primary">
                      {{ req.category || 'General' }}
                    </v-chip>
                  </td>
                  <td>{{ req.user?.name || 'Pharmacist' }}</td>
                  <td class="text-medium-emphasis">{{ req.pharmacy?.name || 'N/A' }}</td>
                  <td>
                    <v-chip size="small" :color="getStatusColor(req.status)" variant="tonal" class="text-capitalize">
                      {{ req.status }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <template v-if="req.status === 'pending'">
                      <v-btn 
                        size="small" 
                        color="success" 
                        variant="tonal" 
                        class="mr-2 text-none"
                        :loading="actionLoading === req.id"
                        @click="approveMedicineRequest(req.id)"
                      >
                        Approve
                      </v-btn>
                      <v-btn 
                        size="small" 
                        color="error" 
                        variant="tonal"
                        class="text-none"
                        :loading="actionLoading === req.id"
                        @click="rejectMedicineRequest(req.id)"
                      >
                        Reject
                      </v-btn>
                    </template>
                    <span v-else class="text-caption text-medium-emphasis">Processed</span>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <div v-else-if="!requestsLoading" class="text-center text-medium-emphasis py-8">
              <v-icon icon="mdi-check-circle-outline" color="success" size="48" class="mb-2" />
              <div class="text-h6 font-weight-bold text-high-emphasis">All caught up!</div>
              <div class="text-body-2">There are currently no medicine requests in the system.</div>
            </div>
          </v-card>
        </v-window-item>

        <!-- TAB 3: Global Catalog -->
        <v-window-item value="catalog">
          <v-card variant="outlined" rounded="xl" class="pa-6">
            <div class="d-flex justify-space-between align-start flex-wrap ga-2 mb-2">
              <div>
                <div class="text-h6 font-weight-bold">Global Medicine Catalog</div>
                <div class="text-body-2 text-medium-emphasis">View and directly manage all registered medicines in the platform catalog.</div>
              </div>
              <v-chip color="primary" variant="tonal">{{ catalogMedicines.length }} Medicines</v-chip>
            </div>

            <v-progress-linear v-if="catalogLoading" indeterminate color="primary" class="my-4" />

            <v-table v-if="!catalogLoading && catalogMedicines.length > 0" class="mt-4">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Generic Name</th>
                  <th>Category</th>
                  <th>Pharmacies Stocking</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="med in catalogMedicines" :key="med.id">
                  <td class="font-weight-medium">{{ med.name }}</td>
                  <td>{{ med.generic_name || '—' }}</td>
                  <td>
                    <v-chip size="small" variant="tonal" color="primary">{{ med.category || 'Uncategorized' }}</v-chip>
                  </td>
                  <td>{{ med.stocks?.length || 0 }}</td>
                  <td class="text-right">
                    <v-btn
                      icon="mdi-pencil"
                      variant="text"
                      size="small"
                      color="primary"
                      @click="openEditDialog(med)"
                    />
                    <v-btn
                      icon="mdi-delete"
                      variant="text"
                      size="small"
                      color="error"
                      :loading="actionLoading === med.id"
                      @click="deleteMedicine(med)"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>

            <div v-else-if="!catalogLoading" class="text-center text-medium-emphasis py-8">
              <v-icon icon="mdi-pill-off" size="48" class="mb-2" />
              <div class="text-h6 font-weight-bold text-high-emphasis">No medicines in the catalog yet</div>
              <div class="text-body-2">Approved medicine requests will appear here automatically.</div>
            </div>
          </v-card>
        </v-window-item>

      </v-window>

      <!-- Edit Medicine Dialog -->
      <v-dialog v-model="editDialog" max-width="450">
        <v-card rounded="xl" class="pa-4">
          <v-card-title class="font-weight-bold">Edit Medicine</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="editingMedicine.name"
              label="Name"
              variant="outlined"
              density="comfortable"
              class="mb-2"
            />
            <v-text-field
              v-model="editingMedicine.generic_name"
              label="Generic Name"
              variant="outlined"
              density="comfortable"
              class="mb-2"
            />
            <v-text-field
              v-model="editingMedicine.category"
              label="Category"
              variant="outlined"
              density="comfortable"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
            <v-btn
              color="primary"
              variant="flat"
              :loading="actionLoading === editingMedicine.id"
              @click="saveMedicineEdit"
            >
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-sheet>
</template>