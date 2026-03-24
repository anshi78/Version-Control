import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Web VCS Dashboard',
  description: 'Version Control System for Websites',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
