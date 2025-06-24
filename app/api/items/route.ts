import { checkAuthStatusOnApi } from '@/utils/check-auth-status-on-api'
import { errorResponse, successResponse } from '@/utils/response-wrappers'
import { ErrorCodes, SuccessCodes } from '@/types/errors'
import { deleteFileFromS3, uploadFileToS3 } from '@/services/AWS/S3'
import {
  FileInsertPayload,
  FolderInsertPayload,
  ItemInsertPayload,
  UploadMode
} from '@/types/item-types'
import { db } from '@/db'
import { items, ItemsSelectType } from '@/db/schema'
import { getUserIdFromClerkId } from '@/db/requests/get-user-id-from-clerk-id'
import { and, asc, eq, InferSelectModel, isNull, not, sql } from 'drizzle-orm'
import { FOLDER_MIME_TYPE } from '@/utils/constants'
import { nanoid } from 'nanoid'
import { generateNumberedFileName } from '@/utils/generate-numbered-file-name'
import { NextRequest } from 'next/server'

const handleMaterializedPath = async (
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

const handleFolderCreation = async (req: Request, userId: number) => {
  const body = await req.json()

  const { name, mimeType, parentId } = body

  if (!name || typeof name !== 'string') {
    return errorResponse(ErrorCodes.BAD_REQUEST, 'Folder name is required.')
  }

  let data: ItemsSelectType

  try {
    const payload: FolderInsertPayload = {
      userId,
      name,
      mimeType,
      parentId
    }

    data = await handleMaterializedPath(parentId, userId, payload)
  } catch (e) {
    let message = 'Unable to create specified resource'
    if (e instanceof Error) {
      message = e.message
    }
    return errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, message)
  }

  return successResponse(SuccessCodes.ACCEPTED, data)
}

const handleFileCreation = async (req: Request, userId: number) => {
  const formData = await req.formData()

  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return errorResponse(ErrorCodes.BAD_REQUEST, 'File not found.')
  }

  // Defaults to creating a copy of the file unless override is explicitly stated
  const mode = (formData.get('mode') ?? UploadMode.COPY) as UploadMode
  const getParentId = formData.get('parentId')
  const parentId = getParentId ? Number(getParentId) : null
  const uniqueId = nanoid()
  const fileName = file.name
  const mimeType = file.type

  let insert: ItemsSelectType | undefined = undefined

  if (mode === UploadMode.COPY) {
    const MAX_RETRIES = 100 // Safety break to prevent infinite loops

    const key = `${userId}/${uniqueId}-${fileName}`
    const { url, size } = await uploadFileToS3(file, key)

    for (let i = 0; i < MAX_RETRIES; i++) {
      const newName = generateNumberedFileName(fileName, i)
      try {
        const payload: FileInsertPayload = {
          userId,
          name: newName,
          mimeType,
          parentId,
          key,
          fileUrl: url,
          size
        }
        insert = await handleMaterializedPath(parentId, userId, payload)
        break
      } catch (e) {
        if (e instanceof Error && (e as any).cause?.code === '23505') {
          console.log(`Conflict for name: ${newName}. Retrying...`)
          insert = undefined
        } else {
          let message =
            'Unable to create specified resource due to an unexpected error.'
          if (e instanceof Error) {
            message = e.message
          }
          try {
            await deleteFileFromS3(key)
          } catch (e) {
            console.error('Unable to delete S3 file')
          }
          return errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, message)
        }
      }
    }

    if (!insert) {
      return errorResponse(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        `Could not find an available name for ${fileName} after ${MAX_RETRIES} attempts.`
      )
    }
  }
  if (mode === UploadMode.OVERRIDE) {
    const [result] = await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          eq(items.name, fileName),
          not(eq(items.mimeType, FOLDER_MIME_TYPE)),
          parentId === null
            ? isNull(items.parentId)
            : eq(items.parentId, parentId)
        )
      )

    if (result) {
      if (!result.key)
        return errorResponse(
          ErrorCodes.INTERNAL_SERVER_ERROR,
          'Malformed entry encountered! Existing item is missing S3 key.'
        )

      const key = result.key
      const { size } = await uploadFileToS3(file, key)

      const [data] = await db
        .update(items)
        .set({
          mimeType,
          size,
          updatedAt: new Date()
        })
        .where(eq(items.id, result.id))
        .returning()

      return successResponse(SuccessCodes.CREATED, data)
    }

    const key = `${userId}/${uniqueId}-${fileName}`
    const { url, size } = await uploadFileToS3(file, key)

    const payload: FileInsertPayload = {
      userId,
      name: fileName,
      mimeType,
      parentId,
      key,
      fileUrl: url,
      size
    }

    try {
      insert = await handleMaterializedPath(parentId, userId, payload)
    } catch (e) {
      let message = 'Unable to create specified resource'
      if (e instanceof Error) {
        message = e.message
      }
      return errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, message)
    }
  }

  return successResponse(SuccessCodes.CREATED, insert)
}

