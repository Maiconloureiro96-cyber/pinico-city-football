import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

/** Mesmo basePath do next.config (GitHub Pages em subpasta) */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const metadata: Metadata = {
  title: 'Pinico City FC - Sorteio de Times',
  description: 'Sorteie times equilibrados para as peladas do Pinico City Futebol Clube',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: `${base}/icon-light-32x32.png`,
        media: '(prefers-color-scheme: light)',
      },
      {
        url: `${base}/icon-dark-32x32.png`,
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: `${base}/icon.svg`,
        type: 'image/svg+xml',
      },
    ],
    apple: `${base}/apple-icon.png`,
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
