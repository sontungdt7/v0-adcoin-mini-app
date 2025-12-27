"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react"
import { useAccount, useReadContract, useReadContracts } from "wagmi"
import { formatUnits, type Address } from "viem"
import { ADCOIN_ADDRESS, ADCOIN_ABI } from "@/lib/contracts"
import { ConnectWallet } from "@coinbase/onchainkit/wallet"

const USDC_DECIMALS = 6

type OfferStatus = "OPEN" | "FILLED" | "EXPIRED" | "CANCELLED"

type MyAdcoinOffer = {
  id: string
  advertiser: Address
  creator: Address
  targetCoin: Address
  creatorCoin: Address
  xAmount: number
  yAmount: number
  expiry: number
  executed: boolean
  cancelled: boolean
  status: OfferStatus
  expiresIn: string
  role: "advertiser" | "creator"
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatTimeRemaining(expiry: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = expiry - now
  if (diff <= 0) return "Expired"
  const hours = Math.floor(diff / 3600)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  const minutes = Math.floor((diff % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function getOfferStatus(offer: { executed: boolean; cancelled: boolean; expiry: number }): OfferStatus {
  if (offer.executed) return "FILLED"
  if (offer.cancelled) return "CANCELLED"
  const now = Math.floor(Date.now() / 1000)
  if (offer.expiry <= now) return "EXPIRED"
  return "OPEN"
}

export function MyAdcoinsView() {
  const { address, isConnected } = useAccount()

  const { data: nextOfferId, isLoading: isLoadingCount } = useReadContract({
    address: ADCOIN_ADDRESS as Address,
    abi: ADCOIN_ABI,
    functionName: "nextOfferId",
  })

  const offerCount = nextOfferId ? Number(nextOfferId) : 0

  const offerContracts = Array.from({ length: offerCount }, (_, i) => ({
    address: ADCOIN_ADDRESS as Address,
    abi: ADCOIN_ABI,
    functionName: "offers",
    args: [BigInt(i)],
  }))

  const { data: offersData, isLoading: isLoadingOffers } = useReadContracts({
    contracts: offerContracts,
  })

  const myOffers: MyAdcoinOffer[] = (offersData || [])
    .map((result, index): MyAdcoinOffer | null => {
      if (result.status !== "success" || !result.result) return null

      const data = result.result as unknown as [Address, Address, Address, Address, bigint, bigint, bigint, boolean, boolean]
      const [advertiser, creator, targetCoin, creatorCoin, xAmount, yAmount, expiry, executed, cancelled] = data

      const isAdvertiser = address?.toLowerCase() === advertiser.toLowerCase()
      const isCreator = address?.toLowerCase() === creator.toLowerCase()

      if (!isAdvertiser && !isCreator) return null

      const expiryNum = Number(expiry)
      const status = getOfferStatus({ executed, cancelled, expiry: expiryNum })

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
        status,
        expiresIn: formatTimeRemaining(expiryNum),
        role: isAdvertiser ? "advertiser" : "creator",
      }
    })
    .filter((offer): offer is MyAdcoinOffer => offer !== null)

  const isLoading = isLoadingCount || isLoadingOffers

  const getStatusBadge = (status: OfferStatus, expiresIn?: string) => {
    switch (status) {
      case "OPEN":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {expiresIn}
          </Badge>
        )
      case "FILLED":
        return (
          <Badge className="gap-1 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Filled
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Expired
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  if (!isConnected) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">My Adcoins</h2>
          <p className="text-sm text-muted-foreground">Track all your Adcoin offers</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Connect your wallet to see your offers</p>
          <ConnectWallet />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">My Adcoins</h2>
        <p className="text-sm text-muted-foreground">
          {myOffers.length} offer{myOffers.length !== 1 ? "s" : ""} on-chain
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {myOffers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden border-border">
              <CardContent className="p-0">
                <div className="p-4 pb-3 flex items-center gap-3 border-b border-border/50">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">C</span>
                    </div>
                    <span className="text-sm font-semibold font-mono">{truncateAddress(offer.creatorCoin)}</span>
                    <span className="text-muted-foreground">×</span>
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <span className="text-sm font-semibold font-mono">{truncateAddress(offer.targetCoin)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {offer.role === "advertiser" ? "Brand" : "Creator"}
                    </Badge>
                    {getStatusBadge(offer.status, offer.expiresIn)}
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-base leading-relaxed text-balance">
                      <span className="font-mono text-sm text-primary">{truncateAddress(offer.advertiser)}</span> commits{" "}
                      <span className="font-bold text-foreground">{offer.yAmount} USDC</span> to buy{" "}
                      <span className="font-bold text-primary font-mono">{truncateAddress(offer.creatorCoin)}</span> when{" "}
                      <span className="font-mono text-sm text-primary">{truncateAddress(offer.creator)}</span> buys{" "}
                      <span className="font-bold text-foreground">{offer.xAmount} USDC</span> of{" "}
                      <span className="font-bold text-primary font-mono">{truncateAddress(offer.targetCoin)}</span>
                    </p>
                  </div>

                  {offer.status === "OPEN" && (
                    <p className="text-xs text-muted-foreground">Expires in {offer.expiresIn}</p>
                  )}

                  {offer.status === "FILLED" && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Offer executed</p>
                      <Button size="sm" variant="ghost" className="gap-1 h-auto py-1 px-2">
                        <span className="text-xs">View on BaseScan</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  {offer.status === "EXPIRED" && offer.role === "advertiser" && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Expired - you can cancel to refund</p>
                      <Button size="sm" variant="outline">
                        Cancel & Refund
                      </Button>
                    </div>
                  )}

                  {offer.status === "EXPIRED" && offer.role === "creator" && (
                    <p className="text-xs text-muted-foreground">This offer has expired</p>
                  )}

                  {offer.status === "CANCELLED" && (
                    <p className="text-xs text-muted-foreground">Offer cancelled and refunded</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {myOffers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No Adcoins yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create an offer or accept one to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
