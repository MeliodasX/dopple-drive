import { FormEvent, useEffect, useState } from 'react'
import { FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal, ModalBody, ModalFooter } from '@/components/modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFolder } from '@/requests/items'
import { QueryKeys } from '@/query/QueryProvider'
import { toast } from '@/lib/toast'
import { useDoppleStore } from '@/providers/dopple-store-provider'

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateFolderModal = ({
  isOpen,
  onClose
}: CreateFolderModalProps) => {
  const [folderName, setFolderName] = useState('')
  const { currentDirectoryId } = useDoppleStore((state) => state)

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () => createFolder(folderName.trim(), currentDirectoryId),
    onSuccess: () => {
      toast.success('Successful', {
        duration: 2000,
        description: 'Folder created successfully.'
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ITEMS, currentDirectoryId]
      })
      handleClose()
    },
    onError: (error) => {
      toast.error('Failed', {
        duration: 3000,
        description: 'Unable to create folder.'
      })
    }
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!folderName.trim() || isPending) return
    mutate()
  }

  const handleClose = () => {
    setFolderName('')
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      setFolderName('')
    }
  }, [isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Folder"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/20">
              <FolderPlus className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-slate-100">New Folder</h3>
              <p className="text-sm text-slate-400">
                Create a new folder in your drive
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder-name" className="font-medium text-slate-300">
              Folder Name
            </Label>
            <Input
              id="folder-name"
              type="text"
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              autoFocus
              disabled={isPending}
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isPending}
            className="text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!folderName.trim() || isPending}
            className="bg-blue-600 text-white hover:bg-blue-500"
          >
            {isPending ? 'Creating...' : 'Create Folder'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
