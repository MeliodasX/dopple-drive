'use client'
import {
  AlertTriangle,
  FileIcon,
  FolderIcon,
  Loader2,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal, ModalBody, ModalFooter } from '@/components/modal'
import { toast } from '@/lib/toast'
import { Item } from '@/types/item-types'
import { FOLDER_MIME_TYPE } from '@/utils/constants'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDoppleStore } from '@/providers/dopple-store-provider'
import { deleteResourceById } from '@/requests/items'
import { QueryKeys } from '@/query/QueryProvider'

interface SimpleDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  item: Item | null
}

export function SimpleDeleteDialog({
  isOpen,
  onClose,
  item
}: SimpleDeleteDialogProps) {
  const queryClient = useQueryClient()
  const { currentDirectoryId } = useDoppleStore((state) => state)

  const { mutate, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteResourceById(item!.id),
    onSuccess: () => {
      toast.success(
        `${getFileFolderLabel(item!.mimeType)} deleted successfully`
      )
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ITEMS, currentDirectoryId]
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.BREADCRUMB, currentDirectoryId]
      })

      onClose()
    },
    onError: (error) => {
      toast.error('Delete failed', {
        description:
          error.message || 'Something went wrong while deleting the item'
      })
    }
  })

  const getFileFolderLabel = (mimeType: string) =>
    mimeType === FOLDER_MIME_TYPE ? 'Folder' : 'File'

  const handleDelete = () => {
    if (!item) return
    mutate()
  }

  if (!item) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Item"
      size="sm"
      showCloseButton={!isDeleting}
    >
      <ModalBody>
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-600/20">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 font-medium text-slate-100">
              Are you sure you want to delete this{' '}
              {getFileFolderLabel(item.mimeType).toLowerCase()}?
            </h3>
            <p className="text-sm text-slate-400">
              This action cannot be undone. This will permanently delete the
              file.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
          {item.mimeType === FOLDER_MIME_TYPE ? (
            <FolderIcon className="h-5 w-5 text-blue-400" />
          ) : (
            <FileIcon className="h-5 w-5 text-slate-400" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-100">
              {item.name}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {getFileFolderLabel(item.mimeType)}
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isDeleting}
          className="text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
