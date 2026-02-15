import { Hono } from "hono";
import prisma from "@muluerp/db";

const ministryRoutes = new Hono();

// Get all ministries
ministryRoutes.get("/", async (c) => {
    const ministries = await prisma.ministry.findMany({
        include: {
            _count: {
                select: { members: true },
            },
        },
    });
    return c.json(ministries);
});

// Get ministry by ID
ministryRoutes.get("/:id", async (c) => {
    const id = c.req.param("id");
    const ministry = await prisma.ministry.findUnique({
        where: { id },
        include: {
            _count: {
                select: { members: true },
            },
        },
    });
    if (!ministry) return c.json({ error: "Ministry not found" }, 404);
    return c.json(ministry);
});

// Create a ministry
ministryRoutes.post("/", async (c) => {
    const { name, description } = await c.req.json<{ name: string; description?: string }>();
    const ministry = await prisma.ministry.create({
        data: { name, description },
    });
    return c.json(ministry);
});

// Update a ministry
ministryRoutes.put("/:id", async (c) => {
    const id = c.req.param("id");
    const { name, description } = await c.req.json<{ name: string; description?: string }>();
    const ministry = await prisma.ministry.update({
        where: { id },
        data: { name, description },
    });
    return c.json(ministry);
});

// Delete a ministry
ministryRoutes.delete("/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.ministry.delete({
        where: { id },
    });
    return c.json({ message: "Ministry deleted" });
});

// Get ministry members
ministryRoutes.get("/:id/members", async (c) => {
    const id = c.req.param("id");
    const members = await prisma.ministryMember.findMany({
        where: { ministryId: id },
        include: {
            user: true,
        },
    });
    return c.json(members);
});

// Add member to ministry
ministryRoutes.post("/:id/members", async (c) => {
    const ministryId = c.req.param("id");
    const { userId } = await c.req.json<{ userId: string }>();
    const member = await prisma.ministryMember.create({
        data: { ministryId, userId },
    });
    return c.json(member);
});

// Remove member from ministry
ministryRoutes.delete("/:id/members/:userId", async (c) => {
    const { id, userId } = c.req.param();
    await prisma.ministryMember.delete({
        where: {
            userId_ministryId: {
                userId,
                ministryId: id,
            },
        },
    });
    return c.json({ message: "Member removed from ministry" });
});

export default ministryRoutes;
