import { Router as createRouter, type Router } from 'express'

import { createProductSchema, updateProductSchema } from '@/domain/product'
import { NotFoundError } from '@/middleware/errorHandler'
import type { ProductRepository } from '@/repositories/productRepository'

export function createProductsRouter(repo: ProductRepository): Router {
  const router = createRouter()

  router.get('/', (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const products = repo.findAll(search)

    res.json(products)
  })

  router.get('/:id', (req, res) => {
    const product = repo.findById(Number(req.params.id))
    if (!product) throw new NotFoundError(`No product ${req.params.id}`)

    res.json(product)
  })

  router.post('/', (req, res) => {
    const input = createProductSchema.parse(req.body)
    const product = repo.create(input)

    res.status(201).json(product)
  })

  router.put('/:id', (req, res) => {
    const input = updateProductSchema.parse(req.body)
    const product = repo.update(Number(req.params.id), input)
    if (!product) throw new NotFoundError(`No product ${req.params.id}`)

    res.json(product)
  })

  router.delete('/:id', (req, res) => {
    if (!repo.remove(Number(req.params.id))) throw new NotFoundError(`No product ${req.params.id}`)

    res.status(204).end()
  })

  return router
}
