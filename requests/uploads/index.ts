import { doPost } from '@/requests'
import { Item } from '@/types/item-types'

interface PresignedUrlResponse {
  signedUrl: string
  key: string
}

interface CompleteUploadPayload {
  name: string
  mimeType: string
  parentId: number | null
  key: string
  url: string
  size: number
}

export const getPresignedUploadUrl = async (
  fileName: string,
  fileType: string
): Promise<PresignedUrlResponse> => {
  const response = await doPost('/uploads/presign', { fileName, fileType })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || 'Could not get upload URL.')
  }

  const json = await response.json()
  return json.data
}

export const completeUpload = async (
  payload: CompleteUploadPayload
): Promise<Item> => {
  const response = await doPost('/uploads/complete', payload)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || 'Failed to finalize upload.')
  }

  const json = await response.json()
  return json.data
}
