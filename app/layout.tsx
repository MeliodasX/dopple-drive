import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { BasicHeader } from '@/components/basic-header'
import { ReactNode } from 'react'
import QueryProvider from '@/query/QueryProvider'
import { Toaster } from '@/components/ui/sonner'
import { DoppleStoreProvider } from '@/providers/dopple-store-provider'

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
  description:
    "Give your files the home they deserve. Dopple Drive is a modern, secure cloud storage solution where you can upload, organize, and preview your most important documents with a clean, fast interface. It's your digital life, decluttered"
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <script />
          <title>Dopple Drive</title>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <DoppleStoreProvider>
            <QueryProvider>
              <BasicHeader />
              {children}
            </QueryProvider>
          </DoppleStoreProvider>
          <Toaster
            position="top-right"
            expand={true}
            richColors={false}
            closeButton={true}
            toastOptions={{
              style: {
                background: 'rgb(15 23 42 / 0.9)',
                border: '1px solid rgb(51 65 85)',
                color: 'rgb(248 250 252)'
              }
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
