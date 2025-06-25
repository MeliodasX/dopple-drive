import { sonnerToast, toast } from '@/lib/toast'
import { nanoid } from 'nanoid'
import { completeUpload, getPresignedUploadUrl } from '@/requests/uploads'
import { DEFAULT_FILE_MIME_TYPE } from '@/utils/constants'
import { ProgressToast } from '@/components/progress-toast'
import { QueryClient } from '@tanstack/react-query'
import { QueryKeys } from '@/query/QueryProvider'

interface UploadQueueItem {
  id: string
  file: File
  parentId: number | null
  toastId: string | number
  queryClient: QueryClient
}

const uploadState = {
  queue: [] as UploadQueueItem[],
  activeUploads: 0,
  maxConcurrentUploads: 3,
  activeControllers: new Map<string, XMLHttpRequest>()
}

const performUpload = (uploadItem: UploadQueueItem) => {
  const { id, file, parentId, toastId, queryClient } = uploadItem

  return new Promise<void>(async (resolve, reject) => {
    try {
      const fileType = file.type || DEFAULT_FILE_MIME_TYPE
      const { signedUrl, key } = await getPresignedUploadUrl(
        file.name,
        fileType
      )

      const xhr = new XMLHttpRequest()
      uploadState.activeControllers.set(id, xhr)

      const cancelUpload = () => xhr.abort()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          sonnerToast.custom(
            () => (
              <ProgressToast
                progress={progress}
                fileName={file.name}
                onCancel={cancelUpload}
                prefix="Uploading"
              />
            ),
            {
              id: toastId,
              className:
                'w-[400px] py-2 px-4 border-slate-600/50 bg-slate-800/90 backdrop-blur-sm'
            }
          )
        }
      })

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          await completeUpload({
            name: file.name,
            mimeType: fileType,
            parentId,
            key,
            url: signedUrl.split('?')[0],
            size: file.size
          })

          await queryClient.invalidateQueries({
            queryKey: [QueryKeys.ITEMS, parentId]
          })

          sonnerToast.dismiss(toastId)
          toast.success(`Successfully uploaded "${file.name}"`)
          resolve()
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        sonnerToast.dismiss(toastId)
        reject(new Error('A network error occurred.'))
      })
      xhr.addEventListener('abort', () => {
        sonnerToast.dismiss(toastId)
      })

      xhr.open('PUT', signedUrl, true)
      xhr.setRequestHeader('Content-Type', fileType)
      xhr.send(file)
    } catch (error) {
      sonnerToast.dismiss(toastId)
      reject(error)
    }
  })
}

const processQueue = () => {
  if (
    uploadState.activeUploads >= uploadState.maxConcurrentUploads ||
    uploadState.queue.length === 0
  ) {
    return
  }

  const uploadItem = uploadState.queue.shift()!
  uploadState.activeUploads++

  performUpload(uploadItem).finally(() => {
    uploadState.activeUploads--
    processQueue()
  })
}

export const uploadFiles = (
  files: File[],
  parentId: number | null,
  queryClient: QueryClient
) => {
  if (files.length === 0) return

  const queuedCount = uploadState.queue.length
  if (queuedCount > 0) {
    toast.info(
      `${queuedCount} file(s) already in queue... adding ${files.length} more.`,
      {
        duration: 2000
      }
    )
  }

  files.forEach((file) => {
    const uploadId = nanoid()
    const initialToast = toast.loading(`Queued: ${file.name}...`, {
      persistent: true
    })

    uploadState.queue.push({
      id: uploadId,
      file,
      parentId,
      toastId: initialToast,
      queryClient
    })
  })

  for (let i = 0; i < uploadState.maxConcurrentUploads; i++) {
    processQueue()
  }
}
