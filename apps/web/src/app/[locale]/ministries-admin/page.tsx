"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ministryAdminService } from "@/services/ministry-admin.service"
import { userService } from "@/services/user.service"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { CheckIcon, XIcon, UserPlusIcon, CrownIcon } from "lucide-react"

function RequestActions({ request, onApprove, onReject }: {
  request: any
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="ghost"
        className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={onApprove}
      >
        <CheckIcon className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={onReject}
      >
        <XIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function MinistryAdminPage() {
  const t = useTranslations("ministryAdmin")
  const tCommon = useTranslations("common")
  const queryClient = useQueryClient()
  const [selectedMinistry, setSelectedMinistry] = React.useState<string>("")
  const [selectedUser, setSelectedUser] = React.useState<string>("")
  const [adminPassword, setAdminPassword] = React.useState<string>("")
  const [addAdminOpen, setAddAdminOpen] = React.useState(false)

  // Fetch all ministries with admin info
  const { data: ministries, isLoading: loadingMinistries } = useQuery({
    queryKey: ["ministries-admin"],
    queryFn: () => ministryAdminService.getAll(),
  })

  // Fetch pending requests
  const { data: pendingRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["ministry-requests"],
    queryFn: () => ministryAdminService.getPendingRequests(),
  })

  // Fetch all users
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  })

  const addAdminMutation = useMutation({
    mutationFn: async ({
      ministryId,
      userId,
      password,
    }: {
      ministryId: string
      userId: string
      password: string
    }) => {
      await ministryAdminService.setAdmin(ministryId, userId)
      if (password.trim().length >= 8) {
        await userService.setPassword(userId, password)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries-admin"] })
      toast.success(t("adminAdded"))
      setAddAdminOpen(false)
      setSelectedMinistry("")
      setSelectedUser("")
      setAdminPassword("")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("failedAddAdmin"))
    },
  })

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: (requestId: string) => ministryAdminService.approveRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministry-requests"] })
      queryClient.invalidateQueries({ queryKey: ["ministries-admin"] })
      toast.success(t("requestApproved"))
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("failedApprove"))
    },
  })

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => ministryAdminService.rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministry-requests"] })
      toast.success(t("requestRejected"))
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("failedReject"))
    },
  })

  const handleAddAdmin = () => {
    if (!selectedMinistry || !selectedUser) {
      toast.error(t("selectMinistryAndUser"))
      return
    }
    if (!adminPassword || adminPassword.length < 8) {
      toast.error(t("passwordRequired"))
      return
    }
    addAdminMutation.mutate({
      ministryId: selectedMinistry,
      userId: selectedUser,
      password: adminPassword,
    })
  }

  // Get available users (not already admin of selected ministry)
  const availableUsers = React.useMemo(() => {
    if (!users || !selectedMinistry) return users || []
    const ministry = ministries?.find((m: any) => m.id === selectedMinistry)
    const existingAdminIds = ministry?.admins?.map((a: any) => a.userId) || []
    return (users as any[]).filter((u: any) => !existingAdminIds.includes(u.id))
  }, [users, selectedMinistry, ministries])

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
        <SiteHeader title={t("title")} />
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Pending Requests Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("pendingRequests")}</CardTitle>
              {pendingRequests && pendingRequests.length > 0 && (
                <Badge variant="destructive">{pendingRequests.length} {t("pending")}</Badge>
              )}
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="text-center py-4 text-muted-foreground">{tCommon("loading")}</div>
              ) : pendingRequests && pendingRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("user")}</TableHead>
                      <TableHead>{t("ministry")}</TableHead>
                      <TableHead>{t("requested")}</TableHead>
                      <TableHead className="text-right">{tCommon("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request: any) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={request.user?.image} />
                              <AvatarFallback>
                                {request.user?.name?.[0] || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{request.user?.name || t("unknown")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.ministry?.name}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <RequestActions
                            request={request}
                            onApprove={() => approveMutation.mutate(request.id)}
                            onReject={() => rejectMutation.mutate(request.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("noPendingRequests")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ministry Admins Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("ministryAdministrators")}</CardTitle>
              <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlusIcon className="mr-2 h-4 w-4" />
                    {t("addAdmin")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("addMinistryAdmin")}</DialogTitle>
                    <DialogDescription>
                      {t("addAdminDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right">{t("ministry")}</label>
                      <Select value={selectedMinistry} onValueChange={(v) => setSelectedMinistry(v ?? "")}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={t("selectMinistry")} />
                        </SelectTrigger>
                        <SelectContent>
                          {ministries?.map((ministry: any) => (
                            <SelectItem key={ministry.id} value={ministry.id}>
                              {ministry.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right">{t("user")}</label>
                      <Select value={selectedUser} onValueChange={(v) => setSelectedUser(v ?? "")}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder={t("selectUser")} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="admin-password" className="text-right">
                        {t("loginPassword")}
                      </Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder={t("passwordPlaceholder")}
                        className="col-span-3"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        minLength={8}
                      />
                      <p className="col-span-3 col-start-2 text-xs text-muted-foreground">
                        {t("passwordHint")}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddAdminOpen(false)}>
                      {tCommon("cancel")}
                    </Button>
                    <Button
                      onClick={handleAddAdmin}
                      disabled={addAdminMutation.isPending || !adminPassword || adminPassword.length < 8}
                    >
                      {addAdminMutation.isPending ? t("adding") : t("addAdmin")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loadingMinistries ? (
                <div className="text-center py-4 text-muted-foreground">{tCommon("loading")}</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {ministries?.map((ministry: any) => (
                    <Card key={ministry.id} className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{ministry.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {ministry.admins?.length > 0 ? (
                            ministry.admins.map((admin: any) => (
                              <div key={admin.id} className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={admin.user?.image} />
                                  <AvatarFallback className="text-xs">
                                    {admin.user?.name?.[0] || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{admin.user?.name}</span>
                                {admin.role === "LEADER" && (
                                  <CrownIcon className="h-3 w-3 text-yellow-500" />
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">{t("noAdminsAssigned")}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
