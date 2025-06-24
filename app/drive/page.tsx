'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useDoppleStore } from '@/providers/dopple-store-provider'
import { getItems } from '@/requests/items'
import { useEffect, useMemo, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { FOLDER_MIME_TYPE } from '@/utils/constants'
import { LoadingSpinner } from '@/components/loading-spinner'
import { EmptyState } from '@/components/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Download,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FilmIcon,
  FolderIcon,
  ImageIcon,
  MoreVertical,
  MusicIcon,
  Share,
  Trash2
} from 'lucide-react'
import { formatGoogleDriveDate } from '@/utils/format-google-drive-date'
import { formatGoogleDriveFileSize } from '@/utils/format-google-drive-file-size'
import { DriveBreadcrumb } from '@/components/bread-crumb'
import { getCategoryFromMimeType } from '@/utils/get-category-from-mime-type'
import { FilePreviewModal } from '@/components/file-preview-modal'
import { Item } from '@/types/item-types'

export default function Home() {
  const { currentDirectoryId, setCurrentDirectoryId } = useDoppleStore(
    (state) => state
  )
  const [selectedFile, setSelectedFile] = useState<number | null>(null)
  const [openFilePreviewModal, setOpenFilePreviewModal] =
    useState<boolean>(false)
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['items', currentDirectoryId],
    queryFn: getItems,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null
  })

  const handleFolderClick = (folderId: number) => {
    setCurrentDirectoryId(folderId)
  }

  const handleFileClick = (fileId: number) => {
    setSelectedFile(fileId)
    setOpenFilePreviewModal(true)
  }

  const handleItemClick = (item: Item) => {
    if (item.mimeType === FOLDER_MIME_TYPE) handleFolderClick(item.id)
    else handleFileClick(item.id)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <FolderIcon className="h-5 w-5 text-blue-400" />
      case 'image':
        return <ImageIcon className="h-5 w-5 text-green-400" />
      case 'audio':
        return <MusicIcon className="h-5 w-5 text-green-400" />
      case 'document':
        return <FileTextIcon className="h-5 w-5 text-blue-300" />
      case 'spreadsheet':
        return <FileSpreadsheetIcon className="h-5 w-5 text-green-500" />
      case 'video':
        return <FilmIcon className="h-5 w-5 text-purple-400" />
      case 'presentation':
        return <FileIcon className="h-5 w-5 text-orange-400" />
      default:
        return <FileIcon className="h-5 w-5 text-slate-400" />
    }
  }

  const sortedItems = useMemo(() => {
    if (!data) return []

    const flatItems = data.pages.flatMap((page) => page.items)

    return flatItems.sort((a, b) => {
      if (a.mimeType === FOLDER_MIME_TYPE && b.mimeType !== FOLDER_MIME_TYPE)
        return -1
      if (a.mimeType !== FOLDER_MIME_TYPE && b.mimeType === FOLDER_MIME_TYPE)
        return 1
      return a.name.localeCompare(b.name)
    })
  }, [data])

  const { ref, inView } = useInView({
    threshold: 0
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])
  return (
    <div className="p-4 md:p-8">
      <DriveBreadcrumb />
      <FilePreviewModal
        isOpen={openFilePreviewModal}
        onClose={() => setOpenFilePreviewModal(false)}
        fileId={selectedFile}
      />
      {status === 'pending' ? (
        <div className="flex min-h-[90vh] w-full flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : status === 'error' ? (
        <div className="flex min-h-[90vh] w-full flex-col items-center justify-center">
          <EmptyState size={'lg'} variant={'error'} />
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="flex min-h-[90vh] w-full flex-col items-center justify-center">
          <EmptyState size={'lg'} variant={'folder'} />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="rounded-lg border border-slate-800 bg-slate-900/30">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-300">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-slate-300">
                      Last modified
                    </TableHead>
                    <TableHead className="font-semibold text-slate-300">
                      File size
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item) => (
                    <TableRow
                      key={item.id}
                      onDoubleClick={() => {
                        handleItemClick(item)
                      }}
                      className="group cursor-pointer border-slate-800 hover:bg-slate-800/30"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {getFileIcon(getCategoryFromMimeType(item.mimeType))}
                          <span className="text-slate-100 transition-colors group-hover:text-blue-400">
                            {item.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {formatGoogleDriveDate(item.updatedAt)}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {item.mimeType !== FOLDER_MIME_TYPE
                          ? formatGoogleDriveFileSize(item.size)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-700 hover:text-slate-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="border-slate-700 bg-slate-800"
                          >
                            <DropdownMenuItem className="text-slate-100 focus:bg-slate-700">
                              <Download className="mr-2 h-4 w-4" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-100 focus:bg-slate-700">
                              <Share className="mr-2 h-4 w-4" /> Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem className="text-red-400 focus:bg-red-900/50 focus:text-red-400">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => () => {
                  handleItemClick(item)
                }}
                className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 transition-colors hover:bg-slate-800/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {getFileIcon(getCategoryFromMimeType(item.mimeType))}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-slate-100">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 text-slate-400 hover:bg-slate-700 hover:text-slate-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-slate-700 bg-slate-800"
                    >
                      <DropdownMenuItem className="text-slate-100 focus:bg-slate-700">
                        <Download className="mr-2 h-4 w-4" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-slate-100 focus:bg-slate-700">
                        <Share className="mr-2 h-4 w-4" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem className="text-red-400 focus:bg-red-900/50 focus:text-red-400">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
                  <span>{formatGoogleDriveDate(item.updatedAt)}</span>
                  <span>
                    {item.mimeType !== FOLDER_MIME_TYPE
                      ? formatGoogleDriveFileSize(item.size)
                      : 'Folder'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div ref={ref} className="h-10 py-4 text-center">
            {isFetchingNextPage && (
              <LoadingSpinner size="sm" variant={'dots'} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
