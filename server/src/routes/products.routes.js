import { Router } from 'express'
import { listProducts, getProduct, listOrigins } from '../controllers/products.controller.js'

const router = Router()

router.get('/', listProducts)
router.get('/origins', listOrigins)
router.get('/:id', getProduct)

export default router
