"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { familyService } from "@/services/family.service"
import { zoneService } from "@/services/zone.service"
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

type FamilyForForm = { id: string; name: string; description?: string | null; zoneId: string }

export function FamilyForm({
    family,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: {
    family?: FamilyForForm | null
    open?: boolean
    onOpenChange?: (open: boolean) => void
} = {}) {
    const queryClient = useQueryClient()
    const [internalOpen, setInternalOpen] = React.useState(false)
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [zoneId, setZoneId] = React.useState("")

    const isEdit = !!family
    const open = isEdit ? (controlledOpen ?? false) : internalOpen
    const setOpen = isEdit ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen

    React.useEffect(() => {
        if (family) {
            setName(family.name)
            setDescription(family.description ?? "")
            setZoneId(family.zoneId)
        }
    }, [family])

    const { data: zones } = useQuery({
        queryKey: ["zones"],
        queryFn: () => zoneService.getAll(),
    })

    const createMutation = useMutation({
        mutationFn: (payload: any) => familyService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["families"] })
            toast.success("Family created successfully")
            setOpen(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to create family")
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => familyService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["families"] })
            toast.success("Family updated successfully")
            setOpen(false)
            resetForm()
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to update family")
        },
    })

    const resetForm = () => {
        setName("")
        setDescription("")
        setZoneId("")
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!zoneId) {
            toast.error("Please select a zone")
            return
        }
        const payload = { name, description, zoneId }
        if (isEdit) {
            updateMutation.mutate({ id: family.id, payload })
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
                    <span className="hidden lg:inline">Add Family</span>
                </SheetTrigger>
            )}
            <SheetContent side="center" className="w-[450px] max-w-full overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEdit ? "Edit Family" : "Add New Family"}</SheetTitle>
                    <SheetDescription>
                        {isEdit ? "Update family details and zone." : "Register a new family and assign them to a zone."}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4 px-4 text-sm">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Family Name</Label>
                        <Input
                            id="name"
                            placeholder="The Smith Family"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            placeholder="e.g. Active in music ministry"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="zone">Zone</Label>
                        <Select value={zoneId} onValueChange={(val) => setZoneId(val || "")}>
                            <SelectTrigger id="zone">
                                <SelectValue placeholder="Select a zone" />
                            </SelectTrigger>
                            <SelectContent>
                                {zones?.map((zone: any) => (
                                    <SelectItem key={zone.id} value={zone.id}>
                                        {zone.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <SheetFooter className="px-0 pt-4">
                        <Button type="submit" className="w-full" disabled={pending}>
                            {pending ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Family" : "Create Family"}
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
