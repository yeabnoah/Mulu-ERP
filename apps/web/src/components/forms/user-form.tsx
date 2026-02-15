"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "@/services/user.service"
import { roleService } from "@/services/role.service"
import { zoneService } from "@/services/zone.service"
import { ministryService } from "@/services/ministry.service"
import { familyService } from "@/services/family.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Checkbox } from "@/components/ui/checkbox"
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Child {
    name: string
    gender: string
    grade?: string
    relationType?: string
    schoolYear?: string
}

interface UserFormProps {
    user?: UserData | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultValues?: Partial<UserData>;
}

interface UserData {
    id: string;
    name: string;
    birthPlace?: string;
    birthDate?: string;
    livingAddress?: string;
    mobile1?: string;
    mobile2?: string;
    educationStatus?: string;
    skill?: string;
    work?: string;
    companyName?: string;
    zoneId?: string;
    currentMinistryId?: string;
    closePersonName?: string;
    closePersonMobile?: string;
    marriageStatus?: string;
    spouseName?: string;
    spouseBelief?: string;
    baptizedYear?: number;
    foundationTeacherName?: string;
    fromOtherChurch?: boolean;
    formerChurchName?: string;
    leaveMessage?: string;
    leaveMessageType?: string;
    familyId?: string;
    familyRole?: string;
    roleIds?: string[];
    children?: Child[];
}

