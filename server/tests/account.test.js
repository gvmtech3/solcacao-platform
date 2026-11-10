import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db.js'
import { registerAndLogin } from './helpers/auth.js'

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

describe('PATCH /api/account/profile', () => {
  it('requires authentication', async () => {
    const res = await request(app).patch('/api/account/profile').send({ firstName: 'New' })
    expect(res.status).toBe(401)
  })

  it('updates the first name', async () => {
    const { cookie } = await registerAndLogin(app)
    const res = await request(app)
      .patch('/api/account/profile')
      .set('Cookie', cookie)
      .send({ firstName: 'Updated' })
    expect(res.status).toBe(200)
    expect(res.body.user.firstName).toBe('Updated')
  })

  it('rejects a numeric-only first name', async () => {
    const { cookie } = await registerAndLogin(app)
    const res = await request(app)
      .patch('/api/account/profile')
      .set('Cookie', cookie)
      .send({ firstName: '12345' })
    expect(res.status).toBe(400)
  })
})
