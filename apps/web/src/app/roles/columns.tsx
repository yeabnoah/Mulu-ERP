"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Role } from "@/services/role.service"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { roleService } from "@/services/role.service"
import { toast } from "sonner"

export const columns: ColumnDef<Role>[] = [
    {
        accessorKey: "name",
        header: "Role Name",
        cell: ({ row }) => (
            <span className="capitalize font-medium">{row.original.name.toLowerCase()}</span>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const queryClient = useQueryClient()
            const deleteMutation = useMutation({
                mutationFn: (id: string) => roleService.delete(id),
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["roles"] })
                    toast.success("Role deleted")
                },
                onError: () => {
                    toast.error("Failed to delete role")
                },
            })

            const handleDelete = () => {
                if (confirm("Are you sure you want to delete this role?")) {
                    deleteMutation.mutate(row.original.id)
                }
            }

            return (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                >
                    <Trash2Icon className="h-4 w-4 text-destructive" />
                </Button>
            )
        },
    },
]
