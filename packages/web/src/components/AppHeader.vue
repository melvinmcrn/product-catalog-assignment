<script setup lang="ts">
import { Button } from '@/components/ui/button'

import SearchBar from './SearchBar.vue'

const search = defineModel<string>({ required: true })
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <SearchBar v-model="search" class="w-full sm:w-64" />
    <Button as-child class="ml-auto">
      <RouterLink to="/products/new">New product</RouterLink>
    </Button>
  </div>
</template>
