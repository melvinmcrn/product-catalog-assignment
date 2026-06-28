import { describe, expect, it } from 'vitest'

import { router } from './index'

describe('router', () => {
  it('maps / to the product list', () => {
    expect(router.resolve('/').name).toBe('product-list')
  })

  it('maps /products/new to the create view', () => {
    expect(router.resolve('/products/new').name).toBe('product-create')
  })

  it('maps /products/:id to the detail view with the id param', () => {
    const resolved = router.resolve('/products/1679')
    expect(resolved.name).toBe('product-detail')
    expect(resolved.params.id).toBe('1679')
  })

  it('maps /products/:id/edit to the edit view', () => {
    expect(router.resolve('/products/1679/edit').name).toBe('product-edit')
  })

  it('maps an unknown path to the not-found view', () => {
    expect(router.resolve('/totally/unknown').name).toBe('not-found')
  })

  it('treats a non-numeric product id as not found', () => {
    expect(router.resolve('/products/abc').name).toBe('not-found')
  })
})
