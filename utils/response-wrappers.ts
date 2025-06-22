import { ErrorCodes, ErrorMessages, HttpStatusCodes } from '@/types/errors'

export const success = (payload?: object) => {
  return {
    success: true,
    payload: payload ?? null
  }
}

export const error = (
  code: ErrorCodes,
  message: string = '',
  details: object = {}
) => {
  const errorCode = HttpStatusCodes[code]
  const defaultMessage = ErrorMessages[code]

  return {
    success: false,
    error: {
      code: errorCode,
      message: message || defaultMessage,
      details
    }
  }
}
