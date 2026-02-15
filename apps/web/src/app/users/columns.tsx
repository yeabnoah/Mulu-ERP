"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "@/services/user.service"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { EllipsisVerticalIcon } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export type User = {
    id: string
    name: string
    email: string
    image?: string | null
    roles?: { role: { name: string }, roleId: string }[]
    family?: { name: string, description?: string | null } | null
    zone?: { name: string } | null
    currentMinistry?: { name: string } | null
    marriageStatus?: string | null
    educationStatus?: string | null
    baptizedYear?: number | null
    fromOtherChurch?: boolean
}

function TableCellViewer({ item }: { item: User }) {
    const isMobile = useIsMobile()
    return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
                <span className="text-foreground w-fit px-0 text-left cursor-pointer hover:underline">
                    {item.name}
                </span>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>{item.name}</DrawerTitle>
                    <DrawerDescription>User details and profile information</DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-6 overflow-y-auto px-4 py-4 text-sm">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">Name</Label>
                            <div className="font-medium text-base">{item.name}</div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">Email</Label>
                            <div className="font-medium text-base">{item.email}</div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">Roles</Label>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {item.roles?.map((ur) => (
                                    <Badge key={ur.roleId} variant="secondary" className="capitalize">
                                        {ur.role.name.toLowerCase()}
                                    </Badge>
                                ))}
                                {(!item.roles || item.roles.length === 0) && (
                                    <span className="text-muted-foreground italic">No roles assigned</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground">Family</Label>
                            <div className="font-medium text-base">
                                {item.family?.name || "No family assigned"}
                            </div>
                            {item.family?.description && (
                                <div className="text-muted-foreground text-xs">{item.family.description}</div>
                            )}
                        </div>
                    </div>
                </div>
                <DrawerFooter>
                    <Button>Edit User</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function UserActions({ user }: { user: User }) {
    const queryClient = useQueryClient()
    const deleteMutation = useMutation({
        mutationFn: () => userService.delete(user.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User removed successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to remove user")
        },
    })

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        className="data-open:bg-muted text-muted-foreground flex size-8"
                        size="icon"
                    >
                        <EllipsisVerticalIcon />
                        <span className="sr-only">Open menu</span>
                    </Button>
                }
            />
            <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Assign Role</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? "Removing..." : "Remove"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const columns: ColumnDef<User>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    indeterminate={
                        table.getIsSomePageRowsSelected() &&
                        !table.getIsAllPageRowsSelected()
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <TableCellViewer item={row.original} />,
        enableHiding: false,
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div className="text-muted-foreground">{row.original.email}</div>
        ),
    },
    {
        accessorKey: "roles",
        header: "Roles",
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
                {row.original.roles?.map((ur) => (
                    <Badge key={ur.roleId} variant="outline" className="px-1.5 capitalize">
                        {ur.role.name.toLowerCase()}
                    </Badge>
                ))}
                {(!row.original.roles || row.original.roles.length === 0) && (
                    <span className="text-muted-foreground text-xs italic">No roles</span>
                )}
            </div>
        ),
        filterFn: (row, id, value) => {
            const roles = row.original.roles?.map((ur) => ur.role.name.toLowerCase()) || []
            return roles.some((role) => role.includes(value.toLowerCase()))
        },
    },
    {
        accessorKey: "family",
        header: "Family",
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {row.original.family?.name || "N/A"}
            </div>
        ),
        filterFn: (row, id, value) => {
            const familyName = row.original.family?.name?.toLowerCase() || ""
            return familyName.includes(value.toLowerCase())
        },
    },
    {
        accessorKey: "zone",
        header: "Zone",
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {row.original.zone?.name || "N/A"}
            </div>
        ),
        filterFn: (row, id, value) => {
            const zoneName = row.original.zone?.name?.toLowerCase() || ""
            return zoneName.includes(value.toLowerCase())
        },
    },
    {
        accessorKey: "currentMinistry",
        header: "Ministry",
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {row.original.currentMinistry?.name || "N/A"}
            </div>
        ),
        filterFn: (row, id, value) => {
            const ministryName = row.original.currentMinistry?.name?.toLowerCase() || ""
            return ministryName.includes(value.toLowerCase())
        },
    },
    {
        accessorKey: "marriageStatus",
        header: "Marriage Status",
        cell: ({ row }) => (
            <div className="text-muted-foreground capitalize">
                {row.original.marriageStatus?.toLowerCase() || "N/A"}
            </div>
        ),
    },
    {
        accessorKey: "educationStatus",
        header: "Education",
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {row.original.educationStatus || "N/A"}
            </div>
        ),
    },
    {
        accessorKey: "baptizedYear",
        header: "Baptized",
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {row.original.baptizedYear ? `Yes (${row.original.baptizedYear})` : "No"}
            </div>
        ),
        filterFn: (row, id, value) => {
            if (value === "baptized") return row.original.baptizedYear != null
            if (value === "not-baptized") return row.original.baptizedYear == null
            return true
        },
    },
    {
        accessorKey: "fromOtherChurch",
        header: "From Other Church",
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {row.original.fromOtherChurch ? "Yes" : "No"}
            </div>
        ),
        filterFn: (row, id, value) => {
            if (value === "yes") return row.original.fromOtherChurch === true
            if (value === "no") return row.original.fromOtherChurch === false
            return true
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <UserActions user={row.original} />,
    },
]
