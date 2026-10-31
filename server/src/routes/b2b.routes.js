import { Router } from 'express'
import { createQuote } from '../controllers/b2b.controller.js'
import { attachUserIfPresent } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { b2bQuoteSchema } from '../validators/schemas.js'
import { uploadBrandAsset } from '../middleware/upload.js'

const router = Router()

router.post(
  '/quotes',
  attachUserIfPresent,
  uploadBrandAsset,
  validateBody(b2bQuoteSchema),
  createQuote
)

export default router
