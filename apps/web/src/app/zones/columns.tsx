"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
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

export type Zone = {
    id: string
    name: string
    description?: string | null
    pastorId: string
    pastor: { name: string }
    createdAt: string
    updatedAt: string
}

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { zoneService } from "@/services/zone.service"
import { toast } from "sonner"

function ZoneActions({ zone }: { zone: Zone }) {
    const queryClient = useQueryClient()
    const deleteMutation = useMutation({
        mutationFn: () => zoneService.delete(zone.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] })
            toast.success("Zone removed successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to remove zone")
        },
    })

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        className="data-open:bg-muted text-muted-foreground flex size-8"
                        size="icon"
                    >
                        <EllipsisVerticalIcon />
                        <span className="sr-only">Open menu</span>
                    </Button>
                }
            />
            <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? "Removing..." : "Remove"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const columns: ColumnDef<Zone>[] = [
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
                    aria-label="Select all"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div className="text-muted-foreground line-clamp-1 max-w-[200px]">
                {row.original.description || "N/A"}
            </div>
        ),
    },
    {
        accessorKey: "pastor",
        header: "Pastor",
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {row.original.pastor?.name || "N/A"}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <ZoneActions zone={row.original} />,
    },
]
