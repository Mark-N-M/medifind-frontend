<script setup>
import { ref, onMounted } from 'vue'
import { adminService } from '@/services/admin'

const pendingCount = ref(0)
const pendingList = ref([])
const loading = ref(false)
const alertMessage = ref('')

const fetchPending = async () => {
  loading.value = true
  try {
    const data = await adminService.getPendingPharmacists()
    pendingCount.value = data.count
    pendingList.value = data.users
  } catch (error) {
    console.error('Failed to load pending users:', error)
  } finally {
    loading.value = false
  }
}

const handleApprove = async (id) => {
  try {
    const res = await adminService.approvePharmacist(id)
    alertMessage.value = res.message
    await fetchPending()
  } catch (error) {
    alertMessage.value = 'Failed to approve user.'
  }
}

const handleReject = async (id) => {
  try {
    const res = await adminService.rejectPharmacist(id)
    alertMessage.value = res.message
    await fetchPending()
  } catch (error) {
    alertMessage.value = 'Failed to reject user.'
  }
}

onMounted(() => {
  fetchPending()
})
</script>

<template>
  <v-sheet color="background" min-height="100vh" class="py-10">
    <v-container style="max-width: 900px;">
      <!-- Header with Notification Badge -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold">Super Admin Portal</h1>
          <div class="text-body-2 text-medium-emphasis">Manage pending pharmacist account verification requests</div>
        </div>

        <v-badge :content="pendingCount" color="error" :model-value="pendingCount > 0">
          <v-btn color="primary" prepend-icon="mdi-bell-outline" variant="tonal" rounded="lg">
            Pending Requests
          </v-btn>
        </v-badge>
      </div>

      <v-alert v-if="alertMessage" type="success" variant="tonal" class="mb-4" rounded="lg" closable @click:close="alertMessage = ''">
        {{ alertMessage }}
      </v-alert>

      <!-- Table Card -->
      <v-card variant="outlined" rounded="xl" class="pa-6">
        <h2 class="text-h6 font-weight-bold mb-4">Pharmacist Applications</h2>

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

        <v-table v-if="pendingList.length > 0">
          <thead>
            <tr>
              <th class="text-left">Full Name</th>
              <th class="text-left">Email Address</th>
              <th class="text-left">Registered Date</th>
              <th class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in pendingList" :key="user.id">
              <td class="font-weight-medium">{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td class="text-medium-emphasis">{{ new Date(user.created_at).toLocaleDateString() }}</td>
              <td class="text-center">
                <v-btn
                  color="success"
                  size="small"
                  rounded="lg"
                  elevation="0"
                  class="mr-2 text-none"
                  @click="handleApprove(user.id)"
                >
                  Approve
                </v-btn>
                <v-btn
                  color="error"
                  size="small"
                  variant="outlined"
                  rounded="lg"
                  class="text-none"
                  @click="handleReject(user.id)"
                >
                  Reject
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div v-else-if="!loading" class="text-center text-medium-emphasis py-8">
          <v-icon icon="mdi-check-circle-outline" size="48" color="success" class="mb-2" />
          <div>All caught up! No pending pharmacist requests found.</div>
        </div>
      </v-card>
    </v-container>
  </v-sheet>
</template>