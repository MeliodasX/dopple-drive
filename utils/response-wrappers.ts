import {
  ErrorCodes,
  ErrorMessages,
  HttpStatusCodes,
  SuccessCodes
} from '@/types/errors'
import { NextResponse } from 'next/server'

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

export const errorResponse = (
  code: ErrorCodes,
  message: string = '',
  details: object = {}
) => {
  return NextResponse.json(error(ErrorCodes.FORBIDDEN, message, details), {
    status: HttpStatusCodes[code]
  })
}

export const successResponse = (
  code: SuccessCodes = SuccessCodes.CREATED,
  payload?: object
) => {
  return NextResponse.json(success(payload), {
    status: HttpStatusCodes[code]
  })
}
