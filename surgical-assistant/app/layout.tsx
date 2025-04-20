import type { Metadata } from 'next'
import './globals.css'
import { VideoProvider } from './context/VideoContext'

export const metadata: Metadata = {
  title: 'Surgical Assistant',
  description: 'Powered by Cerebras AI',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
          <VideoProvider>
            {children}
          </VideoProvider>
        </body>
    </html>
  )
}
