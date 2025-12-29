"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, ArrowLeft, Info, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import type { AdcoinOffer } from "@/lib/types"
import { USDC_ADDRESS, ADCOIN_TOKEN_ADDRESS, ADCOIN_ADDRESS, ADCOIN_ABI } from "@/lib/contracts"
import { use0xSwapPrice } from "@/hooks/use-0x-swap"
import { formatUnits, parseUnits, type Address } from "viem"
import { getCoin } from "@zoralabs/coins-sdk"
import { useAccount } from "wagmi"
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction"
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction"
import { ConnectWallet } from "@coinbase/onchainkit/wallet"

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

type CoinInfo = {
  name?: string
  symbol?: string
  imageUrl?: string
}

type SwapQuoteData = {
  to: string
  data: string
  buyAmount: string
  minBuyAmount: string
  sellAmount: string
} | null

interface AcceptOfferViewProps {
  adcoin: AdcoinOffer
  onBack: () => void
}

const USDC_DECIMALS = 6
const ZEROX_ROUTER = "0xDef1C0ded9bec7F1a1670819833240f027b25EfF" as const

export function AcceptOfferView({ adcoin, onBack }: AcceptOfferViewProps) {
  const { address, isConnected } = useAccount()
  const [targetCoinInfo, setTargetCoinInfo] = useState<CoinInfo>({})
  const [creatorCoinInfo, setCreatorCoinInfo] = useState<CoinInfo>({})
  const [txSuccess, setTxSuccess] = useState(false)
  
  const [targetQuote, setTargetQuote] = useState<SwapQuoteData>(null)
  const [creatorQuote, setCreatorQuote] = useState<SwapQuoteData>(null)
  const [adcoinQuote, setAdcoinQuote] = useState<SwapQuoteData>(null)
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [quotesError, setQuotesError] = useState<string | null>(null)

  const treasuryFeePercent = 3
  const adcoinBuyPercent = 3
  const creatorCoinPercent = 94

  const treasuryFee = (adcoin.yAmount * treasuryFeePercent) / 100
  const adcoinBuy = (adcoin.yAmount * adcoinBuyPercent) / 100
  const creatorCoinBuy = (adcoin.yAmount * creatorCoinPercent) / 100

  const xAmountInUnits = parseUnits(adcoin.xAmount.toString(), USDC_DECIMALS).toString()
  const creatorCoinBuyInUnits = parseUnits(creatorCoinBuy.toFixed(6), USDC_DECIMALS).toString()
  const adcoinBuyInUnits = parseUnits(adcoinBuy.toFixed(6), USDC_DECIMALS).toString()

  const { price: targetSwapPrice, loading: targetLoading, error: targetError } = use0xSwapPrice({
    sellToken: USDC_ADDRESS,
    buyToken: adcoin.targetCoin,
    sellAmount: xAmountInUnits,
    chainId: "8453",
    enabled: true,
  })

  const { price: creatorSwapPrice, loading: creatorLoading, error: creatorError } = use0xSwapPrice({
    sellToken: USDC_ADDRESS,
    buyToken: adcoin.creatorCoin,
    sellAmount: creatorCoinBuyInUnits,
    chainId: "8453",
    enabled: true,
  })

  const { price: adcoinSwapPrice, loading: adcoinLoading } = use0xSwapPrice({
    sellToken: USDC_ADDRESS,
    buyToken: ADCOIN_TOKEN_ADDRESS,
    sellAmount: adcoinBuyInUnits,
    chainId: "8453",
    enabled: true,
  })

  const fetchQuotes = useCallback(async () => {
    if (!address) return
    
    setQuotesLoading(true)
    setQuotesError(null)

    try {
      const fetchQuote = async (sellToken: string, buyToken: string, sellAmount: string) => {
        const params = new URLSearchParams({
          sellToken,
          buyToken,
          sellAmount,
          chainId: "8453",
          taker: address,
        })
        const response = await fetch(`/api/swap/quote?${params.toString()}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to fetch quote")
        }
        return response.json()
      }

      const [target, creator, adcoinQ] = await Promise.all([
        fetchQuote(USDC_ADDRESS, adcoin.targetCoin, xAmountInUnits),
        fetchQuote(USDC_ADDRESS, adcoin.creatorCoin, creatorCoinBuyInUnits),
        fetchQuote(USDC_ADDRESS, ADCOIN_TOKEN_ADDRESS, adcoinBuyInUnits),
      ])

      setTargetQuote(target)
      setCreatorQuote(creator)
      setAdcoinQuote(adcoinQ)
    } catch (err) {
      console.error("Error fetching quotes:", err)
      setQuotesError(err instanceof Error ? err.message : "Failed to fetch quotes")
    } finally {
      setQuotesLoading(false)
    }
  }, [address, adcoin.targetCoin, adcoin.creatorCoin, xAmountInUnits, creatorCoinBuyInUnits, adcoinBuyInUnits])

  useEffect(() => {
    async function fetchCoinInfo() {
      try {
        const [targetRes, creatorRes] = await Promise.all([
          getCoin({ address: adcoin.targetCoin, chain: 8453 }),
          getCoin({ address: adcoin.creatorCoin, chain: 8453 }),
        ])

        const targetCoin = targetRes.data?.zora20Token
        if (targetCoin) {
          const previewImage = targetCoin.mediaContent?.previewImage
          const imageUrl = typeof previewImage === 'string'
            ? previewImage
            : previewImage?.medium || previewImage?.small || undefined
          setTargetCoinInfo({
            name: targetCoin.name || undefined,
            symbol: targetCoin.symbol || undefined,
            imageUrl,
          })
        }

        const creatorCoin = creatorRes.data?.zora20Token
        if (creatorCoin) {
          const previewImage = creatorCoin.mediaContent?.previewImage
          const imageUrl = typeof previewImage === 'string'
            ? previewImage
            : previewImage?.medium || previewImage?.small || undefined
          setCreatorCoinInfo({
            name: creatorCoin.name || undefined,
            symbol: creatorCoin.symbol || undefined,
            imageUrl,
          })
        }
      } catch (err) {
        console.error("Error fetching coin info:", err)
      }
    }
    fetchCoinInfo()
  }, [adcoin.targetCoin, adcoin.creatorCoin])

  const contracts = useMemo(() => {
    if (!targetQuote || !creatorQuote || !adcoinQuote) return []

    const offerId = BigInt(adcoin.id)
    
    const creatorBuysTarget = {
      router: ZEROX_ROUTER as Address,
      calldataData: targetQuote.data as `0x${string}`,
      usdcAmount: BigInt(xAmountInUnits),
      minBuyAmount: BigInt(targetQuote.minBuyAmount || targetQuote.buyAmount),
    }

    const advertiserBuysCreator = {
      router: ZEROX_ROUTER as Address,
      calldataData: creatorQuote.data as `0x${string}`,
      usdcAmount: BigInt(creatorCoinBuyInUnits),
      minBuyAmount: BigInt(creatorQuote.minBuyAmount || creatorQuote.buyAmount),
    }

    const advertiserBuysAdcoin = {
      router: ZEROX_ROUTER as Address,
      calldataData: adcoinQuote.data as `0x${string}`,
      usdcAmount: BigInt(adcoinBuyInUnits),
      minBuyAmount: BigInt(adcoinQuote.minBuyAmount || adcoinQuote.buyAmount),
    }

    return [
      {
        address: ADCOIN_ADDRESS as Address,
        abi: ADCOIN_ABI,
        functionName: "executeOffer",
        args: [offerId, creatorBuysTarget, advertiserBuysCreator, advertiserBuysAdcoin],
      },
    ]
  }, [targetQuote, creatorQuote, adcoinQuote, adcoin.id, xAmountInUnits, creatorCoinBuyInUnits, adcoinBuyInUnits])

  const handleSuccess = useCallback(() => {
    setTxSuccess(true)
  }, [])

  const handleError = useCallback((error: { message: string }) => {
    console.error("Transaction error:", error)
  }, [])

  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log("Transaction status:", status)
  }, [])

  const formatTokenAmount = (amount: string | undefined, decimals: number = 18): string => {
    if (!amount) return "..."
    const formatted = formatUnits(BigInt(amount), decimals)
    const num = parseFloat(formatted)
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    if (num >= 1) return num.toFixed(2)
    return num.toFixed(6)
  }

  const CoinAvatar = ({ info, fallback, gradient }: { info: CoinInfo; fallback: string; gradient: string }) => (
    <div className={`h-10 w-10 rounded-full overflow-hidden ${!info.imageUrl ? gradient : ''} flex items-center justify-center`}>
      {info.imageUrl ? (
        <img src={info.imageUrl} alt={info.name || fallback} className="h-full w-full object-cover" />
      ) : (
        <span className="text-white text-xs font-bold">{info.symbol?.[0] || fallback}</span>
      )}
    </div>
  )

  const isLoading = targetLoading || creatorLoading || adcoinLoading
  const hasError = targetError || creatorError
  const quotesReady = targetQuote && creatorQuote && adcoinQuote

  if (txSuccess) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Offer Executed!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            The swap has been completed successfully.
          </p>
          <Button onClick={onBack} className="w-full">
            Back to Explore
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Accept Offer</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-muted-foreground mb-4 text-sm">Review the swap details below</p>

        <div className="space-y-3">
          <div className="p-3 bg-accent rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              <span>You swap</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">$</span>
                </div>
                <div>
                  <p className="text-base font-bold">${adcoin.xAmount} USDC</p>
                </div>
              </div>
              <ArrowDownUp className="h-4 w-4 text-muted-foreground rotate-90" />
              <div className="flex items-center gap-2">
                <div className="text-right">
                  {targetLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  ) : targetError ? (
                    <p className="text-sm text-destructive">Quote unavailable</p>
                  ) : (
                    <>
                      <p className="text-base font-bold">{formatTokenAmount(targetSwapPrice?.buyAmount)}</p>
                      <p className="text-xs text-muted-foreground">{targetCoinInfo.symbol || truncateAddress(adcoin.targetCoin)}</p>
                    </>
                  )}
                </div>
                <CoinAvatar info={targetCoinInfo} fallback="T" gradient="bg-gradient-to-br from-green-500 to-teal-500" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-accent rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              <span>Brand swaps (94% of ${adcoin.yAmount})</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">$</span>
                </div>
                <div>
                  <p className="text-base font-bold">${creatorCoinBuy.toFixed(2)} USDC</p>
                </div>
              </div>
              <ArrowDownUp className="h-4 w-4 text-muted-foreground rotate-90" />
              <div className="flex items-center gap-2">
                <div className="text-right">
                  {creatorLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  ) : creatorError ? (
                    <p className="text-sm text-destructive">Quote unavailable</p>
                  ) : (
                    <>
                      <p className="text-base font-bold">{formatTokenAmount(creatorSwapPrice?.buyAmount)}</p>
                      <p className="text-xs text-muted-foreground">{creatorCoinInfo.symbol || truncateAddress(adcoin.creatorCoin)}</p>
                    </>
                  )}
                </div>
                <CoinAvatar info={creatorCoinInfo} fallback="C" gradient="bg-gradient-to-br from-blue-500 to-purple-500" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span>Protocol Fees (6%)</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">3% to Treasury</span>
                <span className="font-medium">${treasuryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">3% buys $Adcoin for Brand</span>
                <span className="font-medium">
                  ${adcoinBuy.toFixed(2)}
                  {adcoinSwapPrice && !adcoinLoading && (
                    <span className="text-muted-foreground ml-1">
                      ({formatTokenAmount(adcoinSwapPrice.buyAmount)} $ADCOIN)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {hasError && (
            <div className="p-3 bg-destructive/10 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-xs text-destructive">Some swap quotes are unavailable.</p>
            </div>
          )}

          {quotesError && (
            <div className="p-3 bg-destructive/10 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-xs text-destructive">{quotesError}</p>
            </div>
          )}

          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Advertiser:</span>{" "}
              <span className="font-mono">{truncateAddress(adcoin.advertiser)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border space-y-2">
        {!isConnected ? (
          <ConnectWallet className="w-full" />
        ) : !quotesReady ? (
          <>
            <Button 
              onClick={fetchQuotes} 
              disabled={quotesLoading || isLoading} 
              className="w-full" 
              size="lg"
            >
              {quotesLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Fetching Quotes...
                </>
              ) : isLoading ? (
                "Loading Prices..."
              ) : (
                "Get Swap Quotes"
              )}
            </Button>
            <Button variant="outline" onClick={onBack} className="w-full bg-transparent" size="lg">
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Transaction
              chainId={8453}
              contracts={contracts}
              onSuccess={handleSuccess}
              onError={handleError}
              onStatus={handleStatus}
            >
              <TransactionButton
                text="Execute Offer"
                className="w-full text-sm"
              />
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
            <Button variant="outline" onClick={onBack} className="w-full bg-transparent" size="lg">
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
