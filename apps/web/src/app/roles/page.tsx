"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { roleService } from "@/services/role.service"
import { DataTable } from "@/components/data-table"
import { columns } from "./columns"
import { RoleForm } from "@/components/forms/role-form"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Page() {
    const queryClient = useQueryClient()

    const { data: roles, isLoading } = useQuery({
        queryKey: ["roles"],
        queryFn: () => roleService.getAll(),
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
                <SiteHeader title="Roles" />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold">Roles</h1>
                            <RoleForm />
                        </div>
                        {isLoading ? (
                            <div>Loading...</div>
                        ) : (
                            <DataTable columns={columns} data={roles || []} />
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
