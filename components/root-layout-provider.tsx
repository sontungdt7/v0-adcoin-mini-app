"use client"

import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base } from "wagmi/chains"
import "@coinbase/onchainkit/styles.css"
import "@/app/globals.css"

export function RootLayoutProvider({ children }: { children: React.ReactNode }) {
  return (
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
    </OnchainKitProvider>
  )
}
