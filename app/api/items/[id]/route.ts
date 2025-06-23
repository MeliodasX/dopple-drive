import { checkAuthStatusOnApi } from '@/utils/check-auth-status-on-api'
import { getUserIdFromClerkId } from '@/db/requests/get-user-id-from-clerk-id'
import { NextResponse } from 'next/server'
import { error, success, successResponse } from '@/utils/response-wrappers'
import { ErrorCodes, SuccessCodes } from '@/types/errors'
import { db } from '@/db'
import { items } from '@/db/schema'
import { and, eq, isNull } from 'drizzle-orm'
import { deleteFileFromS3, getPreSignedURL } from '@/services/AWS/S3'
import { FOLDER_MIME_TYPE } from '@/utils/constants'

// TODO: Return the complete folder structure if the required resource is a folder
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: number }> }
) {
  const { id } = await params

  await checkAuthStatusOnApi()
  const userId = await getUserIdFromClerkId()

  if (!userId)
    return NextResponse.json(error(ErrorCodes.FORBIDDEN, "Couldn't find user"))

  if (!id)
    return NextResponse.json(
      error(ErrorCodes.FORBIDDEN, "Couldn't find resource id")
    )

  const [data] = await db
    .select()
    .from(items)
    .where(and(eq(items.id, id), isNull(items.deletedAt)))

  if (data.mimeType === FOLDER_MIME_TYPE || !data.fileUrl) {
    return successResponse(SuccessCodes.OK, data)
  }

  const signedUrl = await getPreSignedURL(data.fileUrl)

  return successResponse(SuccessCodes.OK, {
    ...data,
    signedUrl
  })
}

// TODO: Update this to conform to the new items table
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: number }> }
) {
  const { id } = await params

  await checkAuthStatusOnApi()
  const userId = await getUserIdFromClerkId()

  if (!userId)
    return NextResponse.json(error(ErrorCodes.FORBIDDEN, "Couldn't find user"))

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

  const data = await db
    .update(items)
    .set({
      ...body
    })
    .where(eq(items.id, id))
    .returning()

  return NextResponse.json(success(data))
}

// TODO: If a folder is deleted, handle soft deletion of its child components as well.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: number }> }
) {
  const { id } = await params

  await checkAuthStatusOnApi()
  const userId = await getUserIdFromClerkId()

  if (!userId)
    return NextResponse.json(error(ErrorCodes.FORBIDDEN, "Couldn't find user"))

  if (!id)
    return NextResponse.json(
      error(ErrorCodes.FORBIDDEN, "Couldn't find resource id")
    )

  const [data] = await db
    .update(items)
    .set({
      deletedAt: new Date()
    })
    .where(eq(items.id, id))
    .returning({
      key: items.key,
      mimeType: items.mimeType
    })

  if (data.mimeType !== FOLDER_MIME_TYPE) {
    try {
      if (data.key) await deleteFileFromS3(data.key)
    } catch (e) {
      //NOTE(@MeliodasX): Can log this into a dump table that can perform the deletion later via a scheduled job.
    }
  }

  return successResponse(SuccessCodes.NO_CONTENT)
}
