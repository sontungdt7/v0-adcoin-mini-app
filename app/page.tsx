"use client"

import { useEffect, useState } from "react"
import { sdk } from "@farcaster/miniapp-sdk"
import { ExploreView } from "@/components/explore-view"
import { CreateAdcoinView } from "@/components/create-adcoin-view"
import { MyAdcoinsView } from "@/components/my-adcoins-view"
import { ProfileView } from "@/components/profile-view"
import { BottomNav } from "@/components/bottom-nav"

export default function AdcoinApp() {
  const [activeTab, setActiveTab] = useState<"explore" | "create" | "my-adcoins" | "profile">("explore")

  useEffect(() => {
    sdk.actions.ready()
  }, [])

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="px-4 py-4 border-b border-border">
        <h1 className="text-2xl font-bold">Adcoin</h1>
        <p className="text-xs text-muted-foreground">Connect Brands with Creators</p>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "explore" && <ExploreView />}
        {activeTab === "create" && <CreateAdcoinView />}
        {activeTab === "my-adcoins" && <MyAdcoinsView />}
        {activeTab === "profile" && <ProfileView />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
