import React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PwaRegister } from "@/components/pwa-register"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

/** Mesmo basePath do next.config (GitHub Pages em subpasta) */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export const metadata: Metadata = {
  title: "Pinico City FC - Sorteio de Times",
  description:
    "Sorteie times equilibrados para as peladas do Pinico City Futebol Clube",
  generator: "v0.app",
  applicationName: "Pinico City FC",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pinico City",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: `${base}/icon-light-32x32.png`,
        media: "(prefers-color-scheme: light)",
      },
      {
        url: `${base}/icon-dark-32x32.png`,
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: `${base}/icon.svg`,
        type: "image/svg+xml",
      },
      {
        url: `${base}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: `${base}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: `${base}/apple-icon.png`,
  },
}

export const viewport: Viewport = {
  themeColor: "#1a2744",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  )
}
