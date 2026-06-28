import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { api, httpClient } from './client'

let mockInstance: MockAdapter

describe('api client', () => {
  beforeEach(() => {
    mockInstance = new MockAdapter(httpClient)
  })

  afterEach(() => {
    mockInstance.restore()
  })

  it('targets the absolute API origin', () => {
    expect(httpClient.defaults.baseURL).toBe('http://localhost:5001')
  })

  it('lists products', async () => {
    mockInstance.onGet('/api/products').reply(200, [{ id: 1 }])
    expect(await api.list()).toEqual([{ id: 1 }])
  })

  it('sends the search term as a query param', async () => {
    mockInstance.onGet('/api/products').reply(200, [])
    await api.list('a b')
    expect(mockInstance.history.get[0].params).toEqual({ search: 'a b' })
  })

  it('gets a single product by id', async () => {
    mockInstance.onGet('/api/products/7').reply(200, { id: 7 })
    expect(await api.get(7)).toEqual({ id: 7 })
  })

  it('creates a product via POST and returns the created body', async () => {
    const input = { name: 'New' } as never
    mockInstance.onPost('/api/products', input).reply(201, { id: 9, name: 'New' })
    expect(await api.create(input)).toEqual({ id: 9, name: 'New' })
  })

  it('updates a product via PUT and returns the updated body', async () => {
    const input = { name: 'Edited' } as never
    mockInstance.onPut('/api/products/5', input).reply(200, { id: 5, name: 'Edited' })
    expect(await api.update(5, input)).toEqual({ id: 5, name: 'Edited' })
  })

  it('throws the API error message on a non-2xx response', async () => {
    mockInstance.onGet('/api/products/99').reply(404, { error: { message: 'Not found' } })
    await expect(api.get(99)).rejects.toThrow('Not found')
  })

  it('maps a 422 validation response into per-field errors on the thrown error', async () => {
    mockInstance.onPost('/api/products').reply(422, {
      error: {
        message: 'Validation failed',
        issues: [
          { path: ['name'], message: 'Required' },
          { path: ['gvtId'], message: 'Must be a number' },
        ],
      },
    })

    await expect(api.create({} as never)).rejects.toMatchObject({
      message: 'Validation failed',
      fieldErrors: { name: 'Required', gvtId: 'Must be a number' },
    })
  })

  it('falls back to the axios message when the server sends no error body', async () => {
    mockInstance.onGet('/api/products').networkError()
    await expect(api.list()).rejects.toThrow('Network Error')
  })

  it('resolves undefined for a 204 No Content (delete)', async () => {
    mockInstance.onDelete('/api/products/1').reply(204)
    await expect(api.remove(1)).resolves.toBeUndefined()
  })
})
