const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api`

export const doGet = async (url: string) => {
  return await fetch(`${apiUrl}${url}`)
}

export const doPost = async (url: string, data: object) => {
  return await fetch(`${apiUrl}${url}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      contentType: 'application/json'
    }
  })
}

export const doPut = async (url: string, data: object) => {
  return await fetch(`${apiUrl}${url}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      contentType: 'application/json'
    }
  })
}

export const doDelete = async (url: string) => {
  return await fetch(`${apiUrl}${url}`, {
    method: 'DELETE'
  })
}

export const doPostFormData = async (url: string, formData: FormData) => {
  return await fetch(`${apiUrl}${url}`, {
    method: 'POST',
    body: formData,
    headers: {
      contentType: 'multipart/form-data'
    }
  })
}
