import { createConnection } from './connection'
import { resetAndSeed } from './seed'

// Runnable wrapper for `pnpm seed` - seeds the real on-disk database, then closes it.
const db = createConnection()
const count = resetAndSeed(db)
console.log(`Seeded ${count} products into packages/api/data/products.db`)
db.close()
