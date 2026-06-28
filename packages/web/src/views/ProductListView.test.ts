import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/stores/products'
import type { Product } from '@/types/product'

import ProductListView from './ProductListView.vue'

const routeQuery: { search?: string } = {}
const replace = vi.fn()
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return { ...actual, useRoute: () => ({ query: routeQuery }), useRouter: () => ({ replace }) }
})

beforeEach(() => {
  routeQuery.search = undefined
  replace.mockClear()
})

const product = (id: number): Product => ({
  id,
  gvtId: 12,
  name: `Product ${id}`,
  productTagline: 'Tagline',
  shortDescription: 'Short',
  longDescription: 'Long',
  logoLocation: '',
  productUrl: '/ca/x',
  voucherTypeName: 'Game',
  orderUrl: 'https://example.com',
  productTitle: 'Title',
  variableDenomPriceMinAmount: '0.0',
  variableDenomPriceMaxAmount: '0.0',
  __typename: 'ProductInfo',
})

function mountView(state: { items?: Product[]; loading?: boolean; error?: string | null }) {
  return mount(ProductListView, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: { products: { items: [], loading: false, error: null, ...state } },
          stubActions: true,
        }),
      ],
      stubs: { RouterLink: RouterLinkStub },
    },
  })
}

describe('ProductListView', () => {
  it('renders one card per product', () => {
    const wrapper = mountView({ items: [product(1), product(2)] })
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(2)
  })

  it('shows an empty state when there are no products', () => {
    const wrapper = mountView({ items: [] })
    expect(wrapper.text()).toContain('No products')
    expect(wrapper.findAllComponents(ProductCard)).toHaveLength(0)
  })

  it('shows a loading indicator while fetching', () => {
    const wrapper = mountView({ loading: true })
    expect(wrapper.text()).toContain('Loading')
  })

  it('shows an error banner when the request failed', () => {
    const wrapper = mountView({ error: 'Boom' })
    expect(wrapper.get('[role="alert"]').text()).toContain('Boom')
  })

  it('seeds the search box and initial fetch from the URL query', () => {
    routeQuery.search = 'abc'
    const wrapper = mountView({})
    const store = useProductStore()

    expect(store.fetchAll).toHaveBeenCalledWith('abc')
    expect((wrapper.get('input[type="search"]').element as HTMLInputElement).value).toBe('abc')
  })

  describe('with fake timers', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('writes the search term to the URL and refetches after debounce', async () => {
      const wrapper = mountView({})
      const store = useProductStore()

      await wrapper.get('input[type="search"]').setValue('xyz')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(replace).toHaveBeenCalledWith({ query: { search: 'xyz' } })
      expect(store.fetchAll).toHaveBeenCalledWith('xyz')
    })

    it('clears the search param from the URL when the box is emptied', async () => {
      routeQuery.search = 'abc'
      const wrapper = mountView({})

      await wrapper.get('input[type="search"]').setValue('')
      vi.advanceTimersByTime(300)
      await flushPromises()

      expect(replace).toHaveBeenCalledWith({ query: {} })
    })
  })
})
