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
// logoLocation and the price fields are optional: when blank they're omitted from the request
// body (sent as undefined) and the backend fills in its defaults.
export type ProductInput = Omit<Product, 'id' | '__typename' | 'logoLocation' | 'variableDenomPriceMinAmount' | 'variableDenomPriceMaxAmount'> & {
  logoLocation?: string
  variableDenomPriceMinAmount?: string
  variableDenomPriceMaxAmount?: string
}
