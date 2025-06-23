import { FOLDER_MIME_TYPE } from '@/utils/constants'

export enum UploadMode {
  OVERRIDE = 'OVERRIDE',
  COPY = 'COPY'
}

export interface CreateFolderInput {
  name: string
  mimeType: typeof FOLDER_MIME_TYPE
  parentId: number | null
}

export interface CreateFileInput {
  file: File
  mode: UploadMode
  parentId: number | null
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
