import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'product-list', component: () => import('@/views/ProductListView.vue') },
    { path: '/products/new', name: 'product-create', component: () => import('@/views/ProductCreateView.vue') },
    { path: '/products/:id(\\d+)', name: 'product-detail', component: () => import('@/views/ProductDetailView.vue') },
    { path: '/products/:id(\\d+)/edit', name: 'product-edit', component: () => import('@/views/ProductEditView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
})
