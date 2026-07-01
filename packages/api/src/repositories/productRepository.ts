import type Database from 'better-sqlite3'

import { type Product, type ProductInput, TYPENAME } from '@/domain/product'

// NOTE: if the project is bigger, we should consider using an ORM
// and we won't need to manually type the fields.
const FIELDS = [
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

const COLUMNS = FIELDS.join(', ')
const VALUES = FIELDS.map((f) => `@${f}`).join(', ')
const SET_CLAUSE = FIELDS.map((f) => `${f}=@${f}`).join(', ')

const toRow = (input: ProductInput) => ({
  ...input,
  logoLocation: input.logoLocation ?? '',
  variableDenomPriceMinAmount: input.variableDenomPriceMinAmount ?? '0.0',
  variableDenomPriceMaxAmount: input.variableDenomPriceMaxAmount ?? '0.0',
  __typename: TYPENAME,
})

export class ProductRepository {
  constructor(private readonly db: Database.Database) {}

  findAll(search?: string): Product[] {
    if (!search) return this.db.prepare<[], Product>('SELECT * FROM products ORDER BY id').all()

    // Escape LIKE wildcards (% _) and the escape char itself so the term is matched literally, not as a pattern.
    const q = `%${search.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`
    return this.db
      .prepare<{ q: string }, Product>(
        "SELECT * FROM products WHERE name LIKE @q ESCAPE '\\' OR productTagline LIKE @q ESCAPE '\\' OR productTitle LIKE @q ESCAPE '\\' ORDER BY id",
      )
      .all({ q })
  }

  findById(id: number): Product | undefined {
    return this.db.prepare<[number], Product>('SELECT * FROM products WHERE id = ?').get(id)
  }

  create(input: ProductInput): Product {
    const info = this.db.prepare(`INSERT INTO products (${COLUMNS}) VALUES (${VALUES})`).run(toRow(input))
    return this.findById(Number(info.lastInsertRowid))!
  }

  update(id: number, input: ProductInput): Product | undefined {
    const info = this.db.prepare(`UPDATE products SET ${SET_CLAUSE} WHERE id=@id`).run({ ...toRow(input), id })

    return info.changes > 0 ? this.findById(id) : undefined
  }

  remove(id: number): boolean {
    return this.db.prepare('DELETE FROM products WHERE id = ?').run(id).changes > 0
  }
}
