"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { zoneService } from "@/services/zone.service"
import { userService } from "@/services/user.service"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

export function ZoneForm() {
    const queryClient = useQueryClient()
    const [open, setOpen] = React.useState(false)
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [pastorId, setPastorId] = React.useState("")

    const { data: users } = useQuery({
        queryKey: ["users"],
        queryFn: () => userService.getAll(),
    })

    const mutation = useMutation({
        mutationFn: (payload: any) => zoneService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] })
            toast.success("Zone created successfully")
            setOpen(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to create zone")
        },
    })

    const resetForm = () => {
        setName("")
        setDescription("")
        setPastorId("")
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!pastorId) {
            toast.error("Please select a pastor")
            return
        }
        mutation.mutate({
            name,
            description,
            pastorId,
        })
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="outline" size="sm" />}>
                <PlusIcon />
                <span className="hidden lg:inline">Add Zone</span>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Add New Zone</SheetTitle>
                    <SheetDescription>
                        Create a new zone and assign a pastor.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4 px-4 text-sm">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Zone Name</Label>
                        <Input
                            id="name"
                            placeholder="Northern Zone"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            placeholder="e.g. Covers the northern suburbs"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="pastor">Pastor</Label>
                        <Select value={pastorId} onValueChange={(val) => setPastorId(val || "")}>
                            <SelectTrigger id="pastor">
                                <SelectValue placeholder="Select a pastor" />
                            </SelectTrigger>
                            <SelectContent>
                                {users?.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <SheetFooter className="px-0 pt-4">
                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? "Creating..." : "Create Zone"}
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
