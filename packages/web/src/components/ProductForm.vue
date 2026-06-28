<script setup lang="ts">
import DOMPurify from 'dompurify'
import { computed, reactive, ref, watch } from 'vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ProductInput } from '@/types/product'
import { maxLengthForField, type ProductField, parseProductForm, validateProductField } from '@/validation/productForm'

const props = defineProps<{ submitLabel: string; initialValues?: ProductInput; pending?: boolean }>()
const emit = defineEmits<{ submit: [values: ProductInput] }>()

type FormValues = Record<ProductField, string>

function toFormValues(input?: ProductInput): FormValues {
  return {
    gvtId: input ? String(input.gvtId) : '',
    name: input?.name ?? '',
    productTagline: input?.productTagline ?? '',
    shortDescription: input?.shortDescription ?? '',
    longDescription: input?.longDescription ?? '',
    productUrl: input?.productUrl ?? '',
    voucherTypeName: input?.voucherTypeName ?? '',
    orderUrl: input?.orderUrl ?? '',
    productTitle: input?.productTitle ?? '',
    logoLocation: input?.logoLocation ?? '',
    variableDenomPriceMinAmount: input?.variableDenomPriceMinAmount ?? '',
    variableDenomPriceMaxAmount: input?.variableDenomPriceMaxAmount ?? '',
  }
}

interface FieldConfig {
  key: ProductField
  label: string
  placeholder?: string
  full?: boolean
}

// The input length caps come from the zod schema (maxLengthForField), so they can't drift from validation.
const textFields: FieldConfig[] = [
  { key: 'name', label: 'Name', full: true },
  { key: 'gvtId', label: 'GVT ID', placeholder: 'e.g. 1679' },
  { key: 'voucherTypeName', label: 'Voucher type' },
  { key: 'productTitle', label: 'Title' },
  { key: 'productTagline', label: 'Tagline' },
  { key: 'productUrl', label: 'Product URL', placeholder: '/ca/...' },
  { key: 'orderUrl', label: 'Order URL', placeholder: 'https://...' },
  { key: 'variableDenomPriceMinAmount', label: 'Min price (optional)', placeholder: '0.0' },
  { key: 'variableDenomPriceMaxAmount', label: 'Max price (optional)', placeholder: '0.0' },
  { key: 'logoLocation', label: 'Logo URL (optional)', placeholder: 'https://...', full: true },
]

const textareaFields: FieldConfig[] = [
  { key: 'shortDescription', label: 'Short description' },
  { key: 'longDescription', label: 'Long description' },
]

const values = reactive<FormValues>(toFormValues(props.initialValues))
const errors = ref<Partial<Record<ProductField, string>>>({})

function onBlur(key: ProductField) {
  const message = validateProductField(key, values[key])
  if (message) errors.value = { ...errors.value, [key]: message }
  else {
    const { [key]: _removed, ...rest } = errors.value
    errors.value = rest
  }
}

const logoPreviewFailed = ref(false)
const logoPreview = computed(() => {
  const url = values.logoLocation.trim()
  if (!url || logoPreviewFailed.value) return ''
  return validateProductField('logoLocation', url) ? '' : url
})
watch(
  () => values.logoLocation,
  () => {
    logoPreviewFailed.value = false
  },
)

// Descriptions are HTML — always sanitize before previewing via v-html.
const safeShortDescription = computed(() => DOMPurify.sanitize(values.shortDescription))
const safeLongDescription = computed(() => DOMPurify.sanitize(values.longDescription))
const hasDescriptionPreview = computed(() => Boolean(values.shortDescription.trim() || values.longDescription.trim()))

function onSubmit() {
  const result = parseProductForm(values)
  if (!result.success) {
    errors.value = result.errors
    return
  }
  errors.value = {}
  emit('submit', result.data)
}
</script>

<template>
  <form class="grid gap-6" novalidate @submit.prevent="onSubmit">
    <div data-testid="field-grid" class="grid items-start gap-4 sm:grid-cols-2">
      <div v-for="field in textFields" :key="field.key" class="grid gap-1.5" :class="field.full && 'sm:col-span-2'">
        <Label :for="field.key">{{ field.label }}</Label>
        <Input
          :id="field.key"
          v-model="values[field.key]"
          :name="field.key"
          type="text"
          :maxlength="maxLengthForField(field.key)"
          :placeholder="field.placeholder"
          :aria-invalid="Boolean(errors[field.key])"
          :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
          @blur="onBlur(field.key)"
        />
        <p v-if="errors[field.key]" :id="`${field.key}-error`" class="text-sm text-destructive">{{ errors[field.key] }}</p>
      </div>
    </div>

    <div class="grid gap-4">
      <div v-for="field in textareaFields" :key="field.key" class="grid gap-1.5">
        <Label :for="field.key">{{ field.label }}</Label>
        <Textarea
          :id="field.key"
          v-model="values[field.key]"
          :name="field.key"
          :maxlength="maxLengthForField(field.key)"
          :aria-invalid="Boolean(errors[field.key])"
          :aria-describedby="errors[field.key] ? `${field.key}-error` : undefined"
          @blur="onBlur(field.key)"
        />
        <p v-if="errors[field.key]" :id="`${field.key}-error`" class="text-sm text-destructive">{{ errors[field.key] }}</p>
      </div>
    </div>

    <!-- Live preview of how the logo and descriptions will render on the product page. -->
    <section v-if="logoPreview || hasDescriptionPreview" class="grid gap-3 rounded-xl border border-border p-4">
      <p class="text-sm font-medium text-muted-foreground">Preview</p>
      <img
        v-if="logoPreview"
        data-testid="logo-preview"
        :src="logoPreview"
        alt="Logo preview"
        class="aspect-[640/241] max-h-48 w-full select-none rounded-lg object-cover"
        draggable="false"
        @error="logoPreviewFailed = true"
      >
      <div v-if="hasDescriptionPreview" data-testid="description-preview" class="prose prose-invert max-w-none text-sm">
        <div v-html="safeShortDescription" />
        <div v-html="safeLongDescription" />
      </div>
    </section>

    <div>
      <Button type="submit" :disabled="props.pending">{{ props.pending ? 'Saving…' : submitLabel }}</Button>
    </div>
  </form>
</template>
