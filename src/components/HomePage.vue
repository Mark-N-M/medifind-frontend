<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showSearchInput = ref(false)
const searchQuery = ref('')

function openSearchInput() {
  showSearchInput.value = true
}

function submitSearch() {
  if (searchQuery.value.trim() === '') return
  router.push({ path: '/search', query: { q: searchQuery.value } })
}

const slides = [
  { image: '/images/slide-1.jpg', caption: 'Search from your phone, anywhere in Nairobi' },
  { image: '/images/slide-2.jpg', caption: 'See nearby pharmacies on the map' },
  { image: '/images/slide-3.jpg', caption: 'Compare prices before you travel' },
  { image: '/images/slide-4.jpg', caption: 'Every listing verified and up to date' },
]

const features = [
  {
    icon: 'mdi-magnify',
    title: 'Find',
    subtitle: 'Search by name',
    description: 'Type any medicine or brand and see which pharmacies near you have it on the shelf right now.',
  },
  {
    icon: 'mdi-scale-balance',
    title: 'Compare',
    subtitle: 'Check prices',
    description: 'See what each pharmacy charges side by side, so you never pay more than you need to.',
  },
  {
    icon: 'mdi-shield-check',
    title: 'Verified',
    subtitle: 'Trusted pharmacies',
    description: "Every listing comes from a licensed pharmacy we've confirmed, with details kept up to date.",
  },
]

const steps = [
  { number: 1, title: 'Search your medicine by name' },
  { number: 2, title: 'Compare prices and availability nearby' },
  { number: 3, title: 'Head to a verified pharmacy with confidence' },
]

const stats = [
  { value: '1,800+', label: 'Pharmacies' },
  { value: 'Nairobi-wide', label: 'Coverage' },
  { value: '100%', label: 'Verified listings' },
]
</script>

<template>
  <v-sheet color="background" min-height="100vh">

    <!-- Hero Section -->
    <v-container class="py-12">
      <v-row justify="center">
        <v-col cols="12" md="7" class="text-center">
          <v-chip color="primary" variant="tonal" prepend-icon="mdi-map-marker" size="large" class="mb-5 font-weight-medium">
            Built for Nairobi
          </v-chip>

          <div class="hero-title font-weight-bold mb-4">Find medicine near you</div>
          <div class="text-body-1 text-medium-emphasis mb-8 style-wrapper">
            MediFind connects you to over 1,800 pharmacies across Nairobi, so you never
            have to guess where to find your prescription or overpay for it again.
          </div>

          <v-btn
            v-if="!showSearchInput"
            color="primary"
            size="x-large"
            rounded="lg"
            elevation="0"
            @click="openSearchInput"
          >
            Search medicine
          </v-btn>

          <v-text-field
            v-else
            v-model="searchQuery"
            placeholder="e.g. Amoxicillin 500mg"
            variant="solo"
            rounded="lg"
            elevation="0"
            density="comfortable"
            autofocus
            prepend-inner-icon="mdi-magnify"
            @keyup.enter="submitSearch"
          />

          <div class="mt-3">
            <a href="#how-it-works" class="text-primary text-decoration-none text-body-2">
              How it works
              <v-icon icon="mdi-arrow-right" size="14" />
            </a>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Carousel Section -->
    <v-container class="pb-0" style="max-width: 1000px;">
      <v-sheet rounded="lg" elevation="0" style="overflow: hidden;">
        <v-carousel
          cycle
          interval="4000"
          height="360"
          hide-delimiter-background
          show-arrows="hover"
          color="primary"
        >
          <v-carousel-item
            v-for="(slide, i) in slides"
            :key="i"
            :src="slide.image"
            cover
          >
            <!-- Overlay Gradient -->
            <div class="carousel-overlay">
              <div class="d-flex align-end pa-6 h-100">
                <div class="text-h6 text-white font-weight-medium">{{ slide.caption }}</div>
              </div>
            </div>
          </v-carousel-item>
        </v-carousel>
      </v-sheet>
    </v-container>

    <!-- Features Section -->
    <v-container class="py-12">
      <v-row justify="center">
        <v-col v-for="feature in features" :key="feature.title" cols="12" sm="4">
          <v-card rounded="lg" elevation="0" class="text-center pa-6 h-100" color="surface">
            <v-avatar color="primary" variant="tonal" size="48" class="mb-3">
              <v-icon :icon="feature.icon" color="primary" size="24" />
            </v-avatar>
            <div class="text-subtitle-1 font-weight-medium">{{ feature.title }}</div>
            <div class="text-caption text-medium-emphasis mb-2">{{ feature.subtitle }}</div>
            <div class="text-body-2 text-medium-emphasis">{{ feature.description }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- How It Works Section -->
    <v-container id="how-it-works" class="py-12">
      <div class="text-h4 font-weight-bold mb-1">How it works</div>
      <div class="text-body-2 text-medium-emphasis mb-8">
        Three calm steps between you and the medicine you need.
      </div>
      <v-row>
        <v-col v-for="step in steps" :key="step.number" cols="12" sm="4">
          <v-avatar color="primary" size="40" class="mb-3">
            <span class="text-white font-weight-medium">{{ step.number }}</span>
          </v-avatar>
          <div class="text-body-1">{{ step.title }}</div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Stats Bar -->
    <v-sheet color="primary" class="py-8">
      <v-container>
        <v-row justify="center">
          <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="4" class="text-center">
            <div class="text-h4 font-weight-bold text-white">{{ stat.value }}</div>
            <div class="text-caption text-white text-medium-emphasis">{{ stat.label }}</div>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>

    <!-- Footer -->
    <v-sheet color="surface" class="py-8">
      <v-container class="text-center">
        <div class="text-subtitle-1 font-weight-medium mb-1">MediFind</div>
        <div class="text-caption text-medium-emphasis mb-4">
          Helping Nairobi find the medicine it needs, without the guesswork.
        </div>
        <div class="d-flex justify-center flex-wrap" style="gap: 20px;">
          <router-link to="/search" class="text-body-2 text-medium-emphasis text-decoration-none">Search</router-link>
          <span class="text-body-2 text-medium-emphasis">Pharmacies</span>
          <span class="text-body-2 text-medium-emphasis">Login</span>
          <span class="text-body-2 text-medium-emphasis">About</span>
        </div>
      </v-container>
    </v-sheet>

  </v-sheet>
</template>

<style scoped>
.hero-title {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.style-wrapper {
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.carousel-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(4, 52, 44, 0.75), rgba(4, 52, 44, 0.05));
}
</style>