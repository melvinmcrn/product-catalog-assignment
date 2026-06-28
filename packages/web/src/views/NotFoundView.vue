<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="grid gap-4 py-16 text-center">
    <h1 class="text-3xl font-semibold tracking-tight">Page not found</h1>
    <p class="text-muted-foreground">The page you’re looking for doesn’t exist or has moved.</p>
    <div>
      <Button as-child>
        <RouterLink to="/">Back to catalog</RouterLink>
      </Button>
    </div>
  </div>
</template>
