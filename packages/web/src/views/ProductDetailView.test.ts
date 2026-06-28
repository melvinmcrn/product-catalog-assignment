import { createTestingPinia } from '@pinia/testing'
import { DOMWrapper, enableAutoUnmount, flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'

import { useProductStore } from '@/stores/products'
import type { Product } from '@/types/product'

import ProductDetailView from './ProductDetailView.vue'

const push = vi.fn()
// Reactive so tests can change the id mid-mount, mimicking vue-router reusing the component across products.
const route = reactive({ params: { id: '1679' } })
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return { ...actual, useRoute: () => route, useRouter: () => ({ push }) }
})

// Unmount every mounted wrapper after each test. Required because the modal tests
// attach to document.body, so leftover DOM would otherwise leak between tests.
enableAutoUnmount(afterEach)

const current: Product = {
  id: 1679,
  gvtId: 12,
  name: 'Sultan Voucher',
  productTagline: 'Top up instantly',
  shortDescription: '<img src=x onerror="alert(1)">hello',
  longDescription: '<p>Long body</p>',
  logoLocation: '',
  productUrl: '/ca/sultan',
  voucherTypeName: 'Game',
  orderUrl: 'https://example.com',
  productTitle: 'Sultan Title',
  variableDenomPriceMinAmount: '5.0',
  variableDenomPriceMaxAmount: '50.0',
  __typename: 'ProductInfo',
}

const mountView = (state: Partial<{ current: Product | null; error: string | null }> = { current }) =>
  mount(ProductDetailView, {
    // Attach to the real body so the dialog is reachable via document queries whether it
    // renders inline (our vendored version) or teleports to body (stock shadcn-vue uses a portal).
    attachTo: document.body,
    global: {
      plugins: [createTestingPinia({ initialState: { products: { current: null, error: null, ...state } }, stubActions: true })],
      stubs: { RouterLink: RouterLinkStub },
    },
  })

const clickButton = async (wrapper: ReturnType<typeof mountView>, label: string) => {
  const button = wrapper.findAll('button').find((b) => b.text().includes(label))
  if (!button) throw new Error(`No button labelled "${label}"`)
  await button.trigger('click')
}

// Query the dialog from the document, not the wrapper, so these helpers survive the dialog
// being teleported out of the component tree (e.g. if shadcn-vue's portal is restored).
const findDialog = () => document.querySelector('[role="dialog"]')

const clickDialogButton = async (label: string) => {
  const button = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')).find((b) => b.textContent?.includes(label))
  if (!button) throw new Error(`No dialog button labelled "${label}"`)
  await new DOMWrapper(button).trigger('click')
}

