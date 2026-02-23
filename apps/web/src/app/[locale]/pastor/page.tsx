"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { userService } from "@/services/user.service"
import { zoneService } from "@/services/zone.service"
import { statsService } from "@/services/stats.service"
import { familyService } from "@/services/family.service"
import { ministryService } from "@/services/ministry.service"
import { roleService } from "@/services/role.service"
import { authClient } from "@/lib/auth-client"
import { portalService } from "@/services/portal.service"
import { PortalLayout } from "@/components/portal-layout"
import { DataTable, type DataTableFilterOption } from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUserColumns } from "../users/columns"
import { UserForm } from "@/components/forms/user-form"
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { PlusIcon, MapPin } from "lucide-react"
import { toast } from "sonner"

const CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

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

function PastorPortalLoginForm() {
    const t = useTranslations("pastor")
    const tAuth = useTranslations("auth")
    const router = useRouter()
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [submitting, setSubmitting] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return
        setSubmitting(true)
        try {
            await authClient.signIn.email(
                { email, password },
                {
                    onSuccess: () => {
                        router.push("/pastor")
                        router.refresh()
                    },
                    onError: (err) => {
                        toast.error(err.error?.message ?? t("signInFailed"))
                        setSubmitting(false)
                    },
                },
            )
        } catch {
            setSubmitting(false)
        }
    }

    return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col justify-center px-4">
            <Card>
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <MapPin className="size-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{t("pastorDashboard")}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {t("signInHint")}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="pastor-email">{tAuth("email")}</Label>
                            <Input
                                id="pastor-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pastor-password">{tAuth("password")}</Label>
                            <Input
                                id="pastor-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? t("signingIn") : tAuth("signIn")}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            <Link href="/login" className="underline hover:text-foreground">{t("fullAdminSignIn")}</Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PastorPortalPage() {
    const t = useTranslations("pastor")
    const tDashboard = useTranslations("dashboard")
    const tUsers = useTranslations("users")
    const tCommon = useTranslations("common")
    const router = useRouter()
    const queryClient = useQueryClient()
    const columns = useUserColumns()
    const [addUserOpen, setAddUserOpen] = React.useState(false)

    const { data: session, isPending: sessionLoading } = authClient.useSession()
    const userId = session?.user?.id

    const { data: me } = useQuery({
        queryKey: ["portal", "me"],
        queryFn: () => portalService.getMe(),
        enabled: !!userId,
    })
    React.useEffect(() => {
        if (me && userId && !me.isPastor) {
            router.replace("/my-ministry")
        }
    }, [me, userId, router])

    // Call ALL hooks unconditionally - Rules of Hooks require this
    const { data: pastorZone, isLoading: zoneLoading } = useQuery({
        queryKey: ["pastor-zone", userId],
        queryFn: () => zoneService.getByPastorId(userId!),
        enabled: !!userId,
    })

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ["users", pastorZone?.id],
        queryFn: () => userService.getAll(pastorZone?.id),
        enabled: !!pastorZone?.id,
    })

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

    // useMemo must run unconditionally (Rules of Hooks)
    const filters: DataTableFilterOption<typeof users>[] = React.useMemo(() => [
        {
            id: "family",
            label: tUsers("family"),
            multiSelect: true,
            options: (families || []).filter((f: any) => f.zoneId === pastorZone?.id).map((family: { name: string; id: string }) => ({
                label: family.name,
                value: family.name.toLowerCase(),
            })),
        },
        {
            id: "currentMinistry",
            label: tUsers("ministry"),
            multiSelect: true,
            options: (ministries || []).map((ministry: { name: string }) => ({
                label: ministry.name,
                value: ministry.name.toLowerCase(),
            })),
        },
        {
            id: "marriageStatus",
            label: tUsers("marriageStatus"),
            multiSelect: true,
            options: [
                { label: tUsers("single"), value: "single" },
                { label: tUsers("married"), value: "married" },
                { label: tUsers("widow"), value: "widow" },
                { label: tUsers("divorced"), value: "divorced" },
            ],
        },
        {
            id: "educationStatus",
            label: tUsers("education"),
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
            label: tUsers("baptized"),
            type: "select",
            options: [
                { label: tUsers("baptized"), value: "baptized" },
                { label: tUsers("notBaptized"), value: "not-baptized" },
            ],
        },
        {
            id: "fromOtherChurch",
            label: tUsers("fromOtherChurch"),
            type: "select",
            options: [
                { label: tUsers("yes"), value: "yes" },
                { label: tUsers("no"), value: "no" },
            ],
        },
    ], [tUsers, families, ministries, pastorZone?.id])

    // Now handle loading and conditional states AFTER all hooks are called
    const isLoading = sessionLoading || zoneLoading || usersLoading

    if (sessionLoading) {
        return (
            <PortalLayout title={t("pastorPortal")}>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <LoadingSkeleton />
                </div>
            </PortalLayout>
        )
    }

    if (!userId) {
        return (
            <PortalLayout title={t("pastorDashboard")}>
                <PastorPortalLoginForm />
            </PortalLayout>
        )
    }

    if (isLoading) {
        return (
            <PortalLayout title={t("pastorPortal")}>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <LoadingSkeleton />
                </div>
            </PortalLayout>
        )
    }

    if (!pastorZone) {
        return (
            <PortalLayout title={t("pastorPortal")}>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("noZoneAssigned")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{t("noZoneDescription")}</p>
                        </CardContent>
                    </Card>
                </div>
            </PortalLayout>
        )
    }

    return (
        <PortalLayout title={t("pastorPortal")}>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{t("pastorPortal")}</h1>
                            <p className="text-muted-foreground">{t("managing")}: {pastorZone.name}</p>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title={tDashboard("totalMembers")}
                            value={stats?.basic?.totalMembers || 0}
                            description={t("inYourZone")}
                        />
                        <StatCard
                            title={tDashboard("families")}
                            value={stats?.basic?.totalFamilies || 0}
                            description={t("inYourZone")}
                        />
                        <StatCard
                            title={tDashboard("children")}
                            value={stats?.basic?.totalChildren || 0}
                            description={t("inYourZone")}
                        />
                        <StatCard
                            title={tDashboard("baptized")}
                            value={stats?.basic?.baptizedCount || 0}
                            description={stats?.basic?.totalMembers ? `${Math.round(((stats.basic.baptizedCount ?? 0) / stats.basic.totalMembers) * 100)}% ${t("ofZone")}` : t("inYourZone")}
                        />
                        <StatCard
                            title={t("fromOtherChurch")}
                            value={stats?.basic?.fromOtherChurch ?? 0}
                        />
                        <StatCard
                            title={tDashboard("employed")}
                            value={stats?.basic?.employedCount ?? 0}
                            description={stats?.basic?.totalMembers ? `${Math.round(((stats.basic.employedCount ?? 0) / stats.basic.totalMembers) * 100)}% ${t("ofZone")}` : undefined}
                        />
                    </div>

                    {/* Data visualisation */}
                    {stats && (
                        <>
                            <div className="grid gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("marriageStatus")}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{t("marriageStatusDesc")}</p>
                                    </CardHeader>
                                    <CardContent className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: tDashboard("single"), value: stats.marriageStatus?.single ?? 0 },
                                                        { name: tDashboard("married"), value: stats.marriageStatus?.married ?? 0 },
                                                        { name: tDashboard("widow"), value: stats.marriageStatus?.widow ?? 0 },
                                                        { name: tDashboard("divorced"), value: stats.marriageStatus?.divorced ?? 0 },
                                                    ].filter((d) => d.value > 0)}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => (percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : "")}
                                                    outerRadius={80}
                                                    dataKey="value"
                                                >
                                                    {[0, 1, 2, 3].map((i) => (
                                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("churchStatus")}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{t("churchStatusDesc")}</p>
                                    </CardHeader>
                                    <CardContent className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: tDashboard("baptized"), value: stats.basic?.baptizedCount ?? 0 },
                                                        { name: tDashboard("notBaptized"), value: stats.basic?.notBaptizedCount ?? 0 },
                                                    ].filter((d) => d.value > 0)}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => (percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : "")}
                                                    outerRadius={80}
                                                    dataKey="value"
                                                >
                                                    <Cell fill={CHART_COLORS[0]} />
                                                    <Cell fill={CHART_COLORS[1]} />
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="grid gap-6 lg:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("education")}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{t("educationDesc")}</p>
                                    </CardHeader>
                                    <CardContent className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={Object.entries(stats.educationStatus ?? {}).map(([name, value]) => ({ name, value }))}
                                                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="value" fill={CHART_COLORS[0]} name={tDashboard("members")} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("ageGroups")}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{t("ageGroupsDesc")}</p>
                                    </CardHeader>
                                    <CardContent className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={Object.entries(stats.ageGroups ?? {}).map(([name, value]) => ({ name, value }))}
                                                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="value" fill={CHART_COLORS[2]} name={tDashboard("members")} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                            {stats.ministries && stats.ministries.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("ministriesInZone")}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{t("membersPerMinistry")}</p>
                                    </CardHeader>
                                    <CardContent className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={stats.ministries.map((m: { name: string; memberCount: number }) => ({ name: m.name, members: m.memberCount }))}
                                                layout="vertical"
                                                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                                                <Tooltip />
                                                <Bar dataKey="members" fill={CHART_COLORS[4]} name={tDashboard("members")} radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}

                    {/* Users Table */}
                    <DataTable
                        columns={columns}
                        data={users || []}
                        filters={filters}
                        headerActions={
                            <Button onClick={() => setAddUserOpen(true)}>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {t("addMember")}
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
        </PortalLayout>
    )
}
