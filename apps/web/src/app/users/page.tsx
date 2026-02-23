"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import { PlusIcon, Trash2Icon, UserCogIcon } from "lucide-react"
import { columns } from "./columns"
import { UserForm } from "@/components/forms/user-form"
import { toast } from "sonner"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function UsersPage() {
    const queryClient = useQueryClient()
    const [selectedUsers, setSelectedUsers] = React.useState<any[]>([])
    const [bulkPromoteOpen, setBulkPromoteOpen] = React.useState(false)
    const [selectedZoneId, setSelectedZoneId] = React.useState("")
    const [bulkPastorPassword, setBulkPastorPassword] = React.useState("")

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

    // Bulk delete mutation
    const bulkDeleteMutation = useMutation({
        mutationFn: (ids: string[]) => userService.bulkDelete(ids),
        onSuccess: (data, ids) => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success(`${ids.length} users deleted successfully`)
            setSelectedUsers([])
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to delete users")
        },
    })

    const bulkPromoteMutation = useMutation({
        mutationFn: async ({ ids, zoneId, password }: { ids: string[]; zoneId: string; password: string }) => {
            await userService.bulkPromoteToPastor(ids, zoneId)
            if (password.trim().length >= 8) {
                for (const id of ids) {
                    await userService.setPassword(id, password)
                }
            }
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success(`${variables.ids.length} users promoted to pastor. They can log in at /pastor with their email and the password you set.`)
            setSelectedUsers([])
            setBulkPromoteOpen(false)
            setSelectedZoneId("")
            setBulkPastorPassword("")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to promote users")
        },
    })

    const filters: DataTableFilterOption<typeof users>[] = React.useMemo(() => [
        {
            id: "roles",
            label: "Role",
            multiSelect: true,
            options: (roles || []).map((role: { name: string }) => ({
                label: role.name,
                value: role.name.toLowerCase(),
            })),
        },
        {
            id: "family",
            label: "Family",
            multiSelect: true,
            options: (families || []).map((family: { name: string }) => ({
                label: family.name,
                value: family.name.toLowerCase(),
            })),
        },
        {
            id: "zone",
            label: "Zone",
            multiSelect: true,
            options: (zones || []).map((zone: { name: string }) => ({
                label: zone.name,
                value: zone.name.toLowerCase(),
            })),
        },
        {
            id: "currentMinistry",
            label: "Ministry",
            multiSelect: true,
            options: (ministries || []).map((ministry: { name: string }) => ({
                label: ministry.name,
                value: ministry.name.toLowerCase(),
            })),
        },
        {
            id: "marriageStatus",
            label: "Marriage Status",
            multiSelect: true,
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
            multiSelect: true,
            options: [
                { label: "Baptized", value: "baptized" },
                { label: "Not Baptized", value: "not-baptized" },
            ],
        },
        {
            id: "fromOtherChurch",
            label: "From Other Church",
            multiSelect: true,
            options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
            ],
        },
    ], [roles, families, zones, ministries])

    const handleSelectionChange = (selectedRows: any[]) => {
        setSelectedUsers(selectedRows)
    }

    const handleBulkDelete = () => {
        if (selectedUsers.length === 0) return
        const ids = selectedUsers.map((u) => u.id)
        bulkDeleteMutation.mutate(ids)
    }

    const handleBulkPromote = () => {
        if (selectedUsers.length === 0 || !selectedZoneId || !bulkPastorPassword || bulkPastorPassword.length < 8) return
        const ids = selectedUsers.map((u) => u.id)
        bulkPromoteMutation.mutate({ ids, zoneId: selectedZoneId, password: bulkPastorPassword })
    }

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
                    <div className="@container/main flex flex-1 flex-col gap-6 p-6 lg:gap-8 lg:p-8">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            <div className="px-4 lg:px-6">
                                {/* Bulk Actions Bar */}
                                {selectedUsers.length > 0 && (
                                    <div className="mb-4 flex items-center gap-2 p-2 bg-muted rounded-lg">
                                        <span className="text-sm font-medium">
                                            {selectedUsers.length} user(s) selected
                                        </span>
                                        <div className="ml-auto flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setBulkPromoteOpen(true)}
                                            >
                                                <UserCogIcon className="mr-2 h-4 w-4" />
                                                Promote to Pastor
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleBulkDelete}
                                                disabled={bulkDeleteMutation.isPending}
                                            >
                                                <Trash2Icon className="mr-2 h-4 w-4" />
                                                {bulkDeleteMutation.isPending ? "Deleting..." : "Delete"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <DataTable
                                    title="User Management"
                                    columns={columns}
                                    data={users || []}
                                    headerActions={<UserForm />}
                                    isLoading={isLoading}
                                    filters={filters}
                                    onSelectionChange={handleSelectionChange}
                                    searchPlaceholder="Search users..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>

            {/* Bulk Promote Sheet */}
            <Sheet open={bulkPromoteOpen} onOpenChange={setBulkPromoteOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Bulk Promote to Pastor</SheetTitle>
                        <SheetDescription>
                            Promote {selectedUsers.length} users to pastor, assign a zone, and set a login password for /pastor.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="zone" className="text-right">
                                Zone
                            </Label>
                            <Select value={selectedZoneId} onValueChange={(value) => setSelectedZoneId(value || "")}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a zone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {zones?.map((zone: any) => (
                                        <SelectItem key={zone.id} value={zone.id}>
                                            {zone.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bulk-pastor-password" className="text-right">
                                Login password
                            </Label>
                            <Input
                                id="bulk-pastor-password"
                                type="password"
                                placeholder="Min. 8 characters (same for all)"
                                className="col-span-3"
                                value={bulkPastorPassword}
                                onChange={(e) => setBulkPastorPassword(e.target.value)}
                                minLength={8}
                            />
                            <p className="col-span-3 col-start-2 text-xs text-muted-foreground">
                                Each pastor will sign in at /pastor with their email + this password.
                            </p>
                        </div>
                    </div>
                    <SheetFooter>
                        <Button variant="outline" onClick={() => setBulkPromoteOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkPromote}
                            disabled={!selectedZoneId || !bulkPastorPassword || bulkPastorPassword.length < 8 || bulkPromoteMutation.isPending}
                        >
                            {bulkPromoteMutation.isPending ? "Promoting..." : "Promote"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </SidebarProvider>
    )
}
