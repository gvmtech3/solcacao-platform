import { Router } from 'express'
import { createOrder, listMyOrders } from '../controllers/orders.controller.js'
import { attachUserIfPresent, requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { createOrderSchema } from '../validators/schemas.js'

const router = Router()

router.use(attachUserIfPresent)
router.get('/', requireAuth, listMyOrders)
router.post('/', validateBody(createOrderSchema), createOrder)

export default router
