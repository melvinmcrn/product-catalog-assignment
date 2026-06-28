import { assert, describe, expect, it } from 'vitest'

import { parseProductForm, validateProductField } from './productForm'

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

  it('succeeds when the optional logo and price fields are absent, defaulting them to empty strings', () => {
    const result = parseProductForm(validValues)
    assert(result.success)
    expect(result.data.gvtId).toBe(12)
    expect(result.data.logoLocation).toBe('')
    expect(result.data.variableDenomPriceMinAmount).toBe('')
    expect(result.data.variableDenomPriceMaxAmount).toBe('')
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
