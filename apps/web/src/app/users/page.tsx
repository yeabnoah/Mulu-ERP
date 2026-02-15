"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { userService } from "@/services/user.service"
import { roleService } from "@/services/role.service"
import { familyService } from "@/services/family.service"
import { zoneService } from "@/services/zone.service"
import { ministryService } from "@/services/ministry.service"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable, type DataTableFilterOption } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { columns } from "./columns"
import { UserForm } from "@/components/forms/user-form"

export default function UsersPage() {
    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => userService.getAll(),
    })

    const { data: roles } = useQuery({
        queryKey: ["roles"],
        queryFn: () => roleService.getAll(),
    })

    const { data: families } = useQuery({
        queryKey: ["families"],
        queryFn: () => familyService.getAll(),
    })

    const { data: zones } = useQuery({
        queryKey: ["zones"],
        queryFn: () => zoneService.getAll(),
    })

    const { data: ministries } = useQuery({
        queryKey: ["ministries"],
        queryFn: () => ministryService.getAll(),
    })

    const filters: DataTableFilterOption<typeof users>[] = React.useMemo(() => [
        {
            id: "roles",
            label: "Role",
            options: (roles || []).map((role: { name: string }) => ({
                label: role.name,
                value: role.name.toLowerCase(),
            })),
        },
        {
            id: "family",
            label: "Family",
            options: (families || []).map((family: { name: string }) => ({
                label: family.name,
                value: family.name.toLowerCase(),
            })),
        },
        {
            id: "zone",
            label: "Zone",
            options: (zones || []).map((zone: { name: string }) => ({
                label: zone.name,
                value: zone.name.toLowerCase(),
            })),
        },
        {
            id: "currentMinistry",
            label: "Ministry",
            options: (ministries || []).map((ministry: { name: string }) => ({
                label: ministry.name,
                value: ministry.name.toLowerCase(),
            })),
        },
        {
            id: "marriageStatus",
            label: "Marriage Status",
            options: [
                { label: "Single", value: "single" },
                { label: "Married", value: "married" },
                { label: "Widow", value: "widow" },
                { label: "Divorced", value: "divorced" },
            ],
        },
        {
            id: "baptizedYear",
            label: "Baptized",
            options: [
                { label: "Baptized", value: "baptized" },
                { label: "Not Baptized", value: "not-baptized" },
            ],
        },
        {
            id: "fromOtherChurch",
            label: "From Other Church",
            options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
            ],
        },
    ], [roles, families, zones, ministries])

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
                                    title="User Management"
                                    columns={columns}
                                    data={users || []}
                                    headerActions={<UserForm />}
                                    isLoading={isLoading}
                                    filters={filters}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
