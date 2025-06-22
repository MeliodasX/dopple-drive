import { checkAuthStatusOnApi } from '@/utils/check-auth-status-on-api'
import { getUserIdFromClerkId } from '@/db/requests/get-user-id-from-clerk-id'
import { NextResponse } from 'next/server'
import { error, success } from '@/utils/response-wrappers'
import { ErrorCodes } from '@/types/errors'
import { db } from '@/db'
import { upload } from '@/db/schema'
import { and, eq, isNull } from 'drizzle-orm'
import { deleteFileFromS3 } from '@/services/AWS/S3'

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

  const data = await db
    .select()
    .from(upload)
    .where(and(eq(upload.id, id), isNull(upload.deletedAt)))

  return NextResponse.json(success(data))
}

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
    .update(upload)
    .set({
      ...body
    })
    .where(eq(upload.id, id))
    .returning()

  return NextResponse.json(success(data))
}

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
    .update(upload)
    .set({
      deletedAt: new Date()
    })
    .where(eq(upload.id, id))
    .returning({
      key: upload.key
    })

  try {
    await deleteFileFromS3(data.key)
  } catch (e) {
    //NOTE(@MeliodasX): Can log this into a dump table that can perform the deletion later via a scheduled job.
  }

  return NextResponse.json(
    success({
      message: 'Deleted Successfully'
    })
  )
}
