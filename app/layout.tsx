import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Near Intents Fee Leaderboard',
  description: 'Track referral fees and performance for Near Intents',
  generator: 'Near Intents Fee Dashboard',
  openGraph: {
    title: 'Near Intents Fee Leaderboard',
    description: 'Track referral fees and performance for Near Intents',
    url: 'https://fees.surgeswap.xyz',
    siteName: 'Near Intents Fee Leaderboard',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Near Intents Fee Leaderboard Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Near Intents Fee Leaderboard',
    description: 'Track referral fees and performance for Near Intents',
    creator: '@surgecodes',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
