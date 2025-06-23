import { UploadMode } from '@/types/item-types'
import { doDelete, doGet, doPost, doPostFormData, doPut } from '@/requests'
import { FOLDER_MIME_TYPE } from '@/utils/constants'

export const createFile = async (
  file: File,
  mode?: UploadMode,
  parentId?: number | null
) => {
  const formData = new FormData()
  formData.append('file', file)

  if (mode) {
    formData.append('mode', mode)
  }

  if (parentId) {
    formData.append('parentId', `${parentId}`)
  }

  const response = await doPostFormData(`/items`, formData)

  if (!response.ok) {
    const errorData = await response.json()
    throw Error(errorData)
  }

  return await response.json()
}

export const createFolder = async (name: string, parentId?: number | null) => {
  const response = await doPost('/items', {
    name,
    parentId,
    mimeType: FOLDER_MIME_TYPE
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw Error(errorData)
  }

  return await response.json()
}

export const getResourceById = async (id: number) => {
  const response = await doGet(`/items/${id}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw Error(errorData)
  }

  return await response.json()
}

export const updateResourceById = async (
  id: number,
  payload: {
    name?: string
    parentId?: number | null
  }
) => {
  const response = await doPut(`/file/${id}`, payload)

  if (!response.ok) {
    const errorData = await response.json()
    throw Error(errorData)
  }

  return await response.json()
}

export const deleteResourceById = async (id: number) => {
  await doDelete(`/file/${id}`)

  return {
    success: true
  }
}
