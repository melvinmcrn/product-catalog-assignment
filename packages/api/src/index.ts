import { createApp } from '@/app'
import { createConnection } from '@/db/connection'
import { ProductRepository } from '@/repositories/productRepository'

const db = createConnection()
const app = createApp(new ProductRepository(db))
const port = Number(process.env.PORT) || 5001

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
