import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import ProductForm from '@/components/ProductForm.vue'
import { useProductStore } from '@/stores/products'
import type { Product, ProductInput } from '@/types/product'

import ProductCreateView from './ProductCreateView.vue'

const push = vi.fn()
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return { ...actual, useRouter: () => ({ push }) }
})

const input: ProductInput = {
  gvtId: 12,
  name: 'New',
  productTagline: 'Tagline',
  shortDescription: 'Short',
  longDescription: 'Long',
  logoLocation: '',
  productUrl: '/ca/x',
  voucherTypeName: 'Game',
  orderUrl: 'https://example.com',
  productTitle: 'Title',
  variableDenomPriceMinAmount: '',
  variableDenomPriceMaxAmount: '',
}

describe('ProductCreateView', () => {
  it('creates the product then redirects to its detail page', async () => {
    const wrapper = mount(ProductCreateView, {
      global: { plugins: [createTestingPinia({ stubActions: true })], stubs: { RouterLink: RouterLinkStub } },
    })
    const store = useProductStore()
    vi.mocked(store.create).mockResolvedValue({ ...input, id: 7, __typename: 'ProductInfo' } as Product)

    await wrapper.findComponent(ProductForm).vm.$emit('submit', input)
    await flushPromises()

    expect(store.create).toHaveBeenCalledWith(input)
    expect(push).toHaveBeenCalledWith('/products/7')
  })

  it('passes the store loading state to the form so submit is disabled while saving', () => {
    const wrapper = mount(ProductCreateView, {
      global: {
        plugins: [createTestingPinia({ initialState: { products: { loading: true } }, stubActions: true })],
        stubs: { RouterLink: RouterLinkStub },
      },
    })
    expect(wrapper.findComponent(ProductForm).props('pending')).toBe(true)
  })
})
