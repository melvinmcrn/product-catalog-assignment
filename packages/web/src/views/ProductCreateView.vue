<script setup lang="ts">
import { useRouter } from 'vue-router'

import ProductForm from '@/components/ProductForm.vue'
import { useProductStore } from '@/stores/products'
import type { ProductInput } from '@/types/product'

const router = useRouter()
const store = useProductStore()

async function onSubmit(values: ProductInput) {
  const created = await store.create(values)
  router.push(`/products/${created.id}`)
}
</script>

<template>
  <div class="grid gap-6">
    <RouterLink to="/" class="text-sm text-muted-foreground hover:text-foreground">← Back to catalog</RouterLink>
    <h1 class="text-2xl font-semibold tracking-tight">New product</h1>
    <p v-if="store.error" role="alert" class="text-destructive">{{ store.error }}</p>
    <ProductForm submit-label="Create product" :pending="store.loading" @submit="onSubmit" />
  </div>
</template>
