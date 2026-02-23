"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVerticalIcon } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { zoneService } from "@/services/zone.service"
import { ZoneForm } from "@/components/forms/zone-form"
import { toast } from "sonner"

export type Zone = {
    id: string
    name: string
    description?: string | null
    pastorId: string
    pastor: { name: string }
    createdAt: string
    updatedAt: string
}

function ZoneActions({ zone }: { zone: Zone }) {
    const t = useTranslations("zones")
    const tCommon = useTranslations("common")
    const queryClient = useQueryClient()
    const [editOpen, setEditOpen] = React.useState(false)
    const deleteMutation = useMutation({
        mutationFn: () => zoneService.delete(zone.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] })
            toast.success(t("removedSuccess"))
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || t("failedRemove"))
        },
    })

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="ghost"
                            className="data-open:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <EllipsisVerticalIcon />
                            <span className="sr-only">{tCommon("openMenu")}</span>
                        </Button>
                    }
                />
                <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        {tCommon("edit")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? tCommon("removing") : tCommon("remove")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <ZoneForm
                zone={{ id: zone.id, name: zone.name, description: zone.description ?? undefined, pastorId: zone.pastorId }}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    )
}

export function useZoneColumns(): ColumnDef<Zone>[] {
    const t = useTranslations("zones")
    const tCommon = useTranslations("common")
    const tTable = useTranslations("table")

    return [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        indeterminate={
                            table.getIsSomePageRowsSelected() &&
                            !table.getIsAllPageRowsSelected()
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label={tCommon("selectAll")}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label={tCommon("selectRow")}
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        { accessorKey: "name", header: tTable("name") },
        {
            accessorKey: "description",
            header: tTable("description"),
            cell: ({ row }) => (
                <div className="text-muted-foreground line-clamp-1 max-w-[200px]">
                    {row.original.description || tCommon("na")}
                </div>
            ),
        },
        {
            accessorKey: "pastor",
            header: tTable("pastor"),
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    {row.original.pastor?.name || tCommon("na")}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => <ZoneActions zone={row.original} />,
        },
    ]
}
