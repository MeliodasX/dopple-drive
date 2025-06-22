import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/helpers/timestamps'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  username: text('user_name').unique().notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  ...timestamps
})