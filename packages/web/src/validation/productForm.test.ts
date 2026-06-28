import { assert, describe, expect, it } from 'vitest'

import { maxLengthForField, parseProductForm, validateProductField } from './productForm'

const validValues = {
  gvtId: '12',
  name: 'Sultan Voucher',
  productTagline: 'Top up instantly',
  shortDescription: 'Short description',
  longDescription: 'Long description',
  productUrl: '/ca/sultan',
  voucherTypeName: 'Game Voucher',
  orderUrl: 'https://example.com/order',
  productTitle: 'Sultan',
}

describe('parseProductForm', () => {
  it('fails with a message for an empty name', () => {
    const result = parseProductForm({ ...validValues, name: '' })
    assert(!result.success)
    expect(result.errors.name).toBe('Required')
  })

  it('fails for a non-numeric gvtId', () => {
    const result = parseProductForm({ ...validValues, gvtId: '1a' })
    assert(!result.success)
    expect(result.errors.gvtId).toBeTruthy()
  })

  it('fails when a field exceeds its character limit', () => {
    const result = parseProductForm({ ...validValues, name: 'a'.repeat(121) })
    assert(!result.success)
    expect(result.errors.name).toBeTruthy()
  })

  it('accepts descriptions and a title at the maximum lengths the backend allows', () => {
    const result = parseProductForm({
      ...validValues,
      shortDescription: 'a'.repeat(5000),
      longDescription: 'a'.repeat(5000),
      productTitle: 'a'.repeat(120),
    })
    expect(result.success).toBe(true)
  })

  it('omits the optional logo and price fields when blank, so the backend applies its defaults', () => {
    const result = parseProductForm({ ...validValues, logoLocation: '', variableDenomPriceMinAmount: '', variableDenomPriceMaxAmount: '' })
    assert(result.success)
    expect(result.data.gvtId).toBe(12)
    expect(result.data.logoLocation).toBeUndefined()
    expect(result.data.variableDenomPriceMinAmount).toBeUndefined()
    expect(result.data.variableDenomPriceMaxAmount).toBeUndefined()
  })
})

describe('maxLengthForField', () => {
  it('derives the limit from the zod schema for plain string fields', () => {
    expect(maxLengthForField('name')).toBe(120)
    expect(maxLengthForField('productTagline')).toBe(200)
    expect(maxLengthForField('productUrl')).toBe(50)
    expect(maxLengthForField('orderUrl')).toBe(500)
    expect(maxLengthForField('shortDescription')).toBe(5000)
    expect(maxLengthForField('longDescription')).toBe(5000)
  })

  it('unwraps the optional/union wrapper to find the limit on logoLocation', () => {
    expect(maxLengthForField('logoLocation')).toBe(500)
  })

  it('returns undefined for fields that have no length limit', () => {
    expect(maxLengthForField('gvtId')).toBeUndefined()
    expect(maxLengthForField('variableDenomPriceMinAmount')).toBeUndefined()
    expect(maxLengthForField('variableDenomPriceMaxAmount')).toBeUndefined()
  })
})

describe('validateProductField', () => {
  it('returns "Required" for an empty required field', () => {
    expect(validateProductField('name', '')).toBe('Required')
  })

  it('returns an error for a non-numeric gvtId string', () => {
    expect(validateProductField('gvtId', '1a')).toBe('Must be a number')
  })

  it('returns undefined for valid values across different field types', () => {
    expect(validateProductField('name', 'Sultan')).toBeUndefined()
    expect(validateProductField('gvtId', '12')).toBeUndefined()
    expect(validateProductField('productUrl', '/ca/sultan')).toBeUndefined()
    expect(validateProductField('orderUrl', 'https://example.com')).toBeUndefined()
  })

  it('rejects a negative gvtId', () => {
    expect(validateProductField('gvtId', '-1')).toBeTruthy()
  })

  it('rejects a fractional gvtId', () => {
    expect(validateProductField('gvtId', '1.5')).toBeTruthy()
  })

  it('rejects a productUrl that does not start with a single slash', () => {
    expect(validateProductField('productUrl', 'no-slash')).toBeTruthy()
    expect(validateProductField('productUrl', '//double-slash')).toBeTruthy()
  })

  it('rejects a relative orderUrl', () => {
    expect(validateProductField('orderUrl', '/relative')).toBeTruthy()
  })

  it('treats blank optional fields as valid', () => {
    expect(validateProductField('logoLocation', '')).toBeUndefined()
    expect(validateProductField('variableDenomPriceMinAmount', '')).toBeUndefined()
  })

  it('rejects a non-numeric price value', () => {
    expect(validateProductField('variableDenomPriceMinAmount', 'abc')).toBeTruthy()
    expect(validateProductField('variableDenomPriceMaxAmount', 'abc')).toBeTruthy()
  })

  it('accepts a numeric price value', () => {
    expect(validateProductField('variableDenomPriceMinAmount', '0.5')).toBeUndefined()
    expect(validateProductField('variableDenomPriceMaxAmount', '100')).toBeUndefined()
  })
})
