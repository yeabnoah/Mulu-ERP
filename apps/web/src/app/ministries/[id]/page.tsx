"use client"

import * as React from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { userService } from "@/services/user.service"
import { ministryService } from "@/services/ministry.service"
import { authClient } from "@/lib/auth-client"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable, type DataTableFilterOption } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import { PlusIcon, EllipsisVerticalIcon, UserMinusIcon } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

interface MinistryMember {
    id: string
    name: string
    email: string
    roles?: { role: { name: string }, roleId: string }[]
    currentMinistry?: { id: string, name: string } | null
}

function StatCard({ title, value, description }: { title: string; value: number; description?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value?.toLocaleString() || 0}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    )
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                    <CardContent><Skeleton className="h-8 w-16" /></CardContent>
                </Card>
            ))}
        </div>
    )
}

// Simple columns for ministry members
const ministryColumns: ColumnDef<MinistryMember>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "currentMinistry",
        header: "Ministry",
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {row.original.currentMinistry?.name || "N/A"}
            </div>
        ),
    },
]

interface MinistryPortalPageProps {
    params: Promise<{ id: string }>
}

export default function MinistryPortalPage({ params }: MinistryPortalPageProps) {
    const queryClient = useQueryClient()
    const [addMemberOpen, setAddMemberOpen] = React.useState(false)
    const [selectedUserId, setSelectedUserId] = React.useState("")

    const [resolvedParams, setResolvedParams] = React.useState<{ id: string } | null>(null)

    React.useEffect(() => {
        params.then(setResolvedParams)
    }, [params])

    const ministryId = resolvedParams?.id

    // Get current user
    const { data: session } = authClient.useSession()

    // Get ministry details
    const { data: ministry, isLoading: ministryLoading } = useQuery({
        queryKey: ["ministry", ministryId],
        queryFn: () => ministryService.getById(ministryId!),
        enabled: !!ministryId,
    })

    // Get ministry members
    const { data: members, isLoading: membersLoading } = useQuery({
        queryKey: ["ministry-members", ministryId],
        queryFn: () => ministryService.getMembers(ministryId!),
        enabled: !!ministryId,
    })

    // Get all users to add as members
    const { data: allUsers } = useQuery({
        queryKey: ["users"],
        queryFn: () => userService.getAll(),
    })

    // Get all ministries
    const { data: ministries } = useQuery({
        queryKey: ["ministries"],
        queryFn: () => ministryService.getAll(),
    })

    const addMemberMutation = useMutation({
        mutationFn: () => ministryService.addMember(ministryId!, selectedUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ministry-members", ministryId] })
            toast.success("Member added successfully")
            setAddMemberOpen(false)
            setSelectedUserId("")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to add member")
        },
    })

    const removeMemberMutation = useMutation({
        mutationFn: (userId: string) => ministryService.removeMember(ministryId!, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ministry-members", ministryId] })
            toast.success("Member removed successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to remove member")
        },
    })

    // Filter out users who are already members
    const availableUsers = React.useMemo(() => {
        if (!allUsers || !members) return []
        const memberIds = new Set(members.map((m: any) => m.userId))
        return allUsers.filter((u: any) => !memberIds.has(u.id))
    }, [allUsers, members])

    const isLoading = ministryLoading || membersLoading

    if (isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <LoadingSkeleton />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    if (!ministry) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ministry Not Found</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>The requested ministry could not be found.</p>
                            </CardContent>
                        </Card>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    // Create columns with remove action
    const columns: ColumnDef<MinistryMember>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            id: "actions",
            cell: ({ row }) => (
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
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => removeMemberMutation.mutate(row.original.id)}
                            disabled={removeMemberMutation.isPending}
                        >
                            {removeMemberMutation.isPending ? "Removing..." : "Remove"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{ministry.name}</h1>
                            <p className="text-muted-foreground">{ministry.description || "Ministry Portal"}</p>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Members"
                            value={members?.length || 0}
                            description="In this ministry"
                        />
                    </div>

                    {/* Members Table */}
                    <DataTable
                        columns={columns}
                        data={(members || []).map((m: any) => ({
                            id: m.userId,
                            name: m.user?.name || "Unknown",
                            email: m.user?.email || "",
                            currentMinistry: m.user?.currentMinistry,
                        }))}
                        headerActions={
                            <Button onClick={() => setAddMemberOpen(true)}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Member
                            </Button>
                        }
                    />

                    {/* Add Member Sheet */}
                    <Sheet open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Add Member</SheetTitle>
                                <SheetDescription>
                                    Select a user to add to this ministry.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="user" className="text-right">
                                        User
                                    </Label>
                                    <Select value={selectedUserId} onValueChange={(value) => setSelectedUserId(value || "")}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableUsers.map((user: any) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <SheetFooter>
                                <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => addMemberMutation.mutate()}
                                    disabled={!selectedUserId || addMemberMutation.isPending}
                                >
                                    {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
