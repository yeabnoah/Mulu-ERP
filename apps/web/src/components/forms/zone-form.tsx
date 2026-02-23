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

type ZoneForForm = { id: string; name: string; description?: string | null; pastorId: string }

export function ZoneForm({
    zone,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: {
    zone?: ZoneForForm | null
    open?: boolean
    onOpenChange?: (open: boolean) => void
} = {}) {
    const queryClient = useQueryClient()
    const [internalOpen, setInternalOpen] = React.useState(false)
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [pastorId, setPastorId] = React.useState("")

    const isEdit = !!zone
    const open = isEdit ? (controlledOpen ?? false) : internalOpen
    const setOpen = isEdit ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

    React.useEffect(() => {
        if (zone) {
            setName(zone.name)
            setDescription(zone.description ?? "")
            setPastorId(zone.pastorId)
        }
    }, [zone])

    const { data: users } = useQuery({
        queryKey: ["users"],
        queryFn: () => userService.getAll(),
    })

    const createMutation = useMutation({
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

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => zoneService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["zones"] })
            toast.success("Zone updated successfully")
            setOpen(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to update zone")
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
        const payload = { name, description, pastorId }
        if (isEdit) {
            updateMutation.mutate({ id: zone.id, payload })
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
                    <span className="hidden lg:inline">Add Zone</span>
                </SheetTrigger>
            )}
            <SheetContent side="center" className="w-[450px] max-w-full overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEdit ? "Edit Zone" : "Add New Zone"}</SheetTitle>
                    <SheetDescription>
                        {isEdit ? "Update zone and pastor assignment." : "Create a new zone and assign a pastor."}
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
                        <Button type="submit" className="w-full" disabled={pending}>
                            {pending ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Zone" : "Create Zone"}
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
