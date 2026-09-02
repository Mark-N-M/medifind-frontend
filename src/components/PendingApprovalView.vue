<template>
  <v-container class="fill-height d-flex align-center justify-center text-center">
    <v-card width="500" class="pa-8">
      <v-icon color="warning" size="64" class="mb-4">mdi-clock-outline</v-icon>
      
      <h2 class="text-h5 font-weight-bold mb-2">Registration Submitted</h2>
      
      <p class="text-body-1 text-grey-darken-1 mb-6">
        Your pharmacist registration request was successfully created. For security reasons, pharmacy accounts require administrative verification before access is granted.
      </p>

      <v-alert type="info" variant="tonal" class="mb-6">
        Please wait for admin approval. You will be able to log in once your application is verified.
      </v-alert>

      <v-btn color="primary" to="/login" variant="outlined">
        Return to Login
      </v-btn>
    </v-card>
  </v-container>
</template>