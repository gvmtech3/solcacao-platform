import jwt from 'jsonwebtoken'

const COOKIE_NAME = process.env.COOKIE_NAME || 'solcacao_token'

export function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), accountType: user.accountType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME)
}

export function getTokenFromRequest(req) {
  return req.cookies?.[COOKIE_NAME] || null
}
