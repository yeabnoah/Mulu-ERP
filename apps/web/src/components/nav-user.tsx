"use client"

import * as React from "react"

import { authClient } from "@/lib/auth-client"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { EllipsisVerticalIcon, CircleUserRoundIcon, LogOutIcon } from "lucide-react"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { data: session } = authClient.useSession()
  const [mounted, setMounted] = React.useState(false)

  // Only render user-specific content after client mount to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const user = mounted ? session?.user : null

  const handleSignOut = async () => {
    await authClient.signOut()
    window.location.href = "/login"
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg grayscale" suppressHydrationWarning>
              <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "Admin"} />
              <AvatarFallback className="rounded-lg" suppressHydrationWarning>
                {mounted && user ? (user.name?.[0] ?? "A") + (user.name?.[1] ?? "D") : "..."}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium" suppressHydrationWarning>
                {mounted && user ? user.name : "Admin"}
              </span>
              <span className="text-foreground/70 truncate text-xs" suppressHydrationWarning>
                {mounted && user ? user.email : "Loading..."}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "Admin"} />
                    <AvatarFallback className="rounded-lg" suppressHydrationWarning>
                      {mounted && user ? (user.name?.[0] ?? "A") + (user.name?.[1] ?? "D") : "..."}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium" suppressHydrationWarning>
                      {mounted && user ? user.name : "Admin"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs" suppressHydrationWarning>
                      {mounted && user ? user.email : "Loading..."}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <CircleUserRoundIcon />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
