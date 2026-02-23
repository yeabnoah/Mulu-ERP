"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@/i18n/navigation"
import {
  LayoutDashboardIcon,
  ListIcon,
  FolderIcon,
  UsersIcon,
  DatabaseIcon,
  CommandIcon,
  ShieldIcon,
} from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("nav")
  const tCommon = useTranslations("common")

  const navMain = [
    { title: t("dashboard"), url: "/dashboard", icon: <LayoutDashboardIcon /> },
    { title: t("users"), url: "/users", icon: <UsersIcon /> },
    { title: t("ministries"), url: "/ministries", icon: <ListIcon /> },
    {
      title: t("ministryAdmin"),
      url: "/ministries-admin",
      icon: <ShieldIcon />,
    },
    { title: t("zones"), url: "/zones", icon: <DatabaseIcon /> },
    { title: t("families"), url: "/families", icon: <FolderIcon /> },
  ]

  const navSecondary: { title: string; url: string; icon: React.ReactNode }[] =
    []

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">
                {tCommon("appName")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1">
          <LocaleSwitcher />
        </div>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
