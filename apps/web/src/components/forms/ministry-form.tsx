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

export function MinistryForm() {
    const queryClient = useQueryClient()
    const [open, setOpen] = React.useState(false)
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")

    const mutation = useMutation({
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

    const resetForm = () => {
        setName("")
        setDescription("")
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutation.mutate({
            name,
            description,
        })
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="outline" size="sm" />}>
                <PlusIcon />
                <span className="hidden lg:inline">Add Ministry</span>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Add New Ministry</SheetTitle>
                    <SheetDescription>
                        Define a new ministry and its purpose.
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
                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? "Creating..." : "Create Ministry"}
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
