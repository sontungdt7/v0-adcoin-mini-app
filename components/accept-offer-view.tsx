"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, ArrowLeft, Info } from "lucide-react"

interface AcceptOfferViewProps {
  adcoin: {
    id: string
    advertiserName: string
    advertiserAddress: string
    advertiserAvatar: string
    targetCoin: {
      name: string
      symbol: string
      thumbnail: string
    }
    creatorCoin: {
      name: string
      symbol: string
      thumbnail: string
    }
    creatorSpend: number
    advertiserSpend: number
  }
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

  const treasuryFeePercent = 1
  const adcoinBuyPercent = 1
  const creatorCoinPercent = 98

  const treasuryFee = (adcoin.advertiserSpend * treasuryFeePercent) / 100
  const adcoinBuy = (adcoin.advertiserSpend * adcoinBuyPercent) / 100
  const creatorCoinBuy = (adcoin.advertiserSpend * creatorCoinPercent) / 100

  const estimatedTargetTokens = adcoin.creatorSpend * 100
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
                  <p className="text-lg font-bold">${adcoin.creatorSpend} USDC</p>
                </div>
              </div>
              <ArrowDownUp className="h-5 w-5 text-muted-foreground rotate-90" />
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-lg font-bold text-right">{estimatedTargetTokens.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground text-right">{adcoin.targetCoin.symbol}</p>
                </div>
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                  <img
                    src={adcoin.targetCoin.thumbnail || "/placeholder.svg"}
                    alt={adcoin.targetCoin.name}
                    className="h-full w-full object-cover"
                  />
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
                  <p className="text-xs text-muted-foreground">98% of ${adcoin.advertiserSpend}</p>
                </div>
              </div>
              <ArrowDownUp className="h-5 w-5 text-muted-foreground rotate-90" />
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-lg font-bold text-right">{estimatedCreatorTokens.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground text-right">{adcoin.creatorCoin.symbol}</p>
                </div>
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                  <img
                    src={adcoin.creatorCoin.thumbnail || "/placeholder.svg"}
                    alt={adcoin.creatorCoin.name}
                    className="h-full w-full object-cover"
                  />
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
                <span className="text-muted-foreground">1% to Treasury</span>
                <span className="font-medium">${treasuryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">1% buys $Adcoin → Brand Wallet</span>
                <span className="font-medium">${adcoinBuy.toFixed(2)}</span>
              </div>
            </div>
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
