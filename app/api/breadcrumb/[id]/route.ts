import { NextRequest } from 'next/server'
import { and, eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import { items } from '@/db/schema'
import { checkAuthStatusOnApi } from '@/utils/check-auth-status-on-api'
import { getUserIdFromClerkId } from '@/db/requests/get-user-id-from-clerk-id'
import { errorResponse, successResponse } from '@/utils/response-wrappers'
import { ErrorCodes, SuccessCodes } from '@/types/errors'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await checkAuthStatusOnApi()
    const userId = await getUserIdFromClerkId()
    if (!userId) {
      return errorResponse(ErrorCodes.FORBIDDEN, "Couldn't find user")
    }

    const { id } = await params

    const folderId = parseInt(id, 10)
    if (isNaN(folderId)) {
      return errorResponse(ErrorCodes.BAD_REQUEST, 'Invalid folder ID.')
    }

    const [currentFolder] = await db
      .select({ path: items.path, userId: items.userId })
      .from(items)
      .where(eq(items.id, folderId))

    if (!currentFolder) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'Folder not found.')
    }

    if (currentFolder.userId !== userId) {
      return errorResponse(
        ErrorCodes.FORBIDDEN,
        'You do not have permission to view this folder.'
      )
    }

    const ancestorIds = currentFolder.path
      .split('/')
      .filter((id) => id)
      .map((id) => parseInt(id, 10))

    if (ancestorIds.length === 0) {
      return successResponse(SuccessCodes.OK, [])
    }

    const ancestors = await db
      .select({
        id: items.id,
        name: items.name
      })
      .from(items)
      .where(and(eq(items.userId, userId), inArray(items.id, ancestorIds)))

    const sortedAncestors = ancestorIds
      .map((id) => ancestors.find((a) => a.id === id))
      .filter(Boolean)

    return successResponse(SuccessCodes.OK, sortedAncestors)
  } catch (err: any) {
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      `Failed to fetch breadcrumb: ${err.message || 'Unknown error'}`
    )
  }
}
