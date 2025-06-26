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
  ArrowRightIcon,
  Download,
  FilePenLineIcon,
  MoreVertical,
  Trash2
} from 'lucide-react'
import { formatGoogleDriveDate } from '@/utils/format-google-drive-date'
import { formatGoogleDriveFileSize } from '@/utils/format-google-drive-file-size'
import { DriveBreadcrumb } from '@/components/bread-crumb'
import { getCategoryFromMimeType } from '@/utils/get-category-from-mime-type'
import { FilePreviewModal } from '@/components/file-preview-modal'
import { Item } from '@/types/item-types'
import { startDownloadForItem } from '@/services/download-manager'
import { RenameModal } from '@/components/rename-modal'
import { SimpleDeleteDialog } from '@/components/delete-dialog'
import { MoveModal } from '@/components/move-modal'
import { QueryKeys } from '@/query/QueryProvider'
import { DriveTableRow } from '@/components/drive-table-row'
import { getFileIconForDriveTable } from '@/utils/get-file-icon-for-drive-table'

export default function Home() {
  const {
    currentDirectoryId,
    setCurrentDirectoryId,
    setDisableDropzone,
    setSelectedItemId
  } = useDoppleStore((state) => state)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [openFilePreviewModal, setOpenFilePreviewModal] =
    useState<boolean>(false)
  const [openRenameModal, setOpenRenameModal] = useState<boolean>(false)
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)
  const [openMoveModal, setOpenMoveModal] = useState<boolean>(false)

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: [QueryKeys.ITEMS, currentDirectoryId],
    queryFn: getItems,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null
  })

  const handleFolderClick = (item: Item) => {
    setCurrentDirectoryId(item.id)
    setSelectedItemId(null)
  }

  const handleFileClick = (item: Item) => {
    setSelectedItem(item)
    setOpenFilePreviewModal(true)
    setDisableDropzone(true)
  }

  const handleItemClick = (item: Item) => {
    if (item.mimeType === FOLDER_MIME_TYPE) handleFolderClick(item)
    else handleFileClick(item)
  }

  const handleRenameClick = (item: Item) => {
    setSelectedItem(item)
    setOpenRenameModal(true)
    setDisableDropzone(true)
  }

  const handleDeleteClick = (item: Item) => {
    setSelectedItem(item)
    setOpenDeleteModal(true)
    setDisableDropzone(true)
  }

  const handleMoveClick = (item: Item) => {
    setSelectedItem(item)
    setOpenMoveModal(true)
    setDisableDropzone(true)
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
        onClose={() => {
          setDisableDropzone(false)
          setOpenFilePreviewModal(false)
        }}
        fileId={selectedItem?.id ?? null}
      />
      <RenameModal
        isOpen={openRenameModal}
        onClose={() => {
          setDisableDropzone(false)
          setOpenRenameModal(false)
        }}
        item={selectedItem}
      />
      <MoveModal
        isOpen={openMoveModal}
        onClose={() => {
          setDisableDropzone(false)
          setOpenMoveModal(false)
        }}
        itemToMove={selectedItem}
      />
      <SimpleDeleteDialog
        isOpen={openDeleteModal}
        onClose={() => {
          setDisableDropzone(false)
          setOpenDeleteModal(false)
        }}
        item={selectedItem}
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
                    <DriveTableRow
                      key={item.id}
                      item={item}
                      onDoubleClick={handleItemClick}
                      onRename={handleRenameClick}
                      onDelete={handleDeleteClick}
                      onMove={handleMoveClick}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  handleItemClick(item)
                }}
                className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 transition-colors hover:bg-slate-800/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {getFileIconForDriveTable(
                      getCategoryFromMimeType(item.mimeType)
                    )}
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
                      {item.mimeType !== FOLDER_MIME_TYPE && (
                        <DropdownMenuItem
                          onClick={() => startDownloadForItem(item)}
                          className="text-slate-100 focus:bg-slate-700"
                        >
                          <Download className="mr-2 h-4 w-4" /> Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleRenameClick(item)}
                        className="text-slate-100 focus:bg-slate-700"
                      >
                        <FilePenLineIcon className="mr-2 h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-slate-100 hover:bg-slate-700"
                        onClick={() => handleMoveClick(item)}
                      >
                        <ArrowRightIcon className="mr-2 h-4 w-4" />
                        Move
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(item)}
                        className="text-red-400 focus:bg-red-900/50 focus:text-red-400"
                      >
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
