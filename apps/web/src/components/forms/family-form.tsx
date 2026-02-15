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

export function FamilyForm() {
    const queryClient = useQueryClient()
    const [open, setOpen] = React.useState(false)
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [zoneId, setZoneId] = React.useState("")

    const { data: zones } = useQuery({
        queryKey: ["zones"],
        queryFn: () => zoneService.getAll(),
    })

    const mutation = useMutation({
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
        mutation.mutate({
            name,
            description,
            zoneId,
        })
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="outline" size="sm" />}>
                <PlusIcon />
                <span className="hidden lg:inline">Add Family</span>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Add New Family</SheetTitle>
                    <SheetDescription>
                        Register a new family and assign them to a zone.
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
                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? "Creating..." : "Create Family"}
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
