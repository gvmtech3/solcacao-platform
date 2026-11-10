import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db.js'
import { createCategory, createProduct } from './helpers/fixtures.js'

const app = createApp()

beforeAll(async () => {
  await connectTestDb()
})

beforeEach(async () => {
  await clearCollections()
})

afterAll(async () => {
  await disconnectTestDb()
})

describe('GET /api/categories', () => {
  it('lists categories', async () => {
    await createCategory({ slug: 'bar' })
    await createCategory({ slug: 'truffle', nameEn: 'Truffles', nameEs: 'Trufas' })
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body.categories).toHaveLength(2)
  })
})

describe('GET /api/products', () => {
  it('lists active products', async () => {
    await createProduct({ sku: 'SKU-1', origin: 'Peru', price: 10, cacaoPercentage: 60 })
    await createProduct({ sku: 'SKU-2', origin: 'Ghana', price: 20, cacaoPercentage: 85 })
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(2)
  })

  it('filters by category (productType)', async () => {
    await createProduct({ sku: 'SKU-BAR', productType: 'bar' })
    await createProduct({ sku: 'SKU-TRF', productType: 'truffle' })
    const res = await request(app).get('/api/products?category=truffle')
    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].productType).toBe('truffle')
  })

  it('filters by minCacao and maxPrice', async () => {
    await createProduct({ sku: 'SKU-LOW', cacaoPercentage: 50, price: 9 })
    await createProduct({ sku: 'SKU-HIGH', cacaoPercentage: 85, price: 15 })
    const res = await request(app).get('/api/products?minCacao=70&maxPrice=20')
    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].sku).toBe('SKU-HIGH')
  })

  it('sorts by price-asc', async () => {
    await createProduct({ sku: 'SKU-A', price: 30 })
    await createProduct({ sku: 'SKU-B', price: 10 })
    const res = await request(app).get('/api/products?sort=price-asc')
    expect(res.body.products[0].sku).toBe('SKU-B')
  })

  it('excludes inactive products', async () => {
    await createProduct({ sku: 'SKU-INACTIVE', isActive: false })
    const res = await request(app).get('/api/products')
    expect(res.body.products).toHaveLength(0)
  })

  it('GET /api/products/origins returns distinct origins', async () => {
    await createProduct({ sku: 'SKU-X', origin: 'Peru' })
    await createProduct({ sku: 'SKU-Y', origin: 'Peru' })
    await createProduct({ sku: 'SKU-Z', origin: 'Ghana' })
    const res = await request(app).get('/api/products/origins')
    expect(res.status).toBe(200)
    expect(res.body.origins.sort()).toEqual(['Ghana', 'Peru'])
  })

  it('GET /api/products/:id 404s for an unknown id', async () => {
    const res = await request(app).get('/api/products/000000000000000000000000')
    expect(res.status).toBe(404)
  })

  it('GET /api/products/:id returns the product', async () => {
    const product = await createProduct({ sku: 'SKU-DETAIL' })
    const res = await request(app).get(`/api/products/${product._id}`)
    expect(res.status).toBe(200)
    expect(res.body.product.sku).toBe('SKU-DETAIL')
  })
})
