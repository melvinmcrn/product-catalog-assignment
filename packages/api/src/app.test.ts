import type { Express } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createApp } from '@/app'
import type { ProductRepository } from '@/repositories/productRepository'

type RepoMock = { [K in keyof ProductRepository]: ReturnType<typeof vi.fn> }

const makeRepoMock = (): RepoMock => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
})

describe('createApp composition', () => {
  let repo: RepoMock
  let app: Express

  beforeEach(() => {
    repo = makeRepoMock()
    app = createApp(repo as unknown as ProductRepository)
  })

  it('sets the CORS allow-origin header to the configured frontend origin', async () => {
    const res = await request(app).get('/health').set('Origin', 'http://localhost:5173')

    expect(res.status).toBe(200)
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
  })

  it('answers a CORS preflight request', async () => {
    const res = await request(app).options('/api/products').set('Origin', 'http://localhost:5173').set('Access-Control-Request-Method', 'POST')

    expect(res.status).toBe(204)
    expect(res.headers['access-control-allow-methods']).toContain('POST')
  })

  it('passes thrown errors to our error handler instead of crashing', async () => {
    repo.findById.mockReturnValue(undefined)

    const res = await request(app).get('/api/products/999')

    expect(res.type).toMatch(/json/)
    expect(res.body).toHaveProperty('error')
  })
})
