import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'drizzle-kit'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

const databaseURL = process.env.DATABASE_URL!

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseURL
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public'
  }
})
