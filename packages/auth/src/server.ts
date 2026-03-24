import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { createDb } from "@repo/db";
import * as schema from "@repo/db/schema";


export function createAuth(db: DrizzleD1Database<typeof schema>, env: {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  APPLE_CLIENT_ID: string;
  APPLE_CLIENT_SECRET: string;
  NODE_ENV?: string;
  API_URL?: string;
  ORIGINS?: string;
}) {
  const isProd = env.NODE_ENV === "production";

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),

    baseURL: isProd ? env.API_URL : "http://localhost:8000",
    basePath: "/api/auth",

    trustedOrigins: [
      ...(env.ORIGINS ? env.ORIGINS.split(",") : []),
      "https://ragimart.com",
      "https://admin.ragimart.com",
      "http://localhost:8000",
      "http://localhost:8001",
    ],

    advanced: {
      crossSubDomainCookies: {
        enabled: isProd,
        domain: isProd ? env.API_URL?.split("://")[1] : undefined,
      },
    },

    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },

    emailAndPassword: { enabled: true },
  });
}