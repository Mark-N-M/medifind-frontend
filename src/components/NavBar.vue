<template>
  <v-app-bar flat border density="compact">
    <v-app-bar-title class="font-weight-bold cursor-pointer" @click="$router.push('/')">
      MediFind
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Public Navigation Links -->
     <v-btn variant="text" to="/">Home</v-btn>
    <v-btn variant="text" to="/search">Find Medicine</v-btn>
    <v-btn variant="text" to="/pharmacies">Pharmacies</v-btn>

    <!-- Role-Based Direct Dashboard Links -->
    <v-btn 
      v-if="user && user.role === 'admin'" 
      variant="text" 
      color="primary" 
      to="/admin-dashboard"
      class="ml-1"
    >
      Admin Dashboard
    </v-btn>

    <v-btn 
      v-if="user && user.role === 'pharmacist'" 
      variant="text" 
      color="primary" 
      to="/pharmacist-dashboard"
      class="ml-1"
    >
      Pharmacist Dashboard
    </v-btn>

    <!-- Auth Actions -->
    <template v-if="!token">
      <v-btn variant="outlined" class="ml-2" to="/login">Login</v-btn>
      <v-btn color="primary" class="ml-2" to="/register">Register</v-btn>
    </template>

    <!-- Authenticated User Profile Avatar & Menu -->
    <template v-else>
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="ml-2">
            <v-avatar color="primary" size="36">
              <span class="text-white text-subtitle-1 font-weight-bold">
                {{ userInitial }}
              </span>
            </v-avatar>
          </v-btn>
        </template>

       <v-list density="compact" class="mt-2">
          <v-list-item class="px-4 py-2">
            <v-list-item-title class="font-weight-bold">{{ user?.name }}</v-list-item-title>
            <v-list-item-subtitle class="text-capitalize">{{ user?.role }}</v-list-item-subtitle>
          </v-list-item>

          <v-divider></v-divider>

          <!-- Step 3: Direct link to the new universal Profile page -->
          <v-list-item to="/profile">
            <template v-slot:prepend>
              <v-icon icon="mdi-account-outline" size="small"></v-icon>
            </template>
            <v-list-item-title>My Profile</v-list-item-title>
          </v-list-item>

          <v-list-item @click="handleLogout" color="error">
            <template v-slot:prepend>
              <v-icon icon="mdi-logout" color="error" size="small"></v-icon>
            </template>
            <v-list-item-title class="text-error">Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '@/services/authService';

const router = useRouter();
const route = useRoute();

const token = ref(null);
const user = ref(null);

const syncAuth = () => {
  token.value = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  user.value = storedUser ? JSON.parse(storedUser) : null;
};

onMounted(() => {
  syncAuth();
});

watch(
  () => route.path,
  () => {
    syncAuth();
  }
);

// Get the first uppercase letter of the user's name
const userInitial = computed(() => {
  if (user.value && user.value.name) {
    return user.value.name.charAt(0).toUpperCase();
  }
  return 'U';
});

const handleLogout = async () => {
  try {
    await authService.logout();
  } catch (err) {
    console.error('Logout failed:', err);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token.value = null;
    user.value = null;
    router.push('/login');
  }
};
</script>