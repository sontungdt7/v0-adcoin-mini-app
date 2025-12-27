"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Loader2 } from "lucide-react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatUnits, type Address } from "viem";
import { ADCOIN_ADDRESS, ADCOIN_ABI } from "@/lib/contracts";
import type { AdcoinOffer } from "@/lib/types";

const USDC_DECIMALS = 6;

interface ExploreViewProps {
  onAcceptOffer: (offer: AdcoinOffer) => void;
}

function formatTimeRemaining(expiryTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = expiryTimestamp - now;
  
  if (remaining <= 0) return "Expired";
  
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ExploreView({ onAcceptOffer }: ExploreViewProps) {
  const [filterMode, setFilterMode] = useState<"mine" | "all">("mine");
  const { address: userAddress } = useAccount();

  const { data: nextOfferId, isLoading: isLoadingCount } = useReadContract({
    address: ADCOIN_ADDRESS as Address,
    abi: ADCOIN_ABI,
    functionName: "nextOfferId",
  });

  const offerCount = nextOfferId ? Number(nextOfferId) : 0;

  const offerContracts = Array.from({ length: offerCount }, (_, i) => ({
    address: ADCOIN_ADDRESS as Address,
    abi: ADCOIN_ABI,
    functionName: "offers",
    args: [BigInt(i)],
  }));

  const { data: offersData, isLoading: isLoadingOffers } = useReadContracts({
    contracts: offerContracts,
  });

  const offers: AdcoinOffer[] = (offersData || [])
    .map((result, index): AdcoinOffer | null => {
      if (result.status !== "success" || !result.result) return null;
      
      const data = result.result as unknown as [Address, Address, Address, Address, bigint, bigint, bigint, boolean, boolean];
      const [advertiser, creator, targetCoin, creatorCoin, xAmount, yAmount, expiry, executed, cancelled] = data;
      
      if (executed || cancelled) return null;
      
      const expiryNum = Number(expiry);
      const now = Math.floor(Date.now() / 1000);
      if (expiryNum <= now) return null;

      return {
        id: index.toString(),
        advertiser,
        creator,
        targetCoin,
        creatorCoin,
        xAmount: Number(formatUnits(xAmount, USDC_DECIMALS)),
        yAmount: Number(formatUnits(yAmount, USDC_DECIMALS)),
        expiry: expiryNum,
        executed,
        cancelled,
        expiresIn: formatTimeRemaining(expiryNum),
      };
    })
    .filter((offer): offer is AdcoinOffer => offer !== null);

  const filteredOffers =
    filterMode === "mine"
      ? offers.filter(
          (offer) =>
            userAddress &&
            offer.creator.toLowerCase() === userAddress.toLowerCase()
        )
      : offers;

  const isLoading = isLoadingCount || isLoadingOffers;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-1">Available Offers</h2>
        <p className="text-sm text-muted-foreground">
          {offers.length} active offer{offers.length !== 1 ? "s" : ""} on-chain
        </p>
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => {
            const canExecute =
              userAddress &&
              offer.creator.toLowerCase() === userAddress.toLowerCase();

            return (
              <Card
                key={offer.id}
                className="overflow-hidden border-border hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-0">
                  <div className="p-4 pb-3 flex items-center gap-3 border-b border-border/50">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">C</span>
                      </div>
                      <span className="text-sm font-mono">
                        {truncateAddress(offer.creatorCoin)}
                      </span>
                      <span className="text-muted-foreground">×</span>
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">T</span>
                      </div>
                      <span className="text-sm font-mono">
                        {truncateAddress(offer.targetCoin)}
                      </span>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {offer.expiresIn}
                    </Badge>
                  </div>

                  <div className="p-4">
                    {!canExecute && (
                      <div className="mb-3 p-2 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Offer for:{" "}
                          <span className="font-mono">
                            {truncateAddress(offer.creator)}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-base leading-relaxed text-balance">
                        <span className="font-mono text-sm text-primary">
                          {truncateAddress(offer.advertiser)}
                        </span>{" "}
                        commits{" "}
                        <span className="font-bold text-foreground">
                          {offer.yAmount} USDC
                        </span>{" "}
                        to buy{" "}
                        <span className="font-mono text-sm text-primary">
                          {truncateAddress(offer.creatorCoin)}
                        </span>{" "}
                        when{" "}
                        <span className="font-mono text-sm text-primary">
                          {truncateAddress(offer.creator)}
                        </span>{" "}
                        buys{" "}
                        <span className="font-bold text-foreground">
                          {offer.xAmount} USDC
                        </span>{" "}
                        of{" "}
                        <span className="font-mono text-sm text-primary">
                          {truncateAddress(offer.targetCoin)}
                        </span>
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => onAcceptOffer(offer)}
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
      )}

      {!isLoading && filteredOffers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {filterMode === "mine"
              ? "No offers available for you yet"
              : "No active offers on the platform"}
          </p>
        </div>
      )}
    </div>
  );
}
