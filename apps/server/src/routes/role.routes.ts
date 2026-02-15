import { Hono } from "hono";
import prisma from "@muluerp/db";

const roleRoutes = new Hono();

// Get all roles
roleRoutes.get("/", async (c) => {
    const roles = await prisma.role.findMany();
    return c.json(roles);
});

// Create a new role
roleRoutes.post("/", async (c) => {
    const { name } = await c.req.json<{ name: string }>();
    const role = await prisma.role.create({
        data: { name },
    });
    return c.json(role);
});

// Delete a role
roleRoutes.delete("/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.role.delete({
        where: { id },
    });
    return c.json({ message: "Role deleted" });
});

export default roleRoutes;
