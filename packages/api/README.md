# API

TypeScript + Express + SQLite REST API for the product catalog. Part of the
[workspace](../../README.md). Install dependencies once from the repo root (`pnpm install`); the
commands below assume you're in this directory.

There's no build step. `tsx` runs the TypeScript directly in dev, start, seed and tests. `tsc` is used
for type-checking only.

## Commands

```bash
pnpm dev         # tsx watch, serves on http://localhost:5001
pnpm seed        # reset data/products.db to the original 6 products
pnpm test        # unit tests (dependencies mocked)
pnpm test:e2e    # end-to-end tests against the real stack (temp-file SQLite)
pnpm typecheck   # tsc --noEmit
```

To iterate on one file: `pnpm exec vitest run src/domain/product.test.ts`.

Run the seed before the first start. The server runs without it, but the catalog is empty until the
database is populated. Run it again any time to reset the data.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5001` | HTTP port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed origin for the web app |
| `NODE_ENV=test` | — | Use an in-memory database |

## Layout

The code is split into layers, each tested on its own, with dependencies pointing one way:

```
domain -> db -> repositories -> routes -> app -> index
```

- `domain/product.ts` — zod schemas define the product shape and validation rules; the `Product` type
  is inferred from them. This is where input is actually validated.
- `db/connection.ts` — opens the better-sqlite3 connection and creates the table. Uses an in-memory
  database under `NODE_ENV=test`, otherwise `data/products.db`.
- `db/seed.ts` — `resetAndSeed(db)` clears the table and re-inserts the mock JSON in one transaction,
  keeping the original ids. It's idempotent. `seed.cli.ts` is what `pnpm seed` runs; tests reuse the
  same function.
- `repositories/productRepository.ts` — the only place that knows SQL. Takes the db in its constructor.
- `routes/products.ts` — `createProductsRouter(repo)`. Handlers parse the request body and call the
  repo. Everything is synchronous, since better-sqlite3 is.
- `middleware/errorHandler.ts` — turns errors into JSON: zod errors become 422, not-found becomes 404,
  anything else becomes 500 (logged, without leaking the message).
- `app.ts` — `createApp(repo)` wires up cors, json parsing, a health check, the router, and the error
  handler. The repo is passed in, which is what lets the route tests run against a fake.
- `index.ts` — wires the real connection, repository and app together and starts listening.

## Endpoints

Base path `/api`. Products come back with the same JSON structure as the seed file.

| Method | Path | Purpose | Success | Errors |
|---|---|---|---|---|
| GET | `/api/products?search=` | List, with optional search over name/tagline/title | 200 | — |
| GET | `/api/products/:id` | One product | 200 | 404 |
| POST | `/api/products` | Create | 201 | 422 |
| PUT | `/api/products/:id` | Update | 200 | 404, 422 |
| DELETE | `/api/products/:id` | Delete | 204 | 404 |
| GET | `/health` | Liveness check | 200 | — |

Errors use the shape `{ "error": { "message": string, "issues"?: ZodIssue[] } }`.

## Notes

- `mocks/products.json` is the seed fixture. Its shape, ids (such as `1679`) and count (6) are fixed,
  so it shouldn't be edited.
- Writes go to `data/products.db`, which is gitignored and regenerated from the seed.
- `id` and `__typename` are set by the server and ignored if sent by a client.
- Unit tests sit next to the code as `*.test.ts` and mock the layer below. The end-to-end tests in
  `e2e/` exercise the real stack with a temporary SQLite file.
