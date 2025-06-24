import { sonnerToast, toast } from '@/lib/toast'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { SingleItemFileResponse } from '@/types/item-types'
import { Loader2 } from 'lucide-react'

const activeDownloads = new Set<number>()
const activeControllers = new Map<number, AbortController>()

interface ProgressToastProps {
  progress: number
  fileName: string
  onCancel: () => void
}

const ProgressToast = ({
  progress,
  fileName,
  onCancel
}: ProgressToastProps) => (
  <div className="flex w-full items-start gap-3">
    <span className="mt-0.5 text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" />
    </span>
    <div className="flex w-full flex-col gap-2">
      <span className="font-medium text-slate-100">Downloading {fileName}</span>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-1.5" />
      <Button
        size="sm"
        variant="destructive"
        onClick={onCancel}
        className="mt-2 h-auto self-start px-2.5 py-1 text-xs"
      >
        Cancel
      </Button>
    </div>
  </div>
)

export const downloadFile = async (file: SingleItemFileResponse) => {
  if (activeDownloads.has(file.id)) {
    toast.info(`Download for "${file.name}" is already in progress.`)
    return
  }

  const controller = new AbortController()
  activeDownloads.add(file.id)
  activeControllers.set(file.id, controller)

  const cancelDownload = () => {
    controller.abort()
  }

  const downloadToastId = sonnerToast.custom(
    () => (
      <ProgressToast
        progress={0}
        fileName={file.name}
        onCancel={cancelDownload}
      />
    ),
    {
      duration: Infinity,
      className: 'border-slate-600/50 bg-slate-800/90 backdrop-blur-sm'
    }
  )

  try {
    const response = await fetch(file.signedUrl, { signal: controller.signal })
    if (!response.ok || !response.body) {
      throw new Error(`Network response was not ok: ${response.statusText}`)
    }

    const contentLength = Number(response.headers.get('Content-Length'))
    let receivedLength = 0
    const chunks: Uint8Array[] = []
    const reader = response.body.getReader()

    let lastUpdateTime = 0
    const THROTTLE_INTERVAL = 150

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      receivedLength += value.length

      const now = Date.now()
      if (contentLength && now - lastUpdateTime > THROTTLE_INTERVAL) {
        const progress = (receivedLength / contentLength) * 100
        sonnerToast.custom(
          () => (
            <ProgressToast
              progress={progress}
              fileName={file.name}
              onCancel={cancelDownload}
            />
          ),
          { id: downloadToastId }
        )
        lastUpdateTime = now
      }
    }

    sonnerToast.custom(
      () => (
        <ProgressToast
          progress={100}
          fileName={file.name}
          onCancel={() => {}}
        />
      ),
      { id: downloadToastId }
    )

    const blob = new Blob(chunks)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    sonnerToast.dismiss(downloadToastId)
    toast.success(`${file.name} downloaded successfully!`)
  } catch (error: any) {
    if (error.name === 'AbortError') {
      toast.info(`Download for "${file.name}" was cancelled.`)
    } else {
      console.error('Download failed:', error)
      toast.error(`Failed to download ${file.name}.`)
    }
    sonnerToast.dismiss(downloadToastId)
  } finally {
    activeDownloads.delete(file.id)
    activeControllers.delete(file.id)
  }
}
