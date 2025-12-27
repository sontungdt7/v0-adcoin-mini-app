"use client"

import { OnchainKitProvider } from "@coinbase/onchainkit"
import { baseSepolia } from "wagmi/chains"

export function RootLayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || ""}
      chain={baseSepolia}
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
