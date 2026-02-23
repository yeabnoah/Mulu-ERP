"use client"

import * as React from "react"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CommandIcon, LogOutIcon } from "lucide-react"

function PortalHeaderUser() {
  const { data: session } = authClient.useSession()
  const [mounted, setMounted] = React.useState(false)
  const user = mounted ? session?.user : null

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.href = "/login"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="relative size-9 rounded-full">
            <Avatar className="size-8">
              <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
              <AvatarFallback suppressHydrationWarning>
                {mounted && user ? (user.name?.[0] ?? "U") : "..."}
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
              <Avatar className="size-8">
                <AvatarImage src={user?.image ?? undefined} />
                <AvatarFallback suppressHydrationWarning>
                  {mounted && user ? (user.name?.[0] ?? "U") : "..."}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium" suppressHydrationWarning>
                  {mounted && user ? user.name : "User"}
                </span>
                <span className="text-muted-foreground truncate text-xs" suppressHydrationWarning>
                  {mounted && user ? user.email : "..."}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOutIcon className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PortalLayout({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 lg:px-6">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <CommandIcon className="size-6" />
          <span className="hidden sm:inline">Mulu ERP</span>
        </div>
        {title && (
          <>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-base font-medium">{title}</h1>
          </>
        )}
        <div className="ml-auto">
          <PortalHeaderUser />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
