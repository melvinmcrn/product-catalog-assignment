import type { Express } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createApp } from '@/app'
import type { Product, ProductInput } from '@/domain/product'
import type { ProductRepository } from '@/repositories/productRepository'

type RepoMock = { [K in keyof ProductRepository]: ReturnType<typeof vi.fn> }

const makeRepoMock = (): RepoMock => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
})

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  gvtId: 51,
  name: 'Game of Sultans',
  productTagline: 'Top up Game of Sultans',
  shortDescription: '<p>Top up in seconds.</p>',
  longDescription: '<p>About the game.</p>',
  logoLocation: '',
  productUrl: '/ca/game',
  voucherTypeName: 'MECHANIST',
  orderUrl: 'https://order.codashop.com/ca/initPayment.action',
  productTitle: 'Game of Sultans (Canada)',
  variableDenomPriceMinAmount: '0.0',
  variableDenomPriceMaxAmount: '0.0',
  __typename: 'ProductInfo',
  ...overrides,
})

const makeInput = (overrides: Partial<ProductInput> = {}): ProductInput => ({
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

describe('products API', () => {
  let repo: RepoMock
  let app: Express

  beforeEach(() => {
    repo = makeRepoMock()
    app = createApp(repo as unknown as ProductRepository)
  })

  describe('GET /api/products', () => {
    it('returns 200 with the repository results', async () => {
      repo.findAll.mockReturnValue([makeProduct()])

      const res = await request(app).get('/api/products')

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(1)
      expect(repo.findAll).toHaveBeenCalledWith(undefined)
    })

    it('passes ?search through to the repository', async () => {
      repo.findAll.mockReturnValue([])

      await request(app).get('/api/products?search=sultan')

      expect(repo.findAll).toHaveBeenCalledWith('sultan')
    })
  })

  describe('GET /api/products/:id', () => {
    it('returns 200 with the product when it exists', async () => {
      repo.findById.mockReturnValue(makeProduct({ id: 1679 }))

      const res = await request(app).get('/api/products/1679')

      expect(res.status).toBe(200)
      expect(res.body.id).toBe(1679)
      expect(repo.findById).toHaveBeenCalledWith(1679)
    })

    it('returns 404 when the repository has no such product', async () => {
      repo.findById.mockReturnValue(undefined)

      const res = await request(app).get('/api/products/999999')

      expect(res.status).toBe(404)
      expect(res.body.error.message).toEqual(expect.any(String))
    })
  })

  describe('POST /api/products', () => {
    it('validates, creates, and returns 201', async () => {
      repo.create.mockReturnValue(makeProduct({ id: 7, name: 'Brand New' }))

      const res = await request(app)
        .post('/api/products')
        .send(makeInput({ name: 'Brand New' }))

      expect(res.status).toBe(201)
      expect(res.body.name).toBe('Brand New')
      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Brand New', gvtId: 51 }))
    })

    it('returns 422 and skips the repository when a required field is missing', async () => {
      const { name, ...withoutName } = makeInput()

      const res = await request(app).post('/api/products').send(withoutName)

      expect(res.status).toBe(422)
      expect(res.body.error.issues).toBeDefined()
      expect(repo.create).not.toHaveBeenCalled()
    })

    it('returns 422 when gvtId contains letters', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ ...makeInput(), gvtId: '1a' })

      expect(res.status).toBe(422)
      expect(repo.create).not.toHaveBeenCalled()
    })
  })

  describe('PUT /api/products/:id', () => {
    it('updates an existing product and returns 200', async () => {
      repo.update.mockReturnValue(makeProduct({ id: 1679, name: 'Renamed' }))

      const res = await request(app)
        .put('/api/products/1679')
        .send(makeInput({ name: 'Renamed' }))

      expect(res.status).toBe(200)
      expect(res.body.name).toBe('Renamed')
      expect(repo.update).toHaveBeenCalledWith(1679, expect.objectContaining({ name: 'Renamed' }))
    })

    it('returns 404 when the repository reports no such product', async () => {
      repo.update.mockReturnValue(undefined)

      const res = await request(app).put('/api/products/999999').send(makeInput())

      expect(res.status).toBe(404)
    })

    it('returns 422 and skips the repository for an invalid body', async () => {
      const res = await request(app)
        .put('/api/products/1679')
        .send({ ...makeInput(), name: '' })

      expect(res.status).toBe(422)
      expect(repo.update).not.toHaveBeenCalled()
    })
  })

  describe('DELETE /api/products/:id', () => {
    it('returns 204 when the repository removed the row', async () => {
      repo.remove.mockReturnValue(true)

      const res = await request(app).delete('/api/products/1679')

      expect(res.status).toBe(204)
      expect(repo.remove).toHaveBeenCalledWith(1679)
    })

    it('returns 404 when the repository removed nothing', async () => {
      repo.remove.mockReturnValue(false)

      const res = await request(app).delete('/api/products/999999')

      expect(res.status).toBe(404)
    })
  })
})
