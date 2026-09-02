<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  if (!email.value || !password.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const data = await authService.login({
      email: email.value,
      password: password.value,
    })

    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    // Dynamic role-based redirection
    const userRole = data.user?.role
    if (userRole === 'admin') {
      router.push('/admin-dashboard')
    } else if (userRole === 'pharmacist') {
      router.push('/pharmacist-dashboard')
    } else {
      router.push('/') // Default patient destination
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Invalid email or password.'
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
          <h1 class="text-h5 font-weight-bold">Welcome back</h1>
          <div class="text-body-2 text-medium-emphasis">Log in to access your MediFind account</div>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4" density="compact">
          {{ errorMessage }}
        </v-alert>

        <v-form @submit.prevent="handleLogin">
          <div class="text-caption text-medium-emphasis mb-1">Email address</div>
          <v-text-field
            v-model="email"
            type="email"
            placeholder="name@example.com"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-3"
          />

          <div class="text-caption text-medium-emphasis mb-1">Password</div>
          <v-text-field
            v-model="password"
            type="password"
            placeholder="••••••••"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-6"
          />

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            rounded="lg"
            elevation="0"
            :loading="loading"
            class="text-none font-weight-bold mb-4"
          >
            Log In
          </v-btn>
        </v-form>

        <div class="text-center text-body-2 text-medium-emphasis">
          Don't have an account?
          <router-link to="/register" class="text-primary text-decoration-none font-weight-medium">Sign up</router-link>
        </div>
      </v-card>
    </v-container>
  </v-sheet>
</template>