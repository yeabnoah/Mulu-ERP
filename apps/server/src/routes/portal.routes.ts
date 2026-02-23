import { Hono } from "hono";
import prisma from "@muluerp/db";

type PortalEnv = { Variables: { userId: string } };
const portalRoutes = new Hono<PortalEnv>();

// All portal routes require auth (middleware sets userId). Only return data for ministries the user is assigned to (member or admin).

// Current user info (for redirect: app admin vs ministry-only)
portalRoutes.get("/me", async (c) => {
  const userId = c.get("userId") as string;
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: true } },
    },
  });
  if (!user) return c.json({ error: "User not found" }, 404);

  const roleNames = user.roles.map((r) => r.role.name);
  const isAdmin = roleNames.includes("ADMIN");
  const isPastor = roleNames.includes("PASTOR");
  const isAppAdmin = isAdmin || isPastor;

  return c.json({ userId: user.id, isAppAdmin, isAdmin, isPastor });
});

// Minimal user list for "add member" dropdown (ministry leaders only)
portalRoutes.get("/users", async (c) => {
  const userId = c.get("userId") as string;
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const isMinistryAdmin = await prisma.ministryAdmin.findFirst({
    where: { userId },
  });
  if (!isMinistryAdmin) {
    return c.json({ error: "Forbidden: Only ministry leaders can list users" }, 403);
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, image: true },
    orderBy: { name: "asc" },
  });
  return c.json(users);
});

// Get ministries the current user is assigned to (as member or admin)
portalRoutes.get("/my-ministries", async (c) => {
  const userId = c.get("userId") as string;
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const memberships = await prisma.ministryMember.findMany({
    where: { userId },
    include: {
      ministry: {
        include: {
          admins: {
            where: { userId },
            select: { role: true },
          },
          _count: {
            select: { members: true },
          },
        },
      },
    },
  });

  const adminAssignments = await prisma.ministryAdmin.findMany({
    where: { userId },
    include: {
      ministry: {
        include: {
          _count: {
            select: {
              members: true,
              requests: { where: { status: "PENDING" } },
            },
          },
        },
      },
    },
  });

  const byMinistry = new Map<
    string,
    {
      id: string;
      name: string;
      description: string | null;
      role: string;
      isAdmin: boolean;
      _count: { members: number; requests?: number };
    }
  >();

  for (const m of memberships) {
    const admin = m.ministry.admins?.[0];
    byMinistry.set(m.ministryId, {
      id: m.ministry.id,
      name: m.ministry.name,
      description: m.ministry.description,
      role: admin?.role ?? m.role,
      isAdmin: !!admin,
      _count: {
        members: m.ministry._count?.members ?? 0,
        ...(admin ? { requests: 0 } : {}),
      },
    });
  }

  for (const a of adminAssignments) {
    const existing = byMinistry.get(a.ministryId);
    if (existing) {
      existing.isAdmin = true;
      existing.role = a.role;
      existing._count.requests = a.ministry._count?.requests ?? 0;
    } else {
      byMinistry.set(a.ministryId, {
        id: a.ministry.id,
        name: a.ministry.name,
        description: a.ministry.description,
        role: a.role,
        isAdmin: true,
        _count: {
          members: a.ministry._count?.members ?? 0,
          requests: a.ministry._count?.requests ?? 0,
        },
      });
    }
  }

  const list = Array.from(byMinistry.values());
  return c.json(list);
});

// Get one ministry if the current user is a member
portalRoutes.get("/my-ministries/:ministryId", async (c) => {
  const userId = c.get("userId") as string;
  const ministryId = c.req.param("ministryId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const member = await prisma.ministryMember.findUnique({
    where: {
      userId_ministryId: { userId, ministryId },
    },
    include: {
      ministry: true,
    },
  });

  const admin = await prisma.ministryAdmin.findUnique({
    where: {
      userId_ministryId: { userId, ministryId },
    },
  });

  if (!member && !admin) {
    return c.json({ error: "Forbidden: You are not assigned to this ministry" }, 403);
  }

  const ministry = member?.ministry ?? (await prisma.ministry.findUnique({ where: { id: ministryId } }));
  if (!ministry) return c.json({ error: "Ministry not found" }, 404);

  const [memberCount, requestCount] = await Promise.all([
    prisma.ministryMember.count({ where: { ministryId } }),
    prisma.ministryRequest.count({ where: { ministryId, status: "PENDING" } }),
  ]);

  return c.json({
    ...ministry,
    _count: { members: memberCount, requests: requestCount },
    myRole: admin?.role ?? member?.role ?? "MEMBER",
    isAdmin: !!admin,
  });
});

