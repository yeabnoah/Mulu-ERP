import { serve } from "@hono/node-server";
import { auth } from "@muluerp/auth";
import prisma from "@muluerp/db";
import { env } from "@muluerp/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// Import routes
import userRoutes from "./routes/user.routes";
import roleRoutes from "./routes/role.routes";
import ministryRoutes from "./routes/ministry.routes";
import ministryAdminRoutes from "./routes/ministry-admin.routes";
import portalRoutes from "./routes/portal.routes";
import zoneRoutes from "./routes/zone.routes";
import familyRoutes from "./routes/family.routes";
import uploadRoutes from "./routes/upload.routes";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    credentials: true,
  }),
);

// Auth handler
app.on(["POST", "GET", "DELETE"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
  return c.text("ERP Server OK");
});

// Auth + RBAC Middleware
app.use("/api/*", async (c, next) => {
  if (c.req.path.startsWith("/api/auth") || c.req.path.startsWith("/api/upload")) {
    return next();
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("userId", session.user.id);

  // Portal: any authenticated user can access (data scoped to their assignments in route handlers)
  if (c.req.path.startsWith("/api/portal")) {
    return next();
  }

  const userWithRoles = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      roles: { include: { role: true } },
      zone: true,
    },
  });

  const roles = userWithRoles?.roles.map((r) => r.role.name) || [];
  c.set("userRoles", roles);
  c.set("userZoneId", userWithRoles?.zoneId ?? null);

  if (!roles.includes("ADMIN") && !roles.includes("PASTOR")) {
    return c.json({ error: "Forbidden: Admin or Pastor access required" }, 403);
  }

  await next();
});

// Register routes
app.route("/api/users", userRoutes);
app.route("/api/roles", roleRoutes);
app.route("/api/ministries", ministryRoutes);
app.route("/api/ministries-admin", ministryAdminRoutes);
app.route("/api/portal", portalRoutes);
app.route("/api/zones", zoneRoutes);
app.route("/api/families", familyRoutes);
app.route("/api/upload", uploadRoutes);

// Dashboard stats endpoint - single optimized query
app.get("/api/stats", async (c) => {
  const [users, families, ministries, zones] = await Promise.all([
    prisma.user.count(),
    prisma.family.count(),
    prisma.ministry.count(),
    prisma.zone.count(),
  ]);

  return c.json({
    users,
    families,
    ministries,
    zones,
  });
});

