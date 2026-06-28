import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SearchBar from './SearchBar.vue'

describe('SearchBar', () => {
  it('displays the current modelValue in the input', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: 'hello' } })

    expect(wrapper.get('input').element.value).toBe('hello')
  })

  it('emits update:modelValue with the typed text', async () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' } })

    await wrapper.get('input').setValue('sultan')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['sultan'])
  })

  it('labels the input for accessibility', () => {
    const wrapper = mount(SearchBar, { props: { modelValue: '' } })

    expect(wrapper.get('input').attributes('aria-label')).toBe('Search products')
  })
})
