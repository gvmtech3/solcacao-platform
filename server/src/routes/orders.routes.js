import { Router } from 'express'
import { createOrder, listMyOrders } from '../controllers/orders.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { createOrderSchema } from '../validators/schemas.js'

const router = Router()

router.use(requireAuth)
router.get('/', listMyOrders)
router.post('/', validateBody(createOrderSchema), createOrder)

export default router
