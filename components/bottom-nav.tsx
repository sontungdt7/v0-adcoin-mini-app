"use client"

import { Compass, PlusCircle, Layers, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab: "explore" | "create" | "my-adcoins" | "profile"
  onTabChange: (tab: "explore" | "create" | "my-adcoins" | "profile") => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around px-2 py-3">
        <button
          onClick={() => onTabChange("explore")}
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
            activeTab === "explore" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Compass className="h-5 w-5" />
          <span className="text-xs font-medium">Explore</span>
        </button>

        <button
          onClick={() => onTabChange("create")}
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
            activeTab === "create" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <PlusCircle className="h-5 w-5" />
          <span className="text-xs font-medium">Create</span>
        </button>

        <button
          onClick={() => onTabChange("my-adcoins")}
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
            activeTab === "my-adcoins" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Layers className="h-5 w-5" />
          <span className="text-xs font-medium">My Adcoins</span>
        </button>

        <button
          onClick={() => onTabChange("profile")}
          className={cn(
            "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
            activeTab === "profile" ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <User className="h-5 w-5" />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </nav>
  )
}
