import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createApp } from '@/app'
import { createConnection } from '@/db/connection'
import { resetAndSeed } from '@/db/seed'
import { ProductRepository } from '@/repositories/productRepository'

export const SEED_COUNT = 6
export const SEEDED_ID = 1679

export function createTestApp() {
  const dir = mkdtempSync(join(tmpdir(), 'api-e2e-'))
  const db = createConnection(join(dir, 'e2e.db'))
  resetAndSeed(db)
  const app = createApp(new ProductRepository(db))

  const cleanup = () => {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }

  return { app, cleanup }
}
