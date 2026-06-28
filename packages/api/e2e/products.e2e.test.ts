import type { Express } from 'express'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createTestApp, SEED_COUNT, SEEDED_ID } from './support/buildApp'

const productBody = (overrides: Record<string, unknown> = {}) => ({
  gvtId: 51,
  name: 'New Game',
  productTagline: 'Top up New Game',
  shortDescription: '<p>Top up in seconds.</p>',
  longDescription: '<p>About the game.</p>',
  productUrl: '/ca/new-game',
  voucherTypeName: 'MECHANIST',
  orderUrl: 'https://order.codashop.com/ca/initPayment.action',
  productTitle: 'New Game (Canada)',
  ...overrides,
})

describe('Products API (e2e)', () => {
  let app: Express
  let cleanup: () => void

  beforeEach(() => {
    ;({ app, cleanup } = createTestApp())
  })

  afterEach(() => {
    cleanup()
  })

  it('lets a client browse and search the seeded catalog', async () => {
    const all = await request(app).get('/api/products')
    expect(all.status).toBe(200)
    expect(all.body).toHaveLength(SEED_COUNT)

    const found = await request(app).get('/api/products?search=sultan')
    expect(found.status).toBe(200)
    expect(found.body.map((p: { name: string }) => p.name.trim())).toContain('Game of Sultans')
  })

  it('makes a newly created product retrievable and lists it', async () => {
    const created = await request(app)
      .post('/api/products')
      .send(productBody({ name: 'Brand New' }))
    expect(created.status).toBe(201)
    const newId = created.body.id

    const fetched = await request(app).get(`/api/products/${newId}`)
    expect(fetched.status).toBe(200)
    expect(fetched.body.name).toBe('Brand New')

    const all = await request(app).get('/api/products')
    expect(all.body).toHaveLength(SEED_COUNT + 1)
  })

  it('applies defaults when the optional logo and price fields are omitted', async () => {
    const created = await request(app)
      .post('/api/products')
      .send(productBody({ name: 'No Logo' }))

    expect(created.status).toBe(201)
    expect(created.body.logoLocation).toBe('')
    expect(created.body.variableDenomPriceMinAmount).toBe('0.0')
    expect(created.body.variableDenomPriceMaxAmount).toBe('0.0')
  })

  it('persists an update across requests', async () => {
    const updated = await request(app)
      .put(`/api/products/${SEEDED_ID}`)
      .send(productBody({ name: 'Renamed' }))
    expect(updated.status).toBe(200)

    const fetched = await request(app).get(`/api/products/${SEEDED_ID}`)
    expect(fetched.body.name).toBe('Renamed')
  })

  it('removes a deleted product so it can no longer be fetched', async () => {
    const deleted = await request(app).delete(`/api/products/${SEEDED_ID}`)
    expect(deleted.status).toBe(204)

    const fetched = await request(app).get(`/api/products/${SEEDED_ID}`)
    expect(fetched.status).toBe(404)

    const all = await request(app).get('/api/products')
    expect(all.body).toHaveLength(SEED_COUNT - 1)
  })

  it('rejects invalid input and leaves the catalog unchanged', async () => {
    const rejected = await request(app).post('/api/products').send({ gvtId: '1a' })
    expect(rejected.status).toBe(422)

    const all = await request(app).get('/api/products')
    expect(all.body).toHaveLength(SEED_COUNT)
  })
})
