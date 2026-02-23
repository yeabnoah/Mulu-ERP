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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Input } from "@/components/ui/input"
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
        image: item.image || "",
        birthPlace: item.birthPlace || "",
        birthDate: item.birthDate || "",
        livingAddress: item.livingAddress || "",
        mobile1: item.mobile1 || "",
        mobile2: item.mobile2 || "",
        educationStatus: item.educationStatus || "",
        skill: item.skill || "",
        work: item.work || "",
        companyName: item.companyName || "",
        zoneId: item.zone?.id || "",
        currentMinistryId: item.currentMinistry?.id || "",
        marriageStatus: item.marriageStatus || "",
        spouseName: item.spouseName || "",
        spouseBelief: item.spouseBelief || "",
        baptizedYear: item.baptizedYear || undefined,
        fromOtherChurch: item.fromOtherChurch || false,
        foundationTeacherName: item.foundationTeacherName || "",
        formerChurchName: item.formerChurchName || "",
        leaveMessage: item.leaveMessage || "",
        leaveMessageType: item.leaveMessageType || "",
        familyId: item.family?.id || "",
        familyRole: item.familyRole || "",
        roleIds: roleIds,
    }

    return (
        <>
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={item.image || undefined} alt={item.name} />
                    <AvatarFallback className="text-xs">
                        {item.name?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                </Avatar>
                <span
                    className="text-foreground cursor-pointer hover:underline"
                    onClick={() => setEditOpen(true)}
                >
                    {item.name}
                </span>
            </div>
            <UserForm user={userData} open={editOpen} onOpenChange={setEditOpen} />
        </>
    )
}

function UserActions({ user }: { user: User }) {
    const queryClient = useQueryClient()
    const [editOpen, setEditOpen] = React.useState(false)
    const [promoteOpen, setPromoteOpen] = React.useState(false)
    const [selectedZoneId, setSelectedZoneId] = React.useState("")
    const [pastorPassword, setPastorPassword] = React.useState("")

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
        mutationFn: async () => {
            await userService.promoteToPastor(user.id, selectedZoneId, [])
            if (pastorPassword.trim().length >= 8) {
                await userService.setPassword(user.id, pastorPassword)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User promoted to pastor. They can log in at /pastor with their email and the password you set.")
            setPromoteOpen(false)
            setSelectedZoneId("")
            setPastorPassword("")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to promote to pastor")
        },
    })

    // Check if user is already a pastor or admin
    const isPastor = user.roles?.some((ur) => ur.role.name === "PASTOR")
    const isAdmin = user.roles?.some((ur) => ur.role.name === "ADMIN")
    const adminRole = roles.find((r: { name: string }) => r.name === "ADMIN")

    const updateRolesMutation = useMutation({
        mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) => userService.updateRoles(id, roleIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("Roles updated")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to update roles")
        },
    })

    const handleMakeAdmin = () => {
        if (!adminRole) {
            toast.error("ADMIN role not found. Ensure it exists in Roles.")
            return
        }
        const currentIds = user.roles?.map((ur) => ur.roleId) || []
        const newIds = currentIds.includes(adminRole.id) ? currentIds : [...currentIds, adminRole.id]
        updateRolesMutation.mutate({ id: user.id, roleIds: newIds })
    }

    const handleRemoveAdmin = () => {
        const currentIds = user.roles?.map((ur) => ur.roleId) || []
        const newIds = currentIds.filter((id) => {
            const r = user.roles?.find((ur) => ur.roleId === id)
            return r?.role.name !== "ADMIN"
        })
        updateRolesMutation.mutate({ id: user.id, roleIds: newIds })
    }

    // Build user data for editing
    const roleIds = user.roles?.map((ur) => ur.roleId) || []
    const userData = {
        id: user.id,
        name: user.name || "",
        image: user.image || "",
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
                        <button
                            type="button"
                            className="flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-muted border-0 bg-transparent p-0"
                        >
                            <EllipsisVerticalIcon />
                            <span className="sr-only">Open menu</span>
                        </button>
                    }
                />
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
                    {!isAdmin ? (
                        <DropdownMenuItem
                            onClick={handleMakeAdmin}
                            disabled={!adminRole || updateRolesMutation.isPending}
                        >
                            {updateRolesMutation.isPending ? "Updating..." : "Make admin"}
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onClick={handleRemoveAdmin}
                            disabled={updateRolesMutation.isPending}
                        >
                            {updateRolesMutation.isPending ? "Updating..." : "Remove admin"}
                        </DropdownMenuItem>
                    )}
                    {!isPastor && (
                        <DropdownMenuItem onClick={() => setPromoteOpen(true)}>
                            Promote to Pastor
                        </DropdownMenuItem>
                    )}
                    {isPastor && (
                        <DropdownMenuItem disabled>Already a Pastor</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => deleteMutation.mutate()}
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
                            Select the zone and set a login password so they can sign in at /pastor.
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="pastor-password" className="text-right">
                                Login password
                            </Label>
                            <Input
                                id="pastor-password"
                                type="password"
                                placeholder="Min. 8 characters (for /pastor login)"
                                className="col-span-3"
                                value={pastorPassword}
                                onChange={(e) => setPastorPassword(e.target.value)}
                                minLength={8}
                            />
                            <p className="col-span-3 col-start-2 text-xs text-muted-foreground">
                                They will use their email + this password to sign in at the Pastor dashboard.
                            </p>
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
                            disabled={!selectedZoneId || !pastorPassword || pastorPassword.length < 8 || promoteMutation.isPending}
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
                    key="header-checkbox"
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
