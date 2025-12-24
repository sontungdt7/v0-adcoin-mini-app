"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, Info } from "lucide-react"

interface ExecuteAdcoinModalProps {
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
  open: boolean
  onClose: () => void
}

export function ExecuteAdcoinModal({ adcoin, open, onClose }: ExecuteAdcoinModalProps) {
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecute = async () => {
    setIsExecuting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsExecuting(false)
    onClose()
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="text-xl">Accept Offer</DialogTitle>
          <DialogDescription>Review the swap details below</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isExecuting} className="w-full bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleExecute} disabled={isExecuting} className="w-full">
            {isExecuting ? "Processing..." : "Confirm Swap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
