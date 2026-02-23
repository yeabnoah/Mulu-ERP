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

export type Ministry = {
    id: string
    name: string
    description?: string | null
    createdAt: string
    updatedAt: string
}

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ministryService } from "@/services/ministry.service"
import { MinistryForm } from "@/components/forms/ministry-form"
import { toast } from "sonner"

function MinistryActions({ ministry }: { ministry: Ministry }) {
    const queryClient = useQueryClient()
    const [editOpen, setEditOpen] = React.useState(false)
    const deleteMutation = useMutation({
        mutationFn: () => ministryService.delete(ministry.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ministries"] })
            toast.success("Ministry removed successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to remove ministry")
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
                            <span className="sr-only">Open menu</span>
                        </Button>
                    }
                />
                <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? "Removing..." : "Remove"}
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

export const columns: ColumnDef<Ministry>[] = [
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
            <div className="text-muted-foreground line-clamp-1 max-w-[250px]">
                {row.original.description || "N/A"}
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Created",
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
