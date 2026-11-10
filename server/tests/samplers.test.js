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

describe('POST /api/samplers', () => {
  it('persists a sampler for a guest session', async () => {
    const product = await createProduct()
    const res = await request(app)
      .post('/api/samplers')
      .set('x-guest-session-id', 'sampler-guest-1')
      .send({ items: [{ productId: product._id.toString(), quantity: 1 }] })
    expect(res.status).toBe(201)
    expect(res.body.sampler.items).toHaveLength(1)
    expect(res.body.sampler.guestSessionId).toBe('sampler-guest-1')
  })

  it('rejects an empty items array', async () => {
    const res = await request(app)
      .post('/api/samplers')
      .set('x-guest-session-id', 'sampler-guest-2')
      .send({ items: [] })
    expect(res.status).toBe(400)
  })
})
