import { NextResponse } from 'next/server'
import { checkAuthStatusOnApi } from '@/utils/check-auth-status-on-api'
import { error, success } from '@/utils/response-wrappers'
import { ErrorCodes } from '@/types/errors'
import { uploadFileToS3 } from '@/services/AWS/S3'
import { UploadMode } from '@/types/upload-types'
import { db } from '@/db'
import { upload } from '@/db/schema'
import { getUserIdFromClerkId } from '@/db/requests/get-user-id-from-clerk-id'
import { count, eq, ilike, InferSelectModel } from 'drizzle-orm'

export async function GET(req: Request) {}

export async function POST(req: Request) {
  await checkAuthStatusOnApi()
  const userId = await getUserIdFromClerkId()

  if (!userId)
    return NextResponse.json(error(ErrorCodes.FORBIDDEN, "Couldn't find user"))

  const headers = req.headers
  const contentType = headers.get('Content-Type') || ''

  if (!contentType || !contentType.startsWith('multipart/form-data')) {
    return NextResponse.json(
      error(
        ErrorCodes.BAD_REQUEST,
        'Incorrect request type. Multipart/FormData required.'
      )
    )
  }

  const formData = await req.formData()

  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return NextResponse.json(error(ErrorCodes.BAD_REQUEST, 'File not found.'))
  }

  // Defaults to making a copy
  const mode = (formData.get('mode') ?? UploadMode.STANDARD) as UploadMode
  const fileName = file.name

  const { url, size } = await uploadFileToS3(file)

  let data: InferSelectModel<typeof upload>[] = []

  if (mode === UploadMode.STANDARD) {
    data = await db
      .insert(upload)
      .values({
        fileName,
        size,
        userId,
        fileUrl: url
      })
      .returning()
  }

  if (mode === UploadMode.COPY) {
    const result = await db
      .select({
        count: count()
      })
      .from(upload)
      .where(ilike(upload.fileName, `%${fileName}%`))
    const rowCount = Number(result[0].count)

    const modifiedFileName = `${fileName} (${rowCount})`
    data = await db
      .insert(upload)
      .values({
        fileName: modifiedFileName,
        size,
        userId,
        fileUrl: url
      })
      .returning()
  }

  if (mode === UploadMode.OVERRIDE) {
    const result = await db
      .select()
      .from(upload)
      .where(eq(upload.fileName, fileName))

    if (result) {
      data = await db
        .update(upload)
        .set({
          fileName,
          fileUrl: url,
          size,
          updatedAt: new Date()
        })
        .where(eq(upload.fileName, fileName))
        .returning()
    } else {
      data = await db
        .insert(upload)
        .values({ userId, fileName, fileUrl: url, size })
        .returning()
    }
  }

  return NextResponse.json(success(data))
}
