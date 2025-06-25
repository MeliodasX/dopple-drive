import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import {
  File as FileIcon,
  FileTextIcon,
  Folder as FolderIcon,
  ImageIcon,
  Loader2,
  Search,
  X
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Item } from '@/types/item-types'
import { FOLDER_MIME_TYPE } from '@/utils/constants'
import { searchItems } from '@/requests/search'
import { formatGoogleDriveDate } from '@/utils/format-google-drive-date'

const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  return mounted ? ReactDOM.createPortal(children, document.body) : null
}

const getFileTypeIcon = (mimeType: string) => {
  if (mimeType === FOLDER_MIME_TYPE) {
    return <FolderIcon className="h-5 w-5 text-blue-400" />
  }
  if (mimeType.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5 text-green-400" />
  }
  if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/pdf' ||
    mimeType.includes('document')
  ) {
    return <FileTextIcon className="h-5 w-5 text-blue-300" />
  }
  return <FileIcon className="h-5 w-5 text-slate-400" />
}

const SearchResultItem = ({
  result,
  onClick
}: {
  result: Item
  onClick: () => void
}) => (
  <div
    className={cn(
      'flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors',
      'hover:bg-slate-800/50 active:bg-slate-800/70'
    )}
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
  >
    <div className="flex-shrink-0">{getFileTypeIcon(result.mimeType)}</div>
    <div className="min-w-0 flex-1">
      <h4 className="truncate text-sm font-medium text-slate-100">
        {result.name}
      </h4>
      <p className="text-xs text-slate-400">
        Modified {formatGoogleDriveDate(result.updatedAt)}
      </p>
    </div>
  </div>
)

interface SearchBarProps {
  onFolderSelect: (folderId: number) => void
  onFileSelect: (fileId: number) => void
}

export function SearchBar({ onFolderSelect, onFileSelect }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['search', debouncedTerm],
    queryFn: () => searchItems(debouncedTerm),
    enabled: debouncedTerm.length >= 2
  })

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  const handleFocus = () => {
    setIsOpen(true)
    updateDropdownPosition()
  }

  const handleBlur = () => {
    setIsOpen(false)
  }

  const handleResultClick = (result: Item) => {
    setIsOpen(false)
    setSearchTerm('')
    inputRef?.current?.blur()
    if (result.mimeType === FOLDER_MIME_TYPE) {
      onFolderSelect(result.id)
    } else {
      onFileSelect(result.id)
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition()
      }
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
    }
  }, [isOpen])

  return (
    <div className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search in Drive"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="border-slate-700 bg-slate-800 pr-10 pl-10 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 transform text-slate-400 hover:bg-slate-700 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Portal>
          <div
            className="absolute max-h-[60vh] overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-2xl"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`
            }}
          >
            <ScrollArea className="max-h-[60vh]">
              {isFetching && (
                <div className="flex items-center justify-center p-4 text-sm text-slate-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                </div>
              )}
              {!isFetching &&
                debouncedTerm.length >= 2 &&
                results.length === 0 && (
                  <div className="p-4 text-center text-sm text-slate-400">
                    No results found for &#34;{debouncedTerm}&#34;.
                  </div>
                )}
              {!isFetching && results.length > 0 && (
                <div>
                  {results.map((result) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      onClick={() => handleResultClick(result)}
                    />
                  ))}
                </div>
              )}
              {!debouncedTerm && (
                <div className="p-4 text-center text-sm text-slate-500">
                  Start typing to search your files and folders.
                </div>
              )}
            </ScrollArea>
          </div>
        </Portal>
      )}
    </div>
  )
}
