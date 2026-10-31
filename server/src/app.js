import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import authRoutes from './routes/auth.routes.js'
import productsRoutes from './routes/products.routes.js'
import categoriesRoutes from './routes/categories.routes.js'
import cartRoutes from './routes/cart.routes.js'
import ordersRoutes from './routes/orders.routes.js'
import b2bRoutes from './routes/b2b.routes.js'
import contactRoutes from './routes/contact.routes.js'
import samplersRoutes from './routes/samplers.routes.js'
import accountRoutes from './routes/account.routes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  )
  app.use(express.json())
  app.use(cookieParser())
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

  app.use('/api/auth', authRoutes)
  app.use('/api/products', productsRoutes)
  app.use('/api/categories', categoriesRoutes)
  app.use('/api/cart', cartRoutes)
  app.use('/api/orders', ordersRoutes)
  app.use('/api/b2b', b2bRoutes)
  app.use('/api/contact', contactRoutes)
  app.use('/api/samplers', samplersRoutes)
  app.use('/api/account', accountRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
