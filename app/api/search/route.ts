import { NextRequest } from 'next/server'
import { and, asc, eq, ilike, isNull, sql } from 'drizzle-orm'

import { db } from '@/db'
import { items } from '@/db/schema'
import { checkAuthStatusOnApi } from '@/utils/check-auth-status-on-api'
import { getUserIdFromClerkId } from '@/db/requests/get-user-id-from-clerk-id'
import { errorResponse, successResponse } from '@/utils/response-wrappers'
import { ErrorCodes, SuccessCodes } from '@/types/errors'
import { FOLDER_MIME_TYPE } from '@/utils/constants'

export async function GET(req: NextRequest) {
  try {
    await checkAuthStatusOnApi()
    const userId = await getUserIdFromClerkId()
    if (!userId) {
      return errorResponse(ErrorCodes.FORBIDDEN, "Couldn't find user")
    }

    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return successResponse(SuccessCodes.OK, [])
    }

    const searchResults = await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          isNull(items.deletedAt),
          ilike(items.name, `%${query}%`)
        )
      )
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
        asc(items.name)
      )
      .limit(7)

    return successResponse(SuccessCodes.OK, searchResults)
  } catch (err: any) {
    console.error('Error during search:', err)
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      `Failed to perform search: ${err.message || 'Unknown error'}`
    )
  }
}
