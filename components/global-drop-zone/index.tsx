'use client'

import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { useQueryClient } from '@tanstack/react-query'
import { UploadCloud } from 'lucide-react'
import { useDoppleStore } from '@/providers/dopple-store-provider'
import { uploadFiles } from '@/services/upload-manager'
import { toast } from '@/lib/toast'

const MAX_FILE_SIZE_MB = 100
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

const Portal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  return mounted ? ReactDOM.createPortal(children, document.body) : null
}

export function GlobalDropzone() {
  const [isDragging, setIsDragging] = useState(false)
  const queryClient = useQueryClient()
  const { currentDirectoryId } = useDoppleStore((state) => state)

  const dragCounter = React.useRef(0)

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e?.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    if (e?.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      const validFiles: File[] = []

      for (const file of files) {
        if (file.size === 0 && !file.type) {
          toast.error('Folder uploads are not supported.', {
            description: 'Please drag and drop files instead.'
          })
          continue
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(`"${file.name}" is too large.`, {
            description: `File size cannot exceed ${MAX_FILE_SIZE_MB} MB.`
          })
          continue
        }
        validFiles.push(file)
      }

      if (validFiles.length > 0) {
        uploadFiles(validFiles, currentDirectoryId, queryClient)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [currentDirectoryId])

  if (!isDragging) {
    return null
  }

  return (
    <Portal>
      <div
        className="animate-in fade-in-0 fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 border-2 border-dashed border-blue-500 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      >
        <UploadCloud className="h-24 w-24 text-blue-400" />
        <p className="text-2xl font-medium text-slate-100">
          Drop files to upload
        </p>
      </div>
    </Portal>
  )
}
