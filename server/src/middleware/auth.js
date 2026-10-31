import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { getTokenFromRequest } from '../utils/token.js'

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req)
  if (!token) throw ApiError.unauthorized('You must be logged in.')

  let payload
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please log in again.')
  }

  const user = await User.findById(payload.sub)
  if (!user) throw ApiError.unauthorized('Account no longer exists.')

  req.user = user
  next()
})

export const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req)
  if (!token) return next()

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(payload.sub)
  } catch {
    req.user = null
  }
  next()
})

export function requireAccountType(...types) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized())
    if (!types.includes(req.user.accountType)) {
      return next(ApiError.forbidden('Your account type cannot access this resource.'))
    }
    next()
  }
}
