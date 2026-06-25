import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ProductRepository } from '@/repositories/productRepository'

import { createConnection } from './connection'
import { resetAndSeed } from './seed'

// Counts/ids below come from the fixed mock file (mocks/products.json) and must not drift.
const SEED_COUNT = 6
const A_KNOWN_ID = 1679

describe('resetAndSeed', () => {
  let db: ReturnType<typeof createConnection>
  let repo: ProductRepository

  beforeEach(() => {
    db = createConnection(':memory:')
    repo = new ProductRepository(db)
  })

  afterEach(() => {
    db.close()
  })

  it('inserts every product from the mock file and returns the count', () => {
    expect(resetAndSeed(db)).toBe(SEED_COUNT)
    expect(repo.findAll()).toHaveLength(SEED_COUNT)
  })

  it('preserves the original ids from the source data', () => {
    resetAndSeed(db)

    expect(repo.findById(A_KNOWN_ID)).toBeDefined()
  })

  it('is idempotent: re-seeding resets rather than duplicates', () => {
    resetAndSeed(db)
    const secondCount = resetAndSeed(db)

    expect(secondCount).toBe(SEED_COUNT)
    expect(repo.findAll()).toHaveLength(SEED_COUNT)
    expect(repo.findById(A_KNOWN_ID)).toBeDefined()
  })
})
