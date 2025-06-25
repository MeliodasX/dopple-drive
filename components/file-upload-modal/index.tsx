import type React from 'react'
import { useRef, useState } from 'react'
import { File, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal, ModalBody, ModalFooter } from '@/components/modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFile } from '@/requests/items'
import { toast } from '@/lib/toast'
import { useDoppleStore } from '@/providers/dopple-store-provider'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export const FileUploadModal = ({ isOpen, onClose }: FileUploadModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { currentDirectoryId } = useDoppleStore((state) => state)

  const queryClient = useQueryClient()
  const { mutate, isPending: isUploading } = useMutation({
    mutationFn: (fileToUpload: File) =>
      createFile(fileToUpload, currentDirectoryId),
    onSuccess: () => {
      toast.success('Successful', {
        duration: 2000,
        description: 'File added successfully.'
      })
      queryClient.invalidateQueries({ queryKey: ['items', currentDirectoryId] })
      handleClose()
    },
    onError: (error) => {
      toast.error('Failed', {
        duration: 3000,
        description: 'Unable to add file.'
      })
    }
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (selectedFiles.length === 0 || isUploading) return
    mutate(selectedFiles[0])
  }

  const handleClose = () => {
    setSelectedFiles([])
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Files" size="md">
      <ModalBody>
        <div
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'} `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20">
              <Upload className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium text-slate-100">
                Drop files here or click to browse
              </h3>
              <p className="text-slate-400">
                Select multiple files to upload to your drive
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              Choose Files
            </Button>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-medium text-slate-300">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-slate-800 p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <File className="h-4 w-4 flex-shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 flex-shrink-0 text-slate-400 hover:bg-slate-700 hover:text-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          variant="ghost"
          onClick={handleClose}
          disabled={isUploading}
          className="text-slate-400 hover:bg-slate-800 hover:text-slate-100"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedFiles.length === 0 || isUploading}
          className="bg-blue-600 text-white hover:bg-blue-500"
        >
          {isUploading
            ? 'Uploading...'
            : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
