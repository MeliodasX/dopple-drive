'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  File as FileIcon,
  Folder as FolderIcon,
  FolderPlusIcon,
  Loader2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Modal, ModalBody, ModalFooter } from '@/components/modal'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { FOLDER_MIME_TYPE } from '@/utils/constants'
import { Item, MoveItem } from '@/types/item-types'
import { QueryKeys, QueryType } from '@/query/QueryProvider'
import { useDoppleStore } from '@/providers/dopple-store-provider'
import {
  createFolder,
  getItems,
  getResourceById,
  updateResourceById
} from '@/requests/items'
import { isSingleItemFolderResponse } from '@/types/type-guards'
import { LoadingSpinner } from '@/components/loading-spinner'

interface MoveModalProps {
  isOpen: boolean
  onClose: () => void
  itemToMove: MoveItem | null
}

const getFileTypeIcon = (mimeType: string) => {
  if (mimeType === FOLDER_MIME_TYPE) {
    return <FolderIcon className="h-4 w-4 text-blue-400" />
  }
  return <FileIcon className="h-4 w-4 text-slate-400" />
}

const FolderChildren = ({
  parentFolderId,
  level,
  selectedId,
  onSelect
}: {
  parentFolderId: number
  level: number
  selectedId: number | null
  onSelect: (folder: Item) => void
}) => {
  const { data: response, isLoading } = useQuery({
    queryKey: [QueryKeys.ITEMS, QueryType.SINGLE, parentFolderId],
    queryFn: () => getResourceById(parentFolderId),
    staleTime: 5 * 60 * 1000
  })

  const children = useMemo(() => {
    if (response && isSingleItemFolderResponse(response)) {
      return response.children.filter(
        (item) => item.mimeType === FOLDER_MIME_TYPE
      )
    }
    return []
  }, [response])

  if (isLoading) {
    return (
      <div className="py-1 pl-8">
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div>
      {children.map((folder) => (
        <FolderTreeItem
          key={folder.id}
          folder={folder}
          level={level}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

const FolderTreeItem = ({
  folder,
  level = 0,
  selectedId,
  onSelect
}: {
  folder: Item
  level?: number
  selectedId: number | null
  onSelect: (folder: Item) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isSelected = folder.id === selectedId

  const canExpand = folder.mimeType === FOLDER_MIME_TYPE

  return (
    <div>
      <div
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors',
          'hover:bg-slate-800/50',
          isSelected && 'border border-blue-600/30 bg-blue-600/20'
        )}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => onSelect(folder)}
      >
        <div className="flex h-5 w-5 items-center justify-center p-0">
          {canExpand && (
            <Button
              variant="ghost"
              size="icon"
              className="h-full w-full p-0 text-slate-400 hover:text-slate-100"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <FolderIcon className="h-5 w-5 flex-shrink-0 text-blue-400" />
        <span
          className={cn(
            'flex-1 truncate text-sm',
            isSelected ? 'font-medium text-blue-300' : 'text-slate-100'
          )}
        >
          {folder.name}
        </span>
      </div>
      {isExpanded && (
        <FolderChildren
          parentFolderId={folder.id}
          level={level + 1}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      )}
    </div>
  )
}

export function MoveModal({ isOpen, onClose, itemToMove }: MoveModalProps) {
  const [selectedFolder, setSelectedFolder] = useState<Item | null>(null)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const queryClient = useQueryClient()
  const { currentDirectoryId } = useDoppleStore((state) => state)
  const { ref, inView } = useInView({ threshold: 0 })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingTree,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: [QueryKeys.ITEMS, null],
    queryFn: getItems,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: null,
    enabled: isOpen
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  useEffect(() => {
    if (isOpen) {
      const rootNode: Item = {
        id: 0,
        name: 'My Drive',
        mimeType: FOLDER_MIME_TYPE
      } as Item
      setSelectedFolder(rootNode)
    }
  }, [isOpen])

  const createFolderMutation = useMutation({
    mutationFn: ({
      name,
      parentId
    }: {
      name: string
      parentId: number | null
    }) => createFolder(name, parentId),
    onSuccess: (_, variables) => {
      toast.success(`Folder "${newFolderName}" created`)
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ITEMS, variables.parentId]
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ITEMS, QueryType.SINGLE, variables.parentId]
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.BREADCRUMB, variables.parentId]
      })
      setNewFolderName('')
      setShowCreateFolder(false)
    },
    onError: (error: Error) => toast.error(error.message)
  })

  const moveItemMutation = useMutation({
    mutationFn: (destinationId: number | null) => {
      if (!itemToMove) throw new Error('No item selected to move.')
      return updateResourceById(itemToMove.id, { parentId: destinationId })
    },
    onSuccess: () => {
      if (!itemToMove) return
      toast.success(`Successfully moved "${itemToMove.name}"`)
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ITEMS, currentDirectoryId]
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.BREADCRUMB, currentDirectoryId]
      })
      if (selectedFolder?.id) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.ITEMS, selectedFolder.id]
        })
      }
      handleClose()
    },
    onError: (error: Error) => toast.error(error.message)
  })

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    const parentId =
      selectedFolder?.id === 0 ? null : selectedFolder?.id || null
    createFolderMutation.mutate({ name: newFolderName.trim(), parentId })
  }

  const handleMove = () => {
    if (!selectedFolder || !itemToMove) return
    if (
      itemToMove.mimeType === FOLDER_MIME_TYPE &&
      itemToMove.id === selectedFolder.id
    ) {
      toast.error('Cannot move a folder into itself.')
      return
    }
    moveItemMutation.mutate(selectedFolder.id === 0 ? null : selectedFolder.id)
  }

  const handleClose = () => {
    setShowCreateFolder(false)
    setNewFolderName('')
    onClose()
  }

  const isMoving = moveItemMutation.isPending
  const isCreatingFolder = createFolderMutation.isPending
  const canMove =
    selectedFolder !== null && selectedFolder.id !== itemToMove?.parentId

  const allRootFolders = useMemo(
    () =>
      data?.pages.flatMap((page) =>
        page.items.filter((item) => item.mimeType === FOLDER_MIME_TYPE)
      ) || [],
    [data]
  )

  if (!isOpen || !itemToMove) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Move item"
      size="lg"
      showCloseButton={!isMoving}
    >
      <ModalBody className="p-0">
        <div className="border-b border-slate-800 p-6">
          <h3 className="mb-3 text-sm font-medium text-slate-300">
            Move item:
          </h3>
          <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3 text-sm">
            {getFileTypeIcon(itemToMove.mimeType)}
            <span className="truncate text-slate-100">{itemToMove.name}</span>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-300">
              Choose a destination
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateFolder(!showCreateFolder)}
              className="h-7 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              <FolderPlusIcon className="mr-1 h-4 w-4" /> New folder
            </Button>
          </div>

          {showCreateFolder && (
            <div className="mb-4 rounded-lg border border-slate-700 p-3">
              <div className="flex items-center gap-2">
                <FolderIcon className="h-5 w-5 text-blue-400" />
                <Input
                  placeholder="New folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="h-8 flex-1 border-slate-700 bg-slate-800 text-slate-100"
                  autoFocus
                  disabled={isCreatingFolder}
                />
                <Button
                  size="sm"
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim() || isCreatingFolder}
                  className="h-8 bg-blue-600 text-white hover:bg-blue-500"
                >
                  {isCreatingFolder ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            </div>
          )}

          <ScrollArea className="h-64 rounded-lg border border-slate-800">
            <div className="space-y-1 p-2">
              {isLoadingTree ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : (
                <>
                  <FolderTreeItem
                    key="root"
                    folder={{ id: 0, name: 'My Drive' } as Item}
                    level={0}
                    selectedId={selectedFolder?.id ?? -1}
                    onSelect={setSelectedFolder}
                  />
                  <div className="pl-5">
                    {allRootFolders.map((folder) => (
                      <FolderTreeItem
                        key={folder.id}
                        folder={folder}
                        level={1}
                        selectedId={selectedFolder?.id ?? -1}
                        onSelect={setSelectedFolder}
                      />
                    ))}
                  </div>
                  {isFetchingNextPage && (
                    <div className="p-2 text-center text-xs text-slate-400">
                      <LoadingSpinner size="sm" variant={'dots'} />
                    </div>
                  )}
                  <div ref={ref} className="h-1" />
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-slate-400">
            Moving to:{' '}
            <span className="font-medium text-blue-300">
              {selectedFolder?.name || '...'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isMoving}
              className="text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={!canMove || isMoving}
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              {isMoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Moving...
                </>
              ) : (
                'Move Here'
              )}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  )
}
