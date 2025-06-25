import { NextRequest } from 'next/server'

import { checkAuthStatusOnApi } from '@/utils/check-auth-status-on-api'
import { getUserIdFromClerkId } from '@/db/requests/get-user-id-from-clerk-id'
import { errorResponse, successResponse } from '@/utils/response-wrappers'
import { ErrorCodes, SuccessCodes } from '@/types/errors'
import { FileInsertPayload } from '@/types/item-types'
import { generateNumberedFileName } from '@/utils/generate-numbered-file-name'
import { handleMaterializedPath } from '@/db/requests/handle-materialized-path'

const MAX_RETRIES_ON_NAME_CONFLICT = 100

export async function POST(req: NextRequest) {
  try {
    await checkAuthStatusOnApi()
    const userId = await getUserIdFromClerkId()
    if (!userId) {
      return errorResponse(ErrorCodes.FORBIDDEN, "Couldn't find user")
    }

    const body = await req.json()
    const { name, mimeType, parentId, key, url, size } = body

    if (!name || !mimeType || !key || !url || typeof size === 'undefined') {
      return errorResponse(
        ErrorCodes.BAD_REQUEST,
        'Missing required file information.'
      )
    }

    const payload: FileInsertPayload = {
      userId,
      name,
      mimeType,
      parentId: parentId ? Number(parentId) : null,
      key,
      fileUrl: url,
      size
    }

    let insert
    for (let i = 0; i < MAX_RETRIES_ON_NAME_CONFLICT; i++) {
      const newName = generateNumberedFileName(name, i)
      try {
        insert = await handleMaterializedPath(
          payload.parentId ?? null,
          userId,
          {
            ...payload,
            name: newName
          }
        )
        break
      } catch (e: any) {
        if (e.cause?.code === '23505') {
          insert = undefined
        } else {
          throw e
        }
      }
    }

    if (!insert) {
      return errorResponse(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Could not create file record after multiple attempts.'
      )
    }

    return successResponse(SuccessCodes.CREATED, insert)
  } catch (err: any) {
    console.error('Error completing upload:', err)
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      `Failed to complete upload: ${err.message || 'Unknown error'}`
    )
  }
}
