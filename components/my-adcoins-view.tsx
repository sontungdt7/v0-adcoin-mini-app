"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, XCircle, ExternalLink } from "lucide-react"

// Mock data for demonstration
const allAdcoins = [
  {
    id: "1",
    advertiserAddress: "cryptowhale.base.eth",
    creatorAddress: "yourname.base.eth",
    targetCoin: {
      name: "DEGEN",
      symbol: "DEGEN",
      thumbnail: "/degen-coin.jpg",
    },
    creatorCoin: {
      name: "BASED",
      symbol: "BASED",
      thumbnail: "/creator-coin.jpg",
    },
    creatorSpend: 100,
    advertiserSpend: 150,
    status: "OPEN" as const,
    expiresIn: "12h",
    createdAt: "2 days ago",
  },
  {
    id: "2",
    advertiserAddress: "builder.base.eth",
    creatorAddress: "yourname.base.eth",
    targetCoin: {
      name: "HIGHER",
      symbol: "HIGHER",
      thumbnail: "/higher-coin.jpg",
    },
    creatorCoin: {
      name: "ONCHAIN",
      symbol: "ONCHAIN",
      thumbnail: "/creator-coin.jpg",
    },
    creatorSpend: 50,
    advertiserSpend: 75,
    status: "FILLED" as const,
    executedAt: "1 day ago",
  },
  {
    id: "3",
    advertiserAddress: "marketer.base.eth",
    creatorAddress: "yourname.base.eth",
    targetCoin: {
      name: "BASE",
      symbol: "BASE",
      thumbnail: "/base-coin.jpg",
    },
    creatorCoin: {
      name: "WEB3",
      symbol: "WEB3",
      thumbnail: "/creator-coin.jpg",
    },
    creatorSpend: 200,
    advertiserSpend: 300,
    status: "EXPIRED" as const,
    expiredAt: "3 hours ago",
  },
  {
    id: "4",
    advertiserAddress: "nftcollector.base.eth",
    creatorAddress: "yourname.base.eth",
    targetCoin: {
      name: "SUPER",
      symbol: "SUPER",
      thumbnail: "/creator-coin.jpg",
    },
    creatorCoin: {
      name: "YOUR",
      symbol: "YOUR",
      thumbnail: "/creator-coin.jpg",
    },
    creatorSpend: 75,
    advertiserSpend: 100,
    status: "REFUNDED" as const,
    refundedAt: "1 week ago",
  },
]

export function MyAdcoinsView() {
  const getStatusBadge = (status: string, expiresIn?: string) => {
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
      case "REFUNDED":
        return (
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Refunded
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">My Adcoins</h2>
        <p className="text-sm text-muted-foreground">Track all your Adcoin offers</p>
      </div>

      <div className="space-y-4">
        {allAdcoins.map((adcoin) => (
          <Card key={adcoin.id} className="overflow-hidden border-border">
            <CardContent className="p-0">
              <div className="p-4 pb-3 flex items-center gap-3 border-b border-border/50">
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                    <img
                      src={adcoin.creatorCoin.thumbnail || "/placeholder.svg"}
                      alt={adcoin.creatorCoin.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold">{adcoin.creatorCoin.symbol}</span>
                  <span className="text-muted-foreground">×</span>
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-muted">
                    <img
                      src={adcoin.targetCoin.thumbnail || "/placeholder.svg"}
                      alt={adcoin.targetCoin.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold">{adcoin.targetCoin.symbol}</span>
                </div>
                {getStatusBadge(adcoin.status, adcoin.expiresIn)}
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <p className="text-base leading-relaxed text-balance">
                    <span className="font-mono text-sm text-primary">{adcoin.advertiserAddress}</span> commits{" "}
                    <span className="font-bold text-foreground">{adcoin.advertiserSpend} USDC</span> to buy{" "}
                    <span className="font-bold text-primary">{adcoin.creatorCoin.symbol}</span> when{" "}
                    <span className="font-mono text-sm text-primary">{adcoin.creatorAddress}</span> buys{" "}
                    <span className="font-bold text-foreground">{adcoin.creatorSpend} USDC</span> of{" "}
                    <span className="font-bold text-primary">{adcoin.targetCoin.symbol}</span>
                  </p>
                </div>

                {adcoin.status === "OPEN" && (
                  <p className="text-xs text-muted-foreground">Created {adcoin.createdAt}</p>
                )}

                {adcoin.status === "FILLED" && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Accepted {adcoin.executedAt}</p>
                    <Button size="sm" variant="ghost" className="gap-1 h-auto py-1 px-2">
                      <span className="text-xs">View transaction</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {adcoin.status === "EXPIRED" && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Expired {adcoin.expiredAt}</p>
                    <Button size="sm" variant="outline">
                      Cancel & Refund
                    </Button>
                  </div>
                )}

                {adcoin.status === "REFUNDED" && (
                  <p className="text-xs text-muted-foreground">Refunded {adcoin.refundedAt}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {allAdcoins.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No Adcoins yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