// Get members of a ministry (read-only) — only if current user is a member
portalRoutes.get("/my-ministries/:ministryId/members", async (c) => {
  const userId = c.get("userId") as string;
  const ministryId = c.req.param("ministryId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const isMember = await prisma.ministryMember.findUnique({
    where: { userId_ministryId: { userId, ministryId } },
  });
  const isAdmin = await prisma.ministryAdmin.findUnique({
    where: { userId_ministryId: { userId, ministryId } },
  });

  if (!isMember && !isAdmin) {
    return c.json({ error: "Forbidden: You are not assigned to this ministry" }, 403);
  }

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

// Stats for a ministry (demographics) — only if current user is a member
portalRoutes.get("/my-ministries/:ministryId/stats", async (c) => {
  const userId = c.get("userId") as string;
  const ministryId = c.req.param("ministryId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const isMember = await prisma.ministryMember.findUnique({
    where: { userId_ministryId: { userId, ministryId } },
  });
  const isAdmin = await prisma.ministryAdmin.findUnique({
    where: { userId_ministryId: { userId, ministryId } },
  });
  if (!isMember && !isAdmin) {
    return c.json({ error: "Forbidden: You are not assigned to this ministry" }, 403);
  }

  const ministry = await prisma.ministry.findUnique({
    where: { id: ministryId },
    include: {
      members: {
        include: {
          user: {
            select: {
              marriageStatus: true,
              educationStatus: true,
              birthDate: true,
              baptizedYear: true,
              fromOtherChurch: true,
              work: true,
            },
          },
        },
      },
    },
  });
  if (!ministry) return c.json({ error: "Ministry not found" }, 404);

  const users = ministry.members.map((m) => m.user).filter((u): u is NonNullable<typeof u> => u != null);
  const totalMembers = users.length;

  const marriageStats = {
    single: users.filter((u) => u.marriageStatus === "SINGLE").length,
    married: users.filter((u) => u.marriageStatus === "MARRIED").length,
    widow: users.filter((u) => u.marriageStatus === "WIDOW").length,
    divorced: users.filter((u) => u.marriageStatus === "DIVORCED").length,
  };

  const educationStats: Record<string, number> = {};
  users.forEach((u) => {
    const status = u.educationStatus || "Unknown";
    educationStats[status] = (educationStats[status] || 0) + 1;
  });

  const baptizedCount = users.filter((u) => u.baptizedYear != null).length;
  const fromOtherChurch = users.filter((u) => u.fromOtherChurch).length;
  const employedCount = users.filter((u) => u.work != null && u.work !== "").length;

  const now = new Date();
  const ageGroups: Record<string, number> = {
    "0-18": 0,
    "19-25": 0,
    "26-35": 0,
    "36-45": 0,
    "46-55": 0,
    "55+": 0,
    Unknown: 0,
  };
  users.forEach((u) => {
    if (u.birthDate) {
      const age = now.getFullYear() - u.birthDate.getFullYear();
      if (age < 19) ageGroups["0-18"] = (ageGroups["0-18"] ?? 0) + 1;
      else if (age < 26) ageGroups["19-25"] = (ageGroups["19-25"] ?? 0) + 1;
      else if (age < 36) ageGroups["26-35"] = (ageGroups["26-35"] ?? 0) + 1;
      else if (age < 46) ageGroups["36-45"] = (ageGroups["36-45"] ?? 0) + 1;
      else if (age < 56) ageGroups["46-55"] = (ageGroups["46-55"] ?? 0) + 1;
      else ageGroups["55+"] = (ageGroups["55+"] ?? 0) + 1;
    } else ageGroups["Unknown"] = (ageGroups["Unknown"] ?? 0) + 1;
  });

  return c.json({
    ministryName: ministry.name,
    basic: {
      totalMembers,
      baptizedCount,
      notBaptizedCount: totalMembers - baptizedCount,
      fromOtherChurch,
      employedCount,
      unemployedCount: totalMembers - employedCount,
    },
    marriageStatus: marriageStats,
    educationStatus: educationStats,
    ageGroups,
  });
});

// --- Ministry admin actions (only for users who are MinistryAdmin for this ministry) ---

async function requireMinistryAdmin(c: any, ministryId: string): Promise<string | null> {
  const userId = c.get("userId") as string;
  if (!userId) return null;
  const admin = await prisma.ministryAdmin.findUnique({
    where: { userId_ministryId: { userId, ministryId } },
  });
  return admin ? userId : null;
}

portalRoutes.post("/my-ministries/:ministryId/request", async (c) => {
  const ministryId = c.req.param("ministryId");
  const uid = await requireMinistryAdmin(c, ministryId);
  if (!uid) {
    return c.json({ error: "Forbidden: Only ministry leaders can send join requests" }, 403);
  }
  const { userId } = await c.req.json<{ userId: string }>();

  const request = await prisma.ministryRequest.create({
    data: { userId, ministryId, requestedBy: uid },
  });
  return c.json(request);
});

portalRoutes.patch("/my-ministries/:ministryId/members/:userId", async (c) => {
  const ministryId = c.req.param("ministryId");
  const targetUserId = c.req.param("userId");
  if (!(await requireMinistryAdmin(c, ministryId))) {
    return c.json({ error: "Forbidden: Only ministry leaders can update roles" }, 403);
  }
  const { role } = await c.req.json<{ role: string }>();

  const member = await prisma.ministryMember.update({
    where: { userId_ministryId: { userId: targetUserId, ministryId } },
    data: { role },
  });
  return c.json(member);
});

portalRoutes.delete("/my-ministries/:ministryId/members/:userId", async (c) => {
  const ministryId = c.req.param("ministryId");
  const targetUserId = c.req.param("userId");
  if (!(await requireMinistryAdmin(c, ministryId))) {
    return c.json({ error: "Forbidden: Only ministry leaders can remove members" }, 403);
  }

  await prisma.ministryMember.delete({
    where: { userId_ministryId: { userId: targetUserId, ministryId } },
  });
  return c.json({ message: "Member removed" });
});

export default portalRoutes;
