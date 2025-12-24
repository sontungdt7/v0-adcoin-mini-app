"use client"

import { useAccount, useDisconnect } from "wagmi"
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  Identity,
  IdentityName,
} from "@coinbase/onchainkit/wallet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet as WalletIcon } from "lucide-react"

// Mock user data for unauthenticated state
const mockUserData = {
  address: "0x742d...8f23",
  avatar: "/user-avatar.jpg",
  roles: ["Creator", "Advertiser"],
}

export function ProfileView() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {isConnected ? (
            <>
              {/* Connected State */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <Identity
                  address={address}
                  schemaId="0xf8b05c3f618f5a94c27ec5a1c938f2ee6910d6ea0fb52b24701593482b557721"
                >
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage />
                    <AvatarFallback className="text-2xl">
                      {address?.slice(2, 4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Identity>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <WalletIcon className="h-4 w-4 text-muted-foreground" />
                    <IdentityName address={address} />
                  </div>
                  <div className="flex gap-2 justify-center">
                    {mockUserData.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Wallet>
                <WalletDropdown>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </>
          ) : (
            <>
              {/* Disconnected State - Show Connect Button */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={mockUserData.avatar || "/placeholder.svg"} alt="Profile" />
                  <AvatarFallback className="text-2xl">
                    {mockUserData.address.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">Connect your wallet to view your profile</p>
                  <div className="flex gap-2 justify-center">
                    {mockUserData.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Wallet>
                <ConnectWallet />
              </Wallet>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
