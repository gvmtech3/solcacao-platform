import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.js'
import { mergeGuestCartIntoUser } from './cart.controller.js'

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, accountType } = req.validated

  const existing = await User.findOne({ email })
  if (existing) throw ApiError.conflict('An account with that email already exists.')

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ firstName, lastName, email, passwordHash, accountType })

  await mergeGuestCartIntoUser(req.header('x-guest-session-id'), user._id)

  const token = signToken(user)
  setAuthCookie(res, token)
  res.status(201).json({ user: user.toSafeJSON() })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated

  const user = await User.findOne({ email })
  if (!user) throw ApiError.unauthorized('Invalid email or password.')

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) throw ApiError.unauthorized('Invalid email or password.')

  await mergeGuestCartIntoUser(req.header('x-guest-session-id'), user._id)

  const token = signToken(user)
  setAuthCookie(res, token)
  res.json({ user: user.toSafeJSON() })
})

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res)
  res.status(204).send()
})

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() })
})
