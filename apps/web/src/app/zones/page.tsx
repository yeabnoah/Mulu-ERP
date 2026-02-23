"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { zoneService } from "@/services/zone.service"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable, type DataTableFilterOption } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { columns, type Zone } from "./columns"
import { ZoneForm } from "@/components/forms/zone-form"
import { toast } from "sonner"

export default function ZonesPage() {
  const queryClient = useQueryClient()
  const [selectedZones, setSelectedZones] = React.useState<Zone[]>([])

  const { data: zones, isLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: () => zoneService.getAll(),
  })

  const filters: DataTableFilterOption<typeof zones>[] = React.useMemo(
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
      await Promise.all(ids.map((id) => zoneService.delete(id)))
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ["zones"] })
      toast.success(`${ids.length} zone(s) deleted successfully`)
      setSelectedZones([])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete zones")
    },
  })

  const handleSelectionChange = (rows: Zone[]) => {
    setSelectedZones(rows)
  }

  const handleBulkDelete = () => {
    if (selectedZones.length === 0) return
    if (
      !confirm(
        `Are you sure you want to delete ${selectedZones.length} zone(s)?`
      )
    ) {
      return
    }
    const ids = selectedZones.map((z) => z.id)
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
                {selectedZones.length > 0 && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted p-2">
                    <span className="text-sm font-medium">
                      {selectedZones.length} zone(s) selected
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
                  title="Zone Management"
                  columns={columns}
                  data={zones || []}
                  headerActions={<ZoneForm />}
                  isLoading={isLoading}
                  filters={filters}
                  onSelectionChange={handleSelectionChange}
                  searchPlaceholder="Search zones..."
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
