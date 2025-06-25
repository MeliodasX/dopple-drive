import { ReactNode } from 'react'
import { AppHeader } from '@/components/app-header'
import { FloatingButton } from '@/components/floating-button'
import { auth } from '@clerk/nextjs/server'

export default async function DriveLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  const { userId } = await auth()

  return (
    <main className="min-h-screen w-full bg-slate-950 text-slate-100">
      <AppHeader userId={userId} />
      <FloatingButton />
      {children}
    </main>
  )
}
