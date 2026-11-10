import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db.js'

const app = createApp()

beforeAll(async () => {
  await connectTestDb()
})

afterEach(async () => {
  await clearCollections()
})

afterAll(async () => {
  await disconnectTestDb()
})

describe('POST /api/auth/register', () => {
  it('creates the account but does NOT auto-login (no session cookie set)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
      accountType: 'retail',
    })
    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe('jane@example.com')
    expect(res.body.user.passwordHash).toBeUndefined()
    expect(res.headers['set-cookie']).toBeUndefined()
  })

  it('rejects a numeric-only first name', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: '123',
      lastName: 'Doe',
      email: 'bad@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(400)
    expect(res.body.details.firstName).toBeDefined()
  })

  it('accepts accented international names', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'María',
      lastName: 'López',
      email: 'maria@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(201)
    expect(res.body.user.firstName).toBe('María')
  })

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      email: 'dupe@example.com',
      password: 'password123',
    })
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      email: 'dupe@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(409)
  })

  it('rejects a password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      email: 'shortpw@example.com',
      password: 'short',
    })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('logs in after registering and sets the session cookie', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      email: 'login@example.com',
      password: 'password123',
    })
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(200)
    expect(res.headers['set-cookie']).toBeDefined()
    expect(res.body.user.email).toBe('login@example.com')
  })

  it('rejects an unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(401)
  })

  it('rejects a wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      email: 'wrongpw@example.com',
      password: 'password123',
    })
    const res = await request(app).post('/api/auth/login').send({
      email: 'wrongpw@example.com',
      password: 'nope12345',
    })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  it('requires a session', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('returns the current user when logged in', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      email: 'me@example.com',
      password: 'password123',
    })
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'me@example.com',
      password: 'password123',
    })
    const cookie = loginRes.headers['set-cookie'][0]
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie)
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('me@example.com')
  })
})

describe('POST /api/auth/logout', () => {
  it('clears the session so /me then fails', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      email: 'logout@example.com',
      password: 'password123',
    })
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'logout@example.com',
      password: 'password123',
    })
    const cookie = loginRes.headers['set-cookie'][0]

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookie)
    expect(logoutRes.status).toBe(204)

    const clearedCookie = logoutRes.headers['set-cookie'][0]
    const meRes = await request(app).get('/api/auth/me').set('Cookie', clearedCookie)
    expect(meRes.status).toBe(401)
  })
})
