import { sonnerToast, toast } from '@/lib/toast'
import { Item, SingleItemFileResponse } from '@/types/item-types'
import { getResourceById } from '@/requests/items'
import { isSingleItemFileResponse } from '@/types/type-guards'
import { ProgressToast } from '@/components/progress-toast'

const activeDownloads = new Set<number>()
const activeControllers = new Map<number, AbortController>()

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
        prefix="Downloading"
      />
    ),
    {
      duration: Infinity,
      className:
        'w-[400px] py-2 px-4 rounded-lg border-slate-600/50 bg-slate-800/90 backdrop-blur-sm'
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
              prefix="Downloading"
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
          prefix="Downloading"
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

export const startDownloadForItem = async (item: Item) => {
  if (activeDownloads.has(item.id)) {
    toast.info(`Download for "${item.name}" is already in progress.`)
    return
  }

  const prepToastId = toast.loading(`Preparing to download ${item.name}...`)
  try {
    const response = await getResourceById(item.id)

    if (response && isSingleItemFileResponse(response)) {
      const fileToDownload = response
      sonnerToast.dismiss(prepToastId)
      downloadFile(fileToDownload)
    } else {
      throw new Error('This item is a folder and cannot be downloaded.')
    }
  } catch (error: any) {
    sonnerToast.dismiss(prepToastId)
    toast.error(error.message || 'Could not create download link.')
  }
}
