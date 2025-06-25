'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

export enum QueryKeys {
  ITEMS = 'items',
  BREADCRUMB = 'breadcrumb',
  SEARCH = 'search'
}

export enum QueryType {
  SINGLE = 'single'
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60000
          }
        }
      })
  )
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
