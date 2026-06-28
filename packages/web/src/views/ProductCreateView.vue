<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { ApiError } from '@/api/client'
import ProductForm from '@/components/ProductForm.vue'
import { useProductStore } from '@/stores/products'
import type { ProductInput } from '@/types/product'

const router = useRouter()
const store = useProductStore()
const serverErrors = ref<Record<string, string>>({})

async function onSubmit(values: ProductInput) {
  serverErrors.value = {}
  try {
    const created = await store.create(values)
    router.push(`/products/${created.id}`)
  } catch (error) {
    if (error instanceof ApiError && error.fieldErrors) serverErrors.value = error.fieldErrors
  }
}
</script>

<template>
  <div class="grid gap-6">
    <RouterLink to="/" class="text-sm text-muted-foreground hover:text-foreground">← Back to catalog</RouterLink>
    <h1 class="text-2xl font-semibold tracking-tight">New product</h1>
    <p v-if="store.error" role="alert" class="text-destructive">{{ store.error }}</p>
    <ProductForm submit-label="Create product" :pending="store.loading" :server-errors="serverErrors" @submit="onSubmit" />
  </div>
</template>
