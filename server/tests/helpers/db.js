import 'dotenv/config'
import mongoose from 'mongoose'

process.env.NODE_ENV = 'test'

const TEST_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/solcacao_test'

export async function connectTestDb() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_URI)
  }
}

export async function disconnectTestDb() {
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
}

export async function clearCollections() {
  const collections = mongoose.connection.collections
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})))
}
