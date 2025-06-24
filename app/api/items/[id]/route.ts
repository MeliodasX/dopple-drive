import { checkAuthStatusOnApi } from '@/utils/check-auth-status-on-api'
import { getUserIdFromClerkId } from '@/db/requests/get-user-id-from-clerk-id'
import { NextResponse } from 'next/server'
import {
  error,
  errorResponse,
  successResponse
} from '@/utils/response-wrappers'
import { ErrorCodes, SuccessCodes } from '@/types/errors'
import { db } from '@/db'
import { items } from '@/db/schema'
import { and, eq, isNull, like, not, sql } from 'drizzle-orm'
import { deleteFileFromS3, getPreSignedURL } from '@/services/AWS/S3'
import { FOLDER_MIME_TYPE } from '@/utils/constants'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await checkAuthStatusOnApi()
    const userId = await getUserIdFromClerkId()

    if (!userId)
      return NextResponse.json(
        error(ErrorCodes.FORBIDDEN, "Couldn't find user")
      )

    const itemId = parseInt(id, 10)
    if (isNaN(itemId)) {
      return errorResponse(ErrorCodes.BAD_REQUEST, 'Invalid item ID.')
    }

    const [item] = await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.id, itemId),
          eq(items.userId, userId),
          isNull(items.deletedAt)
        )
      )
      .limit(1)

    if (!item) {
      return errorResponse(
        ErrorCodes.NOT_FOUND,
        'The specified item could not be found.'
      )
    }

    if (item.mimeType !== FOLDER_MIME_TYPE) {
      if (!item.key) {
        return errorResponse(
          ErrorCodes.INTERNAL_SERVER_ERROR,
          'Cannot generate download link for a malformed file entry.'
        )
      }

      const signedUrl = await getPreSignedURL(item.key)

      return successResponse(SuccessCodes.OK, {
        ...item,
        signedUrl
      })
    }

    const children = await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          isNull(items.deletedAt),
          eq(items.parentId, itemId)
        )
      )
    return successResponse(SuccessCodes.OK, {
      folder: item,
      children
    })
  } catch (e) {
    let message = 'Unknown error'
    if (e instanceof Error) message = e.message
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      `Failed to fetch item: ${message}`
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await checkAuthStatusOnApi()
    const userId = await getUserIdFromClerkId()
    if (!userId) {
      return errorResponse(ErrorCodes.FORBIDDEN, "Couldn't find user")
    }

    const itemId = parseInt(id, 10)
    if (isNaN(itemId)) {
      return errorResponse(ErrorCodes.BAD_REQUEST, 'Invalid item ID.')
    }

    if (!id)
      return NextResponse.json(
        error(ErrorCodes.FORBIDDEN, "Couldn't find resource id")
      )

    const headers = req.headers
    const contentType = headers.get('Content-Type') || ''

    if (!contentType || !contentType.startsWith('application/json')) {
      return NextResponse.json(
        error(ErrorCodes.BAD_REQUEST, 'Incorrect request type. JSON required.')
      )
    }

    const body = await req.json()
    const { name, parentId } = body

    if (name === undefined && parentId === undefined) {
      return errorResponse(
        ErrorCodes.BAD_REQUEST,
        'Either "name" or "parentId" must be provided for an update.'
      )
    }

    const updatedItem = await db.transaction(async (trx) => {
      const [itemToUpdate] = await trx
        .select()
        .from(items)
        .where(and(eq(items.id, itemId), eq(items.userId, userId)))

      if (!itemToUpdate) {
        throw new Error(
          'Item not found or you do not have permission to modify it.'
        )
      }

      let targetParentId = itemToUpdate.parentId

      if (parentId !== undefined && parentId !== itemToUpdate.parentId) {
        const newParentId = parentId === null ? null : Number(parentId)
        let newParentPath = '/'

        if (newParentId !== null) {
          const [newParent] = await trx
            .select({ path: items.path, mimeType: items.mimeType })
            .from(items)
            .where(and(eq(items.id, newParentId), eq(items.userId, userId)))

          if (!newParent) throw new Error('Destination folder not found.')
          if (newParent.mimeType !== FOLDER_MIME_TYPE)
            throw new Error('Destination must be a folder.')

          if (
            itemToUpdate.mimeType === FOLDER_MIME_TYPE &&
            newParent.path.startsWith(itemToUpdate.path)
          ) {
            throw new Error(
              'Cannot move a folder into itself or one of its descendants.'
            )
          }
          newParentPath = newParent.path
        }

        const oldPathPrefix = itemToUpdate.path
        const newPathPrefix = `${newParentPath}${itemToUpdate.id}/`

        await trx.execute(
          sql`UPDATE ${items} SET path = REPLACE(${items.path}, ${oldPathPrefix}, ${newPathPrefix}) WHERE ${items.path} LIKE ${oldPathPrefix + '%'}`
        )

        await trx
          .update(items)
          .set({ parentId: newParentId })
          .where(eq(items.id, itemToUpdate.id))
        targetParentId = newParentId
      }

      if (typeof name === 'string' && name !== itemToUpdate.name) {
        if (itemToUpdate.mimeType !== FOLDER_MIME_TYPE) {
          const [conflict] = await trx
            .select({ id: items.id })
            .from(items)
            .where(
              and(
                eq(items.userId, userId),
                eq(items.name, name),
                targetParentId === null
                  ? isNull(items.parentId)
                  : eq(items.parentId, targetParentId),
                not(eq(items.id, itemToUpdate.id))
              )
            )
            .limit(1)

          if (conflict) {
            throw new Error(
              `A file named "${name}" already exists in this location.`
            )
          }
        }
        await trx
          .update(items)
          .set({ name })
          .where(eq(items.id, itemToUpdate.id))
      }

      const [finalItem] = await trx
        .select()
        .from(items)
        .where(eq(items.id, itemToUpdate.id))
      return finalItem
    })

    return successResponse(SuccessCodes.OK, updatedItem)
  } catch (e: any) {
    console.error('Error updating item:', e)
    if (e.message?.includes('already exists')) {
      return errorResponse(ErrorCodes.CONFLICT, e.message)
    }
    if (e.message?.includes('not found')) {
      return errorResponse(ErrorCodes.NOT_FOUND, e.message)
    }
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      `Failed to update item: ${e.message || 'Unknown error'}`
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAuthStatusOnApi()
    const userId = await getUserIdFromClerkId()
    const { id } = await params

    if (!userId) {
      return errorResponse(ErrorCodes.FORBIDDEN, "Couldn't find user")
    }

    const itemId = parseInt(id, 10)
    if (isNaN(itemId)) {
      return errorResponse(ErrorCodes.BAD_REQUEST, 'Invalid item ID.')
    }

    const [itemToDelete] = await db
      .select({
        id: items.id,
        path: items.path,
        key: items.key,
        mimeType: items.mimeType,
        userId: items.userId
      })
      .from(items)
      .where(eq(items.id, itemId))

    if (!itemToDelete) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Item not found.')
    }

    if (itemToDelete.userId !== userId) {
      return errorResponse(
        ErrorCodes.FORBIDDEN,
        'You do not have permission to delete this item.'
      )
    }

    // TODO: Schedule files for deletion when they are soft deleted
    if (itemToDelete.mimeType === FOLDER_MIME_TYPE) {
      await db
        .update(items)
        .set({ deletedAt: new Date() })
        .where(
          and(
            eq(items.userId, userId),
            like(items.path, `${itemToDelete.path}%`)
          )
        )
    } else {
      await db
        .update(items)
        .set({ deletedAt: new Date() })
        .where(eq(items.id, itemId))

      if (itemToDelete.key) {
        try {
          await deleteFileFromS3(itemToDelete.key)
        } catch (e) {
          console.error(
            `Failed to delete S3 object ${itemToDelete.key}. Logging for later cleanup.`,
            e
          )
          // NOTE(@MeliodasX): Can log this into a dump table that can perform the deletion later via a scheduled job.
        }
      }
    }
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    let message = 'Unknown error'
    if (e instanceof Error) message = e.message
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      `Failed to delete resource: ${message}`
    )
  }
}
