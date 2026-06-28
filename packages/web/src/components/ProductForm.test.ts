import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ProductForm from './ProductForm.vue'

const validInput = {
  gvtId: '12',
  name: 'Sultan Voucher',
  productTagline: 'Top up instantly',
  shortDescription: 'Short description',
  longDescription: 'Long description',
  productUrl: '/ca/sultan',
  voucherTypeName: 'Game Voucher',
  orderUrl: 'https://example.com/order',
  productTitle: 'Sultan',
}

async function fillForm(wrapper: VueWrapper, values: Record<string, string>) {
  for (const [field, value] of Object.entries(values)) {
    await wrapper.get(`[name="${field}"]`).setValue(value)
  }
}

describe('ProductForm', () => {
  it('shows field errors and does not emit submit when submitted empty', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.findAll('[aria-invalid="true"]').length).toBeGreaterThan(0)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('shows an error and blocks submit for an invalid field value', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await fillForm(wrapper, { ...validInput, gvtId: '1a' })
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.get('[name="gvtId"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('stays valid when the optional logo and price fields are blank', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await fillForm(wrapper, validInput)
    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })

  it('emits submit once with the coerced payload when all required fields are valid', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await fillForm(wrapper, validInput)
    await wrapper.get('form').trigger('submit.prevent')

    const payload = wrapper.emitted('submit')?.[0]?.[0]
    expect(payload).toMatchObject({ gvtId: 12, name: 'Sultan Voucher', logoLocation: '' })
  })

  it('disables the submit button and shows a saving label while a request is pending', () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create', pending: true } })
    const button = wrapper.get('button[type="submit"]')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toBe('Saving…')
  })

  it('top-aligns grid fields so an error under one input does not misalign its row neighbour', () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })
    expect(wrapper.get('[data-testid="field-grid"]').classes()).toContain('items-start')
  })

  it('validates a single field on blur without submitting', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await wrapper.get('[name="name"]').trigger('blur')

    expect(wrapper.get('[name="name"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('clears a field error once it becomes valid on blur', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await wrapper.get('[name="name"]').trigger('blur')
    expect(wrapper.get('[name="name"]').attributes('aria-invalid')).toBe('true')

    await wrapper.get('[name="name"]').setValue('Sultan')
    await wrapper.get('[name="name"]').trigger('blur')

    expect(wrapper.get('[name="name"]').attributes('aria-invalid')).toBe('false')
  })

  it('shows an image preview for a valid logo URL', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await wrapper.get('[name="logoLocation"]').setValue('https://example.com/logo.png')

    const preview = wrapper.find('[data-testid="logo-preview"]')
    expect(preview.exists()).toBe(true)
    expect(preview.attributes('src')).toBe('https://example.com/logo.png')
  })

  it('hides the logo preview when the preview image fails to load', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await wrapper.get('[name="logoLocation"]').setValue('https://example.com/dead.png')
    await wrapper.get('[data-testid="logo-preview"]').trigger('error')

    expect(wrapper.find('[data-testid="logo-preview"]').exists()).toBe(false)
  })

  it('validates a textarea field on blur', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await wrapper.get('[name="longDescription"]').trigger('blur')

    expect(wrapper.get('[name="longDescription"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('renders a sanitized live preview of the description', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await wrapper.get('[name="longDescription"]').setValue('<p>Hello world</p><img src=x onerror="alert(1)">')

    const preview = wrapper.get('[data-testid="description-preview"]')
    expect(preview.text()).toContain('Hello world')
    expect(preview.html()).not.toContain('onerror')
  })

  it('prefills inputs from initialValues', () => {
    const wrapper = mount(ProductForm, {
      props: {
        submitLabel: 'Save',
        initialValues: { ...validInput, gvtId: 12, name: 'Existing', logoLocation: '', variableDenomPriceMinAmount: '', variableDenomPriceMaxAmount: '' },
      },
    })

    expect((wrapper.get('[name="name"]').element as HTMLInputElement).value).toBe('Existing')
  })

  it('links each error message to its input via aria-describedby', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await wrapper.get('form').trigger('submit.prevent')

    const nameInput = wrapper.get('[name="name"]')
    const describedBy = nameInput.attributes('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(wrapper.find(`#${describedBy}`).exists()).toBe(true)
  })

  it('removes aria-describedby from an input once its error is cleared', async () => {
    const wrapper = mount(ProductForm, { props: { submitLabel: 'Create' } })

    await wrapper.get('[name="name"]').trigger('blur')
    expect(wrapper.get('[name="name"]').attributes('aria-describedby')).toBeTruthy()

    await wrapper.get('[name="name"]').setValue('Sultan')
    await wrapper.get('[name="name"]').trigger('blur')
    expect(wrapper.get('[name="name"]').attributes('aria-describedby')).toBeFalsy()
  })
})
