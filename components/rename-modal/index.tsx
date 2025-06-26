'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { AlertCircle, FileIcon, FolderIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal, ModalBody, ModalFooter } from '@/components/modal'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { FOLDER_MIME_TYPE } from '@/utils/constants'
import { Item } from '@/types/item-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useDoppleStore } from '@/providers/dopple-store-provider'
import { updateResourceById } from '@/requests/items'
import { QueryKeys } from '@/query/QueryProvider'

interface RenameModalProps {
  isOpen: boolean
  onClose: () => void
  item: Item | null
}

export const RenameModal = ({ isOpen, onClose, item }: RenameModalProps) => {
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  const queryClient = useQueryClient()
  const { currentDirectoryId } = useDoppleStore((state) => state)

  const { mutate, isPending: isRenaming } = useMutation({
    mutationFn: (name: string) => updateResourceById(item!.id, { name }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ITEMS, currentDirectoryId]
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.BREADCRUMB, currentDirectoryId]
      })

      toast.success(
        `${item?.mimeType === FOLDER_MIME_TYPE ? 'Folder' : 'File'} renamed successfully`,
        { description: `"${item?.name}" is now "${data.name}"` }
      )
      handleClose()
    },
    onError: (err) => {
      setError(err.message)
    }
  })

  useEffect(() => {
    if (item) {
      setNewName(item.name)
    }
  }, [item])

  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name cannot be empty'
    if (name.startsWith(' ') || name.endsWith(' '))
      return 'Name cannot start or end with spaces'
    return ''
  }

  const handleNameChange = (value: string) => {
    setNewName(value)
    if (error) {
      setError('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!item || isRenaming) return

    const trimmedName = newName.trim()
    const validationError = validateName(trimmedName)

    if (validationError) {
      setError(validationError)
      return
    }

    if (trimmedName === item.name) {
      handleClose()
      return
    }

    mutate(trimmedName)
  }

  const handleClose = () => {
    setNewName('')
    setError('')
    onClose()
  }

  if (!item) return null

  const getFileFolderLabel = (mimeType: string) =>
    mimeType === FOLDER_MIME_TYPE ? 'Folder' : 'File'

  const isValid = !validateName(newName.trim()) && newName.trim() !== item.name

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Rename" size="sm">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/20">
              {item.mimeType === FOLDER_MIME_TYPE ? (
                <FolderIcon className="h-6 w-6 text-blue-400" />
              ) : (
                <FileIcon className="h-6 w-6 text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-slate-100">
                Rename {getFileFolderLabel(item.mimeType)}
              </h3>
              <p className="max-w-xs truncate text-sm text-slate-400">
                Current name:{' '}
                <span className="text-slate-300">{item.name}</span>
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-name" className="font-medium text-slate-300">
              New Name
            </Label>
            <div className="relative">
              <Input
                id="new-name"
                type="text"
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
                className={cn(
                  'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20',
                  error &&
                    'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                )}
                placeholder={`Enter new name`}
                autoFocus
                disabled={isRenaming}
                maxLength={255}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 pt-1 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isRenaming}
            className="text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isRenaming}
            className="bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {isRenaming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Renaming...
              </>
            ) : (
              'Rename'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
