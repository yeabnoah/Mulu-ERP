import { Hono } from "hono";
import { hashPassword } from "better-auth/crypto";
import prisma from "@muluerp/db";

const userRoutes = new Hono();

// Get all users with their roles
userRoutes.get("/", async (c) => {
    const zoneId = c.req.query("zoneId");
    const where = zoneId ? { zoneId } : {};

    const users = await prisma.user.findMany({
        where,
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

// Set password for a user (admin only – used when assigning ministry admin so they can log in)
userRoutes.post("/set-password", async (c) => {
    const body = await c.req.json<{ userId: string; newPassword: string }>();
    const { userId, newPassword } = body;
    if (!userId || !newPassword || typeof newPassword !== "string") {
        return c.json({ error: "userId and newPassword are required" }, 400);
    }
    if (newPassword.length < 8) {
        return c.json({ error: "Password must be at least 8 characters" }, 400);
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) return c.json({ error: "User not found" }, 404);

    const hashed = await hashPassword(newPassword);
    const existing = await prisma.account.findFirst({
        where: { userId, providerId: "credential" },
    });
    if (existing) {
        await prisma.account.update({
            where: { id: existing.id },
            data: { password: hashed, updatedAt: new Date() },
        });
    } else {
        await prisma.account.create({
            data: {
                id: `credential-${userId}`,
                userId,
                accountId: user.email,
                providerId: "credential",
                password: hashed,
            },
        });
    }
    return c.json({ message: "Password set successfully" });
});

// Create user
userRoutes.post("/", async (c) => {
    const data = await c.req.json<{
        name: string
        email?: string
        image?: string
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

    try {
        const user = await prisma.user.create({
            data: {
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: data.name,
                email: data.email || `${data.name.toLowerCase().replace(/\s/g, '.')}@church.local`,
                image: data.image,
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
    } catch (err: unknown) {
        const prismaError = err as { code?: string };
        if (prismaError.code === "P2002") {
            return c.json(
                { error: "A user with this email already exists." },
                409
            );
        }
        throw err;
    }
});

// Update user
userRoutes.patch("/:id", async (c) => {
    const userId = c.req.param("id");
    const data = await c.req.json<{
        name?: string
        email?: string
        image?: string | null
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
        baptizedYear?: number | null
        foundationTeacherName?: string
        fromOtherChurch?: boolean
        formerChurchName?: string
        leaveMessage?: string
        leaveMessageType?: string
        leaveMessageBroughtDate?: string
        roleIds?: string[]
        zoneId?: string | null
        currentMinistryId?: string | null
        familyId?: string | null
        familyRole?: string
        children?: Array<{
            name: string
            gender: string
            grade?: string
            relationType?: string
            schoolYear?: string
        }>
    }>();

    // Update user basic info
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            email: data.email,
            image: data.image,
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
        },
    });

    // Update roles if provided
    if (data.roleIds !== undefined) {
        // Delete existing roles
        await prisma.userRole.deleteMany({
            where: { userId },
        });

        // Add new roles
        if (data.roleIds.length > 0) {
            await prisma.userRole.createMany({
                data: data.roleIds.map((roleId) => ({
                    userId,
                    roleId,
                })),
            });
        }
    }

    // Update children if provided
    if (data.children !== undefined) {
        // Delete existing children
        await prisma.child.deleteMany({
            where: { parentId: userId },
        });

        // Add new children
        if (data.children.length > 0) {
            await prisma.child.createMany({
                data: data.children.map((child) => ({
                    name: child.name,
                    gender: child.gender as any,
                    grade: child.grade,
                    relationType: child.relationType,
                    schoolYear: child.schoolYear,
                    parentId: userId,
                })),
            });
        }
    }

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

// Promote user to pastor - assign PASTOR role and zone
userRoutes.post("/:id/promote-to-pastor", async (c) => {
    const userId = c.req.param("id");
    const { zoneId, roleIds } = await c.req.json<{ zoneId: string; roleIds: string[] }>();

    // First, get the PASTOR role
    const pastorRole = await prisma.role.findFirst({
        where: { name: "PASTOR" },
    });

    if (!pastorRole) {
        return c.json({ error: "PASTOR role not found" }, 404);
    }

    // Add PASTOR role to roleIds if not present
    const allRoleIds = [...new Set([...roleIds, pastorRole.id])];

    // Update user roles
    await prisma.userRole.deleteMany({
        where: { userId },
    });

    await prisma.userRole.createMany({
        data: allRoleIds.map((roleId) => ({
            userId,
            roleId,
        })),
    });

    // Update user's zone and also set them as the pastor of that zone
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            zoneId,
        },
    });

    // Update zone to assign this user as pastor
    await prisma.zone.update({
        where: { id: zoneId },
        data: { pastorId: userId },
    });

    return c.json({ message: "User promoted to pastor successfully", user });
});

// Update user zone
userRoutes.patch("/:id/zone", async (c) => {
    const userId = c.req.param("id");
    const { zoneId } = await c.req.json<{ zoneId: string | null }>();

    const user = await prisma.user.update({
        where: { id: userId },
        data: { zoneId },
    });

    return c.json(user);
});

// Delete user
userRoutes.delete("/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.user.delete({
        where: { id },
    });
    return c.json({ message: "User deleted" });
});

// Bulk delete users
userRoutes.post("/bulk-delete", async (c) => {
    const { ids } = await c.req.json<{ ids: string[] }>();

    await prisma.user.deleteMany({
        where: { id: { in: ids } },
    });

    return c.json({ message: `${ids.length} users deleted` });
});

// Bulk promote to pastor
userRoutes.post("/bulk-promote-to-pastor", async (c) => {
    const { ids, zoneId } = await c.req.json<{ ids: string[]; zoneId: string }>();

    // Get the PASTOR role
    const pastorRole = await prisma.role.findFirst({
        where: { name: "PASTOR" },
    });

    if (!pastorRole) {
        return c.json({ error: "PASTOR role not found" }, 404);
    }

    // Update all users
    for (const userId of ids) {
        // Delete existing roles
        await prisma.userRole.deleteMany({
            where: { userId },
        });

        // Add PASTOR role
        await prisma.userRole.create({
            data: {
                userId,
                roleId: pastorRole.id,
            },
        });

        // Update user's zone
        await prisma.user.update({
            where: { id: userId },
            data: { zoneId },
        });
    }

    // Update zone to assign the first user as pastor
    await prisma.zone.update({
        where: { id: zoneId },
        data: { pastorId: ids[0] },
    });

    return c.json({ message: `${ids.length} users promoted to pastor` });
});

// Bulk update roles
userRoutes.post("/bulk-update-roles", async (c) => {
    const { ids, roleIds } = await c.req.json<{ ids: string[]; roleIds: string[] }>();

    for (const userId of ids) {
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
    }

    return c.json({ message: `Roles updated for ${ids.length} users` });
});

export default userRoutes;
