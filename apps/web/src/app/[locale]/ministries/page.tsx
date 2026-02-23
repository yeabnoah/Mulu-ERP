"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ministryService } from "@/services/ministry.service"
import { AppSidebar } from "@/components/app-sidebar"
import {
  DataTable,
  type DataTableFilterOption,
} from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { useMinistryColumns, type Ministry } from "./columns"
import { MinistryForm } from "@/components/forms/ministry-form"
import { toast } from "sonner"

export default function MinistriesPage() {
  const t = useTranslations("ministries")
  const tCommon = useTranslations("common")
  const tTable = useTranslations("table")
  const columns = useMinistryColumns()
  const queryClient = useQueryClient()
  const [selectedMinistries, setSelectedMinistries] = React.useState<Ministry[]>([])

  const { data: ministries, isLoading } = useQuery({
    queryKey: ["ministries"],
    queryFn: () => ministryService.getAll(),
  })

  const filters: DataTableFilterOption<typeof ministries>[] = React.useMemo(
    () => [
      {
        id: "status",
        label: tTable("status"),
        options: [
          { label: tTable("active"), value: "active" },
          { label: tTable("inactive"), value: "inactive" },
        ],
      },
    ],
    [tTable]
  )

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => ministryService.delete(id)))
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] })
      toast.success(t("deletedSuccess", { count: ids.length }))
      setSelectedMinistries([])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t("failedDelete"))
    },
  })

  const handleSelectionChange = (rows: Ministry[]) => {
    setSelectedMinistries(rows)
  }

  const handleBulkDelete = () => {
    if (selectedMinistries.length === 0) return
    if (
      !confirm(
        t("confirmDelete", { count: selectedMinistries.length })
      )
    ) {
      return
    }
    const ids = selectedMinistries.map((m) => m.id)
    bulkDeleteMutation.mutate(ids)
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
                {selectedMinistries.length > 0 && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted p-2">
                    <span className="text-sm font-medium">
                      {t("selectedCount", { count: selectedMinistries.length })}
                    </span>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={bulkDeleteMutation.isPending}
                      >
                        <Trash2Icon className="mr-2 h-4 w-4" />
                        {bulkDeleteMutation.isPending ? t("deleting") : tCommon("delete")}
                      </Button>
                    </div>
                  </div>
                )}

                <DataTable
                  title={t("title")}
                  columns={columns}
                  data={ministries || []}
                  headerActions={<MinistryForm />}
                  isLoading={isLoading}
                  filters={filters}
                  onSelectionChange={handleSelectionChange}
                  searchPlaceholder={t("searchPlaceholder")}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
