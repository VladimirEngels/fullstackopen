const fs = require('fs')
const { MongoMemoryServer } = require('mongodb-memory-server')

const dbPath = './mongo-data'
fs.mkdirSync(dbPath, { recursive: true })

const start = async () => {
  const server = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbPath,
      storageEngine: 'wiredTiger'
    }
  })

  console.log(`MongoDB running at ${server.getUri()}`)

  const stop = async () => {
    await server.stop({ doCleanup: false })
    process.exit(0)
  }

  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
}

start()
