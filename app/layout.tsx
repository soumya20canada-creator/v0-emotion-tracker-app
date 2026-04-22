import type { Metadata, Viewport } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { IntlProvider } from '@/components/intl-provider'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
})

export const metadata: Metadata = {
  title: 'Bhava · भाव | The felt sense of being',
  description: 'Bhava is your gentle sanctuary for emotional wellness. Name what you feel, find what helps, and come back to yourself — one breath at a time.',
  generator: 'bhava.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#3B82F6',
  userScalable: true,
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${cormorant.variable} font-sans antialiased`}>
        <IntlProvider>
          {children}
        </IntlProvider>
        <Analytics />
      </body>
    </html>
  )
}
