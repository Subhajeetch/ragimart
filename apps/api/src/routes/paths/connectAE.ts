import { connectAliExpress } from "@/utils/manageAEauthTokens";
import type Env from "@/types/env";
import { Hono } from "hono";

const aeAuth = new Hono<{ Bindings: Env }>();

aeAuth.get("/connect", async (c) => {
  const code = c.req.query("code");

  if (!code) {
    return c.json({ error: "Missing code" }, 400);
  }

  const tokens = await connectAliExpress(c.env, code);

  return c.json({ success: true, tokens });
});

export default aeAuth;