"use client"

import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-4 lg:px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md ml-12 lg:ml-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar paciente por CPF..."
          className="h-9 w-full pl-9 bg-muted/50 border-transparent focus:border-primary focus:bg-card"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
            3
          </span>
        </Button>

        {/* Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-border">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground">Patrícia Gonçalves</p>
            <p className="text-xs text-muted-foreground">Psicóloga</p>
          </div>
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src="/avatar.jpg" alt="Avatar da psicóloga" />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              MS
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
