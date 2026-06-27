import axios from 'axios'

import type { Product, ProductInput } from '@/types/product'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001'

export const httpClient = axios.create({ baseURL: BASE_URL })

// Map any non-2xx into a plain Error carrying the API's error.message, so the
// store and views deal with clean messages rather than AxiosError internals.
httpClient.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(new Error(error?.response?.data?.error?.message ?? error?.message ?? 'Request failed')),
)

export const api = {
  list: (search?: string) => httpClient.get<Product[]>('/api/products', { params: search ? { search } : undefined }).then((r) => r.data),
  get: (id: number) => httpClient.get<Product>(`/api/products/${id}`).then((r) => r.data),
  create: (input: ProductInput) => httpClient.post<Product>('/api/products', input).then((r) => r.data),
  update: (id: number, input: ProductInput) => httpClient.put<Product>(`/api/products/${id}`, input).then((r) => r.data),
  remove: (id: number) => httpClient.delete(`/api/products/${id}`).then(() => undefined),
}
