import 'dotenv/config'
import { createApp } from './src/app.js'
import { connectDB } from './src/config/db.js'
import { ensureSeedData } from './seed/ensureSeedData.js'

const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()
  await ensureSeedData()
  const app = createApp()
  app.listen(PORT, () => {
    console.log(`[server] SolCacao API listening on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('[server] failed to start:', err)
  process.exit(1)
})
