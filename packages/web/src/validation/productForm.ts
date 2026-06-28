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
  return {
    success: true,
    data: {
      ...v,
      logoLocation: v.logoLocation ?? '',
      variableDenomPriceMinAmount: v.variableDenomPriceMinAmount ?? '',
      variableDenomPriceMaxAmount: v.variableDenomPriceMaxAmount ?? '',
    },
  }
}
