import jwt from 'jsonwebtoken'

const COOKIE_NAME = process.env.COOKIE_NAME || 'solcacao_token'

export function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), accountType: user.accountType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Secure cookies are only ever sent/stored by the browser over HTTPS. Tying
// this directly to NODE_ENV would silently break login on a production
// deploy that isn't behind TLS yet (e.g. a bare EC2 IP) - so it's its own
// explicit flag, defaulting to "on" only once NODE_ENV=production AND no
// override says otherwise.
const COOKIE_SECURE = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === 'true'
  : process.env.NODE_ENV === 'production'

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: COOKIE_SECURE,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME)
}

export function getTokenFromRequest(req) {
  return req.cookies?.[COOKIE_NAME] || null
}
