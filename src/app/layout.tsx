import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const BASE_URL = 'https://fiveserieshq.com'

export const viewport: Viewport = {
  themeColor: '#0f0f0f',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'FiveSeriesHQ — The BMW 5 Series Community',
    template: '%s | FiveSeriesHQ',
  },
  description:
    'The definitive BMW 5 Series community. Forums, builds, technical library, video library, trusted vendors, and events — covering every generation from E34 to G30.',
  keywords: [
    'BMW 5 Series', 'BMW E34', 'BMW E39', 'BMW E60', 'BMW F10', 'BMW G30',
    'BMW M5', 'BMW community', 'BMW forums', 'BMW technical', 'BMW builds',
    '5 Series forum', '5 Series community', 'BMW owners',
  ],
  authors: [{ name: 'FiveSeriesHQ' }],
  creator: 'FiveSeriesHQ',
  publisher: 'FiveSeriesHQ',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'FiveSeriesHQ',
    title: 'FiveSeriesHQ — The BMW 5 Series Community',
    description:
      'The definitive BMW 5 Series community. Forums, builds, technical library, video library, trusted vendors, and events — E34 to G30.',
    images: [
      {
        url: `https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'FiveSeriesHQ — The BMW 5 Series Community',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FiveSeriesHQ — The BMW 5 Series Community',
    description:
      'The definitive BMW 5 Series community — forums, builds, technical library, and more. E34 to G30.',
    images: [`https://xgfvrlrbeymronphmpii.supabase.co/storage/v1/object/public/hero-images/og-image.png`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
