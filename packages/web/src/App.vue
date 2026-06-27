<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppNavbar from '@/components/AppNavbar.vue'
</script>

<template>
  <div class="min-h-svh bg-background text-foreground">
    <AppNavbar />
    <main class="mx-auto max-w-5xl px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
