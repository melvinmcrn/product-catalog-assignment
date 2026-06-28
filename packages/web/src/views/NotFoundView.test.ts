import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import NotFoundView from './NotFoundView.vue'

describe('NotFoundView', () => {
  it('explains the page was not found and links back to the catalog', () => {
    const wrapper = mount(NotFoundView, { global: { stubs: { RouterLink: RouterLinkStub } } })
    expect(wrapper.text()).toMatch(/not found/i)
    expect(wrapper.getComponent(RouterLinkStub).props('to')).toBe('/')
  })
})
