import { Router } from 'express'
import { createSampler } from '../controllers/samplers.controller.js'
import { attachUserIfPresent } from '../middleware/auth.js'

const router = Router()

router.post('/', attachUserIfPresent, createSampler)

export default router
