import { doGet } from '@/requests'
import { Item } from '@/types/item-types'

export const searchItems = async (query: string): Promise<Item[]> => {
  if (!query || query.trim().length < 2) {
    return Promise.resolve([])
  }

  const params = new URLSearchParams()
  params.append('q', query.trim())

  const response = await doGet(`/search?${params.toString()}`)

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || 'Search request failed.')
  }

  const json = await response.json()
  return json.data
}