describe('ProductDetailView', () => {
  beforeEach(() => {
    route.params.id = '1679'
    push.mockClear()
  })

  it('renders the product name, title and price', () => {
    const wrapper = mountView()
    expect(wrapper.text()).toContain('Sultan Voucher')
    expect(wrapper.text()).toContain('Sultan Title')
    expect(wrapper.text()).toContain('Price: 5.00 - 50.00')
  })

  it('sanitizes HTML descriptions before rendering them', () => {
    const wrapper = mountView()
    expect(wrapper.html()).not.toContain('onerror')
    expect(wrapper.text()).toContain('hello')
  })

  it('links to the edit page for this product', () => {
    const wrapper = mountView()
    const link = wrapper.findAllComponents(RouterLinkStub).find((l) => l.props('to') === '/products/1679/edit')
    expect(link).toBeDefined()
  })

  it('omits the price line when both amounts are blank', () => {
    const wrapper = mountView({ current: { ...current, variableDenomPriceMinAmount: '', variableDenomPriceMaxAmount: '' } })
    expect(wrapper.text()).not.toContain('Price:')
  })

  it('omits the price line when both amounts are zero', () => {
    const wrapper = mountView({ current: { ...current, variableDenomPriceMinAmount: '0.0', variableDenomPriceMaxAmount: '0.0' } })
    expect(wrapper.text()).not.toContain('Price:')
  })

  it('renders the image as a full-width banner', () => {
    const wrapper = mountView({ current: { ...current, logoLocation: 'https://example.com/banner.jpg' } })
    const img = wrapper.get('img[alt="Sultan Voucher"]')
    expect(img.classes()).toContain('w-full')
    expect(img.classes()).toContain('object-cover')
  })

  it('makes the banner image non-selectable and non-draggable', () => {
    const wrapper = mountView({ current: { ...current, logoLocation: 'https://example.com/banner.jpg' } })
    const img = wrapper.get('img[alt="Sultan Voucher"]')
    expect(img.classes()).toContain('select-none')
    expect(img.attributes('draggable')).toBe('false')
  })

  it('keeps the banner area present even when the product has no image, to avoid layout shift', () => {
    const wrapper = mountView({ current: { ...current, logoLocation: '' } })
    const banner = wrapper.get('[data-testid="banner"]')
    expect(banner.classes()).toContain('aspect-[640/241]')
    expect(wrapper.find('img[alt="Sultan Voucher"]').exists()).toBe(false)
  })

  it('hides the logo when the image fails to load', async () => {
    const wrapper = mountView({ current: { ...current, logoLocation: 'https://example.com/dead.png' } })
    await wrapper.get('img[alt="Sultan Voucher"]').trigger('error')
    expect(wrapper.find('img[alt="Sultan Voucher"]').exists()).toBe(false)
  })

  it('shows a friendly message when the product does not exist', () => {
    const wrapper = mountView({ current: null, error: 'Not found' })
    expect(wrapper.text()).toContain('Product not found')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('still surfaces unexpected errors in an alert', () => {
    const wrapper = mountView({ current: null, error: 'Boom' })
    expect(wrapper.get('[role="alert"]').text()).toContain('Boom')
  })

  it('refetches when the route id changes while the component is reused', async () => {
    mountView()
    const store = useProductStore()
    expect(store.fetchOne).toHaveBeenCalledWith(1679)

    route.params.id = '1680'
    await nextTick()

    expect(store.fetchOne).toHaveBeenCalledWith(1680)
  })

  it('shows the next product image after navigating, even if a previous image had failed', async () => {
    const wrapper = mountView({ current: { ...current, logoLocation: 'https://example.com/a.jpg' } })
    const store = useProductStore()

    await wrapper.get('img[alt="Sultan Voucher"]').trigger('error')
    expect(wrapper.find('img[alt="Sultan Voucher"]').exists()).toBe(false)

    // Component is reused for the next product: id changes and a new product (with a logo) loads.
    store.current = { ...current, id: 1680, name: 'Other Voucher', logoLocation: 'https://example.com/b.jpg' }
    route.params.id = '1680'
    await nextTick()

    expect(wrapper.find('img[alt="Other Voucher"]').exists()).toBe(true)
  })

  it('opens a confirmation modal when Delete is clicked', async () => {
    const wrapper = mountView()
    expect(findDialog()).toBeNull()

    await clickButton(wrapper, 'Delete')
    await flushPromises()

    expect(findDialog()).not.toBeNull()
  })

  it('deletes the product after confirmation and returns to the catalog', async () => {
    const wrapper = mountView()
    const store = useProductStore()
    vi.mocked(store.remove).mockResolvedValue()

    await clickButton(wrapper, 'Delete')
    await flushPromises()
    await clickDialogButton('Confirm')
    await flushPromises()

    expect(store.remove).toHaveBeenCalledWith(1679)
    expect(push).toHaveBeenCalledWith('/')
  })

  it('does not delete when the confirmation is cancelled', async () => {
    const wrapper = mountView()
    const store = useProductStore()

    await clickButton(wrapper, 'Delete')
    await flushPromises()
    await clickDialogButton('Cancel')

    expect(store.remove).not.toHaveBeenCalled()
  })
})
