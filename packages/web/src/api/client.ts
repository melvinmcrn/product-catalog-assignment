import axios from 'axios'

import type { Product, ProductInput } from '@/types/product'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001'

export const httpClient = axios.create({ baseURL: BASE_URL })

// An error from the API, optionally carrying the backend's per-field validation messages
// (zod issues) keyed by field name, so a form can show them inline instead of a generic banner.
export class ApiError extends Error {
  readonly fieldErrors?: Record<string, string>
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.fieldErrors = fieldErrors
  }
}

type ApiIssue = { path?: unknown[]; message?: string }

// Reduce zod issues to the first message per top-level field; undefined when there are none.
function toFieldErrors(issues: unknown): Record<string, string> | undefined {
  if (!Array.isArray(issues)) return undefined
  const map: Record<string, string> = {}
  for (const issue of issues as ApiIssue[]) {
    const field = String(issue.path?.[0] ?? '')
    if (field && issue.message && !map[field]) map[field] = issue.message
  }
  return Object.keys(map).length > 0 ? map : undefined
}

// Map any non-2xx into an ApiError carrying the API's error.message (and any field errors),
// so the store and views deal with clean messages rather than AxiosError internals.
httpClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const apiError = error?.response?.data?.error
    const message = apiError?.message ?? error?.message ?? 'Request failed'
    return Promise.reject(new ApiError(message, toFieldErrors(apiError?.issues)))
  },
)

export const api = {
  list: (search?: string) => httpClient.get<Product[]>('/api/products', { params: search ? { search } : undefined }).then((r) => r.data),
  get: (id: number) => httpClient.get<Product>(`/api/products/${id}`).then((r) => r.data),
  create: (input: ProductInput) => httpClient.post<Product>('/api/products', input).then((r) => r.data),
  update: (id: number, input: ProductInput) => httpClient.put<Product>(`/api/products/${id}`, input).then((r) => r.data),
  remove: (id: number) => httpClient.delete(`/api/products/${id}`).then(() => undefined),
}
