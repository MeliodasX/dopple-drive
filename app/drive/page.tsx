'use client'

import { ChangeEvent } from 'react'
import { UploadMode } from '@/types/upload-types'

export default function Home() {
  const checkUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('mode', UploadMode.OVERRIDE)
        try {
          const response = await fetch('http://localhost:3000/api/file', {
            method: 'POST',
            body: formData,
            headers: {
              contentType: 'multipart/form-data'
            }
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error(errorData)
            return window.alert(errorData.message)
          }

          const result = await response.json()
          console.log('Server response:', result)
          window.alert(result)
        } catch (error) {
          console.error(error)
          return window.alert(error)
        }
      }
    }
  }

  const updateUpload = async () => {
    const payload = {
      fileName: 'Test Update'
    }

    try {
      const response = await fetch(`http://localhost:3000/api/file/${6}`, {
        method: 'DELETE',
        // body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(errorData)
        return window.alert(errorData.message)
      }

      const result = await response.json()
      console.log('Server response:', result)
      window.alert(result)
    } catch (error) {
      console.error(error)
      return window.alert(error)
    }
  }

  return (
    <div className="flex flex-col">
      Welcome to Dopple Drive
      <input type="file" id="myFile" name="filename" onChange={checkUpload} />
    </div>
  )
}
