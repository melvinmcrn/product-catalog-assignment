// SQLite adapter bootstrap test — asserts SQLite-specific schema/PRAGMA setup.
// Engine-agnostic behavior (insert/find/update/delete) belongs in the repository contract suite.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type Database from 'better-sqlite3'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createConnection } from './connection'

const EXPECTED_COLUMNS = [
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
]

const insertProduct = (db: Database.Database) =>
  db
    .prepare(
      'INSERT INTO products (gvtId, name, productTagline, shortDescription, longDescription, productUrl, voucherTypeName, orderUrl, productTitle) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .run(51, 'Game of Sultans', 'tagline', 'short', 'long', '/ca/game', 'MECHANIST', 'https://order.codashop.com/x', 'title')

describe('createConnection', () => {
  describe('in memory', () => {
    let db: Database.Database

    beforeEach(() => {
      db = createConnection(':memory:')
    })

    afterEach(() => {
      db.close()
    })

    it('creates a database where the products table is queryable', () => {
      expect(() => db.prepare('SELECT * FROM products').all()).not.toThrow()
    })

    it('creates the products table with exactly the expected columns', () => {
      const columns = db.prepare<[], { name: string }>('PRAGMA table_info(products)').all()

      expect(columns.map((c) => c.name)).toEqual(expect.arrayContaining(EXPECTED_COLUMNS))
      expect(columns).toHaveLength(EXPECTED_COLUMNS.length)
    })

    it('marks id as the autoincrement primary key', () => {
      const idColumn = db.prepare<[], { name: string; pk: number }>('PRAGMA table_info(products)').all().find((c) => c.name === 'id')

      expect(idColumn?.pk).toBe(1)
    })

    it('auto-increments the id on each insert', () => {
      const first = insertProduct(db)
      const second = insertProduct(db)

      expect(Number(second.lastInsertRowid)).toBeGreaterThan(Number(first.lastInsertRowid))
    })

    it('applies default values for optional columns', () => {
      insertProduct(db)

      const row = db.prepare<[], {
        logoLocation: string
        variableDenomPriceMinAmount: string
        variableDenomPriceMaxAmount: string
        __typename: string
      }>('SELECT * FROM products').get()!

      expect(row.logoLocation).toBe('')
      expect(row.variableDenomPriceMinAmount).toBe('0.0')
      expect(row.variableDenomPriceMaxAmount).toBe('0.0')
      expect(row.__typename).toBe('ProductInfo')
    })
  })

  describe('on a real file', () => {
    let db: Database.Database
    let dir: string
    let file: string

    beforeEach(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), 'conn-test-'))
      file = path.join(dir, 'nested', 'products.db')
      db = createConnection(file)
    })

    afterEach(() => {
      db.close()
      fs.rmSync(dir, { recursive: true, force: true })
    })

    it('creates missing parent directories for the database file', () => {
      expect(fs.existsSync(file)).toBe(true)
    })

    // WAL mode is not supported for in-memory databases, so this test only runs on a real file.
    it('enables WAL journal mode', () => {
      expect(db.pragma('journal_mode', { simple: true })).toBe('wal')
    })

    it('persists rows across connection close and reopen', () => {
      insertProduct(db)
      db.close()
      db = createConnection(file)

      const count = db.prepare<[], { n: number }>('SELECT COUNT(*) AS n FROM products').get()!

      expect(count.n).toBe(1)
    })
  })
})
