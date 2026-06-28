import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/api/client'
import ProductForm from '@/components/ProductForm.vue'
import { useProductStore } from '@/stores/products'
import type { Product, ProductInput } from '@/types/product'

import ProductEditView from './ProductEditView.vue'

const push = vi.fn()
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return { ...actual, useRoute: () => ({ params: { id: '1679' } }), useRouter: () => ({ push }) }
})

const existing: Product = {
  id: 1679,
  gvtId: 12,
  name: 'Existing',
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
}

const mountView = () =>
  mount(ProductEditView, {
    global: {
      plugins: [createTestingPinia({ initialState: { products: { current: existing } }, stubActions: true })],
      stubs: { RouterLink: RouterLinkStub },
    },
  })

describe('ProductEditView', () => {
  it('loads the product on mount and prefills the form', () => {
    const wrapper = mountView()
    const store = useProductStore()
    expect(store.fetchOne).toHaveBeenCalledWith(1679)
    expect(wrapper.findComponent(ProductForm).props('initialValues')).toMatchObject({ name: 'Existing' })
  })

  it('updates the product then redirects to its detail page', async () => {
    const wrapper = mountView()
    const store = useProductStore()
    vi.mocked(store.update).mockResolvedValue(existing)
    const payload = { ...existing } as ProductInput

    await wrapper.findComponent(ProductForm).vm.$emit('submit', payload)
    await flushPromises()

    expect(store.update).toHaveBeenCalledWith(1679, payload)
    expect(push).toHaveBeenCalledWith('/products/1679')
  })

  it('passes server-side field errors to the form and does not redirect when update is rejected', async () => {
    const wrapper = mountView()
    const store = useProductStore()
    push.mockClear()
    vi.mocked(store.update).mockRejectedValue(new ApiError('Validation failed', { name: 'Required' }))

    await wrapper.findComponent(ProductForm).vm.$emit('submit', { ...existing } as ProductInput)
    await flushPromises()

    expect(wrapper.findComponent(ProductForm).props('serverErrors')).toEqual({ name: 'Required' })
    expect(push).not.toHaveBeenCalled()
  })

  it('passes the store loading state to the form so submit is disabled while saving', () => {
    const wrapper = mount(ProductEditView, {
      global: {
        plugins: [createTestingPinia({ initialState: { products: { current: existing, loading: true } }, stubActions: true })],
        stubs: { RouterLink: RouterLinkStub },
      },
    })
    expect(wrapper.findComponent(ProductForm).props('pending')).toBe(true)
  })
})
