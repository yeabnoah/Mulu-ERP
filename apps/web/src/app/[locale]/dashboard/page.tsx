"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import { portalService } from "@/services/portal.service"
import { statsService } from "@/services/stats.service"
import { zoneService } from "@/services/zone.service"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
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
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import { Users, Home, Church, MapPin, Baby, GraduationCap, Briefcase, Heart } from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

function StatCard({ title, value, icon: Icon, description }: { title: string; value: number; icon: any; description?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value?.toLocaleString() || 0}</div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
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

function AdminDashboard({ stats }: { stats: any }) {
  const t = useTranslations("dashboard")
  const marriageData = stats?.marriageStatus
    ? [
        { name: t("single"), value: stats.marriageStatus.single },
        { name: t("married"), value: stats.marriageStatus.married },
        { name: t("widow"), value: stats.marriageStatus.widow },
        { name: t("divorced"), value: stats.marriageStatus.divorced },
      ]
    : []

  const educationData = stats?.educationStatus
    ? Object.entries(stats.educationStatus).map(([name, value]: [string, any]) => ({
        name,
        value,
      }))
    : []

  const zoneData =
    stats?.zones?.map((z: any) => ({
      name: z.name,
      members: z.memberCount,
      families: z.familyCount,
    })) || []

  const ministryData =
    stats?.ministries?.map((m: any) => ({
      name: m.name,
      members: m.memberCount,
    })) || []

  const ageData = stats?.ageGroups
    ? Object.entries(stats.ageGroups).map(([name, value]: [string, any]) => ({
        name,
        value,
      }))
    : []

  const churchStatusData = [
    { name: t("baptized"), value: stats?.basic?.baptizedCount || 0 },
    { name: t("notBaptized"), value: stats?.basic?.notBaptizedCount || 0 },
  ]

  const workData = [
    { name: t("employed"), value: stats?.basic?.employedCount || 0 },
    { name: t("notEmployed"), value: stats?.basic?.unemployedCount || 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Basic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("totalMembers")} value={stats?.basic?.totalUsers} icon={Users} />
        <StatCard title={t("families")} value={stats?.basic?.totalFamilies} icon={Home} />
        <StatCard title={t("ministries")} value={stats?.basic?.totalMinistries} icon={Church} />
        <StatCard title={t("zones")} value={stats?.basic?.totalZones} icon={MapPin} />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("children")} value={stats?.basic?.totalChildren} icon={Baby} />
        <StatCard title={t("baptized")} value={stats?.basic?.baptizedCount} icon={Heart} description={`${Math.round((stats?.basic?.baptizedCount / stats?.basic?.totalUsers) * 100) || 0}% ${t("ofTotal")}`} />
        <StatCard title={t("fromOtherChurch")} value={stats?.basic?.fromOtherChurch} icon={Church} />
        <StatCard title={t("employed")} value={stats?.basic?.employedCount} icon={Briefcase} description={`${Math.round((stats?.basic?.employedCount / stats?.basic?.totalUsers) * 100) || 0}% ${t("ofTotal")}`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("marriageStatus")}</CardTitle>
            <CardDescription>{t("marriageStatusDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marriageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {marriageData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <CardDescription>{t("churchStatusDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={churchStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {churchStatusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("membersByZone")}</CardTitle>
            <CardDescription>{t("membersByZoneDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="members" fill="#0088FE" name={t("members")} />
                <Bar dataKey="families" fill="#00C49F" name={t("families")} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("membersByMinistry")}</CardTitle>
            <CardDescription>{t("membersByMinistryDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ministryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="members" fill="#FFBB28" name={t("members")} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("educationStatus")}</CardTitle>
            <CardDescription>{t("educationStatusDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={educationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {educationData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("ageGroups")}</CardTitle>
            <CardDescription>{t("ageGroupsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" name={t("members")} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Work Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("employmentStatus")}</CardTitle>
            <CardDescription>{t("employmentStatusDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {workData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PastorDashboard({ stats, selectedZone }: { stats: any; selectedZone: string }) {
  const t = useTranslations("dashboard")
  const marriageData = stats?.marriageStatus
    ? [
        { name: t("single"), value: stats.marriageStatus.single },
        { name: t("married"), value: stats.marriageStatus.married },
        { name: t("widow"), value: stats.marriageStatus.widow },
        { name: t("divorced"), value: stats.marriageStatus.divorced },
      ]
    : []

  const educationData = stats?.educationStatus ? Object.entries(stats.educationStatus).map(([name, value]: [string, any]) => ({
    name,
    value,
  })) : []

  const ministryData = stats?.ministries?.map((m: any) => ({
    name: m.name,
    members: m.memberCount,
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">{t("zoneLabel")}: {stats?.zoneName}</h2>
      </div>

      {/* Basic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("totalMembers")} value={stats?.basic?.totalMembers} icon={Users} />
        <StatCard title={t("families")} value={stats?.basic?.totalFamilies} icon={Home} />
        <StatCard title={t("children")} value={stats?.basic?.totalChildren} icon={Baby} />
        <StatCard title={t("baptized")} value={stats?.basic?.baptizedCount} icon={Heart} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("marriageStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marriageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {marriageData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("educationStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={educationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("ministryDistribution")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ministryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="members" fill="#00C49F" name={t("members")} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Page() {
  const t = useTranslations("dashboard")
  const router = useRouter()
  const [view, setView] = React.useState<"admin" | "pastor">("admin")
  const [selectedZone, setSelectedZone] = React.useState<string>("")

  const { data: session, isPending: sessionPending } = authClient.useSession()
  const { data: me } = useQuery({
    queryKey: ["portal", "me"],
    queryFn: () => portalService.getMe(),
    enabled: !!session?.user?.id,
  })
  React.useEffect(() => {
    if (sessionPending) return
    if (!session) {
      router.replace("/login")
      return
    }
    if (!me) return
    if (!me.isAppAdmin) {
      router.replace("/my-ministry")
      return
    }
    if (me.isPastor && !me.isAdmin) {
      router.replace("/pastor")
    }
  }, [session, sessionPending, me, router])

  const { data: stats, isLoading: loadingAdmin } = useQuery({
    queryKey: ["stats-detailed"],
    queryFn: () => statsService.getDetailed(),
    enabled: !!me?.isAdmin,
  })

  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: () => zoneService.getAll(),
  })

  const { data: pastorStats, isLoading: loadingPastor } = useQuery({
    queryKey: ["stats-pastor", selectedZone],
    queryFn: () => statsService.getPastorStats(selectedZone),
    enabled: !!selectedZone,
  })

  if (sessionPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }
  if (session && me && (!me.isAppAdmin || (me.isPastor && !me.isAdmin))) {
    return null
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
        <SiteHeader title={t("analytics")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6 lg:gap-8 lg:p-8">
            {/* View Toggle */}
            <div className="flex items-center gap-4">
              <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                <TabsList>
                  <TabsTrigger value="admin">{t("adminView")}</TabsTrigger>
                  <TabsTrigger value="pastor">{t("pastorView")}</TabsTrigger>
                </TabsList>
              </Tabs>

              {view === "pastor" && (
                <Select value={selectedZone} onValueChange={(value) => setSelectedZone(value || "")}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t("selectZone")} />
                  </SelectTrigger>
                  <SelectContent>
                    {zones?.map((zone: any) => (
                      <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {loadingAdmin ? (
              <LoadingSkeleton />
            ) : view === "admin" ? (
              <AdminDashboard stats={stats} />
            ) : selectedZone && !loadingPastor ? (
              <PastorDashboard stats={pastorStats} selectedZone={selectedZone} />
            ) : view === "pastor" && !selectedZone ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  {t("selectZoneToView")}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
