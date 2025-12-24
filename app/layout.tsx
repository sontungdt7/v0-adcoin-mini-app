"use client"

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base } from "wagmi/chains"
import "@coinbase/onchainkit/styles.css"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

const URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:5000';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ""}
          chain={base}
          config={{
            appearance: {
              mode: 'auto',
            },
            wallet: {
              display: 'modal',
              preference: 'all',
            },
          }}
        >
          {children}
          <Analytics />
        </OnchainKitProvider>
      </body>
    </html>
  )
}