// Detailed dashboard stats for admin
app.get("/api/stats/detailed", async (c) => {
  // Get all users with related data
  const users = await prisma.user.findMany({
    include: {
      zone: true,
      family: true,
      currentMinistry: true,
      children: true,
    },
  });

  // Basic counts
  const totalUsers = users.length;
  const totalFamilies = await prisma.family.count();
  const totalMinistries = await prisma.ministry.count();
  const totalZones = await prisma.zone.count();
  const totalChildren = await prisma.child.count();

  // Gender distribution
  // We'll estimate from names or add a gender field - for now use marriage status

  // Marriage status distribution
  const marriageStats = {
    single: users.filter(u => u.marriageStatus === "SINGLE").length,
    married: users.filter(u => u.marriageStatus === "MARRIED").length,
    widow: users.filter(u => u.marriageStatus === "WIDOW").length,
    divorced: users.filter(u => u.marriageStatus === "DIVORCED").length,
  };

  // Education status distribution
  const educationStats: Record<string, number> = {};
  users.forEach(u => {
    const status = u.educationStatus || "UNKNOWN";
    educationStats[status] = (educationStats[status] || 0) + 1;
  });

  // Zone distribution
  const zoneStats = await prisma.zone.findMany({
    include: {
      _count: {
        select: { members: true, families: true },
      },
    },
  });

  // Ministry distribution
  const ministryStats = await prisma.ministry.findMany({
    include: {
      _count: {
        select: { members: true },
      },
    },
  });

  // Baptized stats
  const baptizedCount = users.filter(u => u.baptizedYear !== null).length;
  const notBaptizedCount = totalUsers - baptizedCount;

  // From other church
  const fromOtherChurch = users.filter(u => u.fromOtherChurch).length;

  // Work status
  const employedCount = users.filter(u => u.work !== null && u.work !== "").length;
  const unemployedCount = totalUsers - employedCount;

  // Age groups (based on birthDate if available)
  const now = new Date();
  const ageGroups = {
    "0-18": 0,
    "19-25": 0,
    "26-35": 0,
    "36-45": 0,
    "46-55": 0,
    "55+": 0,
    "Unknown": 0,
  };
  users.forEach(u => {
    if (u.birthDate) {
      const age = now.getFullYear() - u.birthDate.getFullYear();
      if (age < 19) ageGroups["0-18"]++;
      else if (age < 26) ageGroups["19-25"]++;
      else if (age < 36) ageGroups["26-35"]++;
      else if (age < 46) ageGroups["36-45"]++;
      else if (age < 56) ageGroups["46-55"]++;
      else ageGroups["55+"]++;
    } else {
      ageGroups["Unknown"]++;
    }
  });

  // Children stats
  const familiesWithChildren = users.filter(u => u.familyRole === "FATHER" || u.familyRole === "MOTHER").length;

  return c.json({
    basic: {
      totalUsers,
      totalFamilies,
      totalMinistries,
      totalZones,
      totalChildren,
      baptizedCount,
      notBaptizedCount,
      fromOtherChurch,
      employedCount,
      unemployedCount,
      familiesWithChildren,
    },
    marriageStatus: marriageStats,
    educationStatus: educationStats,
    zones: zoneStats.map(z => ({
      id: z.id,
      name: z.name,
      memberCount: z._count.members,
      familyCount: z._count.families,
    })),
    ministries: ministryStats.map(m => ({
      id: m.id,
      name: m.name,
      memberCount: m._count.members,
    })),
    ageGroups,
  });
});

// Pastor stats - only their zone data
app.get("/api/stats/pastor/:zoneId", async (c) => {
  const zoneId = c.req.param("zoneId");

  const zone = await prisma.zone.findUnique({
    where: { id: zoneId },
    include: {
      families: {
        include: {
          members: {
            include: {
              children: true,
            },
          },
        },
      },
      members: {
        include: {
          user: {
            include: {
              currentMinistry: true,
              children: true,
            },
          },
        },
      },
    },
  });

  if (!zone) {
    return c.json({ error: "Zone not found" }, 404);
  }

  const zoneMembers = zone.members;
  const users = zoneMembers.map((zm) => zm.user);
  const families = zone.families;

  const totalMembers = users.length;
  const totalFamilies = families.length;
  const totalChildren = families.reduce((acc, f) => acc + f.members.filter((m) => m.familyRole === "SON" || m.familyRole === "DAUGHTER").length, 0);

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
      if (age < 19) ageGroups["0-18"]++;
      else if (age < 26) ageGroups["19-25"]++;
      else if (age < 36) ageGroups["26-35"]++;
      else if (age < 46) ageGroups["36-45"]++;
      else if (age < 56) ageGroups["46-55"]++;
      else ageGroups["55+"]++;
    } else ageGroups["Unknown"]++;
  });

  const ministryIds = [...new Set(users.map((u) => u.currentMinistryId).filter(Boolean))];
  const ministries = await prisma.ministry.findMany({
    where: { id: { in: ministryIds as string[] } },
    include: { _count: { select: { members: true } } },
  });

  return c.json({
    zoneName: zone.name,
    basic: {
      totalMembers,
      totalFamilies,
      totalChildren,
      baptizedCount,
      notBaptizedCount: totalMembers - baptizedCount,
      fromOtherChurch,
      employedCount,
      unemployedCount: totalMembers - employedCount,
    },
    marriageStatus: marriageStats,
    educationStatus: educationStats,
    ageGroups,
    ministries: ministries.map((m) => ({
      id: m.id,
      name: m.name,
      memberCount: m._count.members,
    })),
  });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
