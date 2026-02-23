"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ministryService } from "@/services/ministry.service"
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

type MinistryForForm = { id: string; name: string; description?: string | null }

export function MinistryForm({
    ministry,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: {
    ministry?: MinistryForForm | null
    open?: boolean
    onOpenChange?: (open: boolean) => void
} = {}) {
    const queryClient = useQueryClient()
    const [internalOpen, setInternalOpen] = React.useState(false)
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")

    const isEdit = !!ministry
    const open = isEdit ? (controlledOpen ?? false) : internalOpen
    const setOpen = isEdit ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

    React.useEffect(() => {
        if (ministry) {
            setName(ministry.name)
            setDescription(ministry.description ?? "")
        }
    }, [ministry])

    const createMutation = useMutation({
        mutationFn: (payload: any) => ministryService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ministries"] })
            toast.success("Ministry created successfully")
            setOpen(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to create ministry")
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => ministryService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ministries"] })
            toast.success("Ministry updated successfully")
            setOpen(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to update ministry")
        },
    })

    const resetForm = () => {
        setName("")
        setDescription("")
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const payload = { name, description }
        if (isEdit) {
            updateMutation.mutate({ id: ministry.id, payload })
        } else {
            createMutation.mutate(payload)
        }
    }

    const pending = createMutation.isPending || updateMutation.isPending

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            {!isEdit && (
                <SheetTrigger render={<Button variant="outline" size="sm" />}>
                    <PlusIcon />
                    <span className="hidden lg:inline">Add Ministry</span>
                </SheetTrigger>
            )}
            <SheetContent side="center" className="w-[450px] max-w-full overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEdit ? "Edit Ministry" : "Add New Ministry"}</SheetTitle>
                    <SheetDescription>
                        {isEdit ? "Update ministry details." : "Define a new ministry and its purpose."}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4 px-4 text-sm">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Ministry Name</Label>
                        <Input
                            id="name"
                            placeholder="Worship Ministry"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="A brief description of the ministry"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <SheetFooter className="px-0 pt-4">
                        <Button type="submit" className="w-full" disabled={pending}>
                            {pending ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Ministry" : "Create Ministry"}
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
