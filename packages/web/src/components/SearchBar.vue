<script setup lang="ts">
import { Input } from '@/components/ui/input'

const model = defineModel<string>({ required: true })
</script>

<template>
  <Input v-model="model" type="search" placeholder="Search products…" aria-label="Search products" />
</template>
