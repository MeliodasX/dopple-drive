import { FOLDER_MIME_TYPE } from '@/utils/constants'

export function getCategoryFromMimeType(mimeType: string) {
  if (!mimeType) {
    return 'default'
  }

  if (mimeType === FOLDER_MIME_TYPE) {
    return 'folder'
  }

  const mainType = mimeType.split('/')[0]

  if (mainType === 'image') {
    return 'image'
  }
  if (mainType === 'video') {
    return 'video'
  }
  if (mainType === 'audio') {
    return 'audio'
  }

  switch (mimeType) {
    case 'application/pdf':
      return 'document'
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'document'
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'spreadsheet'
    case 'application/vnd.ms-powerpoint':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return 'presentation'
    case 'text/plain':
    case 'text/csv':
      return 'document'
    default:
      return 'default'
  }
}
