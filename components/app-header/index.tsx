'use client'

import { SignedIn, UserButton } from '@clerk/nextjs'
import { DoppleLogo } from '@/components/dopple-logo'
import { SearchBar } from '@/components/search-bar'
import { useState } from 'react'
import { useDoppleStore } from '@/providers/dopple-store-provider'
import { FilePreviewModal } from '@/components/file-preview-modal'

export const AppHeader = ({ userId }: { userId: string | null }) => {
  const [openPreviewModal, setOpenPreviewModal] = useState<boolean>(false)
  const [fileId, setFileId] = useState<number | null>(null)
  const { setDisableDropzone, setCurrentDirectoryId } = useDoppleStore(
    (state) => state
  )

  const onFileSelect = (id: number) => {
    setFileId(id)
    setOpenPreviewModal(true)
    setDisableDropzone(true)
  }

  const onFolderSelect = (id: number) => {
    setCurrentDirectoryId(id)
  }

  const handlePreviewModalClose = () => {
    setOpenPreviewModal(false)
    setFileId(null)
    setDisableDropzone(false)
  }

  return (
    <>
      {userId && (
        <>
          <FilePreviewModal
            isOpen={openPreviewModal}
            onClose={handlePreviewModalClose}
            fileId={fileId}
          />
          <header className="flex h-16 w-full items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
            <DoppleLogo />
            <SearchBar
              onFileSelect={onFileSelect}
              onFolderSelect={onFolderSelect}
            />
            <div className="h-8 w-8 flex-shrink-0">
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
        </>
      )}
    </>
  )
}
