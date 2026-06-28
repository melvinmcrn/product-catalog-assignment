import { z } from 'zod'

export const TYPENAME = 'ProductInfo' as const
export const priceString = z.string().regex(/^\d+(\.\d+)?$/, 'must be numeric, e.g. 0.0')

export const createProductSchema = z.object({
  gvtId: z.coerce.number().int().nonnegative(),
  name: z.string().trim().min(1).max(120),
  productTagline: z.string().trim().min(1).max(200),
  shortDescription: z.string().min(1).max(5_000),
  longDescription: z.string().min(1).max(5_000),
  productUrl: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^\/(?!\/)[^\s?#]*([?#][^\s]*)?$/, 'must be a relative URL starting with a single slash'),
  voucherTypeName: z.string().trim().min(1).max(50),
  orderUrl: z.url().trim().max(500),
  productTitle: z.string().trim().min(1).max(120),
  logoLocation: z.url().trim().max(500).optional(),
  variableDenomPriceMinAmount: priceString.optional(),
  variableDenomPriceMaxAmount: priceString.optional(),
})
export const updateProductSchema = createProductSchema

export type ProductInput = z.infer<typeof createProductSchema>
export type Product = ProductInput & {
  id: number
  __typename: typeof TYPENAME
}
