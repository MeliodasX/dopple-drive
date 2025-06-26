import { SignedOut, SignInButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { DoppleLogo } from '@/components/dopple-logo'
import { Button } from '@/components/ui/button'

export const BasicHeader = async () => {
  const { userId } = await auth()

  return (
    <>
      {!userId && (
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <DoppleLogo />
              <div className="flex h-16 items-center justify-end gap-4 p-4">
                <SignedOut>
                  <SignInButton>
                    <Button
                      asChild
                      size="lg"
                      className="bg-blue-600 px-8 py-3 text-lg text-white hover:bg-blue-500"
                    >
                      <Link href="/">Get Started</Link>
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </div>
        </header>
      )}
    </>
  )
}
