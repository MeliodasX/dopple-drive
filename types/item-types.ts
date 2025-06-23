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
