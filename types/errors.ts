export enum SuccessCodes {
  OK = 'OK',
  CREATED = 'CREATED',
  ACCEPTED = 'ACCEPTED',
  NO_CONTENT = 'NO_CONTENT'
}

export enum ErrorCodes {
  BAD_REQUEST = 'BAD_REQUEST', // General invalid request
  UNAUTHORIZED = 'UNAUTHORIZED', // No token or invalid token format
  FORBIDDEN = 'FORBIDDEN', // User lacks permission
  NOT_FOUND = 'NOT_FOUND', // Resource doesn't exist
  VALIDATION_ERROR = 'VALIDATION_ERROR', // Schema validation failure
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export const ErrorMessages = {
  [ErrorCodes.BAD_REQUEST]: 'Invalid request parameters',
  [ErrorCodes.UNAUTHORIZED]: 'Unauthorized access. Please log in to continue',
  [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found',
  [ErrorCodes.VALIDATION_ERROR]: 'Request validation failed',
  [ErrorCodes.CONFLICT]: 'Resource conflicts with another resource',
  [ErrorCodes.INTERNAL_SERVER_ERROR]:
    'Server ran into issues with your request.'
} as const

export const HttpStatusCodes = {
  [SuccessCodes.OK]: 200,
  [SuccessCodes.CREATED]: 201,
  [SuccessCodes.ACCEPTED]: 202,
  [SuccessCodes.NO_CONTENT]: 204,
  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.VALIDATION_ERROR]: 422,
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 500
} as const
