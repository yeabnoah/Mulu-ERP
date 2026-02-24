import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Load env from apps/server/.env (works when run from repo root or packages/db)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../../apps/server/.env");
dotenv.config({ path: envPath });

import { PrismaClient } from "./generated/client";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!connectionString) throw new Error("DATABASE_URL or DIRECT_URL must be set (e.g. in apps/server/.env)");
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...");

    // 1. Ensure ADMIN role exists
    const adminRole = await prisma.role.upsert({
        where: { name: "ADMIN" },
        update: {},
        create: {
            name: "ADMIN",
        },
    });
    console.log("✅ ADMIN role ensured.");

    // 2. Create Default Admin User (email/password from env or defaults)
    const adminEmail = process.env.ADMIN_EMAIL || "admin@muluerp.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await hashPassword(adminPassword);

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            id: "admin-user-id",
            name: "System Admin",
            email: adminEmail,
            emailVerified: true,
        },
    });

    // 3. Create Account for Admin
    await prisma.account.upsert({
        where: { id: "admin-account-id" },
        update: {
            password: hashedPassword,
            providerId: "credential",
            accountId: adminEmail,
        },
        create: {
            id: "admin-account-id",
            userId: adminUser.id,
            accountId: adminEmail,
            providerId: "credential",
            password: hashedPassword,
        },
    });

    // 4. Link Admin User to ADMIN Role
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: adminUser.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: adminUser.id,
            roleId: adminRole.id,
        },
    });

    console.log("✅ Default admin user created successfully.");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
