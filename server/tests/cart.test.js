import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db.js'
import { createProduct } from './helpers/fixtures.js'

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

describe('Guest cart', () => {
  it('adds an item and reflects it on GET /cart', async () => {
    const product = await createProduct()
    const guestId = 'guest-1'

    const addRes = await request(app)
      .post('/api/cart/items')
      .set('x-guest-session-id', guestId)
      .send({ productId: product._id.toString(), quantity: 2 })
    expect(addRes.status).toBe(201)
    expect(addRes.body.items).toHaveLength(1)
    expect(addRes.body.items[0].quantity).toBe(2)

    const getRes = await request(app).get('/api/cart').set('x-guest-session-id', guestId)
    expect(getRes.body.items).toHaveLength(1)
  })

  it('increments quantity when adding the same product twice', async () => {
    const product = await createProduct()
    const guestId = 'guest-2'
    await request(app)
      .post('/api/cart/items')
      .set('x-guest-session-id', guestId)
      .send({ productId: product._id.toString(), quantity: 1 })
    const res = await request(app)
      .post('/api/cart/items')
      .set('x-guest-session-id', guestId)
      .send({ productId: product._id.toString(), quantity: 1 })
    expect(res.body.items[0].quantity).toBe(2)
  })

  it('updates item quantity via PATCH', async () => {
    const product = await createProduct()
    const guestId = 'guest-3'
    await request(app)
      .post('/api/cart/items')
      .set('x-guest-session-id', guestId)
      .send({ productId: product._id.toString(), quantity: 1 })
    const res = await request(app)
      .patch(`/api/cart/items/${product._id}`)
      .set('x-guest-session-id', guestId)
      .send({ quantity: 5 })
    expect(res.status).toBe(200)
    expect(res.body.items[0].quantity).toBe(5)
  })

  it('rejects a non-positive quantity on PATCH', async () => {
    const product = await createProduct()
    const guestId = 'guest-4'
    await request(app)
      .post('/api/cart/items')
      .set('x-guest-session-id', guestId)
      .send({ productId: product._id.toString(), quantity: 1 })
    const res = await request(app)
      .patch(`/api/cart/items/${product._id}`)
      .set('x-guest-session-id', guestId)
      .send({ quantity: 0 })
    expect(res.status).toBe(400)
  })

  it('removes an item via DELETE', async () => {
    const product = await createProduct()
    const guestId = 'guest-5'
    await request(app)
      .post('/api/cart/items')
      .set('x-guest-session-id', guestId)
      .send({ productId: product._id.toString(), quantity: 1 })
    const res = await request(app)
      .delete(`/api/cart/items/${product._id}`)
      .set('x-guest-session-id', guestId)
    expect(res.status).toBe(200)
    expect(res.body.items).toHaveLength(0)
  })

  it('requires a guest session id when not logged in', async () => {
    const product = await createProduct()
    const res = await request(app)
      .post('/api/cart/items')
      .send({ productId: product._id.toString(), quantity: 1 })
    expect(res.status).toBe(400)
  })
})

describe('Guest cart merges into the user cart on login', () => {
  it('merges guest items into the account cart after logging in', async () => {
    const product = await createProduct()
    const guestId = 'merge-guest-1'
    const email = 'merge@example.com'

    await request(app)
      .post('/api/cart/items')
      .set('x-guest-session-id', guestId)
      .send({ productId: product._id.toString(), quantity: 3 })

    await request(app).post('/api/auth/register').send({
      firstName: 'Merge',
      email,
      password: 'password123',
    })

    const loginRes = await request(app)
      .post('/api/auth/login')
      .set('x-guest-session-id', guestId)
      .send({ email, password: 'password123' })
    const cookie = loginRes.headers['set-cookie'][0]

    const cartRes = await request(app).get('/api/cart').set('Cookie', cookie)
    expect(cartRes.body.items).toHaveLength(1)
    expect(cartRes.body.items[0].quantity).toBe(3)
  })
})
