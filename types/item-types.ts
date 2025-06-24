export enum UploadMode {
  OVERRIDE = 'OVERRIDE',
  COPY = 'COPY'
}

export interface BaseItemInsertPayload {
  mimeType: string
  userId: number
  name: string
  parentId?: number | null
}

export interface FileInsertPayload extends BaseItemInsertPayload {
  fileUrl: string
  size: number
  key: string
}

export interface FolderInsertPayload extends BaseItemInsertPayload {
  fileUrl?: null
  size?: null
  key?: null
}

export type ItemInsertPayload = FileInsertPayload | FolderInsertPayload

export interface Item {
  id: number
  userId: number
  name: string
  mimeType: string
  fileUrl?: string
  size?: number
  key: string
  parentId?: number
  path: string
  createdAt: string
  updatedAt: string
  deletedAt: string
}

export interface SingleItemFileResponse extends Item {
  presignedUrl: string
}

export interface SingleItemFolderResponse {
  folder: Item
  children: Item[]
}

export interface PaginatedItemsResponse {
  items: Item[]
  nextPageToken: string | null
  hasMore: boolean
}

export interface GetItemsContext {
  queryKey: readonly (string | number | null)[]
  pageParam: string | null
}
