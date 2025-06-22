import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton
} from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export const AppHeader = async () => {
  const { userId } = await auth()

  return (
    <>
      {userId && (
        <header className="flex h-16 w-full items-center justify-end gap-4 p-4">
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
      )}
    </>
  )
}
