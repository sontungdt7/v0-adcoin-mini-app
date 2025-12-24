"use client"

import { useAccount } from "wagmi"
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet"
import { Identity, Name, Avatar as OnchainAvatar, Address } from "@coinbase/onchainkit/identity"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet as WalletIcon } from "lucide-react"

const mockUserData = {
  address: "0x742d...8f23",
  avatar: "/user-avatar.jpg",
  roles: ["Creator", "Advertiser"],
}

export function ProfileView() {
  const { address, isConnected } = useAccount()

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {isConnected && address ? (
            <>
              <div className="flex flex-col items-center gap-4 mb-6">
                <Identity
                  address={address}
                  schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
                >
                  <OnchainAvatar className="h-24 w-24" />
                  <Name className="font-semibold text-lg" />
                  <Address className="text-sm text-muted-foreground" />
                </Identity>
                <div className="flex gap-2 justify-center mt-2">
                  {mockUserData.roles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <Wallet>
                  <ConnectWallet />
                  <WalletDropdown>
                    <WalletDropdownDisconnect />
                  </WalletDropdown>
                </Wallet>
              </div>
            </>
          ) : (
            <>
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

              <div className="flex justify-center">
                <Wallet>
                  <ConnectWallet />
                </Wallet>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
