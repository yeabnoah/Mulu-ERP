/**
 * Update the first admin user's email and/or password.
 * Usage (from repo root or packages/db):
 *   pnpm run update-admin
 * Set in apps/server/.env (or env):
 *   ADMIN_EMAIL=new@example.com
 *   ADMIN_PASSWORD=newpassword
 * If only ADMIN_PASSWORD is set, only the password is updated.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// When run from packages/db (cwd may be repo root or packages/db)
// Load from repo root or from packages/db
const envPathRoot = path.resolve(process.cwd(), "apps/server/.env");
const envPathFromDb = path.resolve(__dirname, "../../../apps/server/.env");
dotenv.config({ path: envPathRoot });
dotenv.config({ path: envPathFromDb });

import { PrismaClient } from "../prisma/generated/client";
import { hashPassword } from "better-auth/crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!connectionString) {
  console.error("DATABASE_URL or DIRECT_URL must be set (e.g. in apps/server/.env)");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const newEmail = process.env.ADMIN_EMAIL?.trim();
  const newPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!newEmail && !newPassword) {
    console.error("Set ADMIN_EMAIL and/or ADMIN_PASSWORD in apps/server/.env (or env) to update the admin.");
    console.error("Example: ADMIN_EMAIL=admin@church.com ADMIN_PASSWORD=secret123");
    process.exit(1);
  }

  if (newPassword && newPassword.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  // Find the admin user (user with ADMIN role)
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  if (!adminRole) {
    console.error("ADMIN role not found. Run db:seed first.");
    process.exit(1);
  }

  const link = await prisma.userRole.findFirst({
    where: { roleId: adminRole.id },
    include: { user: true },
  });
  if (!link) {
    console.error("No user with ADMIN role found. Run db:seed first.");
    process.exit(1);
  }

  const adminUser = link.user;
  const oldEmail = adminUser.email;

  if (newEmail && newEmail !== oldEmail) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { email: newEmail, emailVerified: true, updatedAt: new Date() },
    });
    const emailAccount = await prisma.account.findFirst({
      where: { userId: adminUser.id, providerId: "credential" },
    });
    if (emailAccount) {
      await prisma.account.update({
        where: { id: emailAccount.id },
        data: { accountId: newEmail, updatedAt: new Date() },
      });
    }
    console.log(`✅ Admin email updated: ${oldEmail} → ${newEmail}`);
  }

  if (newPassword) {
    const hashed = await hashPassword(newPassword);
    const emailAccount = await prisma.account.findFirst({
      where: { userId: adminUser.id, providerId: "credential" },
    });
    const currentEmail = newEmail || adminUser.email;
    if (emailAccount) {
      await prisma.account.update({
        where: { id: emailAccount.id },
        data: { password: hashed, updatedAt: new Date() },
      });
    } else {
      await prisma.account.create({
        data: {
          id: `credential-${adminUser.id}`,
          userId: adminUser.id,
          accountId: currentEmail,
          providerId: "credential",
          password: hashed,
        },
      });
    }
    console.log("✅ Admin password updated.");
  }

  console.log("Done. Use the new credentials to sign in.");
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
