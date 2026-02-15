import { Hono } from "hono";
import prisma from "@muluerp/db";

const zoneRoutes = new Hono();

// Get all zones
zoneRoutes.get("/", async (c) => {
    const zones = await prisma.zone.findMany({
        include: {
            pastor: true,
            _count: {
                select: { members: true, families: true },
            },
        },
    });
    return c.json(zones);
});

// Create a zone
zoneRoutes.post("/", async (c) => {
    const { name, description, pastorId } = await c.req.json<{ name: string; description?: string; pastorId: string }>();
    const zone = await prisma.zone.create({
        data: { name, description, pastorId },
    });
    return c.json(zone);
});

// Update a zone
zoneRoutes.put("/:id", async (c) => {
    const id = c.req.param("id");
    const { name, description, pastorId } = await c.req.json<{ name: string; description?: string; pastorId: string }>();
    const zone = await prisma.zone.update({
        where: { id },
        data: { name, description, pastorId },
    });
    return c.json(zone);
});

// Delete a zone
zoneRoutes.delete("/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.zone.delete({
        where: { id },
    });
    return c.json({ message: "Zone deleted" });
});

// Get zone members
zoneRoutes.get("/:id/members", async (c) => {
    const id = c.req.param("id");
    const members = await prisma.zoneMember.findMany({
        where: { zoneId: id },
        include: {
            user: true,
        },
    });
    return c.json(members);
});

// Add member to zone
zoneRoutes.post("/:id/members", async (c) => {
    const zoneId = c.req.param("id");
    const { userId } = await c.req.json<{ userId: string }>();
    const member = await prisma.zoneMember.create({
        data: { zoneId, userId },
    });
    return c.json(member);
});

export default zoneRoutes;
