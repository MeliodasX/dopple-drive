import {
  SingleItemFileResponse,
  SingleItemFolderResponse
} from '@/types/item-types'

export function isSingleItemFileResponse(
  response: any
): response is SingleItemFileResponse {
  return (
    response &&
    typeof response === 'object' &&
    'signedUrl' in response &&
    typeof response.signedUrl === 'string' &&
    'id' in response
  )
}

export function isSingleItemFolderResponse(
  response: any
): response is SingleItemFolderResponse {
  return (
    response &&
    typeof response === 'object' &&
    'folder' in response &&
    typeof response.folder === 'object' &&
    'children' in response &&
    Array.isArray(response.children)
  )
}
