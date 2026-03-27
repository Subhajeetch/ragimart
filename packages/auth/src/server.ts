import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@repo/db";
import * as schema from "@repo/db/schema";

type SendEmailFn = (opts: {
  to: string;
  subject: string;
  html: string;
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
  sendEmail?: SendEmailFn,
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

    // ── Additional user fields ──────────────────────────────────────────────
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

    // ── Email + Password ────────────────────────────────────────────────────
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,

      sendResetPassword: async ({ user, url }) => {
        if (!sendEmail) {
          console.warn("[Better Auth] sendEmail not configured — reset URL:", url);
          return;
        }
        await sendEmail({
          to: user.email,
          subject: "Reset your Ragimart password",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
              <h2 style="color:#111">Reset your password</h2>
              <p style="color:#555">Click the button below to reset your password. This link expires in 1 hour.</p>
              <a href="${url}"
                style="display:inline-block;background:#2d7ff9;color:#fff;padding:12px 28px;border-radius:100px;text-decoration:none;font-weight:600;margin:16px 0">
                Reset Password
              </a>
              <p style="color:#999;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      },
    },

    // ── Social providers ────────────────────────────────────────────────────
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
  });
}