# Web

Vue 3 + Vite single-page app for the product catalog, using Pinia for state and vue-router for routing.
Part of the [workspace](../../README.md). Install dependencies once from the repo root (`pnpm install`);
the commands below assume you're in this directory.

It expects the [API](../api/README.md) on http://localhost:5001. Running `pnpm dev` from the repo root
starts both. Components are built with shadcn-vue and Tailwind, in a dark theme.

## Commands

```bash
pnpm dev            # Vite dev server, http://localhost:5173
pnpm build          # type-check and build for production
pnpm test           # unit tests (Vitest + @vue/test-utils, jsdom)
pnpm test:coverage  # coverage report
pnpm typecheck      # vue-tsc -b
```

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5001` | API origin the client calls |

The app calls the API as a separate origin (it uses CORS), so the base URL is absolute rather than a
relative `/api` path.

## Structure

- `api/client.ts` — the axios instance and a response interceptor that turns non-2xx responses into
  plain `Error`s with the API's message.
- `stores/products.ts` — the Pinia store that holds the catalog state and wraps the API client.
- `validation/productForm.ts` — a copy of the backend's zod rules so the form can validate fields as you
  go. The backend remains the real check.
- `types/product.ts` — `Product` and `ProductInput`, matching the API.
- `components/` — the app's components (product form, card, search bar, navbar, and so on).
- `components/ui/` — shadcn-vue components, vendored into the repo. They're meant to be edited here and
  are excluded from Biome. The `cn()` helper is in `lib/utils.ts`.
- `views/` and `router/` — the pages and the route table.

## Notes

- `@/` is aliased to `src/`, set in both `vite.config.ts` and the tsconfig.
- Tests live next to the code as `*.test.ts` and mount components in jsdom; `src/test/setup.ts` is the
  setup file. The store and API client are mocked in component tests.
- Importing a `.vue` file into a `.ts` file only type-checks with the Vue (Volar) editor extension; the
  build works without it. Don't add a `declare module '*.vue'` shim, since it weakens component types.
- The vendored `components/ui` files keep shadcn-vue's own formatting on purpose, so they line up with
  future `shadcn-vue add` updates.
