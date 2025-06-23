import { UploadMode } from '@/types/item-types'
import { doDelete, doGet, doPostFormData, doPut } from '@/requests'

export const uploadFile = async (file: File, mode?: UploadMode) => {
  const formData = new FormData()
  formData.append('file', file)

  if (mode) {
    formData.append('mode', mode)
  }

  const response = await doPostFormData(`/file`, formData)

  if (!response.ok) {
    const errorData = await response.json()
    throw Error(errorData)
  }

  return await response.json()
}

export const getFileById = async (id: number) => {
  const response = await doGet(`/file/${id}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw Error(errorData)
  }

  return await response.json()
}

export const updateFileById = async (
  id: number,
  payload: {
    fileName: string
  }
) => {
  const response = await doPut(`/file/${id}`, payload)

  if (!response.ok) {
    const errorData = await response.json()
    throw Error(errorData)
  }

  return await response.json()
}

export const deleteFileById = async (id: number) => {
  const response = await doDelete(`/file/${id}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw Error(errorData)
  }

  return await response.json()
}
