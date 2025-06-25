import { ItemInsertPayload } from '@/types/item-types'
import { db } from '@/db'
import { items } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { FOLDER_MIME_TYPE } from '@/utils/constants'

export const handleMaterializedPath = async (
  parentId: number | null,
  userId: number,
  payload: ItemInsertPayload
) => {
  let parentPath = '/'
  if (parentId) {
    const [parentItem] = await db
      .select()
      .from(items)
      .where(and(eq(items.id, parentId), eq(items.userId, userId)))
      .limit(1)
    if (!parentItem) {
      throw Error('Parent folder not found.')
    }
    if (parentItem.mimeType !== FOLDER_MIME_TYPE) {
      throw Error('Parent item is not a folder.')
    }
    parentPath = parentItem.path
  }

  return await db.transaction(async (trx) => {
    const [insertedItemPartial] = await trx
      .insert(items)
      .values({
        ...payload,
        path: ''
      })
      .returning({ id: items.id })

    if (!insertedItemPartial) {
      throw new Error('Failed to insert new item into database.')
    }

    const fullPath = `${parentPath}${insertedItemPartial.id}/`

    const [finalItem] = await trx
      .update(items)
      .set({ path: fullPath })
      .where(eq(items.id, insertedItemPartial.id))
      .returning()

    if (!finalItem) {
      throw new Error('Failed to update item path in database.')
    }

    return finalItem
  })
}
