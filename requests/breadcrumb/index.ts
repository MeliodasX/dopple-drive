import { BreadcrumbItem } from '@/types/item-types'
import { doGet } from '@/requests'

export const getBreadcrumb = async (
  folderId: number | null
): Promise<BreadcrumbItem[]> => {
  if (folderId === null) {
    return []
  }

  const response = await doGet(`/breadcrumb/${folderId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch breadcrumb data')
  }
  const json = await response.json()
  return json.data
}
