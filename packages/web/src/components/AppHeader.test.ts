import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppHeader from './AppHeader.vue'

const mountHeader = (modelValue = '') => mount(AppHeader, { props: { modelValue }, global: { stubs: { RouterLink: RouterLinkStub } } })

describe('AppHeader', () => {
  it('links to the create page', () => {
    const wrapper = mountHeader()
    const link = wrapper.findAllComponents(RouterLinkStub).find((l) => l.props('to') === '/products/new')
    expect(link).toBeDefined()
    expect(link?.text()).toBe('New product')
  })

  it('displays the current search value in the input', () => {
    const wrapper = mountHeader('hello')

    expect(wrapper.get('input').element.value).toBe('hello')
  })

  it('relays the search text via update:modelValue', async () => {
    const wrapper = mountHeader()
    await wrapper.get('input').setValue('sultan')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['sultan'])
  })
})
