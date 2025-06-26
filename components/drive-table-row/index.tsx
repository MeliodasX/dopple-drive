import { Item } from '@/types/item-types'
import { getCategoryFromMimeType } from '@/utils/get-category-from-mime-type'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatGoogleDriveDate } from '@/utils/format-google-drive-date'
import { FOLDER_MIME_TYPE } from '@/utils/constants'
import { formatGoogleDriveFileSize } from '@/utils/format-google-drive-file-size'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  ArrowRightIcon,
  Download,
  FilePenLineIcon,
  MoreVertical,
  Trash2
} from 'lucide-react'
import { startDownloadForItem } from '@/services/download-manager'
import { getFileIconForDriveTable } from '@/utils/get-file-icon-for-drive-table'
import { Button } from '@/components/ui/button'
import { useDoppleStore } from '@/providers/dopple-store-provider'

export const DriveTableRow = ({
  item,
  onDoubleClick,
  onRename,
  onDelete,
  onMove
}: {
  item: Item
  onDoubleClick: (item: Item) => void
  onRename: (item: Item) => void
  onDelete: (item: Item) => void
  onMove: (item: Item) => void
}) => {
  const { selectedItemId, setSelectedItemId } = useDoppleStore((state) => state)
  const isSelected = selectedItemId === item.id

  return (
    <TableRow
      onClick={() => setSelectedItemId(item.id)}
      onDoubleClick={() => onDoubleClick(item)}
      className={`group cursor-pointer border-slate-800 transition-colors duration-100 ${
        isSelected ? 'bg-blue-600/20' : 'hover:bg-slate-900/40'
      }`}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          {getFileIconForDriveTable(getCategoryFromMimeType(item.mimeType))}
          <span
            className={`transition-colors group-hover:text-blue-400 ${isSelected ? 'text-blue-300' : 'text-slate-100'}`}
          >
            {item.name}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-slate-400">
        {formatGoogleDriveDate(item.updatedAt)}
      </TableCell>
      <TableCell className="text-slate-400">
        {item.mimeType !== FOLDER_MIME_TYPE
          ? formatGoogleDriveFileSize(item.size)
          : '—'}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-700 hover:text-slate-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-slate-700 bg-slate-800"
          >
            {item.mimeType !== FOLDER_MIME_TYPE && (
              <DropdownMenuItem
                onClick={() => startDownloadForItem(item)}
                className="text-slate-100 focus:bg-slate-700"
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onRename(item)}
              className="text-slate-100 focus:bg-slate-700"
            >
              <FilePenLineIcon className="mr-2 h-4 w-4" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onMove(item)}
              className="text-slate-100 focus:bg-slate-700"
            >
              <ArrowRightIcon className="mr-2 h-4 w-4" />
              Move
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="text-red-400 focus:bg-red-900/50 focus:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
