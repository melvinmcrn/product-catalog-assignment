import fs from 'node:fs'
import path from 'node:path'
import type Database from 'better-sqlite3'

import type { Product } from '@/domain/product'

// Seeding inserts the id explicitly to preserve the source ids (e.g. 1679) — allowed alongside AUTOINCREMENT.
const SEED_FIELDS = [
  'id',
  'gvtId',
  'name',
  'productTagline',
  'shortDescription',
  'longDescription',
  'logoLocation',
  'productUrl',
  'voucherTypeName',
  'orderUrl',
  'productTitle',
  'variableDenomPriceMinAmount',
  'variableDenomPriceMaxAmount',
  '__typename',
] as const

const COLUMNS = SEED_FIELDS.join(', ')
const VALUES = SEED_FIELDS.map((f) => `@${f}`).join(', ')

export function resetAndSeed(db: Database.Database): number {
  const file = path.resolve(import.meta.dirname, '../../mocks/products.json')
  const { products } = JSON.parse(fs.readFileSync(file, 'utf8')) as { products: Product[] }

  const insert = db.prepare(`INSERT INTO products (${COLUMNS}) VALUES (${VALUES})`)
  // One transaction: wipe then re-insert, so re-seeding resets rather than duplicates (and is all-or-nothing).
  const tx = db.transaction((items: Product[]) => {
    db.exec('DELETE FROM products')
    for (const item of items) insert.run(item)
  })
  tx(products)

  return products.length
}
