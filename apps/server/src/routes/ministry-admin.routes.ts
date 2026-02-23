import { Hono } from "hono";
import prisma from "@muluerp/db";

const ministryAdminRoutes = new Hono();

// Get all ministries with admin info
ministryAdminRoutes.get("/", async (c) => {
  const ministries = await prisma.ministry.findMany({
    include: {
      admins: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          requests: {
            where: { status: "PENDING" },
          },
        },
      },
    },
  });

  return c.json(ministries);
});

// Set ministry admin (main admin only)
ministryAdminRoutes.post("/:ministryId/admins", async (c) => {
  const ministryId = c.req.param("ministryId");
  const { userId, role } = await c.req.json<{ userId: string; role?: string }>();

  const admin = await prisma.ministryAdmin.upsert({
    where: {
      userId_ministryId: {
        userId,
        ministryId,
      },
    },
    update: {
      role: role || "LEADER",
    },
    create: {
      userId,
      ministryId,
      role: role || "LEADER",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return c.json(admin);
});

// Remove ministry admin
ministryAdminRoutes.delete("/:ministryId/admins/:userId", async (c) => {
  const ministryId = c.req.param("ministryId");
  const userId = c.req.param("userId");

  await prisma.ministryAdmin.delete({
    where: {
      userId_ministryId: {
        userId,
        ministryId,
      },
    },
  });

  return c.json({ message: "Admin removed" });
});

// Get pending requests for a ministry
ministryAdminRoutes.get("/requests", async (c) => {
  const requests = await prisma.ministryRequest.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      ministry: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return c.json(requests);
});

// Approve request
ministryAdminRoutes.post("/requests/:requestId/approve", async (c) => {
  const requestId = c.req.param("requestId");
  const adminId = c.get("userId"); // From auth middleware

  const request = await prisma.ministryRequest.update({
    where: { id: requestId },
    data: {
      status: "APPROVED",
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
    include: {
      ministry: true,
      user: true,
    },
  });

  // Add user as ministry member
  await prisma.ministryMember.upsert({
    where: {
      userId_ministryId: {
        userId: request.userId,
        ministryId: request.ministryId,
      },
    },
    update: {},
    create: {
      userId: request.userId,
      ministryId: request.ministryId,
      role: "MEMBER",
    },
  });

  return c.json({ message: "Request approved", request });
});

// Reject request
ministryAdminRoutes.post("/requests/:requestId/reject", async (c) => {
  const requestId = c.req.param("requestId");
  const adminId = c.get("userId"); // From auth middleware
  const { notes } = await c.req.json<{ notes?: string }>();

  const request = await prisma.ministryRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      notes,
    },
  });

  return c.json({ message: "Request rejected", request });
});

// Create request to join ministry (from ministry dashboard)
ministryAdminRoutes.post("/:ministryId/request", async (c) => {
  const ministryId = c.req.param("ministryId");
  const { userId } = await c.req.json<{ userId: string }>();

  const request = await prisma.ministryRequest.create({
    data: {
      userId,
      ministryId,
      requestedBy: userId,
    },
  });

  return c.json(request);
});

// Get ministry members
ministryAdminRoutes.get("/:ministryId/members", async (c) => {
  const ministryId = c.req.param("ministryId");

  const members = await prisma.ministryMember.findMany({
    where: { ministryId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return c.json(members);
});

// Update member role
ministryAdminRoutes.patch("/:ministryId/members/:userId", async (c) => {
  const ministryId = c.req.param("ministryId");
  const userId = c.req.param("userId");
  const { role } = await c.req.json<{ role: string }>();

  const member = await prisma.ministryMember.update({
    where: {
      userId_ministryId: {
        userId,
        ministryId,
      },
    },
    data: { role },
  });

  return c.json(member);
});

// Remove member from ministry
ministryAdminRoutes.delete("/:ministryId/members/:userId", async (c) => {
  const ministryId = c.req.param("ministryId");
  const userId = c.req.param("userId");

  await prisma.ministryMember.delete({
    where: {
      userId_ministryId: {
        userId,
        ministryId,
      },
    },
  });

  return c.json({ message: "Member removed" });
});

export default ministryAdminRoutes;
