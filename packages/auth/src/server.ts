import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@repo/db";
import * as schema from "@repo/db/schema";

type SendEmailFn = (opts: {
  to: string;
  url: string;
  token: string;
}) => Promise<void>;

export function createAuth(
  db: ReturnType<typeof createDb>,
  env: {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    NODE_ENV?: string;
    API_URL?: string;
    APP_URL?: string;
    ORIGINS?: string;
    DOMAIN?: string;
  },
  sendResetPassEmail?: SendEmailFn,
) {
  const isProd = env.NODE_ENV === "production";
  const appUrl = isProd ? (env.APP_URL ?? "https://ragimart.com") : "http://localhost:8000";

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

    baseURL: isProd ? env.API_URL : "http://localhost:8002",
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
        domain: isProd && env.DOMAIN ? env.DOMAIN : undefined,
      },
    },


    user: {
      additionalFields: {
        gender: {
          type: "string",
          required: false,
          input: true,
        },
        role: {
          type: "string",
          required: false,
          input: false,
          defaultValue: "customer",
        },
      },
    },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,

      resetPassword: {
        enabled: true,
      },

      sendResetPassword: async ({ user, url, token }) => {
        if (sendResetPassEmail) {
          await sendResetPassEmail({ to: user.email, url, token });
        }
      },
    },

    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
  });
}