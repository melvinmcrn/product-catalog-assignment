import cors from 'cors'
import express, { type Express } from 'express'

import { errorHandler } from '@/middleware/errorHandler'
import type { ProductRepository } from '@/repositories/productRepository'
import { createProductsRouter } from '@/routes/products'

export function createApp(repo: ProductRepository): Express {
  const app = express()

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))
  app.use(express.json())
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))
  app.use('/api/products', createProductsRouter(repo))
  app.use(errorHandler)

  return app
}
