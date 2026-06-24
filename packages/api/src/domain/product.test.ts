import { describe, expect, it } from 'vitest'

import { createProductSchema } from './product'

// Only the required fields.
const makeRequiredInput = () => ({
  gvtId: 51,
  name: 'Game of Sultans',
  productTagline: 'Top Up Game of Sultans Diamonds in Codashop',
  shortDescription: '<p class="shop-content--paragraph">Top up in seconds.</p>',
  longDescription: '<p class="shop-content--paragraph">About the game.</p>',
  productUrl: '/ca/game-of-sultans',
  voucherTypeName: 'MECHANIST',
  orderUrl: 'https://order.codashop.com/ca/initPayment.action',
  productTitle: 'Game of Sultans (Canada)',
})

// A complete body, including the optional logo + price fields.
const makeValidInput = () => ({
  ...makeRequiredInput(),
  logoLocation: 'https://cdn1.codashop.com/S/content/common/images/mno/gameofsultans_640x241.jpg',
  variableDenomPriceMinAmount: '0.0',
  variableDenomPriceMaxAmount: '0.0',
})

describe('createProductSchema', () => {
  it('accepts a fully valid product body', () => {
    expect(() => createProductSchema.parse(makeValidInput())).not.toThrow()
  })

  it('accepts a body with only required fields', () => {
    expect(createProductSchema.safeParse(makeRequiredInput()).success).toBe(true)
  })

  describe('gvtId', () => {
    it('coerces a numeric string to a number', () => {
      const result = createProductSchema.parse({ ...makeValidInput(), gvtId: '51' })

      expect(result.gvtId).toBe(51)
    })

    it('rejects a value that contains letters', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), gvtId: '1a' }).success).toBe(false)
    })

    it('rejects a negative number', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), gvtId: -1 }).success).toBe(false)
    })

    it('rejects a non-integer float', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), gvtId: 1.5 }).success).toBe(false)
    })
  })

  describe('name', () => {
    it('rejects an empty value', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), name: '' }).success).toBe(false)
    })

    it('rejects a value longer than 120 characters', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), name: 'a'.repeat(121) }).success).toBe(false)
    })

    it('trims leading and trailing whitespace', () => {
      const result = createProductSchema.parse({ ...makeValidInput(), name: '  Game of Sultans  ' })

      expect(result.name).toBe('Game of Sultans')
    })
  })

  describe('productTagline', () => {
    it('rejects an empty value', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), productTagline: '' }).success).toBe(false)
    })

    it('rejects a value longer than 200 characters', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), productTagline: 'a'.repeat(201) }).success).toBe(false)
    })

    it('trims leading and trailing whitespace', () => {
      const result = createProductSchema.parse({ ...makeValidInput(), productTagline: '  tagline  ' })

      expect(result.productTagline).toBe('tagline')
    })
  })

  describe('shortDescription', () => {
    it('rejects an empty value', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), shortDescription: '' }).success).toBe(false)
    })

    it('rejects a value longer than 1000 characters', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), shortDescription: 'a'.repeat(1001) }).success).toBe(false)
    })
  })

  describe('longDescription', () => {
    it('rejects an empty value', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), longDescription: '' }).success).toBe(false)
    })

    it('rejects a value longer than 4000 characters', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), longDescription: 'a'.repeat(4001) }).success).toBe(false)
    })
  })

  describe('productUrl', () => {
    it('accepts a relative path with query string', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), productUrl: '/ca/game?ref=1' }).success).toBe(true)
    })

    it('accepts a relative path with hash', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), productUrl: '/ca/game#section' }).success).toBe(true)
    })

    it('rejects a whitespace-only value', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), productUrl: '   ' }).success).toBe(false)
    })

    it('rejects a protocol-relative URL', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), productUrl: '//evil.example.com' }).success).toBe(false)
    })

    it('rejects an absolute URL', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), productUrl: 'https://example.com/path' }).success).toBe(false)
    })

    it('rejects a value longer than 50 characters', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), productUrl: `/${'a'.repeat(50)}` }).success).toBe(false)
    })

    it('trims leading and trailing whitespace', () => {
      const result = createProductSchema.parse({ ...makeValidInput(), productUrl: '  /ca/game  ' })

      expect(result.productUrl).toBe('/ca/game')
    })
  })

  describe('voucherTypeName', () => {
    it('rejects an empty value', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), voucherTypeName: '' }).success).toBe(false)
    })

    it('rejects a value longer than 50 characters', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), voucherTypeName: 'a'.repeat(51) }).success).toBe(false)
    })

    it('trims leading and trailing whitespace', () => {
      const result = createProductSchema.parse({ ...makeValidInput(), voucherTypeName: '  MECHANIST  ' })

      expect(result.voucherTypeName).toBe('MECHANIST')
    })
  })

  describe('orderUrl', () => {
    it('rejects an invalid URL', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), orderUrl: 'not-a-url' }).success).toBe(false)
    })

    it('trims leading and trailing whitespace', () => {
      const result = createProductSchema.parse({
        ...makeValidInput(),
        orderUrl: '  https://order.codashop.com/ca/initPayment.action  ',
      })

      expect(result.orderUrl).toBe('https://order.codashop.com/ca/initPayment.action')
    })
  })

  describe('productTitle', () => {
    it('rejects an empty value', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), productTitle: '' }).success).toBe(false)
    })

    it('rejects a value longer than 50 characters', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), productTitle: 'a'.repeat(51) }).success).toBe(false)
    })

    it('trims leading and trailing whitespace', () => {
      const result = createProductSchema.parse({ ...makeValidInput(), productTitle: '  title  ' })

      expect(result.productTitle).toBe('title')
    })
  })

  describe('logoLocation', () => {
    it('rejects an invalid URL when provided', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), logoLocation: 'not-a-url' }).success).toBe(false)
    })
  })

  describe('variableDenomPriceMinAmount', () => {
    it('accepts a decimal price string', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), variableDenomPriceMinAmount: '9.99' }).success).toBe(true)
    })

    it('accepts an integer price string', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), variableDenomPriceMinAmount: '10' }).success).toBe(true)
    })

    it('rejects a non-numeric value', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), variableDenomPriceMinAmount: '1.2.3' }).success).toBe(false)
    })

    it('rejects a trailing-dot format', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), variableDenomPriceMinAmount: '1.' }).success).toBe(false)
    })
  })

  describe('variableDenomPriceMaxAmount', () => {
    it('accepts a decimal price string', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), variableDenomPriceMaxAmount: '9.99' }).success).toBe(true)
    })

    it('accepts an integer price string', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), variableDenomPriceMaxAmount: '100' }).success).toBe(true)
    })

    it('rejects a non-numeric value', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), variableDenomPriceMaxAmount: 'abc' }).success).toBe(false)
    })

    it('rejects a trailing-dot format', () => {
      expect(createProductSchema.safeParse({ ...makeValidInput(), variableDenomPriceMaxAmount: '1.' }).success).toBe(false)
    })
  })
})
