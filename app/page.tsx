"use client";

import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { ExploreView } from "@/components/explore-view";
import { CreateAdcoinView } from "@/components/create-adcoin-view";
import { MyAdcoinsView } from "@/components/my-adcoins-view";
import { ProfileView } from "@/components/profile-view";
import { AcceptOfferView } from "@/components/accept-offer-view";
import { BottomNav } from "@/components/bottom-nav";

type AdcoinOffer = {
  id: string;
  advertiserName: string;
  advertiserAddress: string;
  advertiserAvatar: string;
  targetCoin: {
    name: string;
    symbol: string;
    thumbnail: string;
  };
  creatorCoin: {
    name: string;
    symbol: string;
    thumbnail: string;
  };
  creatorSpend: number;
  advertiserSpend: number;
};

export default function AdcoinApp() {
  const [activeTab, setActiveTab] = useState<
    "explore" | "create" | "my-adcoins" | "profile"
  >("explore");
  const [selectedOffer, setSelectedOffer] = useState<AdcoinOffer | null>(null);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  if (selectedOffer) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <AcceptOfferView
          adcoin={selectedOffer}
          onBack={() => setSelectedOffer(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "explore" && (
          <ExploreView onAcceptOffer={setSelectedOffer} />
        )}
        {activeTab === "create" && <CreateAdcoinView />}
        {activeTab === "my-adcoins" && <MyAdcoinsView />}
        {activeTab === "profile" && <ProfileView />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
