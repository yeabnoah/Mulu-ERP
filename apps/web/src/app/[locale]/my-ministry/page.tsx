"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { portalService } from "@/services/portal.service"
import { PortalLayout } from "@/components/portal-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
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
import { UserPlusIcon, XIcon, UsersIcon, Church, Heart, Briefcase, Building2 } from "lucide-react"

const CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

function MinistryPortalLoginForm() {
  const t = useTranslations("myMinistry")
  const tPastor = useTranslations("pastor")
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
            router.push("/my-ministry")
            router.refresh()
          },
          onError: (err) => {
            toast.error(err.error?.message ?? tPastor("signInFailed"))
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
            <Church className="size-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {tPastor("signInHint")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="portal-email">{tAuth("email")}</Label>
              <Input
                id="portal-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portal-password">{tAuth("password")}</Label>
              <Input
                id="portal-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? tPastor("signingIn") : tAuth("signIn")}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              <Link href="/login" className="underline hover:text-foreground">{tPastor("fullAdminSignIn")}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function MinistryDashboardPage() {
  const t = useTranslations("myMinistry")
  const tDashboard = useTranslations("dashboard")
  const tCommon = useTranslations("common")
  const queryClient = useQueryClient()
  const [addMemberOpen, setAddMemberOpen] = React.useState(false)
  const [selectedUserId, setSelectedUserId] = React.useState("")
  const [selectedMinistryId, setSelectedMinistryId] = React.useState<string>("")

  const { data: session, isPending: sessionPending } = authClient.useSession()
  const userId = session?.user?.id

  const { data: myMinistries = [], isLoading: loadingMinistries } = useQuery({
    queryKey: ["portal", "my-ministries"],
    queryFn: () => portalService.getMyMinistries(),
    enabled: !!userId,
  })

  React.useEffect(() => {
    if (myMinistries.length > 0 && (!selectedMinistryId || !myMinistries.some((m) => m.id === selectedMinistryId))) {
      setSelectedMinistryId(myMinistries[0].id)
    }
  }, [myMinistries, selectedMinistryId])

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ["portal", "my-ministry-members", selectedMinistryId],
    queryFn: () => portalService.getMyMinistryMembers(selectedMinistryId),
    enabled: !!selectedMinistryId,
  })

  const currentMinistry = myMinistries.find((m) => m.id === selectedMinistryId)
  const isMinistryLeader = currentMinistry?.isAdmin ?? false

  const { data: allUsers } = useQuery({
    queryKey: ["portal", "users"],
    queryFn: () => portalService.getUsers(),
    enabled: isMinistryLeader && addMemberOpen,
  })

  const { data: ministryStats } = useQuery({
    queryKey: ["portal", "ministry-stats", selectedMinistryId],
    queryFn: () => portalService.getMyMinistryStats(selectedMinistryId),
    enabled: !!selectedMinistryId,
  })

  const availableUsers = React.useMemo(() => {
    if (!allUsers || !members) return allUsers || []
    const memberIds = (members as any[]).map((m: { userId: string }) => m.userId)
    return (allUsers as { id: string }[]).filter((u) => !memberIds.includes(u.id))
  }, [allUsers, members])

  const requestJoinMutation = useMutation({
    mutationFn: ({ ministryId, userId }: { ministryId: string; userId: string }) =>
      portalService.requestJoin(ministryId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal"] })
      toast.success(t("requestSent"))
      setAddMemberOpen(false)
      setSelectedUserId("")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("failedSendRequest"))
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ ministryId, userId, role }: { ministryId: string; userId: string; role: string }) =>
      portalService.updateMemberRole(ministryId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal"] })
      toast.success(t("roleUpdated"))
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("failedUpdateRole"))
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: ({ ministryId, userId }: { ministryId: string; userId: string }) =>
      portalService.removeMember(ministryId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal"] })
      toast.success(t("memberRemoved"))
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("failedRemoveMember"))
    },
  })

  const handleAddMember = () => {
    if (!selectedMinistryId || !selectedUserId) {
      toast.error(t("pleaseSelectUser"))
      return
    }
    requestJoinMutation.mutate({
      ministryId: selectedMinistryId,
      userId: selectedUserId,
    })
  }

  if (sessionPending) {
    return (
      <PortalLayout title={t("title")}>
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground">{tCommon("loading")}</p>
        </div>
      </PortalLayout>
    )
  }

  if (!userId) {
    return (
      <PortalLayout title={t("title")}>
        <MinistryPortalLoginForm />
      </PortalLayout>
    )
  }

  if (!loadingMinistries && myMinistries.length === 0) {
    return (
      <PortalLayout title={t("title")}>
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("noMinistryAssigned")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("noMinistryDescription")}
              </p>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout title={t("title")}>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Ministry Selector */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("selectMinistry")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedMinistryId}
                onValueChange={(v) => setSelectedMinistryId(v ?? "")}
              >
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder={t("selectAMinistry")} />
                </SelectTrigger>
                <SelectContent>
                  {myMinistries.map((ministry) => (
                    <SelectItem key={ministry.id} value={ministry.id}>
                      {ministry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedMinistryId && currentMinistry && (
            <>
              {/* Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t("totalMembers")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currentMinistry._count?.members ?? 0}
                    </div>
                  </CardContent>
                </Card>
                {isMinistryLeader && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t("pendingRequests")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {currentMinistry._count?.requests ?? 0}
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{t("yourRole")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-sm">
                      {currentMinistry.role}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Demographics overview */}
              {ministryStats && (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Heart className="h-4 w-4" /> {t("baptized")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{ministryStats.basic?.baptizedCount ?? 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {ministryStats.basic?.totalMembers
                            ? `${Math.round(((ministryStats.basic.baptizedCount ?? 0) / ministryStats.basic.totalMembers) * 100)}% ${t("ofMembers")}`
                            : ""}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Church className="h-4 w-4" /> {t("fromOtherChurch")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{ministryStats.basic?.fromOtherChurch ?? 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Briefcase className="h-4 w-4" /> {t("employed")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{ministryStats.basic?.employedCount ?? 0}</div>
                        <p className="text-xs text-muted-foreground">
                          {ministryStats.basic?.totalMembers
                            ? `${Math.round(((ministryStats.basic.employedCount ?? 0) / ministryStats.basic.totalMembers) * 100)}% ${t("ofMembers")}`
                            : ""}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4" /> {t("notBaptized")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{ministryStats.basic?.notBaptizedCount ?? 0}</div>
                      </CardContent>
                    </Card>
                  </div>

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
                                { name: tDashboard("single"), value: ministryStats.marriageStatus?.single ?? 0 },
                                { name: tDashboard("married"), value: ministryStats.marriageStatus?.married ?? 0 },
                                { name: tDashboard("widow"), value: ministryStats.marriageStatus?.widow ?? 0 },
                                { name: tDashboard("divorced"), value: ministryStats.marriageStatus?.divorced ?? 0 },
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
                                { name: tDashboard("baptized"), value: ministryStats.basic?.baptizedCount ?? 0 },
                                { name: tDashboard("notBaptized"), value: ministryStats.basic?.notBaptizedCount ?? 0 },
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
                        <p className="text-sm text-muted-foreground">{t("educationByStatus")}</p>
                      </CardHeader>
                      <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(ministryStats.educationStatus ?? {}).map(([name, value]) => ({ name, value }))}
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
                            data={Object.entries(ministryStats.ageGroups ?? {}).map(([name, value]) => ({ name, value }))}
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
                </>
              )}

              {/* Members Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("members")}</CardTitle>
                  {isMinistryLeader && (
                    <Button size="sm" onClick={() => setAddMemberOpen(true)}>
                      <UserPlusIcon className="mr-2 h-4 w-4" />
                      {t("addMember")}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {loadingMembers ? (
                    <div className="text-center py-4 text-muted-foreground">{tCommon("loading")}</div>
                  ) : members && members.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("member")}</TableHead>
                          <TableHead>{t("role")}</TableHead>
                          <TableHead>{t("joined")}</TableHead>
                          {isMinistryLeader && (
                            <TableHead className="text-right">{tCommon("actions")}</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(members as any[]).map((member) => (
                          <TableRow key={member.userId}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.user?.image} />
                                  <AvatarFallback>
                                    {member.user?.name?.[0] || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{member.user?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={member.role === "LEADER" ? "default" : "outline"}
                              >
                                {member.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(member.createdAt).toLocaleDateString()}
                            </TableCell>
                            {isMinistryLeader && (
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Select
                                    value={member.role}
                                    onValueChange={(value) =>
                                      updateRoleMutation.mutate({
                                        ministryId: selectedMinistryId,
                                        userId: member.userId,
                                        role: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="w-32 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="MEMBER">{t("memberRole")}</SelectItem>
                                      <SelectItem value="LEADER">{t("leaderRole")}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-red-500 hover:text-red-600"
                                    onClick={() =>
                                      removeMemberMutation.mutate({
                                        ministryId: selectedMinistryId,
                                        userId: member.userId,
                                      })
                                    }
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("noMembersYet")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Add Member Dialog */}
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("addMemberTitle")}</DialogTitle>
                <DialogDescription>
                  {t("addMemberDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right">{t("userLabel")}</label>
                  <Select value={selectedUserId} onValueChange={(v) => setSelectedUserId(v ?? "")}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t("selectUser")} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers?.map((user: { id: string; name: string }) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedUserId || requestJoinMutation.isPending}
                >
                  {requestJoinMutation.isPending ? t("sending") : t("sendRequest")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
    </PortalLayout>
  )
}
