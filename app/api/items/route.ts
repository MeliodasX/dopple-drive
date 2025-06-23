import { checkAuthStatusOnApi } from '@/utils/check-auth-status-on-api'
import { errorResponse, successResponse } from '@/utils/response-wrappers'
import { ErrorCodes, SuccessCodes } from '@/types/errors'
import { uploadFileToS3 } from '@/services/AWS/S3'
import {
  FileInsertPayload,
  FolderInsertPayload,
  ItemInsertPayload,
  UploadMode
} from '@/types/item-types'
import { db } from '@/db'
import { items, ItemsSelectType } from '@/db/schema'
import { getUserIdFromClerkId } from '@/db/requests/get-user-id-from-clerk-id'
import { count, eq, ilike } from 'drizzle-orm'
import { FOLDER_MIME_TYPE } from '@/utils/constants'

const handleMaterializedPath = async (
  parentId: number | null,
  payload: ItemInsertPayload
) => {
  let parentPath = '/'
  if (parentId) {
    const [parentItem] = await db
      .select()
      .from(items)
      .where(eq(items.id, parentId))
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

    data = await handleMaterializedPath(parentId, payload)
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

  // Defaults to overriding a file unless copy is explicitly stated
  const mode = (formData.get('mode') ?? UploadMode.OVERRIDE) as UploadMode
  const getParentId = formData.get('parentId')
  const parentId = getParentId ? Number(getParentId) : null

  const fileName = file.name
  const mimeType = file.type

  let insert: ItemsSelectType | undefined = undefined

  if (mode === UploadMode.COPY) {
    const result = await db
      .select({
        count: count()
      })
      .from(items)
      .where(ilike(items.name, `%${fileName}%`))
    const rowCount = Number(result[0].count)

    const name = fileName.split('.')
    name[0] = `${name[0]}_(${rowCount})`
    const modifiedFileName = name.join('.')
    const key = `${userId}/${modifiedFileName}`

    const { url, size } = await uploadFileToS3(
      file,
      `${userId}`,
      modifiedFileName
    )

    const payload: FileInsertPayload = {
      userId,
      name: modifiedFileName,
      mimeType,
      parentId,
      key,
      fileUrl: url,
      size
    }

    try {
      insert = await handleMaterializedPath(parentId, payload)
    } catch (e) {
      let message = 'Unable to create specified resource'
      if (e instanceof Error) {
        message = e.message
      }
      return errorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, message)
    }
  }

  if (mode === UploadMode.OVERRIDE) {
    const [result] = await db
      .select()
      .from(items)
      .where(eq(items.name, fileName))

    const key = `${userId}/${fileName}`
    const { url, size } = await uploadFileToS3(file, `${userId}`)

    if (result) {
      const [data] = await db
        .update(items)
        .set({
          mimeType,
          size,
          updatedAt: new Date()
        })
        .where(eq(items.name, fileName))
        .returning()

      return successResponse(SuccessCodes.CREATED, data)
    }

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
      insert = await handleMaterializedPath(parentId, payload)
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
