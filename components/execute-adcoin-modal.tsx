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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsExecuting(false)
    onClose()
    // In production, this would trigger a wallet connection and on-chain transaction
  }

  const protocolFeePercent = 3
  const adcoinCoinPercent = 3
  const creatorCoinPercent = 94
  const protocolFee = (adcoin.advertiserSpend * protocolFeePercent) / 100
  const adcoinCoinBuy = (adcoin.advertiserSpend * adcoinCoinPercent) / 100
  const creatorCoinBuy = (adcoin.advertiserSpend * creatorCoinPercent) / 100

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Accept Offer</DialogTitle>
          <DialogDescription>This transaction is atomic and irreversible</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={adcoin.advertiserAvatar || "/placeholder.svg"} alt={adcoin.advertiserName} />
              <AvatarFallback>{adcoin.advertiserName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{adcoin.advertiserName}</p>
              <p className="text-xs text-muted-foreground">{adcoin.advertiserAddress}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">You will buy</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                  <img
                    src={adcoin.targetCoin.thumbnail || "/placeholder.svg"}
                    alt={adcoin.targetCoin.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-lg font-bold">${adcoin.creatorSpend} USDC</p>
                  <p className="text-xs text-muted-foreground">of {adcoin.targetCoin.name}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="p-4 bg-accent rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Advertiser will receive</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                    <img
                      src={adcoin.creatorCoin.thumbnail || "/placeholder.svg"}
                      alt={adcoin.creatorCoin.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-base font-bold">${creatorCoinBuy.toFixed(2)} of your coin</p>
                    <p className="text-xs text-muted-foreground">94% of ${adcoin.advertiserSpend}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pl-[52px]">
                  + ${adcoinCoinBuy.toFixed(2)} of Adcoin coin (3%)
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm font-semibold mb-2">Advertiser's ${adcoin.advertiserSpend} Breakdown</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Protocol treasury</span>
              <span className="font-medium">
                ${protocolFee.toFixed(2)} ({protocolFeePercent}%)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Adcoin coin buy</span>
              <span className="font-medium">
                ${adcoinCoinBuy.toFixed(2)} ({adcoinCoinPercent}%)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your coin buy</span>
              <span className="font-medium">
                ${creatorCoinBuy.toFixed(2)} ({creatorCoinPercent}%)
              </span>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-xs font-medium">
              You pay no protocol fees. All fees are covered by the advertiser.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              This acceptance is atomic and cannot be undone. Ensure you have ${adcoin.creatorSpend} USDC available.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isExecuting} className="w-full bg-transparent">
            Cancel
          </Button>
          <Button onClick={handleExecute} disabled={isExecuting} className="w-full">
            {isExecuting ? "Accepting..." : "Confirm & Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
