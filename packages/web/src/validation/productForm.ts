import { z } from 'zod'

import type { ProductInput } from '@/types/product'

const priceString = z.string().regex(/^\d+(\.\d+)?$/, 'Must be numeric, e.g. 0.0')

export const productFormSchema = z.object({
  gvtId: z.coerce.number({ message: 'Must be a number' }).int('Must be a whole number').nonnegative('Must not be negative'),
  name: z.string().trim().min(1, 'Required').max(120, 'Must be at most 120 characters'),
  productTagline: z.string().trim().min(1, 'Required').max(200, 'Must be at most 200 characters'),
  shortDescription: z.string().trim().min(1, 'Required').max(5_000, 'Must be at most 5000 characters'),
  longDescription: z.string().trim().min(1, 'Required').max(5_000, 'Must be at most 5000 characters'),
  productUrl: z
    .string()
    .trim()
    .min(1, 'Required')
    .max(50, 'Must be at most 50 characters')
    .regex(/^\/(?!\/)[^\s?#]*([?#][^\s]*)?$/, 'Must be a relative URL starting with a single slash'),
  voucherTypeName: z.string().trim().min(1, 'Required').max(50, 'Must be at most 50 characters'),
  orderUrl: z.url('Must be a valid URL').trim().max(500, 'Must be at most 500 characters'),
  productTitle: z.string().trim().min(1, 'Required').max(120, 'Must be at most 120 characters'),
  logoLocation: z.url('Must be a valid URL').trim().max(500, 'Must be at most 500 characters').optional().or(z.literal('')),
  variableDenomPriceMinAmount: priceString.optional().or(z.literal('')),
  variableDenomPriceMaxAmount: priceString.optional().or(z.literal('')),
})

export type ProductField = keyof typeof productFormSchema.shape

// Reads the `.max()` length straight off the zod schema so the form's input caps stay in sync with
// validation. Recurses through optional/union wrappers (e.g. logoLocation is `.optional().or('')`).
function maxLength(schema: z.ZodType): number | undefined {
  const direct = (schema as { maxLength?: number | null }).maxLength
  if (typeof direct === 'number') return direct

  const unwrap = (schema as { unwrap?: () => z.ZodType }).unwrap
  if (typeof unwrap === 'function') {
    const inner = maxLength(unwrap.call(schema))
    if (inner != null) return inner
  }

  const options = (schema as { def?: { options?: z.ZodType[] } }).def?.options
  if (Array.isArray(options)) {
    for (const option of options) {
      const inner = maxLength(option)
      if (inner != null) return inner
    }
  }

  return undefined
}

export function maxLengthForField(field: ProductField): number | undefined {
  return maxLength(productFormSchema.shape[field])
}

export function validateProductField(field: ProductField, value: unknown): string | undefined {
  const result = productFormSchema.shape[field].safeParse(value)
  return result.success ? undefined : result.error.issues[0]?.message
}

export type ProductFormResult = { success: true; data: ProductInput } | { success: false; errors: Record<string, string> }

export function parseProductForm(values: Record<string, unknown>): ProductFormResult {
  const result = productFormSchema.safeParse(values)
  if (!result.success) {
    const errors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const field = String(issue.path[0])
      if (!errors[field]) errors[field] = issue.message
    }
    return { success: false, errors }
  }
  const v = result.data
  // Blank optional fields are omitted (sent as undefined, which JSON.stringify drops) so the
  // backend treats them as absent and applies its own defaults.
  return {
    success: true,
    data: {
      ...v,
      logoLocation: v.logoLocation || undefined,
      variableDenomPriceMinAmount: v.variableDenomPriceMinAmount || undefined,
      variableDenomPriceMaxAmount: v.variableDenomPriceMaxAmount || undefined,
    },
  }
}
