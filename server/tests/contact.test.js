import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db.js'

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

describe('POST /api/contact', () => {
  it('accepts a valid submission', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'María López',
      email: 'maria@example.com',
      category: 'general',
      message: 'Do you ship internationally to Mexico?',
    })
    expect(res.status).toBe(201)
    expect(res.body.inquiry.status).toBe('new')
  })

  it('rejects an invalid email', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Jane',
      email: 'not-an-email',
      category: 'general',
      message: 'A long enough message here.',
    })
    expect(res.status).toBe(400)
  })

  it('rejects a message shorter than 10 characters', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Jane',
      email: 'jane@example.com',
      category: 'general',
      message: 'short',
    })
    expect(res.status).toBe(400)
  })

  it('rejects a numeric-only name', async () => {
    const res = await request(app).post('/api/contact').send({
      name: '12345',
      email: 'jane@example.com',
      category: 'general',
      message: 'A long enough message here.',
    })
    expect(res.status).toBe(400)
  })
})
