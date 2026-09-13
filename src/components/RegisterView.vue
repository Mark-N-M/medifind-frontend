<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('patient') // Default role

// Pharmacist specific fields
const pharmacyName = ref('')
const location = ref('')
const latitude = ref('')
const longitude = ref('')

const loading = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  if (!name.value || !email.value || !password.value) return
  
  // Extra validation if pharmacist is selected
if (
  role.value === 'pharmacist' &&
  (!pharmacyName.value || !location.value || !latitude.value || !longitude.value)
) {
  errorMessage.value = 'Please fill in Pharmacy Name, Address, Latitude, and Longitude.'
  return
}

  loading.value = true
  errorMessage.value = ''

  try {
    const payload = {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
      ...(role.value === 'pharmacist' && {
        pharmacy_name: pharmacyName.value,
        location: location.value,
        latitude: latitude.value,
        longitude: longitude.value,
      }),
    }

    const data = await authService.register(payload)

    // If account requires admin approval (Pharmacist)
    if (data.user?.status === 'pending') {
      router.push('/pending-approval')
      return
    }

    // Standard patient flow (Auto-approved)
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    router.push('/')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-sheet color="background" min-height="100vh" class="d-flex align-center justify-center py-12">
    <v-container style="max-width: 450px;">
      <v-card variant="outlined" rounded="xl" class="pa-8">
        <div class="text-center mb-6">
          <div class="d-inline-flex align-center text-primary font-weight-bold text-h5 mb-2">
            <v-icon icon="mdi-pill" class="mr-2" color="primary" />
            MediFind
          </div>
          <h1 class="text-h5 font-weight-bold">Create your account</h1>
          <div class="text-body-2 text-medium-emphasis">Join MediFind to manage & find medicines easily</div>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" density="compact">
          {{ errorMessage }}
        </v-alert>

        <v-form @submit.prevent="handleRegister">
          <div class="text-caption text-medium-emphasis mb-1">Full Name</div>
          <v-text-field
            v-model="name"
            placeholder="John Doe"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-3"
            required
          />

          <div class="text-caption text-medium-emphasis mb-1">Email address</div>
          <v-text-field
            v-model="email"
            type="email"
            placeholder="name@example.com"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-3"
            required
          />

          <div class="text-caption text-medium-emphasis mb-1">Password</div>
          <v-text-field
            v-model="password"
            type="password"
            placeholder="••••••••"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-3"
            required
          />

          <!-- Account Type / Role Input Field -->
          <div class="text-caption text-medium-emphasis mb-1">Account Type</div>
          <v-select
            v-model="role"
            :items="[
              { title: 'Patient (Looking for medicines)', value: 'patient' },
              { title: 'Pharmacist (Managing a pharmacy)', value: 'pharmacist' }
            ]"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-3"
          />

          <!-- Pharmacist-Specific Form Fields -->
          <template v-if="role === 'pharmacist'">
            <v-divider class="my-4" />
            <div class="text-subtitle-2 font-weight-bold mb-3 text-primary">Pharmacy Details</div>

            <div class="text-caption text-medium-emphasis mb-1">Pharmacy Name</div>
            <v-text-field
              v-model="pharmacyName"
              placeholder="e.g., City Center Pharmacy"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="mb-3"
              required
            />

            <div class="text-caption text-medium-emphasis mb-1">Pharmacy Location / Address</div>
            <v-text-field
              v-model="location"
              placeholder="e.g., 123 Main Street, Building A"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="mb-3"
              required
            />

            <div class="text-caption text-medium-emphasis mb-1">Latitude</div>
            <v-text-field
              v-model="latitude"
              type="number"
              placeholder="-1.2833"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="mb-3"
            />

            <div class="text-caption text-medium-emphasis mb-1">Longitude</div>
            <v-text-field
              v-model="longitude"
              type="number"
              placeholder="36.8167"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="mb-3"
            />
          </template>

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            rounded="lg"
            elevation="0"
            :loading="loading"
            class="text-none font-weight-bold mt-2 mb-4"
          >
            Create Account
          </v-btn>
        </v-form>

        <div class="text-center text-body-2 text-medium-emphasis">
          Already have an account?
          <router-link to="/login" class="text-primary text-decoration-none font-weight-medium">Log in</router-link>
        </div>
      </v-card>
    </v-container>
  </v-sheet>
</template>