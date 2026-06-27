import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { api, httpClient } from './client'

let mockClient: MockAdapter

describe('api client', () => {
  beforeEach(() => {
    mockClient = new MockAdapter(httpClient)
  })

  afterEach(() => {
    mockClient.restore()
  })

  it('targets the absolute API origin', () => {
    expect(httpClient.defaults.baseURL).toBe('http://localhost:5001')
  })

  it('lists products', async () => {
    mockClient.onGet('/api/products').reply(200, [{ id: 1 }])
    expect(await api.list()).toEqual([{ id: 1 }])
  })

  it('sends the search term as a query param', async () => {
    mockClient.onGet('/api/products').reply(200, [])
    await api.list('a b')
    expect(mockClient.history.get[0].params).toEqual({ search: 'a b' })
  })

  it('throws the API error message on a non-2xx response', async () => {
    mockClient.onGet('/api/products/99').reply(404, { error: { message: 'Not found' } })
    await expect(api.get(99)).rejects.toThrow('Not found')
  })

  it('resolves undefined for a 204 No Content (delete)', async () => {
    mockClient.onDelete('/api/products/1').reply(204)
    await expect(api.remove(1)).resolves.toBeUndefined()
  })
})
