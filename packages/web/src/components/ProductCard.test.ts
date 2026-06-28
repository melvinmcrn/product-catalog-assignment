import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { Product } from '@/types/product'

import ProductCard from './ProductCard.vue'

const product: Product = {
  id: 1679,
  gvtId: 12,
  name: 'Sultan Voucher',
  productTagline: 'Top up instantly',
  shortDescription: 'Short',
  longDescription: 'Long',
  logoLocation: 'https://example.com/logo.png',
  productUrl: '/ca/sultan',
  voucherTypeName: 'Game',
  orderUrl: 'https://example.com/order',
  productTitle: 'Sultan',
  variableDenomPriceMinAmount: '5.0',
  variableDenomPriceMaxAmount: '50.0',
  __typename: 'ProductInfo',
}

const mountCard = (p: Product = product) => mount(ProductCard, { props: { product: p }, global: { stubs: { RouterLink: RouterLinkStub } } })

describe('ProductCard', () => {
  it('renders the product name and tagline', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('Sultan Voucher')
    expect(wrapper.text()).toContain('Top up instantly')
  })

  it('links to the product detail page', () => {
    const wrapper = mountCard()
    expect(wrapper.getComponent(RouterLinkStub).props('to')).toBe('/products/1679')
  })

  it('shows the logo with the product name as alt text', () => {
    const wrapper = mountCard()
    const img = wrapper.get('img')
    expect(img.attributes('src')).toBe('https://example.com/logo.png')
    expect(img.attributes('alt')).toBe('Sultan Voucher')
  })

  it('shows the price range in a consistent fixed-decimal format', () => {
    const wrapper = mountCard()
    expect(wrapper.text()).toContain('5.00 - 50.00')
  })

  it('omits the price range when both amounts are blank', () => {
    const wrapper = mountCard({ ...product, variableDenomPriceMinAmount: '', variableDenomPriceMaxAmount: '' })
    expect(wrapper.text()).not.toContain(' - ')
  })

  it('keeps a fixed-size banner area even without an image, to avoid layout shift', () => {
    const wrapper = mountCard({ ...product, logoLocation: '' })
    const banner = wrapper.get('[data-testid="banner"]')
    expect(banner.classes()).toContain('aspect-[640/241]')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('shows the product name as a text fallback in the banner when there is no logo', () => {
    const wrapper = mountCard({ ...product, logoLocation: '' })
    const banner = wrapper.get('[data-testid="banner"]')
    expect(banner.text()).toContain('Sultan Voucher')
  })

  it('keeps a visible keyboard focus indicator on the card link', () => {
    const wrapper = mountCard()
    const link = wrapper.getComponent(RouterLinkStub)
    expect(link.classes().some((c) => c.startsWith('focus-visible:ring'))).toBe(true)
  })

  it('hides the logo when the image fails to load', async () => {
    const wrapper = mountCard()
    await wrapper.get('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('shows the product name as a text fallback after the logo fails to load', async () => {
    const wrapper = mountCard()
    await wrapper.get('img').trigger('error')
    expect(wrapper.get('[data-testid="banner"]').text()).toContain('Sultan Voucher')
  })
})
