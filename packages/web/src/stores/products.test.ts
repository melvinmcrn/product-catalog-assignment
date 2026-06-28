import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import type { Product } from '@/types/product'

import { useProductStore } from './products'

vi.mock('@/api/client', () => ({
  api: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  gvtId: 12,
  name: 'Sultan',
  productTagline: 'Tagline',
  shortDescription: 'Short',
  longDescription: 'Long',
  logoLocation: '',
  productUrl: '/ca/sultan',
  voucherTypeName: 'Game',
  orderUrl: 'https://example.com',
  productTitle: 'Sultan',
  variableDenomPriceMinAmount: '0.0',
  variableDenomPriceMaxAmount: '0.0',
  __typename: 'ProductInfo',
  ...overrides,
})

describe('useProductStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchAll populates items and clears loading', async () => {
    vi.mocked(api.list).mockResolvedValue([product()])
    const store = useProductStore()

    await store.fetchAll()

    expect(store.items).toEqual([product()])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchAll records the error message when the request fails and leaves items unchanged', async () => {
    vi.mocked(api.list).mockRejectedValue(new Error('boom'))
    const store = useProductStore()

    await expect(store.fetchAll()).rejects.toThrow('boom')

    expect(store.error).toBe('boom')
    expect(store.loading).toBe(false)
    expect(store.items).toEqual([])
  })

  it('fetchAll forwards the search term to the client', async () => {
    vi.mocked(api.list).mockResolvedValue([])
    const store = useProductStore()

    await store.fetchAll('coin')

    expect(api.list).toHaveBeenCalledWith('coin')
  })

  it('sets loading while a request is in flight and clears a stale error', async () => {
    vi.mocked(api.list).mockResolvedValue([])
    const store = useProductStore()
    store.error = 'stale'

    const pending = store.fetchAll()
    expect(store.loading).toBe(true)
    await pending

    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchOne loads the requested product into current', async () => {
    const p = product({ id: 7, name: 'Seven' })
    vi.mocked(api.get).mockResolvedValue(p)
    const store = useProductStore()

    await store.fetchOne(7)

    expect(api.get).toHaveBeenCalledWith(7)
    expect(store.current).toEqual(p)
  })

  it('fetchOne records the error when the request fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('not found'))
    const store = useProductStore()

    await expect(store.fetchOne(99)).rejects.toThrow('not found')

    expect(store.error).toBe('not found')
    expect(store.current).toBeNull()
  })

  it('create appends the returned product to items and returns it', async () => {
    const created = product({ id: 2, name: 'New' })
    vi.mocked(api.create).mockResolvedValue(created)
    const store = useProductStore()

    const result = await store.create(created)

    expect(store.items).toContainEqual(created)
    expect(result).toEqual(created)
  })

  it('update replaces current with the returned product and returns it', async () => {
    const updated = product({ id: 5, name: 'Edited' })
    vi.mocked(api.update).mockResolvedValue(updated)
    const store = useProductStore()

    const result = await store.update(5, updated)

    expect(api.update).toHaveBeenCalledWith(5, expect.objectContaining({ name: 'Edited' }))
    expect(store.current).toEqual(updated)
    expect(result).toEqual(updated)
  })

  it('update also refreshes the product in items so the list stays current', async () => {
    const original = product({ id: 5, name: 'Old' })
    const updated = product({ id: 5, name: 'Edited' })
    vi.mocked(api.update).mockResolvedValue(updated)
    const store = useProductStore()
    store.items = [original]

    await store.update(5, updated)

    expect(store.items.find((p) => p.id === 5)).toEqual(updated)
  })

  it('remove deletes the product from items', async () => {
    vi.mocked(api.remove).mockResolvedValue(undefined)
    const store = useProductStore()
    store.items = [product({ id: 1 }), product({ id: 2 }), product({ id: 3 })]

    await store.remove(2)

    expect(api.remove).toHaveBeenCalledWith(2)
    expect(store.items.map((p) => p.id)).toEqual([1, 3])
  })
})
