import { checkAuthStatusOnApi } from '@/utils/check-auth-status-on-api'
import { errorResponse, successResponse } from '@/utils/response-wrappers'
import { ErrorCodes, SuccessCodes } from '@/types/errors'
import { FolderInsertPayload } from '@/types/item-types'
import { db } from '@/db'
import { items, ItemsSelectType } from '@/db/schema'
import { getUserIdFromClerkId } from '@/db/requests/get-user-id-from-clerk-id'
import { and, asc, eq, InferSelectModel, isNull, SQL, sql } from 'drizzle-orm'
import { FOLDER_MIME_TYPE } from '@/utils/constants'
import { generateNumberedFileName } from '@/utils/generate-numbered-file-name'
import { NextRequest } from 'next/server'
import { handleMaterializedPath } from '@/db/requests/handle-materialized-path'

const MAX_RETRIES_ON_NAME_CONFLICT = 100

export async function GET(req: NextRequest) {
  try {
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

    const conditions: (SQL | undefined)[] = [
      eq(items.userId, userId),
      isNull(items.deletedAt)
    ]

    if (targetParentId === null) {
      conditions.push(isNull(items.parentId))
    } else {
      conditions.push(eq(items.parentId, targetParentId))
    }

    if (pageTokenCursor) {
      const mimeTypeSortExpression = sql`CASE WHEN
      ${items.mimeType}
      =
      ${FOLDER_MIME_TYPE}
      THEN
      0
      ELSE
      1
      END`
      const pageTokenCursorMimeTypeSortValue = sql`CASE WHEN ${pageTokenCursor.mimeType} = ${FOLDER_MIME_TYPE} THEN 0 ELSE 1 END`

      const cursorCondition = sql`
          (${mimeTypeSortExpression}, ${items.name}, ${items.id})
          > (
          ${pageTokenCursorMimeTypeSortValue}
          ,
          ${pageTokenCursor.name}
          ,
          ${pageTokenCursor.id}
          )
      `
      conditions.push(cursorCondition)
    }
    const finalWhereClause = and(...conditions)

    const fetchedItems: InferSelectModel<typeof items>[] = await db
      .select()
      .from(items)
      .where(finalWhereClause)
      .orderBy(
        sql`CASE WHEN
            ${items.mimeType}
            =
            ${FOLDER_MIME_TYPE}
            THEN
            0
            ELSE
            1
            END`,
        asc(items.name),
        asc(items.id)
      )
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

  if (!contentType.startsWith('application/json'))
    return errorResponse(
      ErrorCodes.BAD_REQUEST,
      'Unsupported Content Type Received'
    )

  const body = await req.json()

  const { name, mimeType, parentId } = body

  if (!name || typeof name !== 'string') {
    return errorResponse(ErrorCodes.BAD_REQUEST, 'Folder name is required.')
  }

  let insert: ItemsSelectType | undefined = undefined

  for (let i = 0; i < MAX_RETRIES_ON_NAME_CONFLICT; i++) {
    const newName = generateNumberedFileName(name, i)
    try {
      const payload: FolderInsertPayload = {
        userId,
        name: newName,
        mimeType,
        parentId
      }

      insert = await handleMaterializedPath(parentId, userId, payload)
      break
    } catch (e) {
      if (e instanceof Error && (e as any).cause?.code === '23505') {
        insert = undefined
      } else {
        let message = 'Unable to create specified folder.'
        if (e instanceof Error) {
          message = e.message
        }
        return errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, message)
      }
    }
  }

  if (!insert) {
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      `Could not find an available name for folder "${name}" after ${MAX_RETRIES_ON_NAME_CONFLICT} attempts.`
    )
  }

  return successResponse(SuccessCodes.CREATED, insert)
}
