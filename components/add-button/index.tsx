'use client'

import { FolderPlus, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export default function AddButton() {
  const handleNewFolder = () => {
    console.log('Create new folder')
  }

  const handleFileUpload = () => {
    console.log('Upload file')
  }

  const handleFolderUpload = () => {
    console.log('Upload folder')
  }

  const handleNewDocument = () => {
    console.log('Create new document')
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground h-16 w-30 rounded-2xl border shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <Plus className="h-6 w-6" />
            <span>Add</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="mt-2 w-56">
          <DropdownMenuItem
            onClick={handleNewFolder}
            className="cursor-pointer"
          >
            <FolderPlus className="mr-3 h-4 w-4" />
            New folder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleFileUpload}
            className="cursor-pointer"
          >
            <Upload className="mr-3 h-4 w-4" />
            File upload
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleFolderUpload}
            className="cursor-pointer"
          >
            <Upload className="mr-3 h-4 w-4" />
            Folder upload
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
