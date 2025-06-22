import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { error } from '@/utils/response-wrappers'
import { ErrorCodes } from '@/types/errors'

export const checkAuthStatusOnApi = async () => {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json(error(ErrorCodes.UNAUTHORIZED))
  }
}
