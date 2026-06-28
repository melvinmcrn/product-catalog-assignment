<script setup lang="ts">
import { computed, ref } from 'vue'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPriceRange, hasPriceRange } from '@/lib/price'
import type { Product } from '@/types/product'

const props = defineProps<{ product: Product }>()

const hasPrice = computed(() => hasPriceRange(props.product.variableDenomPriceMinAmount, props.product.variableDenomPriceMaxAmount))
const priceRange = computed(() => formatPriceRange(props.product.variableDenomPriceMinAmount, props.product.variableDenomPriceMaxAmount))

// Hide the logo if its URL is dead so we never show the browser's broken-image icon.
const logoFailed = ref(false)
const hasLogo = computed(() => Boolean(props.product.logoLocation) && !logoFailed.value)
</script>

<template>
  <RouterLink
    :to="`/products/${product.id}`"
    class="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  >
    <Card class="h-full transition-colors hover:ring-ring">
      <div data-testid="banner" class="-mt-4 aspect-[640/241] w-full select-none overflow-hidden rounded-t-xl bg-muted">
        <img
          v-if="hasLogo"
          :src="product.logoLocation"
          :alt="product.name"
          class="h-full w-full select-none object-cover"
          draggable="false"
          @error="logoFailed = true"
        >
        <div v-else class="flex h-full w-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
          {{ product.name }}
        </div>
      </div>
      <CardHeader>
        <CardTitle>{{ product.name }}</CardTitle>
        <p class="text-sm text-muted-foreground">{{ product.productTagline }}</p>
      </CardHeader>
      <CardContent v-if="hasPrice" class="text-sm text-muted-foreground">
        {{ priceRange }}
      </CardContent>
    </Card>
  </RouterLink>
</template>
