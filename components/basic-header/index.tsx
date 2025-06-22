import { SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export const BasicHeader = async () => {
  const { userId } = await auth()

  return (
    <>
      {!userId && (
        <header className="flex h-16 items-center justify-end gap-4 p-4">
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
        </header>
      )}
    </>
  )
}
