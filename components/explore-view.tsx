"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { ExecuteAdcoinModal } from "@/components/execute-adcoin-modal";

// Mock data for demonstration
const mockAdcoins = [
  {
    id: "1",
    advertiserName: "NewBrand",
    advertiserAddress: "newbrand.base.eth",
    advertiserAvatar: "/crypto-whale-avatar.png",
    targetCoin: {
      name: "NewBrand",
      symbol: "$NewBrand",
      thumbnail: "/degen-coin.jpg",
    },
    creatorCoin: {
      name: "CreatorCoin",
      symbol: "$CREATOR",
      thumbnail: "/creator-coin.jpg",
    },
    creatorAddress: "creator.base.eth",
    creatorSpend: 1,
    advertiserSpend: 100,
    expiresIn: "12h",
    status: "active" as const,
    forCreator: "0xYourAddress123",
  },
  {
    id: "2",
    advertiserName: "BasedBuilder",
    advertiserAddress: "builder.base.eth",
    advertiserAvatar: "/builder-avatar.png",
    targetCoin: {
      name: "BUILDER",
      symbol: "$BUILDER",
      thumbnail: "/higher-coin.jpg",
    },
    creatorCoin: {
      name: "CreatorCoin",
      symbol: "$CREATOR",
      thumbnail: "/creator-coin.jpg",
    },
    creatorAddress: "creator.base.eth",
    creatorSpend: 1,
    advertiserSpend: 50,
    expiresIn: "6h",
    status: "active" as const,
    forCreator: "0xYourAddress123",
  },
  {
    id: "3",
    advertiserName: "OnchainMarketer",
    advertiserAddress: "marketer.base.eth",
    advertiserAvatar: "/marketer-avatar.jpg",
    targetCoin: {
      name: "Marketer",
      symbol: "$Marketer",
      thumbnail: "/base-coin.jpg",
    },
    creatorCoin: {
      name: "Other Creator Coin",
      symbol: "OtherCreator",
      thumbnail: "/creator-coin.jpg",
    },
    creatorAddress: "othercreator.base.eth",
    creatorSpend: 2,
    advertiserSpend: 30,
    expiresIn: "24h",
    status: "active" as const,
    forCreator: "0xOtherCreator456",
  },
];

export function ExploreView() {
  const [selectedAdcoin, setSelectedAdcoin] = useState<
    (typeof mockAdcoins)[0] | null
  >(null);
  const [filterMode, setFilterMode] = useState<"mine" | "all">("mine");

  const currentUserAddress = "0xYourAddress123";

  const filteredAdcoins =
    filterMode === "mine"
      ? mockAdcoins.filter((adcoin) => adcoin.forCreator === currentUserAddress)
      : mockAdcoins;

  return (
    <>
      <div className="p-4 space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Available Offer</h2>
        </div>

        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={filterMode === "mine" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setFilterMode("mine")}
          >
            For Me
          </Button>
          <Button
            variant={filterMode === "all" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setFilterMode("all")}
          >
            All Creators
          </Button>
        </div>

        <div className="space-y-4">
          {filteredAdcoins.map((adcoin) => {
            const canExecute = adcoin.forCreator === currentUserAddress;

            return (
              <Card
                key={adcoin.id}
                className="overflow-hidden border-border hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="p-4 pb-3 flex items-center gap-3 border-b border-border/50">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                        <img
                          src={
                            adcoin.creatorCoin.thumbnail || "/placeholder.svg"
                          }
                          alt={adcoin.creatorCoin.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {adcoin.creatorCoin.symbol}
                      </span>
                      <span className="text-muted-foreground">×</span>
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                        <img
                          src={
                            adcoin.targetCoin.thumbnail || "/placeholder.svg"
                          }
                          alt={adcoin.targetCoin.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {adcoin.targetCoin.symbol}
                      </span>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {adcoin.expiresIn}
                    </Badge>
                  </div>

                  <div className="p-4">
                    {!canExecute && (
                      <div className="mb-3 p-2 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Offer for:{" "}
                          <span className="font-mono">{adcoin.forCreator}</span>
                        </p>
                      </div>
                    )}

                    {/* Offer Statement */}
                    <div className="mb-4">
                      <p className="text-base leading-relaxed text-balance">
                        <span className="font-mono text-sm text-primary">
                          {adcoin.advertiserAddress}
                        </span>{" "}
                        commits{" "}
                        <span className="font-bold text-foreground">
                          {adcoin.advertiserSpend} USDC
                        </span>{" "}
                        to buy{" "}
                        <span className="font-bold text-primary">
                          {adcoin.creatorCoin.symbol}
                        </span>{" "}
                        when{" "}
                        <span className="font-mono text-sm text-primary">
                          {adcoin.creatorAddress}
                        </span>{" "}
                        buys{" "}
                        <span className="font-bold text-foreground">
                          {adcoin.creatorSpend} USDC
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-primary">
                          {adcoin.targetCoin.symbol}
                        </span>
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setSelectedAdcoin(adcoin)}
                      disabled={!canExecute}
                    >
                      {canExecute ? "Accept Offer" : "Not Available for You"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredAdcoins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {filterMode === "mine"
                ? "No offers available for you yet"
                : "No active promises on the platform"}
            </p>
          </div>
        )}
      </div>

      {selectedAdcoin && (
        <ExecuteAdcoinModal
          adcoin={selectedAdcoin}
          open={!!selectedAdcoin}
          onClose={() => setSelectedAdcoin(null)}
        />
      )}
    </>
  );
}
