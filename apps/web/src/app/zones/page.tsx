"use client"

import { useQuery } from "@tanstack/react-query"
import { zoneService } from "@/services/zone.service"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { columns } from "./columns"
import { ZoneForm } from "@/components/forms/zone-form"

export default function ZonesPage() {
    const { data: zones, isLoading } = useQuery({
        queryKey: ["zones"],
        queryFn: () => zoneService.getAll(),
    })

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <div className="px-4 lg:px-6">
                                <DataTable
                                    title="Zone Management"
                                    columns={columns}
                                    data={zones || []}
                                    headerActions={<ZoneForm />}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