export async function GET(req: NextRequest) {
  await checkAuthStatusOnApi()
  const userId = await getUserIdFromClerkId()

  if (!userId) {
    return errorResponse(ErrorCodes.FORBIDDEN, "Couldn't find user")
  }

  const searchParams = req.nextUrl.searchParams
  const parentIdParam = searchParams.get('parentId')
  const pageSizeParam = searchParams.get('pageSize')
  const pageTokenParam = searchParams.get('pageToken')

  const targetParentId: number | null = parentIdParam
    ? parseInt(parentIdParam, 10)
    : null

  // Cap page size at 200 for safety
  const pageSize: number = pageSizeParam
    ? Math.min(parseInt(pageSizeParam, 10), 200)
    : 50

  let pageTokenCursor: { mimeType: string; name: string; id: number } | null =
    null

  if (pageTokenParam) {
    try {
      const decodedToken = Buffer.from(pageTokenParam, 'base64').toString(
        'ascii'
      )
      pageTokenCursor = JSON.parse(decodedToken)
      if (
        pageTokenCursor &&
        (typeof pageTokenCursor.mimeType !== 'string' ||
          typeof pageTokenCursor.name !== 'string' ||
          typeof pageTokenCursor.id !== 'number')
      ) {
        pageTokenCursor = null
      }
    } catch (e) {
      console.warn('Malformed pageToken received:', pageTokenParam)
      pageTokenCursor = null
    }
  }

  try {
    const baseWhereClause = and(
      eq(items.userId, userId),
      targetParentId === null
        ? isNull(items.parentId)
        : eq(items.parentId, targetParentId),
      isNull(items.deletedAt)
    )

    const mimeTypeSortExpression = sql`CASE WHEN ${items.mimeType} = ${FOLDER_MIME_TYPE} THEN 0 ELSE 1 END`

    let cursorCondition = sql`TRUE`
    if (pageTokenCursor) {
      const pageTokenCursorMimeTypeSortValue = sql`CASE WHEN ${pageTokenCursor.mimeType} = ${FOLDER_MIME_TYPE} THEN 0 ELSE 1 END`

      cursorCondition = sql`
        (${mimeTypeSortExpression} > ${pageTokenCursorMimeTypeSortValue})
        OR
        (${mimeTypeSortExpression} = ${pageTokenCursorMimeTypeSortValue} AND ${items.name} > ${pageTokenCursor.name})
        OR
        (${mimeTypeSortExpression} = ${pageTokenCursorMimeTypeSortValue} AND ${items.name} = ${pageTokenCursor.name} AND ${items.id} > ${pageTokenCursor.id})
      `
    }

    const finalWhereClause = and(baseWhereClause, cursorCondition)

    const fetchedItems: InferSelectModel<typeof items>[] = await db
      .select()
      .from(items)
      .where(finalWhereClause)
      .orderBy(asc(mimeTypeSortExpression), asc(items.name), asc(items.id))
      .limit(pageSize + 1)

    const hasNextPage = fetchedItems.length > pageSize
    const itemsToReturn = hasNextPage
      ? fetchedItems.slice(0, pageSize)
      : fetchedItems

    let nextCursor: { mimeType: string; name: string; id: number } | null = null
    if (hasNextPage) {
      const lastItem = itemsToReturn[itemsToReturn.length - 1]
      nextCursor = {
        mimeType: lastItem.mimeType,
        name: lastItem.name,
        id: lastItem.id
      }
    }

    const nextPageToken = nextCursor
      ? Buffer.from(JSON.stringify(nextCursor)).toString('base64')
      : null

    return successResponse(SuccessCodes.OK, {
      items: itemsToReturn,
      nextPageToken,
      hasMore: hasNextPage
    })
  } catch (err: any) {
    console.error('Error fetching items list:', err)
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      `Failed to list items: ${err.message || 'Unknown error'}`
    )
  }
}

export async function POST(req: Request) {
  await checkAuthStatusOnApi()
  const userId = await getUserIdFromClerkId()

  if (!userId) return errorResponse(ErrorCodes.FORBIDDEN, "Couldn't find user")

  const headers = req.headers
  const contentType = headers.get('Content-Type') || ''

  if (!contentType) {
    return errorResponse(
      ErrorCodes.BAD_REQUEST,
      'Incorrect request type. Content Type is required.'
    )
  }

  if (contentType.startsWith('multipart/form-data')) {
    return handleFileCreation(req, userId)
  }

  if (contentType.startsWith('application/json')) {
    return handleFolderCreation(req, userId)
  }

  return errorResponse(
    ErrorCodes.BAD_REQUEST,
    'Unsupported Content Type Received'
  )
}
