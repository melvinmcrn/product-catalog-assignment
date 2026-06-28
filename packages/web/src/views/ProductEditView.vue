<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { ApiError } from '@/api/client'
import ProductForm from '@/components/ProductForm.vue'
import { useProductStore } from '@/stores/products'
import type { ProductInput } from '@/types/product'

const route = useRoute()
const router = useRouter()
const store = useProductStore()
const productId = Number(route.params.id)
const serverErrors = ref<Record<string, string>>({})

async function onSubmit(values: ProductInput) {
  serverErrors.value = {}
  try {
    await store.update(productId, values)
    router.push(`/products/${productId}`)
  } catch (error) {
    if (error instanceof ApiError && error.fieldErrors) serverErrors.value = error.fieldErrors
  }
}

onMounted(() => store.fetchOne(productId))
</script>

<template>
  <div class="grid gap-6">
    <RouterLink :to="`/products/${productId}`" class="text-sm text-muted-foreground hover:text-foreground">← Back to product</RouterLink>
    <h1 class="text-2xl font-semibold tracking-tight">Edit product</h1>

    <p v-if="store.loading && !store.current" class="text-muted-foreground">Loading…</p>
    <p v-else-if="store.error" role="alert" class="text-destructive">{{ store.error }}</p>
    <!-- Render once loaded so the form prefills from the current product. -->
    <ProductForm
      v-else-if="store.current"
      :initial-values="store.current"
      :pending="store.loading"
      :server-errors="serverErrors"
      submit-label="Save changes"
      @submit="onSubmit"
    />
  </div>
</template>
