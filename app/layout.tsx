import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { BasicHeader } from '@/components/basic-header'
import { ReactNode } from 'react'
import QueryProvider from '@/query/QueryProvider'

const setThemeScript = `
    (function() {
      try {
        document.documentElement.classList.toggle('dark', true);
      } catch (e) {
        console.log("Unable to set theme");
      }
    })();
  `

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Dopple Drive',
  description: 'Something cool that accentuates Dopple Drive'
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script dangerouslySetInnerHTML={{ __html: setThemeScript }} />
          <title>Dopple Drive</title>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <QueryProvider>
            <BasicHeader />
            {children}
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
