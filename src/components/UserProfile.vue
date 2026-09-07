<template>
  <v-container class="py-8" max-width="800">
    <v-card class="pa-6" rounded="lg" border elevation="1">
      <!-- Header / Avatar Section -->
      <div class="d-flex align-center gap-4 mb-6">
        <v-avatar color="primary" size="72">
          <span class="text-white text-h4 font-weight-bold">{{ userInitial }}</span>
        </v-avatar>

        <div>
          <h2 class="text-h5 font-weight-bold mb-1">{{ user?.name || 'User Profile' }}</h2>
          <v-chip 
            :color="roleColor" 
            size="small" 
            class="text-capitalize font-weight-medium"
          >
            {{ user?.role || 'Guest' }}
          </v-chip>
        </div>
      </div>

      <v-divider class="mb-6"></v-divider>

      <!-- User Information Details -->
      <v-row dense>
        <v-col cols="12" sm="6">
          <div class="text-caption text-grey-darken-1 font-weight-medium">Full Name</div>
          <div class="text-body-1 font-weight-regular mb-4">{{ user?.name || 'N/A' }}</div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="text-caption text-grey-darken-1 font-weight-medium">Email Address</div>
          <div class="text-body-1 font-weight-regular mb-4">{{ user?.email || 'N/A' }}</div>
        </v-col>

        <!-- Role-Specific Pharmacy Section -->
        <v-col cols="12" v-if="user?.role === 'pharmacist' && user?.pharmacy">
          <v-card color="grey-lighten-4" flat class="pa-4 rounded-lg mt-2">
            <div class="text-subtitle-2 font-weight-bold mb-1 text-primary">
              <v-icon icon="mdi-pharmacy" class="mr-1" size="small"></v-icon>
              Assigned Pharmacy
            </div>
            <div class="text-body-2 font-weight-medium">{{ user.pharmacy.name }}</div>
            <div class="text-caption text-grey-darken-1">{{ user.pharmacy.location }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Role-Based Navigation Buttons -->
      <div class="d-flex justify-end gap-2 mt-6">
        <!-- Dashboard Button for Admin & Pharmacist -->
        <v-btn 
          v-if="user?.role === 'admin' || user?.role === 'pharmacist'" 
          variant="flat" 
          color="primary" 
          @click="goToDashboard"
        >
          Go to Dashboard
        </v-btn>

        <!-- Return Home Button for Patients/Guests -->
        <v-btn 
          v-else 
          variant="outlined" 
          color="primary" 
          to="/"
        >
          Return Home
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';

const router = useRouter();
const user = ref(null);

onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  }

  try {
    const liveUserData = await authService.getUser();
    user.value = liveUserData;
    localStorage.setItem('user', JSON.stringify(liveUserData));
  } catch (err) {
    console.error('Failed to reload profile data:', err);
  }
});

const userInitial = computed(() => {
  return user.value?.name ? user.value.name.charAt(0).toUpperCase() : 'U';
});

const roleColor = computed(() => {
  switch (user.value?.role) {
    case 'admin':
      return 'deep-purple';
    case 'pharmacist':
      return 'teal';
    default:
      return 'blue';
  }
});

const goToDashboard = () => {
  if (user.value?.role === 'admin') {
    router.push('/admin-dashboard');
  } else if (user.value?.role === 'pharmacist') {
    router.push('/pharmacist-dashboard');
  }
};
</script>