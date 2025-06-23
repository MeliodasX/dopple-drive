import { ReactNode } from 'react'
import { AppHeader } from '@/components/app-header'
import { FloatingButton } from '@/components/floating-button'

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <main className="min-h-screen w-full bg-slate-950 text-slate-100">
      <AppHeader />
      <FloatingButton />
      {children}
    </main>
  )
}
