"use client"

import type React from "react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, CheckCircle2, Loader2 } from "lucide-react"
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction"
import { useAccount } from "wagmi"
import { parseUnits, isAddress, type Address } from "viem"
import { ADCOIN_ADDRESS, ADCOIN_ABI, USDC_ADDRESS, ERC20_ABI } from "@/lib/contracts"
import { ConnectWallet } from "@coinbase/onchainkit/wallet"
import { getCoin } from "@zoralabs/coins-sdk"

const USDC_DECIMALS = 6

type CoinInfo = {
  name?: string
  symbol?: string
  imageUrl?: string
  loading?: boolean
  error?: boolean
}

export function CreateAdcoinView() {
  const { address, isConnected } = useAccount()
  const [formData, setFormData] = useState({
    commitAmount: "",
    creatorCoin: "",
    creatorAddress: "",
    targetCoinAmount: "",
    targetCoin: "",
    expiryDate: "",
  })
  const [txSuccess, setTxSuccess] = useState(false)
  const [creatorCoinInfo, setCreatorCoinInfo] = useState<CoinInfo>({})
  const [targetCoinInfo, setTargetCoinInfo] = useState<CoinInfo>({})

  useEffect(() => {
    async function fetchCreatorCoinInfo() {
      if (!formData.creatorCoin || !isAddress(formData.creatorCoin)) {
        setCreatorCoinInfo({})
        return
      }

      setCreatorCoinInfo({ loading: true })
      try {
        const response = await getCoin({
          address: formData.creatorCoin,
          chain: 8453,
        })
        const coin = response.data?.zora20Token
        if (coin) {
          const previewImage = coin.mediaContent?.previewImage
          const imageUrl = typeof previewImage === 'string'
            ? previewImage
            : previewImage?.medium || previewImage?.small || undefined
          setCreatorCoinInfo({
            name: coin.name || undefined,
            symbol: coin.symbol || undefined,
            imageUrl,
          })
        } else {
          setCreatorCoinInfo({ error: true })
        }
      } catch {
        setCreatorCoinInfo({ error: true })
      }
    }

    const timeout = setTimeout(fetchCreatorCoinInfo, 500)
    return () => clearTimeout(timeout)
  }, [formData.creatorCoin])

  useEffect(() => {
    async function fetchTargetCoinInfo() {
      if (!formData.targetCoin || !isAddress(formData.targetCoin)) {
        setTargetCoinInfo({})
        return
      }

      setTargetCoinInfo({ loading: true })
      try {
        const response = await getCoin({
          address: formData.targetCoin,
          chain: 8453,
        })
        const coin = response.data?.zora20Token
        if (coin) {
          const previewImage = coin.mediaContent?.previewImage
          const imageUrl = typeof previewImage === 'string'
            ? previewImage
            : previewImage?.medium || previewImage?.small || undefined
          setTargetCoinInfo({
            name: coin.name || undefined,
            symbol: coin.symbol || undefined,
            imageUrl,
          })
        } else {
          setTargetCoinInfo({ error: true })
        }
      } catch {
        setTargetCoinInfo({ error: true })
      }
    }

    const timeout = setTimeout(fetchTargetCoinInfo, 500)
    return () => clearTimeout(timeout)
  }, [formData.targetCoin])

  const commitAmountNum = Number.parseFloat(formData.commitAmount) || 0
  const protocolFee = (commitAmountNum * 3) / 100
  const adcoinCoinBuy = (commitAmountNum * 3) / 100
  const creatorCoinBuy = (commitAmountNum * 94) / 100

  const isFormValid = useMemo(() => {
    return (
      formData.commitAmount &&
      Number.parseFloat(formData.commitAmount) > 0 &&
      formData.creatorCoin &&
      isAddress(formData.creatorCoin) &&
      formData.creatorAddress &&
      isAddress(formData.creatorAddress) &&
      formData.targetCoinAmount &&
      Number.parseFloat(formData.targetCoinAmount) > 0 &&
      formData.targetCoin &&
      isAddress(formData.targetCoin) &&
      formData.expiryDate
    )
  }, [formData])

  const contracts = useMemo(() => {
    if (!isFormValid || !address) return []

    const yAmount = parseUnits(formData.commitAmount, USDC_DECIMALS)
    const xAmount = parseUnits(formData.targetCoinAmount, USDC_DECIMALS)
    const expiry = BigInt(Math.floor(new Date(formData.expiryDate).getTime() / 1000))

    return [
      {
        address: USDC_ADDRESS as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ADCOIN_ADDRESS, yAmount],
      },
      {
        address: ADCOIN_ADDRESS as Address,
        abi: ADCOIN_ABI,
        functionName: "createOffer",
        args: [
          formData.creatorAddress as Address,
          formData.targetCoin as Address,
          formData.creatorCoin as Address,
          xAmount,
          yAmount,
          expiry,
        ],
      },
    ]
  }, [isFormValid, address, formData])

  const handleSuccess = useCallback(() => {
    setTxSuccess(true)
    setFormData({
      commitAmount: "",
      creatorCoin: "",
      creatorAddress: "",
      targetCoinAmount: "",
      targetCoin: "",
      expiryDate: "",
    })
    setCreatorCoinInfo({})
    setTargetCoinInfo({})
    setTimeout(() => setTxSuccess(false), 5000)
  }, [])

  const handleError = useCallback((error: { message: string }) => {
    console.error("Transaction error:", error)
  }, [])

  const CoinPreview = ({ info, label }: { info: CoinInfo; label: string }) => {
    if (info.loading) {
      return (
        <div className="flex items-center gap-2 mt-1 p-1.5 bg-muted rounded">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Looking up {label}...</span>
        </div>
      )
    }
    if (info.error) {
      return (
        <div className="mt-1 p-1.5 bg-yellow-500/10 rounded">
          <span className="text-xs text-yellow-600">Not found on Zora - will still work</span>
        </div>
      )
    }
    if (info.symbol || info.name) {
      return (
        <div className="flex items-center gap-2 mt-1 p-1.5 bg-green-500/10 rounded">
          {info.imageUrl ? (
            <img src={info.imageUrl} alt={info.name} className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">{info.symbol?.[0] || "?"}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">{info.symbol}</span>
            {info.name && <span className="text-xs text-muted-foreground">{info.name}</span>}
          </div>
        </div>
      )
    }
    return null
  }

  if (txSuccess) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <Card className="border-2 border-green-500">
          <CardContent className="py-6 px-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold mb-1">Offer Created!</h2>
            <p className="text-sm text-muted-foreground">
              Your Adcoin offer has been submitted to the blockchain.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-bold mb-1">Create an Adcoin Offer</h2>
        <p className="text-sm text-muted-foreground">Make an Adcoin offer to the creator.</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <div className="text-base leading-relaxed space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">I commit</span>
                <Input
                  className="inline-flex h-9 text-base w-24"
                  type="number"
                  placeholder="100"
                  min="0"
                  step="0.01"
                  value={formData.commitAmount}
                  onChange={(e) => setFormData({ ...formData, commitAmount: e.target.value })}
                />
                <span className="font-medium">USDC to buy</span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Creator Coin:</span>
                  <Input
                    className="inline-flex h-9 text-sm font-mono flex-1 min-w-[200px]"
                    placeholder="0x..."
                    value={formData.creatorCoin}
                    onChange={(e) => setFormData({ ...formData, creatorCoin: e.target.value })}
                  />
                </div>
                <CoinPreview info={creatorCoinInfo} label="creator coin" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">when</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Creator Wallet:</span>
                <Input
                  className="inline-flex h-9 text-sm font-mono flex-1 min-w-[200px]"
                  placeholder="0x..."
                  value={formData.creatorAddress}
                  onChange={(e) => setFormData({ ...formData, creatorAddress: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">buys</span>
                <Input
                  className="inline-flex h-9 text-base w-24"
                  type="number"
                  placeholder="1"
                  min="0"
                  step="0.01"
                  value={formData.targetCoinAmount}
                  onChange={(e) => setFormData({ ...formData, targetCoinAmount: e.target.value })}
                />
                <span className="font-medium">USDC of</span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Target Coin:</span>
                  <Input
                    className="inline-flex h-9 text-sm font-mono flex-1 min-w-[200px]"
                    placeholder="0x..."
                    value={formData.targetCoin}
                    onChange={(e) => setFormData({ ...formData, targetCoin: e.target.value })}
                  />
                </div>
                <CoinPreview info={targetCoinInfo} label="target coin" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">Expires on</span>
          <Input
            type="datetime-local"
            className="inline-flex h-9 text-sm max-w-[200px]"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />
        </div>

        <Card className="bg-muted/50">
          <CardContent className="py-3 px-4">
            <h3 className="font-semibold text-sm mb-2">What happens when accepted?</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5">
                <span className="text-primary">•</span>
                <span>Creator buys the target coin</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary">•</span>
                <span>Your USDC is spent automatically</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-primary">•</span>
                <span>You receive creator coins</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {commitAmountNum > 0 && (
          <Card className="border-primary/20">
            <CardContent className="py-3 px-4">
              <h3 className="font-semibold text-sm mb-2">How your USDC is used</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    94% buy {creatorCoinInfo.symbol ? `$${creatorCoinInfo.symbol}` : "creator coin"}
                  </span>
                  <span className="font-semibold">${creatorCoinBuy.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">3% buy $Adcoin</span>
                  <span className="font-semibold">${adcoinCoinBuy.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">3% protocol fee</span>
                  <span className="font-semibold">${protocolFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between">
                  <span className="font-bold text-sm">Total</span>
                  <span className="font-bold text-sm">${commitAmountNum.toFixed(2)} USDC</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Alert className="py-2">
          <InfoIcon className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs">
            USDC locked in contract. Refund 100% after expiry if not executed.
          </AlertDescription>
        </Alert>

        {!isConnected ? (
          <div className="w-full">
            <ConnectWallet className="w-full" />
          </div>
        ) : (
          <Transaction
            chainId={8453}
            contracts={contracts}
            onSuccess={handleSuccess}
            onError={handleError}
          >
            <TransactionButton
              text="Create Adcoin Offer"
              disabled={!isFormValid}
              className="w-full text-sm h-10"
            />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>
        )}
      </div>
    </div>
  )
}
