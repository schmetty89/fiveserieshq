import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'FiveSeriesHQ — The BMW 5 Series Community',
    template: '%s | FiveSeriesHQ',
  },
  description:
    'The definitive resource for BMW 5 Series owners. Forums, builds, video library, technical docs, and trusted vendors — E34 to G30.',
  keywords: ['BMW 5 Series', 'E34', 'E39', 'E60', 'F10', 'G30', 'BMW community', 'BMW forums'],
  openGraph: {
    type: 'website',
    siteName: 'FiveSeriesHQ',
    title: 'FiveSeriesHQ — The BMW 5 Series Community',
    description: 'Forums, builds, video library, technical docs, and trusted vendors — E34 to G30.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
