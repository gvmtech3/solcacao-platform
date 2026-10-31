import B2BQuoteRequest from '../models/B2BQuoteRequest.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { generateQuoteNumber } from '../utils/referenceNumbers.js'

export const createQuote = asyncHandler(async (req, res) => {
  const data = req.validated

  const files = []
  if (req.file) {
    files.push({
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      originalFilename: req.file.originalname,
    })
  }

  const quote = await B2BQuoteRequest.create({
    ...data,
    corporatePartnerUserId: req.user?._id || null,
    quoteNumber: generateQuoteNumber(),
    files,
  })

  res.status(201).json({ quote })
})
