'use client'

import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Folder, Home, MoreHorizontal } from 'lucide-react'

import { useDoppleStore } from '@/providers/dopple-store-provider'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LoadingSpinner } from '@/components/loading-spinner'
import { getBreadcrumb } from '@/requests/breadcrumb'
import { BreadcrumbItem } from '@/types/item-types'
import { QueryKeys } from '@/query/QueryProvider'

export const DriveBreadcrumb = () => {
  const { currentDirectoryId, setCurrentDirectoryId } = useDoppleStore(
    (state) => state
  )

  const { data: breadcrumbItems, isLoading } = useQuery({
    queryKey: [QueryKeys.BREADCRUMB, currentDirectoryId],
    queryFn: () => getBreadcrumb(currentDirectoryId),
    staleTime: 5 * 60 * 1000
  })

  const handleNavigate = (id: number | null) => {
    setCurrentDirectoryId(id)
  }

  const items = useMemo(() => {
    const rootItem = { id: null, name: 'My Dopple Drive' }
    return [rootItem, ...(breadcrumbItems || [])]
  }, [breadcrumbItems])

  if (isLoading || !items) {
    return (
      <div className="flex h-14 items-center border-b border-slate-800 px-4">
        <LoadingSpinner size="sm" variant="dots" />
      </div>
    )
  }

  return (
    <div className="my-4 border-b border-slate-800 bg-slate-900/50">
      <div className="md:hidden">
        <CompactBreadcrumb items={items} onNavigate={handleNavigate} />
      </div>
      <div className="hidden md:block">
        <DesktopBreadcrumb items={items} onNavigate={handleNavigate} />
      </div>
    </div>
  )
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  onNavigate: (id: number | null) => void
  maxItems?: number
}

const DesktopBreadcrumb = ({
  items,
  onNavigate,
  maxItems = 4
}: BreadcrumbProps) => {
  const needsCollapsing = items.length > maxItems

  const visibleItems = useMemo(() => {
    if (!needsCollapsing) return items
    return [items[0], ...items.slice(items.length - (maxItems - 1))]
  }, [items, maxItems, needsCollapsing])

  const collapsedItems = useMemo(() => {
    if (!needsCollapsing) return []
    return items.slice(1, -(maxItems - 1))
  }, [items, maxItems, needsCollapsing])

  return (
    <nav
      className="flex items-center space-x-2 px-4 py-2 text-sm"
      aria-label="Breadcrumb"
    >
      {visibleItems.map((item, index) => {
        const isLast = item.id === items[items.length - 1].id

        return (
          <React.Fragment key={item.id ?? 'root'}>
            {needsCollapsing && index === 1 && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="border-slate-700 bg-slate-800"
                  >
                    {collapsedItems.map((collapsedItem) => (
                      <DropdownMenuItem
                        key={collapsedItem.id}
                        onClick={() => onNavigate(collapsedItem.id)}
                        className="cursor-pointer text-slate-100 focus:bg-slate-700"
                      >
                        {collapsedItem.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(item.id)}
              disabled={isLast}
              className={cn(
                'h-8 px-3 font-medium',
                isLast
                  ? 'cursor-default text-slate-100 hover:bg-transparent'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )}
            >
              {item.id === null && <Home className="mr-2 h-4 w-4" />}
              {item.name}
            </Button>

            {!isLast && index < visibleItems.length - 1 && (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

const CompactBreadcrumb = ({ items, onNavigate }: BreadcrumbProps) => {
  const currentItem = items[items.length - 1]
  const hasParent = items.length > 1
  const parentItem = hasParent ? items[items.length - 2] : null

  const collapsedItems = items.slice(0, -1)

  return (
    <div className="flex h-14 items-center gap-1 px-2">
      {hasParent && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate(parentItem?.id ?? null)}
          className="h-9 w-9 flex-shrink-0 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          <ChevronRight className="h-5 w-5 rotate-180" />
        </Button>
      )}

      {collapsedItems.length > 0 && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="border-slate-700 bg-slate-800"
            >
              {[...collapsedItems].map((collapsedItem) => (
                <DropdownMenuItem
                  key={collapsedItem.id}
                  onClick={() => onNavigate(collapsedItem.id)}
                  className="cursor-pointer text-slate-100 focus:bg-slate-700"
                >
                  {collapsedItem.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="flex-shrink-0 text-slate-500">
          {currentItem.id === null ? (
            <Home className="h-5 w-5" />
          ) : (
            <Folder className="h-5 w-5" />
          )}
        </div>
        <span className="truncate text-lg font-medium text-slate-100">
          {currentItem.name}
        </span>
      </div>
    </div>
  )
}
