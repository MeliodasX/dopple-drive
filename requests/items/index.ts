import {
  Item,
  PaginatedItemsResponse,
  SingleItemFileResponse,
  SingleItemFolderResponse,
  UploadMode
} from '@/types/item-types'
import { doDelete, doGet, doPost, doPostFormData, doPut } from '@/requests'
import { FOLDER_MIME_TYPE } from '@/utils/constants'
import { QueryFunctionContext } from '@tanstack/react-query'

export const createFile = async (
  file: File,
  mode?: UploadMode,
  parentId?: number | null
): Promise<Item> => {
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

  const json = await response.json()
  return json.data
}

export const createFolder = async (
  name: string,
  parentId?: number | null
): Promise<Item> => {
  const response = await doPost('/items', {
    name,
    parentId,
    mimeType: FOLDER_MIME_TYPE
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw Error(errorData)
  }

  const json = await response.json()
  return json.data
}

export const getItems = async ({
  queryKey,
  pageParam
}: QueryFunctionContext<
  (string | number | null)[],
  string | null
>): Promise<PaginatedItemsResponse> => {
  const [_key, parentId] = queryKey

  const params = new URLSearchParams()
  if (parentId !== null && typeof parentId === 'number') {
    params.append('parentId', `${parentId}`)
  }

  if (pageParam) {
    params.append('pageToken', pageParam)
  }
  params.append('pageSize', '50')

  const response = await doGet(`/items?${params.toString()}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || 'Failed to fetch items')
  }

  const json = await response.json()
  return json.data
}

export const getResourceById = async (
  id: number
): Promise<SingleItemFileResponse | SingleItemFolderResponse> => {
  const response = await doGet(`/items/${id}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw Error(errorData)
  }

  const json = await response.json()
  return json.data
}

export const updateResourceById = async (
  id: number,
  payload: {
    name?: string
    parentId?: number | null
  }
): Promise<Item> => {
  const response = await doPut(`/file/${id}`, payload)

  if (!response.ok) {
    const errorData = await response.json()
    throw Error(errorData)
  }

  const json = await response.json()
  return json.data
}

export const deleteResourceById = async (id: number): Promise<void> => {
  await doDelete(`/file/${id}`)
}
