import { timestamp } from 'drizzle-orm/pg-core'

export const timestamps = {
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}