import { SignedIn, UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { DoppleLogo } from '@/components/dopple-logo'
import { SearchBar } from '@/components/search-bar'

export const AppHeader = async () => {
  const { userId } = await auth()

  return (
    <>
      {userId && (
        <header className="flex h-16 w-full items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
          <DoppleLogo size={'medium'} />
          <SearchBar />
          <div className="h-8 w-8 flex-shrink-0">
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>
      )}
    </>
  )
}
