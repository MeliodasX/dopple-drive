import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/helpers/timestamps'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  ...timestamps
})