import { PrismaClient } from "./generated/client";
import { crypto } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
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

    // 2. Create Default Admin User
    const adminEmail = "admin@muluerp.com";
    const adminPassword = "admin123";
    const hashedPassword = await crypto.hashPassword(adminPassword);

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
        },
        create: {
            id: "admin-account-id",
            userId: adminUser.id,
            accountId: adminEmail,
            providerId: "email",
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
