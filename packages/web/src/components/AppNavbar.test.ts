import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppNavbar from './AppNavbar.vue'

const mountNavbar = () => mount(AppNavbar, { global: { stubs: { RouterLink: RouterLinkStub } } })

describe('AppNavbar', () => {
  it('shows the catalog title', () => {
    expect(mountNavbar().text()).toContain('Product Catalog')
  })

  it('links the title back to the home page', () => {
    const wrapper = mountNavbar()
    const link = wrapper.findAllComponents(RouterLinkStub).find((l) => l.text().includes('Product Catalog'))
    expect(link?.props('to')).toBe('/')
  })
})
