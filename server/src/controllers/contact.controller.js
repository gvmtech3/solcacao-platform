import ContactInquiry from '../models/ContactInquiry.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createInquiry = asyncHandler(async (req, res) => {
  const inquiry = await ContactInquiry.create(req.validated)
  res.status(201).json({ inquiry })
})
