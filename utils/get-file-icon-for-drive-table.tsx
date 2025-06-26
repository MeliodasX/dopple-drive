import {
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FilmIcon,
  FolderIcon,
  ImageIcon,
  MusicIcon
} from 'lucide-react'

export const getFileIconForDriveTable = (type: string) => {
  switch (type) {
    case 'folder':
      return <FolderIcon className="h-5 w-5 text-blue-400" />
    case 'image':
      return <ImageIcon className="h-5 w-5 text-green-400" />
    case 'audio':
      return <MusicIcon className="h-5 w-5 text-green-400" />
    case 'document':
      return <FileTextIcon className="h-5 w-5 text-blue-300" />
    case 'spreadsheet':
      return <FileSpreadsheetIcon className="h-5 w-5 text-green-500" />
    case 'video':
      return <FilmIcon className="h-5 w-5 text-purple-400" />
    case 'presentation':
      return <FileIcon className="h-5 w-5 text-orange-400" />
    default:
      return <FileIcon className="h-5 w-5 text-slate-400" />
  }
}
