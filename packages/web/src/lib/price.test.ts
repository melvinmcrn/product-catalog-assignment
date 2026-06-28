import { describe, expect, it } from 'vitest'

import { formatPriceRange, hasPriceRange } from './price'

describe('hasPriceRange', () => {
  it('is false when both bounds are empty', () => {
    expect(hasPriceRange('', '')).toBe(false)
  })

  it('is false when both bounds are zero', () => {
    expect(hasPriceRange('0.0', '0.0')).toBe(false)
    expect(hasPriceRange('0', '0')).toBe(false)
  })

  it('is true when at least one bound is greater than zero', () => {
    expect(hasPriceRange('5.0', '50.0')).toBe(true)
    expect(hasPriceRange('0.0', '50.0')).toBe(true)
  })

  it('is false for non-numeric', () => {
    expect(hasPriceRange('abc', '')).toBe(false)
  })
})

describe('formatPriceRange', () => {
  it('formats both bounds to the same fixed-decimal shape', () => {
    expect(formatPriceRange('12.0', '15')).toBe('12.00 - 15.00')
  })

  it('shows a single value when only one bound is meaningful', () => {
    expect(formatPriceRange('0.0', '15')).toBe('15.00')
    expect(formatPriceRange('12', '0')).toBe('12.00')
  })

  it('collapses an equal min and max to a single value', () => {
    expect(formatPriceRange('15', '15.00')).toBe('15.00')
  })

  it('is empty when neither bound is meaningful', () => {
    expect(formatPriceRange('', '')).toBe('')
    expect(formatPriceRange('0.0', '0')).toBe('')
  })
})
