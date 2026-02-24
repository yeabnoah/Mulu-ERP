import prisma from "@muluerp/db";
import { env } from "@muluerp/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN!, process.env.OTHER_ORIGIN!, process.env.OTHER_ORIGIN2!, process.env.BETTER_AUTH_URL!,
    "https://mulu-erp.roggy.site",
    "https://mulu.roggy.site",
],
  emailAndPassword: {
    enabled: true,
  },
  
  advanced: {
    // defaultCookieAttributes: {
    //   sameSite: isProduction ? "none" : "lax",
    //   secure: isProduction,
    //   httpOnly: true,
    // },
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: process.env.NODE_ENV === "production" ? ".roggy.site" : "",
  }
  },
  // Disable signup - only single admin user allowed
  handlers: {
    signUp: async () => {
      throw new Error("Sign up is disabled. Contact administrator.");
    },
  },
});
