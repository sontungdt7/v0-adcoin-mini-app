"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, ArrowLeft, Info } from "lucide-react"
import type { AdcoinOffer } from "@/lib/types"

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface AcceptOfferViewProps {
  adcoin: AdcoinOffer
  onBack: () => void
}

export function AcceptOfferView({ adcoin, onBack }: AcceptOfferViewProps) {
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecute = async () => {
    setIsExecuting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsExecuting(false)
    onBack()
  }

  const treasuryFeePercent = 3
  const adcoinBuyPercent = 3
  const creatorCoinPercent = 94

  const treasuryFee = (adcoin.yAmount * treasuryFeePercent) / 100
  const adcoinBuy = (adcoin.yAmount * adcoinBuyPercent) / 100
  const creatorCoinBuy = (adcoin.yAmount * creatorCoinPercent) / 100

  const estimatedTargetTokens = adcoin.xAmount * 100
  const estimatedCreatorTokens = creatorCoinBuy * 50

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack} disabled={isExecuting}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Accept Offer</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-muted-foreground mb-6">Review the swap details below</p>

        <div className="space-y-4">
          <div className="p-4 bg-accent rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              <span>You swap</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">USDC</span>
                </div>
                <div>
                  <p className="text-lg font-bold">${adcoin.xAmount} USDC</p>
                </div>
              </div>
              <ArrowDownUp className="h-5 w-5 text-muted-foreground rotate-90" />
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-lg font-bold text-right">{estimatedTargetTokens.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground text-right font-mono">{truncateAddress(adcoin.targetCoin)}</p>
                </div>
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-accent rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              <span>Brand swaps</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-muted-foreground">USDC</span>
                </div>
                <div>
                  <p className="text-lg font-bold">${creatorCoinBuy.toFixed(0)} USDC</p>
                  <p className="text-xs text-muted-foreground">94% of ${adcoin.yAmount}</p>
                </div>
              </div>
              <ArrowDownUp className="h-5 w-5 text-muted-foreground rotate-90" />
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-lg font-bold text-right">{estimatedCreatorTokens.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground text-right font-mono">{truncateAddress(adcoin.creatorCoin)}</p>
                </div>
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span>Protocol Fee</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">3% to Treasury</span>
                <span className="font-medium">${treasuryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">3% buys $Adcoin → Brand Wallet</span>
                <span className="font-medium">${adcoinBuy.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Advertiser:</span>{" "}
              <span className="font-mono">{truncateAddress(adcoin.advertiser)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <Button onClick={handleExecute} disabled={isExecuting} className="w-full" size="lg">
          {isExecuting ? "Processing..." : "Confirm Swap"}
        </Button>
        <Button variant="outline" onClick={onBack} disabled={isExecuting} className="w-full bg-transparent" size="lg">
          Cancel
        </Button>
      </div>
    </div>
  )
}
