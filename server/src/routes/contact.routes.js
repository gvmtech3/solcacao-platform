import { Router } from 'express'
import { createInquiry } from '../controllers/contact.controller.js'
import { validateBody } from '../middleware/validate.js'
import { contactSchema } from '../validators/schemas.js'

const router = Router()

router.post('/', validateBody(contactSchema), createInquiry)

export default router
