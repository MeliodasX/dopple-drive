import { drizzle } from 'drizzle-orm/postgres-js'
import { loadEnvConfig } from '@next/env'
import postgres from 'postgres'
import * as schema from '@/db/schema'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

const databaseURL = process.env.DATABASE_URL!

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
