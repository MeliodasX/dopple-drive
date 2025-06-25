import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface ProgressToastProps {
  progress: number
  fileName: string
  onCancel: () => void
  prefix?: string
}

export const ProgressToast = ({
  progress,
  fileName,
  onCancel,
  prefix = 'Handling'
}: ProgressToastProps) => (
  <div className="flex w-full items-start gap-4">
    <div className="mt-1 shrink-0 text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>

    <div className="flex-1 space-y-2">
      <p className="font-medium text-ellipsis text-slate-100">
        {prefix} {fileName}
      </p>
      <div className="flex items-center gap-3">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="w-10 text-right text-xs text-slate-400">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="destructive"
          onClick={onCancel}
          className="mt-1 px-2.5 py-1 text-xs"
        >
          Cancel
        </Button>
      </div>
    </div>
  </div>
)
