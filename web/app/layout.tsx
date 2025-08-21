import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Socrates',
  description: 'AI-powered audiobook player with chat capabilities',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
