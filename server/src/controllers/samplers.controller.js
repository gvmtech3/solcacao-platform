import CustomSampler from '../models/CustomSampler.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createSampler = asyncHandler(async (req, res) => {
  const { items, samplerName } = req.body
  if (!Array.isArray(items) || items.length === 0) {
    throw ApiError.badRequest('A sampler needs at least one item.')
  }

  const guestSessionId = req.header('x-guest-session-id') || null
  const sampler = await CustomSampler.create({
    userId: req.user?._id || null,
    guestSessionId: req.user ? null : guestSessionId,
    samplerName,
    items,
  })

  res.status(201).json({ sampler })
})
