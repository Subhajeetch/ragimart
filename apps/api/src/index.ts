import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAuth } from "@repo/auth/server";
import { createDb } from "@repo/db";

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  APPLE_CLIENT_ID: string;
  APPLE_CLIENT_SECRET: string;
  NODE_ENV?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: ["https://example.com", "https://admin.example.com", "http://localhost:8000", "http://localhost:8001"],
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.on(["GET", "POST"], "/api/auth/**", (c) => {
  const db = createDb(c.env.DB);
  const auth = createAuth(db, {
    GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET,
    APPLE_CLIENT_ID: c.env.APPLE_CLIENT_ID,
    APPLE_CLIENT_SECRET: c.env.APPLE_CLIENT_SECRET,
    NODE_ENV: c.env.NODE_ENV
  });
  return auth.handler(c.req.raw);
});

export default app;