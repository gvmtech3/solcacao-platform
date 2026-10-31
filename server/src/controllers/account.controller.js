import { asyncHandler } from '../utils/asyncHandler.js'

export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.validated

  if (firstName !== undefined) req.user.firstName = firstName
  if (lastName !== undefined) req.user.lastName = lastName
  await req.user.save()

  res.json({ user: req.user.toSafeJSON() })
})
