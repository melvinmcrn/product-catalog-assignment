import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

export function createConnection(filename?: string): Database.Database {
  const file = filename ?? path.resolve(import.meta.dirname, '../../data/products.db')
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true })

  const db = new Database(file)

  db.pragma('journal_mode = WAL')

  // NOTE: this should be in a migration file with ORM.
  // but for now, we'll just use SQL for easier setup for demo session.
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id                          INTEGER PRIMARY KEY AUTOINCREMENT,
      gvtId                       INTEGER NOT NULL,
      name                        TEXT    NOT NULL,
      productTagline              TEXT    NOT NULL,
      shortDescription            TEXT    NOT NULL,
      longDescription             TEXT    NOT NULL,
      logoLocation                TEXT    NOT NULL DEFAULT '',
      productUrl                  TEXT    NOT NULL,
      voucherTypeName             TEXT    NOT NULL,
      orderUrl                    TEXT    NOT NULL,
      productTitle                TEXT    NOT NULL,
      variableDenomPriceMinAmount TEXT    NOT NULL DEFAULT '0.0',
      variableDenomPriceMaxAmount TEXT    NOT NULL DEFAULT '0.0',
      __typename                  TEXT    NOT NULL DEFAULT 'ProductInfo'
    )
  `)

  return db
}
