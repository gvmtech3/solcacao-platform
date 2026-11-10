import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { connectTestDb, disconnectTestDb, clearCollections } from './helpers/db.js'

const app = createApp()

const VALID_QUOTE = {
  companyName: 'Acme Hotels',
  contactName: "Jane O'Brien",
  email: 'jane@acmehotels.com',
  phone: '+1 555 123 4567',
  cacaoProfile: '72% Dark',
  estimatedQuantity: '250',
  packagingPreference: 'Kraft Gift Box',
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

describe('POST /api/b2b/quotes', () => {
  it('accepts a submission with no file and no account (anonymous lead)', async () => {
    const res = await request(app).post('/api/b2b/quotes').field(VALID_QUOTE)
    expect(res.status).toBe(201)
    expect(res.body.quote.quoteNumber).toMatch(/^SC-B2B-\d+$/)
    expect(res.body.quote.files).toHaveLength(0)
  })

  it('accepts a brand asset file upload', async () => {
    const res = await request(app)
      .post('/api/b2b/quotes')
      .field(VALID_QUOTE)
      .attach('brandAsset', Buffer.from('%PDF-1.4 fake'), {
        filename: 'logo.pdf',
        contentType: 'application/pdf',
      })
    expect(res.status).toBe(201)
    expect(res.body.quote.files).toHaveLength(1)
    expect(res.body.quote.files[0].originalFilename).toBe('logo.pdf')

    const fileRes = await request(app).get(res.body.quote.files[0].fileUrl)
    expect(fileRes.status).toBe(200)
  })

  it('rejects an unsupported file type', async () => {
    const res = await request(app)
      .post('/api/b2b/quotes')
      .field(VALID_QUOTE)
      .attach('brandAsset', Buffer.from('not an image'), {
        filename: 'virus.exe',
        contentType: 'application/x-msdownload',
      })
    expect(res.status).toBe(400)
  })

  it('rejects a quantity below the 50-unit minimum', async () => {
    const res = await request(app)
      .post('/api/b2b/quotes')
      .field({ ...VALID_QUOTE, estimatedQuantity: '10' })
    expect(res.status).toBe(400)
  })

  it('rejects a numeric-only contact name', async () => {
    const res = await request(app)
      .post('/api/b2b/quotes')
      .field({ ...VALID_QUOTE, contactName: '12345' })
    expect(res.status).toBe(400)
  })

  it('rejects a missing company name', async () => {
    const { companyName, ...rest } = VALID_QUOTE
    const res = await request(app).post('/api/b2b/quotes').field(rest)
    expect(res.status).toBe(400)
  })
})
