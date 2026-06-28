<script setup lang="ts">
import DOMPurify from 'dompurify'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatPriceRange, hasPriceRange } from '@/lib/price'
import { useProductStore } from '@/stores/products'

const route = useRoute()
const router = useRouter()
const store = useProductStore()
// Reactive: vue-router reuses this component across product→product navigation, so the id must track the route.
const productId = computed(() => Number(route.params.id))

// Descriptions contain server-side HTML — always sanitize before v-html, never render raw.
const safeShortDescription = computed(() => (store.current ? DOMPurify.sanitize(store.current.shortDescription) : ''))
const safeLongDescription = computed(() => (store.current ? DOMPurify.sanitize(store.current.longDescription) : ''))

const hasPrice = computed(() => hasPriceRange(store.current?.variableDenomPriceMinAmount ?? '', store.current?.variableDenomPriceMaxAmount ?? ''))
const priceRange = computed(() => formatPriceRange(store.current?.variableDenomPriceMinAmount ?? '', store.current?.variableDenomPriceMaxAmount ?? ''))

const notFound = computed(() => Boolean(store.error && /not found/i.test(store.error)))

// Hide the logo if its URL is dead so we never show the browser's broken-image icon.
const logoFailed = ref(false)
const hasLogo = computed(() => Boolean(store.current?.logoLocation) && !logoFailed.value)

const confirming = ref(false)

async function onDelete() {
  await store.remove(productId.value)
  router.push('/')
}

// Refetch on id change (covers component reuse) and clear the per-product image-failure flag so each product retries its banner.
// NOTE: If local state grows significantly, consider keying <RouterView :key="$route.params.id"> instead to get a fresh mount for free.
watch(
  productId,
  (id) => {
    logoFailed.value = false
    store.fetchOne(id)
  },
  { immediate: true },
)
</script>

<template>
  <div class="grid gap-6">
    <RouterLink to="/" class="text-sm text-muted-foreground hover:text-foreground">← Back to catalog</RouterLink>

    <p v-if="store.loading" class="text-muted-foreground">Loading…</p>
    <p v-else-if="notFound" class="text-muted-foreground">Product not found.</p>
    <p v-else-if="store.error" role="alert" class="text-destructive">{{ store.error }}</p>

    <article v-else-if="store.current" class="grid gap-4">
      <div data-testid="banner" class="aspect-[640/241] max-h-72 w-full select-none overflow-hidden rounded-xl bg-muted">
        <img
          v-if="hasLogo"
          :src="store.current.logoLocation"
          :alt="store.current.name"
          class="h-full w-full select-none object-cover"
          draggable="false"
          @error="logoFailed = true"
        >
        <div v-else class="flex h-full w-full items-center justify-center px-4 text-center text-muted-foreground">
          <span class="text-lg font-medium">{{ store.current.name }}</span>
        </div>
      </div>
      <header class="flex flex-wrap items-start gap-4">
        <div class="grid gap-1">
          <h1 class="text-2xl font-semibold tracking-tight">{{ store.current.name }}</h1>
          <p class="text-muted-foreground">{{ store.current.productTitle }}</p>
          <p class="text-muted-foreground">{{ store.current.productTagline }}</p>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <Button as-child variant="outline">
            <RouterLink :to="`/products/${store.current.id}/edit`">Edit</RouterLink>
          </Button>
          <Button variant="destructive" @click="confirming = true">Delete</Button>
        </div>
      </header>

      <Dialog v-model:open="confirming">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this product?</DialogTitle>
            <DialogDescription>This permanently removes “{{ store.current.name }}” from the catalog. This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" :disabled="store.loading" @click="confirming = false">Cancel</Button>
            <Button variant="destructive" :disabled="store.loading" @click="onDelete">Confirm delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p v-if="hasPrice" class="text-sm text-muted-foreground">Price: {{ priceRange }}</p>

      <section class="prose prose-invert max-w-none border-t border-border pt-6" v-html="safeLongDescription" />
      <section class="prose prose-invert max-w-none border-t border-border pt-6 text-sm" v-html="safeShortDescription" />
    </article>
  </div>
</template>
