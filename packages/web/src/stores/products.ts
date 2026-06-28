import { defineStore } from 'pinia'
import { ref } from 'vue'

import { api } from '@/api/client'
import type { Product, ProductInput } from '@/types/product'

export const useProductStore = defineStore('products', () => {
  const items = ref<Product[]>([])
  const current = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    loading.value = true
    error.value = null
    try {
      return await fn()
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchAll = (search?: string) =>
    run(async () => {
      items.value = await api.list(search)
    })

  const fetchOne = (id: number) =>
    run(async () => {
      current.value = await api.get(id)
    })

  const create = (input: ProductInput) =>
    run(async () => {
      const created = await api.create(input)
      items.value.push(created)
      return created
    })

  const update = (id: number, input: ProductInput) =>
    run(async () => {
      const updated = await api.update(id, input)
      current.value = updated
      items.value = items.value.map((p) => (p.id === id ? updated : p))
      return updated
    })

  const remove = (id: number) =>
    run(async () => {
      await api.remove(id)
      items.value = items.value.filter((p) => p.id !== id)
    })

  return { items, current, loading, error, fetchAll, fetchOne, create, update, remove }
})
