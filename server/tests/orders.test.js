import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db.js'
import { createProduct } from './helpers/fixtures.js'
import { registerAndLogin } from './helpers/auth.js'

const app = createApp()

const SHIPPING = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '+1 555 222 3333',
  addressLine1: '456 Cacao Ave',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94107',
}

beforeAll(async () => {
  await connectTestDb()
})

beforeEach(async () => {
  await clearCollections()
})

afterAll(async () => {
  await disconnectTestDb()
})

describe('POST /api/orders (guest checkout)', () => {
  it('rejects checkout with an empty cart', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('x-guest-session-id', 'empty-cart')
      .send(SHIPPING)
    expect(res.status).toBe(400)
  })

  it('places an order for a guest with no account', async () => {
    const product = await createProduct({ price: 10 })
    const guestId = 'order-guest-1'
    await request(app)
      .post('/api/cart/items')
      .set('x-guest-session-id', guestId)
      .send({ productId: product._id.toString(), quantity: 2 })

    const res = await request(app)
      .post('/api/orders')
      .set('x-guest-session-id', guestId)
      .send(SHIPPING)

    expect(res.status).toBe(201)
    expect(res.body.order.userId).toBeNull()
    expect(res.body.order.totalAmount).toBe(20)
    expect(res.body.order.orderNumber).toMatch(/^SC-\d+$/)

    const cartRes = await request(app).get('/api/cart').set('x-guest-session-id', guestId)
    expect(cartRes.body.items).toHaveLength(0)
  })
})

describe('POST /api/orders (authenticated retail)', () => {
  it('computes the total from the DB, not the client, and clears the cart', async () => {
    const product = await createProduct({ price: 15.5 })
    const { cookie } = await registerAndLogin(app, { accountType: 'retail' })

    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productId: product._id.toString(), quantity: 3 })

    const res = await request(app).post('/api/orders').set('Cookie', cookie).send(SHIPPING)
    expect(res.status).toBe(201)
    expect(res.body.order.totalAmount).toBe(46.5)
    expect(res.body.order.userId).toBeDefined()

    const cartRes = await request(app).get('/api/cart').set('Cookie', cookie)
    expect(cartRes.body.items).toHaveLength(0)
  })
})

describe('POST /api/orders (B2B accounts are blocked)', () => {
  it('rejects checkout for a logged-in B2B account with 403', async () => {
    const product = await createProduct()
    const { cookie } = await registerAndLogin(app, { accountType: 'b2b' })

    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productId: product._id.toString(), quantity: 1 })

    const res = await request(app).post('/api/orders').set('Cookie', cookie).send(SHIPPING)
    expect(res.status).toBe(403)
  })
})

describe('GET /api/orders', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/orders')
    expect(res.status).toBe(401)
  })

  it('lists only the current user\'s orders', async () => {
    const product = await createProduct({ price: 5 })
    const { cookie } = await registerAndLogin(app, { accountType: 'retail' })
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookie)
      .send({ productId: product._id.toString(), quantity: 1 })
    await request(app).post('/api/orders').set('Cookie', cookie).send(SHIPPING)

    const res = await request(app).get('/api/orders').set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.body.orders).toHaveLength(1)
  })
})
