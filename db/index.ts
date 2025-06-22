import { drizzle } from 'drizzle-orm/node-postgres'
import { loadEnvConfig } from '@next/env'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

const databaseURL = process.env.DATABASE_URL!

const db = drizzle({
  connection: {
    connectionString: databaseURL,
    ssl: {
      rejectUnauthorized: false
    }
  }
})

export { db }
