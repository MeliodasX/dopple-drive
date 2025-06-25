import {
  AnyPgColumn,
  bigint,
  index,
  integer,
  pgTable,
  serial,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core'
import { timestamps } from '@/db/helpers/timestamps'
import { InferSelectModel, relations, sql } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique().notNull(),
  username: text('user_name').unique().notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  ...timestamps
})

export const items = pgTable(
  'items',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    name: text('name').notNull(),
    fileUrl: text('file_url'),
    size: bigint('size', { mode: 'number' }),
    key: text('key'),
    mimeType: text('mime_type').notNull().default('application/octet-stream'),
    parentId: integer('parent_id').references((): AnyPgColumn => items.id, {
      onDelete: 'cascade'
    }),
    path: text('path').notNull(),
    ...timestamps
  },
  (table) => {
    return {
      pathPerUserUnique: uniqueIndex('items_path_user_idx').on(
        table.userId,
        table.path
      ),
      folderFileSortIdx: index('items_folder_file_sort_idx').on(
        table.parentId,
        table.mimeType,
        table.name,
        table.id
      ),
      parentIdIdx: index('items_parent_id_idx').on(table.parentId),
      nameIdx: index('items_name_idx').on(table.name),
      uniqueNameInFolder: uniqueIndex('unique_name_in_folder_idx').on(
        table.userId,
        table.parentId,
        table.name
      ).where(sql`${table.parentId}
            IS NOT NULL`),
      uniqueNameInRoot: uniqueIndex('unique_name_in_root_idx').on(
        table.userId,
        table.name
      ).where(sql`${table.parentId}
            IS NULL`)
    }
  }
)

export const itemsRelations = relations(items, ({ one, many }) => ({
  owner: one(users, {
    fields: [items.userId],
    references: [users.id]
  }),
  parent: one(items, {
    fields: [items.parentId],
    references: [items.id],
    relationName: 'parentItem'
  }),
  children: many(items, {
    relationName: 'parentItem'
  })
}))

export type ItemsSelectType = InferSelectModel<typeof items>
