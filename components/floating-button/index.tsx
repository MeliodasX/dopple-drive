'use client'

import { Button } from '@/components/ui/button'
import { FolderPlus, Plus, Upload } from 'lucide-react'
import { useState } from 'react'
import { CreateFolderModal } from '@/components/create-folder-modal'
import { FileUploadModal } from '@/components/file-upload-modal'

export const FloatingButton = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [createFileOpen, setCreateFileOpen] = useState(false)

  const onCreateFolderModalClose = () => {
    setCreateFolderOpen(false)
  }

  const onCreateFileModalClose = () => {
    setCreateFileOpen(false)
  }

  return (
    <>
      <CreateFolderModal
        isOpen={createFolderOpen}
        onClose={onCreateFolderModalClose}
      />
      <FileUploadModal
        isOpen={createFileOpen}
        onClose={onCreateFileModalClose}
      />
      <div className="fixed right-6 bottom-6 z-50">
        <div
          className={`absolute right-0 bottom-16 mr-1.5 mb-1.5 flex flex-col items-end gap-3 transition-all duration-300 ${
            menuOpen
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-4 opacity-0'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-100 shadow-lg">
              Create Folder
            </span>
            <Button
              onClick={() => setCreateFolderOpen(true)}
              className="h-12 w-12 flex-shrink-0 rounded-full border border-slate-600 bg-slate-700 text-slate-100 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-slate-600"
              disabled={createFolderOpen || createFileOpen}
            >
              <FolderPlus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-100 shadow-lg">
              File Upload
            </span>
            <Button
              onClick={() => setCreateFileOpen(true)}
              disabled={createFolderOpen || createFileOpen}
              className="h-12 w-12 flex-shrink-0 rounded-full bg-blue-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-500"
            >
              <Upload className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <Button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-500 ${
            menuOpen ? 'rotate-45' : 'rotate-0'
          }`}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}
