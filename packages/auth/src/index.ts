import prisma from "@muluerp/db";
import { env } from "@muluerp/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  // Disable signup - only single admin user allowed
  handlers: {
    signUp: async () => {
      throw new Error("Sign up is disabled. Contact administrator.");
    },
  },
});
