import { Router } from 'express'
import { updateProfile } from '../controllers/account.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { accountUpdateSchema } from '../validators/schemas.js'

const router = Router()

router.use(requireAuth)
router.patch('/profile', validateBody(accountUpdateSchema), updateProfile)

export default router
