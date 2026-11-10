import request from 'supertest'

let counter = 0

export async function registerAndLogin(app, overrides = {}) {
  counter += 1
  const email = overrides.email || `user${Date.now()}_${counter}@example.com`
  const password = overrides.password || 'password123'

  await request(app)
    .post('/api/auth/register')
    .send({
      firstName: overrides.firstName || 'Test',
      lastName: overrides.lastName || 'User',
      email,
      password,
      accountType: overrides.accountType || 'retail',
    })
    .expect(201)

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200)

  const cookie = loginRes.headers['set-cookie']?.[0]?.split(';')[0]
  return { cookie, user: loginRes.body.user, email, password }
}
