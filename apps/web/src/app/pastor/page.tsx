"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { userService } from "@/services/user.service"
import { zoneService } from "@/services/zone.service"
import { statsService } from "@/services/stats.service"
import { familyService } from "@/services/family.service"
import { ministryService } from "@/services/ministry.service"
import { roleService } from "@/services/role.service"
import { authClient } from "@/lib/auth-client"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable, type DataTableFilterOption } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { columns } from "../users/columns"
import { UserForm } from "@/components/forms/user-form"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

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

export default function PastorPortalPage() {
    const queryClient = useQueryClient()
    const [addUserOpen, setAddUserOpen] = React.useState(false)

    // Get current user to find their zone
    const { data: session, isPending: sessionLoading } = authClient.useSession()
    const userId = session?.user?.id

    // Show loading state while session is being determined
    if (sessionLoading) {
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

    // Get pastor's zone
    const { data: pastorZone, isLoading: zoneLoading } = useQuery({
        queryKey: ["pastor-zone", userId],
        queryFn: () => zoneService.getByPastorId(userId!),
        enabled: !!userId,
    })

    // Get users in pastor's zone
    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ["users", pastorZone?.id],
        queryFn: () => userService.getAll(pastorZone?.id),
        enabled: !!pastorZone?.id,
    })

    // Get pastor stats
    const { data: stats } = useQuery({
        queryKey: ["pastor-stats", pastorZone?.id],
        queryFn: () => statsService.getPastorStats(pastorZone!.id),
        enabled: !!pastorZone?.id,
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

    const { data: roles } = useQuery({
        queryKey: ["roles"],
        queryFn: () => roleService.getAll(),
    })

    const isLoading = zoneLoading || usersLoading

    const filters: DataTableFilterOption<typeof users>[] = React.useMemo(() => [
        {
            id: "family",
            label: "Family",
            multiSelect: true,
            options: (families || []).filter((f: any) => f.zoneId === pastorZone?.id).map((family: { name: string; id: string }) => ({
                label: family.name,
                value: family.name.toLowerCase(),
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
            id: "educationStatus",
            label: "Education",
            multiSelect: true,
            options: [
                { label: "High School", value: "high school" },
                { label: "College", value: "college" },
                { label: "University", value: "university" },
                { label: "Post Graduate", value: "post graduate" },
            ],
        },
        {
            id: "baptized",
            label: "Baptized",
            type: "select",
            options: [
                { label: "Baptized", value: "baptized" },
                { label: "Not Baptized", value: "not-baptized" },
            ],
        },
        {
            id: "fromOtherChurch",
            label: "From Other Church",
            type: "select",
            options: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
            ],
        },
    ], [families, ministries, pastorZone?.id])

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

    if (!pastorZone) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>No Zone Assigned</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>You do not have a zone assigned. Please contact the administrator.</p>
                            </CardContent>
                        </Card>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Pastor Portal</h1>
                            <p className="text-muted-foreground">Managing: {pastorZone.name}</p>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Members"
                            value={stats?.basic?.totalMembers || 0}
                            description="In your zone"
                        />
                        <StatCard
                            title="Families"
                            value={stats?.basic?.totalFamilies || 0}
                            description="In your zone"
                        />
                        <StatCard
                            title="Children"
                            value={stats?.basic?.totalChildren || 0}
                            description="In your zone"
                        />
                        <StatCard
                            title="Baptized"
                            value={stats?.basic?.baptizedCount || 0}
                            description="In your zone"
                        />
                    </div>

                    {/* Users Table */}
                    <DataTable
                        columns={columns}
                        data={users || []}
                        filters={filters}
                        headerActions={
                            <Button onClick={() => setAddUserOpen(true)}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add Member
                            </Button>
                        }
                    />

                    <UserForm
                        open={addUserOpen}
                        onOpenChange={setAddUserOpen}
                        defaultValues={{
                            zoneId: pastorZone.id,
                        }}
                    />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
