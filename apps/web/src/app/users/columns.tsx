"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { userService } from "@/services/user.service"
import { roleService } from "@/services/role.service"
import { zoneService } from "@/services/zone.service"
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EllipsisVerticalIcon } from "lucide-react"
import { UserForm } from "@/components/forms/user-form"

export type User = {
    id: string
    name: string
    email: string
    image?: string | null
    roles?: { role: { name: string }, roleId: string }[]
    family?: { id: string, name: string, description?: string | null } | null
    zone?: { id: string, name: string } | null
    currentMinistry?: { id: string, name: string } | null
    marriageStatus?: string | null
    educationStatus?: string | null
    baptizedYear?: number | null
    fromOtherChurch?: boolean
    // Additional fields for editing
    birthPlace?: string
    birthDate?: string
    livingAddress?: string
    mobile1?: string
    mobile2?: string
    skill?: string
    work?: string
    companyName?: string
    zoneId?: string
    currentMinistryId?: string
    closePersonName?: string
    closePersonMobile?: string
    spouseName?: string
    spouseBelief?: string
    foundationTeacherName?: string
    formerChurchName?: string
    leaveMessage?: string
    leaveMessageType?: string
    familyId?: string
    familyRole?: string
    roleIds?: string[]
}

function TableCellViewer({ item }: { item: User }) {
    const [editOpen, setEditOpen] = React.useState(false)

    // Extract role IDs from the roles array
    const roleIds = item.roles?.map((ur) => ur.roleId) || []

    // Build user data for editing
    const userData = {
        id: item.id,
        name: item.name || "",
        birthPlace: item.birthPlace || "",
        birthDate: item.birthDate || "",
        livingAddress: item.livingAddress || "",
        mobile1: item.mobile1 || "",
        mobile2: item.mobile2 || "",
        educationStatus: item.educationStatus || "",
        skill: item.skill || "",
        work: item.work || "",
        companyName: item.companyName || "",
        zoneId: item.zoneId || "",
        currentMinistryId: item.currentMinistryId || "",
        marriageStatus: item.marriageStatus || "",
        spouseName: item.spouseName || "",
        spouseBelief: item.spouseBelief || "",
        baptizedYear: item.baptizedYear || undefined,
        fromOtherChurch: item.fromOtherChurch || false,
        foundationTeacherName: item.foundationTeacherName || "",
        formerChurchName: item.formerChurchName || "",
        leaveMessage: item.leaveMessage || "",
        leaveMessageType: item.leaveMessageType || "",
        familyId: item.familyId || "",
        familyRole: item.familyRole || "",
        roleIds: roleIds,
    }

    return (
        <>
            <span
                className="text-foreground w-fit px-0 text-left cursor-pointer hover:underline"
                onClick={() => setEditOpen(true)}
            >
                {item.name}
            </span>
            <UserForm user={userData} open={editOpen} onOpenChange={setEditOpen} />
        </>
    )
}

function UserActions({ user }: { user: User }) {
    const queryClient = useQueryClient()
    const [editOpen, setEditOpen] = React.useState(false)
    const [promoteOpen, setPromoteOpen] = React.useState(false)
    const [selectedZoneId, setSelectedZoneId] = React.useState("")

    // Fetch roles and zones for the promote dialog
    const { data: roles = [] } = useQuery({
        queryKey: ["roles"],
        queryFn: () => roleService.getAll(),
    })

    const { data: zones = [] } = useQuery({
        queryKey: ["zones"],
        queryFn: () => zoneService.getAll(),
    })

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

    const promoteMutation = useMutation({
        mutationFn: () => userService.promoteToPastor(user.id, selectedZoneId, []),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User promoted to pastor successfully")
            setPromoteOpen(false)
            setSelectedZoneId("")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to promote to pastor")
        },
    })

    // Check if user is already a pastor
    const isPastor = user.roles?.some((ur) => ur.role.name === "PASTOR")

    // Build user data for editing
    const roleIds = user.roles?.map((ur) => ur.roleId) || []
    const userData = {
        id: user.id,
        name: user.name || "",
        birthPlace: user.birthPlace || "",
        birthDate: user.birthDate || "",
        livingAddress: user.livingAddress || "",
        mobile1: user.mobile1 || "",
        mobile2: user.mobile2 || "",
        educationStatus: user.educationStatus || "",
        skill: user.skill || "",
        work: user.work || "",
        companyName: user.companyName || "",
        zoneId: user.zone?.id || "",
        currentMinistryId: user.currentMinistry?.id || "",
        marriageStatus: user.marriageStatus || "",
        spouseName: user.spouseName || "",
        spouseBelief: user.spouseBelief || "",
        baptizedYear: user.baptizedYear || undefined,
        fromOtherChurch: user.fromOtherChurch || false,
        foundationTeacherName: user.foundationTeacherName || "",
        formerChurchName: user.formerChurchName || "",
        leaveMessage: user.leaveMessage || "",
        leaveMessageType: user.leaveMessageType || "",
        familyId: user.family?.id || "",
        familyRole: user.familyRole || "",
        roleIds: roleIds,
    }

    return (
        <>
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
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onSelect={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                    {!isPastor && (
                        <DropdownMenuItem onSelect={() => setPromoteOpen(true)}>
                            Promote to Pastor
                        </DropdownMenuItem>
                    )}
                    {isPastor && (
                        <DropdownMenuItem disabled>Already a Pastor</DropdownMenuItem>
                    )}
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
            <UserForm user={userData} open={editOpen} onOpenChange={setEditOpen} />
            <Sheet open={promoteOpen} onOpenChange={setPromoteOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Promote to Pastor</SheetTitle>
                        <SheetDescription>
                            Select the zone that this pastor will oversee.
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
                                    {zones.map((zone: any) => (
                                        <SelectItem key={zone.id} value={zone.id}>
                                            {zone.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <SheetFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPromoteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => promoteMutation.mutate()}
                            disabled={!selectedZoneId || promoteMutation.isPending}
                        >
                            {promoteMutation.isPending ? "Promoting..." : "Promote"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
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
            const filterValues = value.toLowerCase().split("|")
            return roles.some((role) => filterValues.some((v: string) => role.includes(v)))
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
            const filterValues = value.toLowerCase().split("|")
            return filterValues.some((v: string) => familyName.includes(v))
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
            const filterValues = value.toLowerCase().split("|")
            return filterValues.some((v: string) => zoneName.includes(v))
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
