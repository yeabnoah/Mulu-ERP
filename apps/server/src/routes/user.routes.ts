import { Hono } from "hono";
import prisma from "@muluerp/db";

const userRoutes = new Hono();

// Get all users with their roles
userRoutes.get("/", async (c) => {
    const users = await prisma.user.findMany({
        include: {
            roles: {
                include: {
                    role: true,
                },
            },
            family: true,
            zone: true,
            currentMinistry: true,
            children: true,
        },
    });
    return c.json(users);
});

// Get user by ID
userRoutes.get("/:id", async (c) => {
    const id = c.req.param("id");
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            roles: {
                include: {
                    role: true,
                },
            },
            family: true,
            zone: true,
            currentMinistry: true,
            children: true,
        },
    });
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json(user);
});

// Create user
userRoutes.post("/", async (c) => {
    const data = await c.req.json<{
        name: string
        email?: string
        birthPlace?: string
        birthDate?: string
        livingAddress?: string
        mobile1?: string
        mobile2?: string
        educationStatus?: string
        skill?: string
        work?: string
        companyName?: string
        closePersonName?: string
        closePersonMobile?: string
        marriageStatus?: string
        spouseName?: string
        spouseBelief?: string
        baptizedYear?: number
        foundationTeacherName?: string
        fromOtherChurch?: boolean
        formerChurchName?: string
        leaveMessage?: string
        leaveMessageType?: string
        leaveMessageBroughtDate?: string
        roleIds?: string[]
        zoneId?: string
        currentMinistryId?: string
        familyId?: string
        familyRole?: string
        children?: Array<{
            name: string
            gender: string
            grade?: string
            relationType?: string
            schoolYear?: string
        }>
    }>();

    const user = await prisma.user.create({
        data: {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: data.name,
            email: data.email || `${data.name.toLowerCase().replace(/\s/g, '.')}@church.local`,
            birthPlace: data.birthPlace,
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            livingAddress: data.livingAddress,
            mobile1: data.mobile1,
            mobile2: data.mobile2,
            educationStatus: data.educationStatus,
            skill: data.skill,
            work: data.work,
            companyName: data.companyName,
            closePersonName: data.closePersonName,
            closePersonMobile: data.closePersonMobile,
            marriageStatus: data.marriageStatus as any,
            spouseName: data.spouseName,
            spouseBelief: data.spouseBelief as any,
            baptizedYear: data.baptizedYear,
            foundationTeacherName: data.foundationTeacherName,
            fromOtherChurch: data.fromOtherChurch,
            formerChurchName: data.formerChurchName,
            leaveMessage: data.leaveMessage,
            leaveMessageType: data.leaveMessageType as any,
            leaveMessageBroughtDate: data.leaveMessageBroughtDate ? new Date(data.leaveMessageBroughtDate) : null,
            zoneId: data.zoneId,
            currentMinistryId: data.currentMinistryId,
            familyId: data.familyId,
            familyRole: data.familyRole as any,
            roles: data.roleIds ? {
                create: data.roleIds.map((roleId) => ({ roleId }))
            } : undefined,
            children: data.children ? {
                create: data.children
            } : undefined,
        },
    });

    return c.json(user);
});

// Update user roles
userRoutes.post("/:id/roles", async (c) => {
    const userId = c.req.param("id");
    const { roleIds } = await c.req.json<{ roleIds: string[] }>();

    // Delete existing roles
    await prisma.userRole.deleteMany({
        where: { userId },
    });

    // Add new roles
    if (roleIds.length > 0) {
        await prisma.userRole.createMany({
            data: roleIds.map((roleId) => ({
                userId,
                roleId,
            })),
        });
    }

    return c.json({ message: "Roles updated successfully" });
});

// Delete user
userRoutes.delete("/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.user.delete({
        where: { id },
    });
    return c.json({ message: "User deleted" });
});

export default userRoutes;
