"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, CheckCircle2 } from "lucide-react"
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

const USDC_DECIMALS = 6

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
    setTimeout(() => setTxSuccess(false), 5000)
  }, [])

  const handleError = useCallback((error: { message: string }) => {
    console.error("Transaction error:", error)
  }, [])

  if (txSuccess) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card className="border-2 border-green-500">
          <CardContent className="pt-8 pb-8 px-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Offer Created!</h2>
            <p className="text-muted-foreground">
              Your Adcoin offer has been submitted to the blockchain.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Create an Adcoin Offer</h2>
        <p className="text-muted-foreground">Make an Adcoin offer to the creator.</p>
      </div>

      <div className="space-y-8">
        <Card className="border-2">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="text-2xl leading-relaxed space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium">I commit</span>
                <Input
                  className="inline-flex h-12 text-xl w-32"
                  type="number"
                  placeholder="100"
                  min="0"
                  step="0.01"
                  value={formData.commitAmount}
                  onChange={(e) => setFormData({ ...formData, commitAmount: e.target.value })}
                />
                <span className="font-medium">USDC to buy</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium text-base text-muted-foreground">Creator Coin Address:</span>
                <Input
                  className="inline-flex h-12 text-lg font-mono flex-1 min-w-[280px]"
                  placeholder="0x..."
                  value={formData.creatorCoin}
                  onChange={(e) => setFormData({ ...formData, creatorCoin: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium">when</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium text-base text-muted-foreground">Creator Wallet Address:</span>
                <Input
                  className="inline-flex h-12 text-lg font-mono flex-1 min-w-[280px]"
                  placeholder="0x..."
                  value={formData.creatorAddress}
                  onChange={(e) => setFormData({ ...formData, creatorAddress: e.target.value })}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium">buys</span>
                <Input
                  className="inline-flex h-12 text-xl w-32"
                  type="number"
                  placeholder="1"
                  min="0"
                  step="0.01"
                  value={formData.targetCoinAmount}
                  onChange={(e) => setFormData({ ...formData, targetCoinAmount: e.target.value })}
                />
                <span className="font-medium">USDC of</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium text-base text-muted-foreground">Target Coin Address:</span>
                <Input
                  className="inline-flex h-12 text-lg font-mono flex-1 min-w-[280px]"
                  placeholder="0x..."
                  value={formData.targetCoin}
                  onChange={(e) => setFormData({ ...formData, targetCoin: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-lg">
            <span className="font-medium">This offer expires on</span>
            <Input
              type="datetime-local"
              className="inline-flex h-11 text-base max-w-xs"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </div>
        </div>

        <Card className="bg-muted/50">
          <CardContent className="pt-6 pb-6">
            <h3 className="font-semibold text-lg mb-3">What happens when this is accepted?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>The creator buys the target coin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Your USDC is spent automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>You receive creator coins</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>This offer can only happen once</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {commitAmountNum > 0 && (
          <Card className="border-primary/20">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-semibold text-lg mb-4">How your USDC is used</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    94% buy the {"creator's"} coin and send it to your address.
                  </span>
                  <span className="font-semibold">${creatorCoinBuy.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">3% buy Adcoin coin and send them to your address.</span>
                  <span className="font-semibold">${adcoinCoinBuy.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">3% goes to the Adcoin protocol</span>
                  <span className="font-semibold">${protocolFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">${commitAmountNum.toFixed(2)} USDC</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Your USDC is locked in the smart contract. Execution is atomic and trustless. You can refund 100% after
            expiry if not executed.
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
              className="w-full text-lg h-12"
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