export function UserForm({ user, open: externalOpen, onOpenChange: externalOnOpenChange, defaultValues }: UserFormProps) {
    const queryClient = useQueryClient()
    const [internalOpen, setInternalOpen] = React.useState(false)
    const open = externalOpen !== undefined ? externalOpen : internalOpen
    const setOpen = externalOnOpenChange || setInternalOpen
    const isEditing = !!user

    // Basic Info
    const [name, setName] = React.useState("")
    const [birthPlace, setBirthPlace] = React.useState("")
    const [birthDate, setBirthDate] = React.useState("")
    const [livingAddress, setLivingAddress] = React.useState("")
    const [mobile1, setMobile1] = React.useState("")
    const [mobile2, setMobile2] = React.useState("")

    // Education & Work
    const [educationStatus, setEducationStatus] = React.useState("")
    const [skill, setSkill] = React.useState("")
    const [work, setWork] = React.useState("")
    const [companyName, setCompanyName] = React.useState("")

    // Zone & Ministry
    const [zoneId, setZoneId] = React.useState("")
    const [currentMinistryId, setCurrentMinistryId] = React.useState("")

    // Emergency Contact
    const [closePersonName, setClosePersonName] = React.useState("")
    const [closePersonMobile, setClosePersonMobile] = React.useState("")

    // Marriage
    const [marriageStatus, setMarriageStatus] = React.useState("")
    const [spouseName, setSpouseName] = React.useState("")
    const [spouseBelief, setSpouseBelief] = React.useState("")

    // Church Background
    const [baptizedYear, setBaptizedYear] = React.useState("")
    const [foundationTeacherName, setFoundationTeacherName] = React.useState("")
    const [fromOtherChurch, setFromOtherChurch] = React.useState(false)
    const [formerChurchName, setFormerChurchName] = React.useState("")
    const [leaveMessage, setLeaveMessage] = React.useState("")
    const [leaveMessageType, setLeaveMessageType] = React.useState("")

    // Family - assign to existing family
    const [familyId, setFamilyId] = React.useState("")
    const [familyRole, setFamilyRole] = React.useState("")

    // Children
    const [children, setChildren] = React.useState<Child[]>([])

    // Roles
    const [selectedRoles, setSelectedRoles] = React.useState<string[]>([])

    const { data: roles } = useQuery({
        queryKey: ["roles"],
        queryFn: () => roleService.getAll(),
    })

    const { data: zones } = useQuery({
        queryKey: ["zones"],
        queryFn: () => zoneService.getAll(),
    })

    const { data: ministries } = useQuery({
        queryKey: ["ministries"],
        queryFn: () => ministryService.getAll(),
    })

    const { data: families } = useQuery({
        queryKey: ["families"],
        queryFn: () => familyService.getAll(),
    })

    // Populate form when editing
    React.useEffect(() => {
        if (user) {
            setName(user.name || "")
            setBirthPlace(user.birthPlace || "")
            setBirthDate(user.birthDate || "")
            setLivingAddress(user.livingAddress || "")
            setMobile1(user.mobile1 || "")
            setMobile2(user.mobile2 || "")
            setEducationStatus(user.educationStatus || "")
            setSkill(user.skill || "")
            setWork(user.work || "")
            setCompanyName(user.companyName || "")
            setZoneId(user.zoneId || "")
            setCurrentMinistryId(user.currentMinistryId || "")
            setClosePersonName(user.closePersonName || "")
            setClosePersonMobile(user.closePersonMobile || "")
            setMarriageStatus(user.marriageStatus || "")
            setSpouseName(user.spouseName || "")
            setSpouseBelief(user.spouseBelief || "")
            setBaptizedYear(user.baptizedYear?.toString() || "")
            setFoundationTeacherName(user.foundationTeacherName || "")
            setFromOtherChurch(user.fromOtherChurch || false)
            setFormerChurchName(user.formerChurchName || "")
            setLeaveMessage(user.leaveMessage || "")
            setLeaveMessageType(user.leaveMessageType || "")
            setFamilyId(user.familyId || "")
            setFamilyRole(user.familyRole || "")
            setSelectedRoles(user.roleIds || [])
            setChildren(user.children || [])
        }
    }, [user])

    // Apply default values when opening in create mode
    React.useEffect(() => {
        if (!isEditing && defaultValues && open) {
            if (defaultValues.zoneId) setZoneId(defaultValues.zoneId)
            if (defaultValues.currentMinistryId) setCurrentMinistryId(defaultValues.currentMinistryId)
            if (defaultValues.familyId) setFamilyId(defaultValues.familyId)
            if (defaultValues.familyRole) setFamilyRole(defaultValues.familyRole)
        }
    }, [defaultValues, open, isEditing])

    const mutation = useMutation({
        mutationFn: (payload: any) => {
            if (isEditing && user) {
                return userService.update(user.id, payload)
            }
            return userService.create(payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success(isEditing ? "Member updated successfully" : "Member created successfully")
            setOpen(false)
            if (!externalOnOpenChange) {
                resetForm()
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || `Failed to ${isEditing ? "update" : "create"} member`)
        },
    })

    const resetForm = () => {
        setName("")
        setBirthPlace("")
        setBirthDate("")
        setLivingAddress("")
        setMobile1("")
        setMobile2("")
        setEducationStatus("")
        setSkill("")
        setWork("")
        setCompanyName("")
        setZoneId("")
        setCurrentMinistryId("")
        setClosePersonName("")
        setClosePersonMobile("")
        setMarriageStatus("")
        setSpouseName("")
        setSpouseBelief("")
        setBaptizedYear("")
        setFoundationTeacherName("")
        setFromOtherChurch(false)
        setFormerChurchName("")
        setLeaveMessage("")
        setLeaveMessageType("")
        setFamilyId("")
        setFamilyRole("")
        setChildren([])
        setSelectedRoles([])
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutation.mutate({
            name,
            birthPlace,
            birthDate: birthDate || undefined,
            livingAddress,
            mobile1,
            mobile2,
            educationStatus,
            skill,
            work,
            companyName,
            zoneId: zoneId || undefined,
            currentMinistryId: currentMinistryId || undefined,
            closePersonName,
            closePersonMobile,
            marriageStatus: marriageStatus || undefined,
            spouseName: spouseName || undefined,
            spouseBelief: spouseBelief || undefined,
            baptizedYear: baptizedYear ? parseInt(baptizedYear) : undefined,
            foundationTeacherName,
            fromOtherChurch,
            formerChurchName: formerChurchName || undefined,
            leaveMessage: leaveMessage || undefined,
            leaveMessageType: leaveMessageType || undefined,
            familyId: familyId || undefined,
            familyRole: familyRole || undefined,
            roleIds: selectedRoles,
            children: children.length > 0 ? children : undefined,
        })
    }

    const toggleRole = (roleId: string) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId]
        )
    }

    const addChild = () => {
        setChildren([...children, { name: "", gender: "", grade: "", relationType: "", schoolYear: "" }])
    }

    const removeChild = (index: number) => {
        setChildren(children.filter((_, i) => i !== index))
    }

    const updateChild = (index: number, field: keyof Child, value: string) => {
        const updated = [...children]
        updated[index] = { ...updated[index], [field]: value }
        setChildren(updated)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="outline" size="sm" />}>
                <PlusIcon />
                <span className="hidden lg:inline">Add Member</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[500px] max-w-full overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Member" : "Add New Member"}</SheetTitle>
                    <SheetDescription>
                        {isEditing ? "Update member details." : "Register a new church member with all their details."}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4 px-4 text-sm">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-base border-b pb-2">Basic Information</h3>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="birthPlace">Birth Place</Label>
                                <Input
                                    id="birthPlace"
                                    placeholder="Addis Ababa"
                                    value={birthPlace}
                                    onChange={(e) => setBirthPlace(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="birthDate">Birth Date</Label>
                                <Input
                                    id="birthDate"
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="livingAddress">Living Address</Label>
                            <Textarea
                                id="livingAddress"
                                placeholder="Full address..."
                                value={livingAddress}
                                onChange={(e) => setLivingAddress(e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="mobile1">Mobile No 1 *</Label>
                                <Input
                                    id="mobile1"
                                    placeholder="+251 9xx xxx xxxx"
                                    value={mobile1}
                                    onChange={(e) => setMobile1(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="mobile2">Mobile No 2</Label>
                                <Input
                                    id="mobile2"
                                    placeholder="+251 9xx xxx xxxx"
                                    value={mobile2}
                                    onChange={(e) => setMobile2(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Education & Work */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-base border-b pb-2">Education & Work</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="educationStatus">Education Status</Label>
                                <Select value={educationStatus} onValueChange={(value) => setEducationStatus(value || "")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                                        <SelectItem value="DIPLOMA">Diploma</SelectItem>
                                        <SelectItem value="DEGREE">Degree</SelectItem>
                                        <SelectItem value="MASTERS">Masters</SelectItem>
                                        <SelectItem value="PHD">PhD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="skill">Skill</Label>
                                <Input
                                    id="skill"
                                    placeholder="e.g., Teaching, Music"
                                    value={skill}
                                    onChange={(e) => setSkill(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="work">Work</Label>
                                <Input
                                    id="work"
                                    placeholder="e.g., Teacher, Engineer"
                                    value={work}
                                    onChange={(e) => setWork(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <Input
                                    id="companyName"
                                    placeholder="Company name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Zone & Ministry */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-base border-b pb-2">Zone & Ministry</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="zone">Zone</Label>
                                <Select value={zoneId} onValueChange={(value) => setZoneId(value || "")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select zone..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {zones?.map((zone: any) => (
                                            <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="ministry">Current Ministry</Label>
                                <Select value={currentMinistryId} onValueChange={(value) => setCurrentMinistryId(value || "")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ministry..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ministries?.map((ministry: any) => (
                                            <SelectItem key={ministry.id} value={ministry.id}>{ministry.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Family Assignment */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-base border-b pb-2">Family</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="family">Assign to Family</Label>
                                <Select value={familyId} onValueChange={(value) => setFamilyId(value || "")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select family..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {families?.map((family: any) => (
                                            <SelectItem key={family.id} value={family.id}>{family.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="familyRole">Family Role</Label>
                                <Select value={familyRole} onValueChange={(value) => setFamilyRole(value || "")}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FATHER">Father</SelectItem>
                                        <SelectItem value="MOTHER">Mother</SelectItem>
                                        <SelectItem value="SON">Son</SelectItem>
                                        <SelectItem value="DAUGHTER">Daughter</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-base border-b pb-2">Emergency Contact</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="closePersonName">Close Person Name</Label>
                                <Input
                                    id="closePersonName"
                                    placeholder="Emergency contact name"
                                    value={closePersonName}
                                    onChange={(e) => setClosePersonName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="closePersonMobile">Close Person Mobile</Label>
                                <Input
                                    id="closePersonMobile"
                                    placeholder="+251 9xx xxx xxxx"
                                    value={closePersonMobile}
                                    onChange={(e) => setClosePersonMobile(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Marriage Information */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-base border-b pb-2">Marriage Information</h3>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="marriageStatus">Marriage Status</Label>
                            <Select value={marriageStatus} onValueChange={(value) => setMarriageStatus(value || "")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SINGLE">Single</SelectItem>
                                    <SelectItem value="MARRIED">Married</SelectItem>
                                    <SelectItem value="WIDOW">Widow</SelectItem>
                                    <SelectItem value="DIVORCED">Divorced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {marriageStatus === "MARRIED" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="spouseName">Spouse Name</Label>
                                    <Input
                                        id="spouseName"
                                        placeholder="Spouse name"
                                        value={spouseName}
                                        onChange={(e) => setSpouseName(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="spouseBelief">Spouse Belief</Label>
                                    <Select value={spouseBelief} onValueChange={(value) => setSpouseBelief(value || "")}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BELIEVER">Believer</SelectItem>
                                            <SelectItem value="OTHER">Other Religion</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Children */}
                    {(marriageStatus === "MARRIED" || familyRole === "FATHER" || familyRole === "MOTHER") && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-semibold text-base">Children</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addChild}>
                                    <PlusIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            {children.map((child, index) => (
                                <div key={index} className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">Name</Label>
                                            <Input
                                                placeholder="Child name"
                                                value={child.name}
                                                onChange={(e) => updateChild(index, "name", e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">Gender</Label>
                                            <Select value={child.gender} onValueChange={(v) => updateChild(index, "gender", v || "")}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">Grade</Label>
                                            <Input
                                                placeholder="Grade"
                                                value={child.grade}
                                                onChange={(e) => updateChild(index, "grade", e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Label className="text-xs">School Year</Label>
                                            <Input
                                                placeholder="e.g., 2024-2025"
                                                value={child.schoolYear}
                                                onChange={(e) => updateChild(index, "schoolYear", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeChild(index)}>
                                        <Trash2Icon className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Church Background */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-base border-b pb-2">Church Background</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="baptizedYear">Baptized Year</Label>
                                <Input
                                    id="baptizedYear"
                                    type="number"
                                    placeholder="e.g., 2020"
                                    value={baptizedYear}
                                    onChange={(e) => setBaptizedYear(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="foundationTeacherName">Foundation Teacher</Label>
                                <Input
                                    id="foundationTeacherName"
                                    placeholder="Teacher name"
                                    value={foundationTeacherName}
                                    onChange={(e) => setFoundationTeacherName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="fromOtherChurch"
                                checked={fromOtherChurch}
                                onCheckedChange={(checked) => setFromOtherChurch(checked as boolean)}
                            />
                            <Label htmlFor="fromOtherChurch">From other church?</Label>
                        </div>
                        {fromOtherChurch && (
                            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="formerChurchName">Former Church Name</Label>
                                    <Input
                                        id="formerChurchName"
                                        placeholder="Church name"
                                        value={formerChurchName}
                                        onChange={(e) => setFormerChurchName(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="leaveMessageType">Leave Message Type</Label>
                                    <Select value={leaveMessageType} onValueChange={(value) => setLeaveMessageType(value || "")}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LEAVE_MESSAGE">Leave Message</SelectItem>
                                            <SelectItem value="SPECIAL_CASE">Special Case</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {leaveMessageType && (
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="leaveMessage">Leave Message</Label>
                                        <Textarea
                                            id="leaveMessage"
                                            placeholder="Details about leaving..."
                                            value={leaveMessage}
                                            onChange={(e) => setLeaveMessage(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Roles */}
                    <div className="flex flex-col gap-3">
                        <Label>Roles</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {roles?.map((role) => (
                                <div key={role.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={selectedRoles.includes(role.id)}
                                        onCheckedChange={() => toggleRole(role.id)}
                                    />
                                    <Label
                                        htmlFor={`role-${role.id}`}
                                        className="text-xs capitalize font-normal"
                                    >
                                        {role.name.toLowerCase()}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <SheetFooter className="px-0 pt-4">
                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Member" : "Create Member")}
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
