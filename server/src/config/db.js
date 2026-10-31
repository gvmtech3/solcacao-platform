import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/solcacao'

  mongoose.connection.on('connected', () => {
    console.log(`[mongo] connected -> ${mongoose.connection.name}`)
  })
  mongoose.connection.on('error', (err) => {
    console.error('[mongo] connection error:', err.message)
  })

  await mongoose.connect(uri)
}
