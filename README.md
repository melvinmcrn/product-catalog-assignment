# Product Catalog

A small full-stack product catalog. The frontend is Vue 3; the backend is a TypeScript + Express +
SQLite REST API. It's a pnpm-workspaces monorepo with two packages:

- [`packages/api`](./packages/api) — the REST API
- [`packages/web`](./packages/web) — the Vue app

The original task brief is kept in [`ASSIGNMENT.md`](./ASSIGNMENT.md).

## Prerequisites

- Node 20 or newer
- pnpm 9 or newer (`npm install -g pnpm` if you don't have it)

## Getting started

```bash
pnpm install      # install the whole workspace
pnpm seed         # populate the database (see note below)
pnpm dev          # start the API on :5001 and the web app on :5173
```

Open http://localhost:5173 for the app. The API runs at http://localhost:5001
(for example `http://localhost:5001/api/products`).

**Run `pnpm seed` before the first start.** It fills `packages/api/data/products.db` with the original
6 products. The server runs without it, but the catalog will be empty until you do. Running it again
resets the data back to those 6 products.

## Tests

```bash
pnpm test                       # unit tests for both packages
pnpm --filter api test:e2e      # API end-to-end suite (not included in `pnpm test`)
```

## Checks

```bash
pnpm check          # Biome: lint + format + import order
pnpm check:fix      # apply Biome fixes
pnpm -r typecheck   # type-check both packages
```

## How it fits together

The web app talks to the API over HTTP using an absolute base URL, so the two run as separate origins
and the API uses CORS rather than a Vite proxy. State on the client lives in a Pinia store; the API
validates everything with zod and persists to SQLite.

See each package's README for details:

- [`packages/api/README.md`](./packages/api/README.md) — layering, the API contract, and the seed step
- [`packages/web/README.md`](./packages/web/README.md) — app structure and conventions
