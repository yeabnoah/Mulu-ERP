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
import { ministryService } from "@/services/ministry.service"
import { MinistryForm } from "@/components/forms/ministry-form"
import { toast } from "sonner"

export type Ministry = {
    id: string
    name: string
    description?: string | null
    createdAt: string
    updatedAt: string
}

function MinistryActions({ ministry }: { ministry: Ministry }) {
    const t = useTranslations("ministries")
    const tCommon = useTranslations("common")
    const queryClient = useQueryClient()
    const [editOpen, setEditOpen] = React.useState(false)
    const deleteMutation = useMutation({
        mutationFn: () => ministryService.delete(ministry.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ministries"] })
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
            <MinistryForm
                ministry={{ id: ministry.id, name: ministry.name, description: ministry.description ?? undefined }}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    )
}

export function useMinistryColumns(): ColumnDef<Ministry>[] {
    const t = useTranslations("ministries")
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
                <div className="text-muted-foreground line-clamp-1 max-w-[250px]">
                    {row.original.description || tCommon("na")}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: tTable("created"),
            cell: ({ row }) => (
                <div className="text-muted-foreground text-xs">
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => <MinistryActions ministry={row.original} />,
        },
    ]
}
