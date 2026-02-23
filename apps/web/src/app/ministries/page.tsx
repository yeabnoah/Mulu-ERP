"use client"

import * as React from "react"
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
import { columns, type Ministry } from "./columns"
import { MinistryForm } from "@/components/forms/ministry-form"
import { toast } from "sonner"

export default function MinistriesPage() {
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
        label: "Status",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    ],
    []
  )

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => ministryService.delete(id)))
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] })
      toast.success(`${ids.length} ministry(ies) deleted successfully`)
      setSelectedMinistries([])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete ministries")
    },
  })

  const handleSelectionChange = (rows: Ministry[]) => {
    setSelectedMinistries(rows)
  }

  const handleBulkDelete = () => {
    if (selectedMinistries.length === 0) return
    if (
      !confirm(
        `Are you sure you want to delete ${selectedMinistries.length} ministry(ies)?`
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
                      {selectedMinistries.length} ministry(ies) selected
                    </span>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={bulkDeleteMutation.isPending}
                      >
                        <Trash2Icon className="mr-2 h-4 w-4" />
                        {bulkDeleteMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                )}

                <DataTable
                  title="Ministry Management"
                  columns={columns}
                  data={ministries || []}
                  headerActions={<MinistryForm />}
                  isLoading={isLoading}
                  filters={filters}
                  onSelectionChange={handleSelectionChange}
                  searchPlaceholder="Search ministries..."
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
