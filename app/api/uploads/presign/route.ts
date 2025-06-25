import { NextRequest } from 'next/server'
import { checkAuthStatusOnApi } from '@/utils/check-auth-status-on-api'
import { getUserIdFromClerkId } from '@/db/requests/get-user-id-from-clerk-id'
import { errorResponse, successResponse } from '@/utils/response-wrappers'
import { ErrorCodes, SuccessCodes } from '@/types/errors'
import { nanoid } from 'nanoid'
import { putPreSignedURL } from '@/services/aws/s3'

export async function POST(req: NextRequest) {
  try {
    await checkAuthStatusOnApi()
    const userId = await getUserIdFromClerkId()
    if (!userId) {
      return errorResponse(ErrorCodes.FORBIDDEN, "Couldn't find user")
    }

    const body = await req.json()
    const { fileName, fileType } = body
    if (!fileName || !fileType) {
      return errorResponse(
        ErrorCodes.BAD_REQUEST,
        'File name and type are required.'
      )
    }

    const uniqueId = nanoid()
    const key = `${userId}/${uniqueId}-${fileName}`

    const signedUrl = await putPreSignedURL(key, fileType)

    return successResponse(SuccessCodes.OK, { signedUrl, key })
  } catch (err: any) {
    console.error('Error generating pre-signed URL:', err)
    return errorResponse(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      `Failed to prepare upload: ${err.message || 'Unknown error'}`
    )
  }
}
