import { FOLDER_MIME_TYPE } from '@/utils/constants'
import {
  BaseItemInsertPayload,
  FileInsertPayload,
  FolderInsertPayload
} from '@/types/item-types'

export function isFileInsertPayload(
  payload: BaseItemInsertPayload
): payload is FileInsertPayload {
  return (
    payload.mimeType !== FOLDER_MIME_TYPE &&
    typeof (payload as FileInsertPayload).fileUrl === 'string' &&
    typeof (payload as FileInsertPayload).size === 'number' &&
    typeof (payload as FileInsertPayload).key === 'string'
  )
}

export function isFolderInsertPayload(
  payload: BaseItemInsertPayload
): payload is FolderInsertPayload {
  return (
    payload.mimeType === FOLDER_MIME_TYPE &&
    ((payload as FolderInsertPayload).fileUrl === null ||
      (payload as FolderInsertPayload).fileUrl === undefined) &&
    ((payload as FolderInsertPayload).size === null ||
      (payload as FolderInsertPayload).size === undefined) &&
    ((payload as FolderInsertPayload).key === null ||
      (payload as FolderInsertPayload).key === undefined)
  )
}
