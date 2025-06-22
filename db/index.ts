import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'

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
