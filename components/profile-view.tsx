"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

// Mock user data
const userData = {
  address: "0x742d...8f23",
  avatar: "/user-avatar.jpg",
  roles: ["Creator", "Advertiser"],
}

export function ProfileView() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={userData.avatar || "/placeholder.svg"} alt="Profile" />
              <AvatarFallback className="text-2xl">{userData.address.slice(2, 4).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <p className="font-mono text-sm font-semibold">{userData.address}</p>
              </div>
              <div className="flex gap-2 justify-center">
                {userData.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Button className="w-full bg-transparent" variant="outline">
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
