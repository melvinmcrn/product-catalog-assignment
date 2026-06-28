export interface Product {
  id: number
  gvtId: number
  name: string
  productTagline: string
  shortDescription: string
  longDescription: string
  logoLocation: string
  productUrl: string
  voucherTypeName: string
  orderUrl: string
  productTitle: string
  variableDenomPriceMinAmount: string
  variableDenomPriceMaxAmount: string
  __typename: 'ProductInfo'
}

// id and __typename are server-managed, never client-supplied.
export type ProductInput = Omit<Product, 'id' | '__typename'>
