'use client'

import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Download,
  FileX as FileXIcon,
  Loader2,
  Volume2Icon,
  X
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { isSingleItemFileResponse } from '@/types/type-guards'
import { QueryKeys, QueryType } from '@/query/QueryProvider'
import { SingleItemFileResponse } from '@/types/item-types'
import { getResourceById } from '@/requests/items'
import { downloadFile } from '@/services/download-manager'

const getFileCategory = (mimeType?: string) => {
  if (!mimeType) return 'unknown'
  const mainType = mimeType.split('/')[0]
  if (mainType === 'image') return 'image'
  if (mainType === 'video') return 'video'
  if (mainType === 'audio') return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  return 'unknown'
}

const handleDownload = (file: SingleItemFileResponse | undefined | null) => {
  if (!file?.signedUrl) return
  downloadFile(file)
}

const ImagePreview = ({ file }: { file: SingleItemFileResponse }) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <img
        src={file.signedUrl}
        alt={file.name}
        className="block max-h-full max-w-full object-contain"
      />
    </div>
  )
}

const VideoPreview = ({ file }: { file: SingleItemFileResponse }) => (
  <div className="flex h-full items-center justify-center bg-black">
    <video
      src={file.signedUrl}
      className="max-h-full max-w-full"
      controls
      autoPlay
    >
      Your browser does not support the video tag.
    </video>
  </div>
)

const AudioPreview = ({ file }: { file: SingleItemFileResponse }) => (
  <div className="flex h-full flex-col items-center justify-center bg-slate-900 p-8">
    <Volume2Icon className="mb-8 h-24 w-24 text-orange-400" />
    <p className="mb-4 text-xl font-medium text-slate-100">{file.name}</p>
    <audio src={file.signedUrl} controls autoPlay className="w-full max-w-md">
      Your browser does not support the audio element.
    </audio>
  </div>
)

const PdfPreview = ({ file }: { file: SingleItemFileResponse }) => (
  <div className="h-full w-full bg-slate-500">
    <iframe
      src={file.signedUrl}
      className="h-full w-full border-0"
      title={`Preview of ${file.name}`}
    />
  </div>
)

const UnsupportedPreview = ({ file }: { file: SingleItemFileResponse }) => (
  <div className="flex h-full flex-col items-center justify-center bg-slate-900 p-8 text-center">
    <FileXIcon className="mb-6 h-24 w-24 text-slate-600" />
    <h3 className="mb-2 text-xl font-semibold text-slate-100">{file.name}</h3>
    <p className="mb-6 text-slate-400">This file type cannot be previewed.</p>
    <Button
      onClick={() => handleDownload(file)}
      className="bg-blue-600 text-white hover:bg-blue-500"
    >
      <Download className="mr-2 h-4 w-4" />
      Download File
    </Button>
  </div>
)

interface PreviewHeaderProps {
  file: SingleItemFileResponse | undefined | null
  onClose: () => void
}

const PreviewHeader = ({ file, onClose }: PreviewHeaderProps) => {
  return (
    <header className="absolute top-0 right-0 left-0 z-10 flex h-16 items-center justify-between gap-4 bg-gradient-to-b from-black/50 to-transparent p-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-9 w-9 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h2 className="truncate font-medium text-white">
            {file?.name || 'Loading...'}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDownload(file)}
          disabled={!file}
          className="text-white hover:bg-white/10"
        >
          <Download className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10 md:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileId: number | null
}

export const FilePreviewModal = ({
  isOpen,
  onClose,
  fileId
}: FilePreviewModalProps) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.ITEMS, QueryType.SINGLE, fileId],
    queryFn: () => getResourceById(fileId ?? -1),
    enabled: !!fileId && isOpen,
    staleTime: 60 * 60 * 1000
  })

  const file = isSingleItemFileResponse(data) ? data : null

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      )
    }
    if (isError) {
      return (
        <div className="flex h-full items-center justify-center p-4 text-center">
          <p className="text-red-400">{error.message}</p>
        </div>
      )
    }
    if (!file) {
      return (
        <UnsupportedPreview
          file={
            {
              name: 'File not found',
              mimeType: 'unknown'
            } as SingleItemFileResponse
          }
        />
      )
    }

    const category = getFileCategory(file.mimeType)
    switch (category) {
      case 'image':
        return <ImagePreview file={file} />
      case 'video':
        return <VideoPreview file={file} />
      case 'audio':
        return <AudioPreview file={file} />
      case 'pdf':
        return <PdfPreview file={file} />
      default:
        return <UnsupportedPreview file={file} />
    }
  }

  return (
    <div
      className="animate-in fade-in-0 fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex h-full w-full flex-col">
        <PreviewHeader file={file} onClose={onClose} />
        <main className="min-h-0 flex-1 pt-16">{renderContent()}</main>
      </div>
    </div>
  )
}
