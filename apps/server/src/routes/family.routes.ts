import { Hono } from "hono";
import prisma from "@muluerp/db";

const familyRoutes = new Hono();

// Get all families
familyRoutes.get("/", async (c) => {
    const families = await prisma.family.findMany({
        include: {
            zone: true,
            _count: {
                select: { members: true },
            },
        },
    });
    return c.json(families);
});

// Create a family
familyRoutes.post("/", async (c) => {
    const { name, description, zoneId } = await c.req.json<{ name: string; description?: string; zoneId: string }>();
    const family = await prisma.family.create({
        data: { name, description, zoneId },
    });
    return c.json(family);
});

// Update a family
familyRoutes.put("/:id", async (c) => {
    const id = c.req.param("id");
    const { name, description, zoneId } = await c.req.json<{ name: string; description?: string; zoneId: string }>();
    const family = await prisma.family.update({
        where: { id },
        data: { name, description, zoneId },
    });
    return c.json(family);
});

// Delete a family
familyRoutes.delete("/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.family.delete({
        where: { id },
    });
    return c.json({ message: "Family deleted" });
});

// Get family members
familyRoutes.get("/:id/members", async (c) => {
    const id = c.req.param("id");
    const members = await prisma.user.findMany({
        where: { familyId: id },
    });
    return c.json(members);
});

// Add member to family
familyRoutes.post("/:id/members", async (c) => {
    const familyId = c.req.param("id");
    const { userId, familyRole } = await c.req.json<{ userId: string; familyRole: any }>();
    const member = await prisma.user.update({
        where: { id: userId },
        data: { familyId, familyRole },
    });
    return c.json(member);
});

export default familyRoutes;
