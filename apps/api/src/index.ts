import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "@repo/auth/server";
import { createDb } from "@repo/db";
import sendResetPassEmail from "@/utils/sendResetPassEmail";

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NODE_ENV?: string;
  API_URL?: string;
  ORIGINS?: string;
  DOMAIN?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
  const origins = c.env.ORIGINS ? c.env.ORIGINS.split(",") : ["https://ragimart.com", "https://admin.ragimart.com", "http://localhost:8000", "http://localhost:8001"];
  return cors({
    origin: origins,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })(c, next);
});

app.all("/api/auth/*", (c) => {
  const db = createDb(c.env.DB);
  const auth = createAuth(db,
    {
      GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET,
      NODE_ENV: c.env.NODE_ENV,
      API_URL: c.env.API_URL,
      ORIGINS: c.env.ORIGINS,
      DOMAIN: c.env.DOMAIN,
    },
    sendResetPassEmail
  );
  return auth.handler(c.req.raw);
});

export default app;