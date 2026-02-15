"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { roleService } from "@/services/role.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

export function RoleForm() {
    const queryClient = useQueryClient()
    const [open, setOpen] = React.useState(false)
    const [name, setName] = React.useState("")

    const mutation = useMutation({
        mutationFn: (name: string) => roleService.create(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] })
            toast.success("Role created successfully")
            setOpen(false)
            setName("")
        },
        onError: () => {
            toast.error("Failed to create role")
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutation.mutate(name)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button size="sm" />}>
                <PlusIcon />
                <span className="hidden lg:inline">Add Role</span>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Add New Role</SheetTitle>
                    <SheetDescription>
                        Create a new role for members.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., LEADER, DEACON, MEMBER"
                            value={name}
                            onChange={(e) => setName(e.target.value.toUpperCase())}
                            required
                        />
                    </div>
                    <SheetFooter className="px-0 pt-4">
                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? "Creating..." : "Create Role"}
                        </Button>
                        <SheetClose render={<Button variant="outline" className="w-full" type="button" />}>
                            Cancel
                        </SheetClose>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    )
}
