<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/products'

const route = useRoute()
const router = useRouter()
const store = useProductStore()

// Seed from the URL so a searched view is shareable and survives navigation/refresh.
const search = ref(typeof route.query.search === 'string' ? route.query.search : '')

let debounce: ReturnType<typeof setTimeout>
watch(search, (value) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => {
    const query = value.trim()
    router.replace({ query: query ? { search: query } : {} })
    store.fetchAll(query || undefined)
  }, 250)
})

onMounted(() => store.fetchAll(search.value.trim() || undefined))
onUnmounted(() => clearTimeout(debounce))
</script>

<template>
  <div class="grid gap-6">
    <AppHeader v-model="search" />

    <p v-if="store.loading" class="text-muted-foreground">Loading…</p>
    <p v-else-if="store.error" role="alert" class="text-destructive">{{ store.error }}</p>
    <p v-else-if="store.items.length === 0" class="text-muted-foreground">No products found.</p>
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard v-for="product in store.items" :key="product.id" :product="product" />
    </div>
  </div>
</template>
