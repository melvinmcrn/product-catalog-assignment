import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createConnection } from '@/db/connection'
import type { ProductInput } from '@/domain/product'

import { ProductRepository } from './productRepository'

const makeInput = (overrides: Partial<ProductInput> = {}): ProductInput => ({
  gvtId: 51,
  name: 'Game of Sultans',
  productTagline: 'Top Up Game of Sultans Diamonds in Codashop',
  shortDescription: '<p>Top up in seconds.</p>',
  longDescription: '<p>About the game.</p>',
  productUrl: '/ca/game-of-sultans',
  voucherTypeName: 'MECHANIST',
  orderUrl: 'https://order.codashop.com/ca/initPayment.action',
  productTitle: 'Game of Sultans (Canada)',
  ...overrides,
})

describe('ProductRepository', () => {
  let repo: ProductRepository
  let db: ReturnType<typeof createConnection>

  beforeEach(() => {
    db = createConnection(':memory:')
    repo = new ProductRepository(db)
  })

  afterEach(() => {
    db.close()
  })

  describe('create', () => {
    it('returns the row with a server-generated id and __typename', () => {
      const product = repo.create(makeInput())

      expect(product.id).toEqual(expect.any(Number))
      expect(product.__typename).toBe('ProductInfo')
      expect(product.name).toBe('Game of Sultans')
    })

    it('applies defaults for omitted optional fields', () => {
      const product = repo.create(makeInput())

      expect(product.logoLocation).toBe('')
      expect(product.variableDenomPriceMinAmount).toBe('0.0')
      expect(product.variableDenomPriceMaxAmount).toBe('0.0')
    })

    it('persists provided optional fields', () => {
      const product = repo.create(
        makeInput({
          logoLocation: 'https://cdn1.codashop.com/logo.jpg',
          variableDenomPriceMinAmount: '10',
          variableDenomPriceMaxAmount: '100',
        }),
      )

      expect(product.logoLocation).toBe('https://cdn1.codashop.com/logo.jpg')
      expect(product.variableDenomPriceMinAmount).toBe('10')
      expect(product.variableDenomPriceMaxAmount).toBe('100')
    })

    it('generates distinct ids for successive products', () => {
      const first = repo.create(makeInput())
      const second = repo.create(makeInput())

      expect(second.id).not.toBe(first.id)
    })
  })

  describe('findById', () => {
    it('round-trips a created product', () => {
      const created = repo.create(makeInput())

      expect(repo.findById(created.id)).toEqual(created)
    })

    it('returns undefined for an unknown id', () => {
      expect(repo.findById(999)).toBeUndefined()
    })
  })

  describe('findAll', () => {
    it('returns every product', () => {
      repo.create(makeInput({ name: 'Game of Sultans' }))
      repo.create(makeInput({ name: 'Mobile Legends' }))

      expect(repo.findAll()).toHaveLength(2)
    })

    it('returns an empty array when there are no products', () => {
      expect(repo.findAll()).toEqual([])
    })

    it('filters by name case-insensitively', () => {
      repo.create(makeInput({ name: 'Game of Sultans' }))
      repo.create(makeInput({ name: 'Mobile Legends', productTagline: 'Top up Mobile Legends', productTitle: 'Mobile Legends' }))

      const results = repo.findAll('sultan')

      expect(results).toHaveLength(1)
      expect(results[0]?.name).toBe('Game of Sultans')
    })

    it('matches against productTagline and productTitle too', () => {
      repo.create(makeInput({ name: 'Alpha', productTagline: 'unique-tagline-token', productTitle: 'x' }))
      repo.create(makeInput({ name: 'Beta', productTitle: 'unique-title-token' }))

      expect(repo.findAll('unique-tagline-token')).toHaveLength(1)
      expect(repo.findAll('unique-title-token')).toHaveLength(1)
    })
  })

  describe('update', () => {
    it('replaces fields and keeps the same id', () => {
      const created = repo.create(makeInput({ name: 'Old Name' }))

      const updated = repo.update(created.id, makeInput({ name: 'New Name' }))

      expect(updated?.id).toBe(created.id)
      expect(updated?.name).toBe('New Name')
      expect(repo.findById(created.id)?.name).toBe('New Name')
    })

    it('returns undefined for an unknown id', () => {
      expect(repo.update(999, makeInput())).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('returns true and deletes the row', () => {
      const created = repo.create(makeInput())

      expect(repo.remove(created.id)).toBe(true)
      expect(repo.findById(created.id)).toBeUndefined()
    })

    it('returns false for an unknown id', () => {
      expect(repo.remove(999)).toBe(false)
    })
  })
})
