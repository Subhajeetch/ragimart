const KV_KEY = "ali_tokens";
import config from "@/base.config";
import kvManager from "./kvManager";

const { AE_API_BASE } = config;

//types

type TokenData = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

type AEEnv = {
  AE_APP_KEY: string;
  AE_APP_SECRET: string;
  KV: KVNamespace;
};

//helpers
async function sha256(message: string): Promise<string> {
  const buffer = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

async function generateSign(
  params: Record<string, string>,
  appSecret: string
): Promise<string> {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("");

  return sha256(`${appSecret}${sorted}${appSecret}`);
}

async function buildParams(
  env: AEEnv,
  extra: Record<string, string>
): Promise<Record<string, string>> {
  const base: Record<string, string> = {
    app_key: env.AE_APP_KEY,
    timestamp: Date.now().toString(),
    sign_method: "sha256",
    ...extra,
  };

  const sign = await generateSign(base, env.AE_APP_SECRET);
  return { ...base, sign };
}

//kv helpers
async function readTokens(kv: KVNamespace): Promise<TokenData | null> {
  const raw = await kv.get(KV_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TokenData;
  } catch {
    return null;
  }
}

async function writeTokens(kv: KVNamespace, tokens: TokenData): Promise<void> {
  const ttlSeconds = Math.max(
    Math.floor((tokens.expires_at - Date.now()) / 1000) + 60,
    60
  );
  await kv.put(KV_KEY, JSON.stringify(tokens), { expirationTtl: ttlSeconds });
}

async function fetchNewTokens(
  env: AEEnv,
  code: string
): Promise<TokenData> {
  const params = await buildParams(env, {
    code,
    uuid: crypto.randomUUID(),
  });

  const res = await fetch(`${AE_API_BASE}/auth/token/create`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams(params),
  });

  if (!res.ok) {
    throw new Error(`AliExpress token create HTTP error: ${res.status}`);
  }

  const data = await res.json<Record<string, string>>();

  if (data.code !== "0") {
    throw new Error(`AliExpress token create error: ${JSON.stringify(data)}`);
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + Number(data.expires_in) * 1000,
  };
}

async function fetchRefreshedTokens(
  env: AEEnv,
  currentRefreshToken: string
): Promise<TokenData> {
  const params = await buildParams(env, {
    refresh_token: currentRefreshToken,
  });

  const res = await fetch(`${AE_API_BASE}/auth/token/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: new URLSearchParams(params),
  });

  if (!res.ok) {
    throw new Error(`AliExpress token refresh HTTP error: ${res.status}`);
  }

  const data = await res.json<Record<string, string>>();

  if (data.code !== "0") {
    throw new Error(`AliExpress token refresh error: ${JSON.stringify(data)}`);
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + Number(data.expires_in) * 1000,
  };
}


export async function connectAliExpress(
  env: AEEnv,
  code: string
): Promise<TokenData> {
  const tokens = await fetchNewTokens(env, code);
  await writeTokens(env.KV, tokens);
  return tokens;
}

export async function getAccessToken(env: AEEnv): Promise<string> {
  const tokens = await readTokens(env.KV);

  if (!tokens) {
    throw new Error(
      "AliExpress not connected. Complete OAuth flow first via /api/ae/connect."
    );
  }

  const fiveMinutes = 5 * 60 * 1000;
  if (tokens.expires_at - Date.now() <= fiveMinutes) {
    const refreshed = await fetchRefreshedTokens(env, tokens.refresh_token);
    await writeTokens(env.KV, refreshed);
    return refreshed.access_token;
  }

  return tokens.access_token;
}


export async function isConnected(env: AEEnv): Promise<boolean> {
  const tokens = await readTokens(env.KV);
  return tokens !== null;
}

export async function disconnectAliExpress(env: AEEnv): Promise<void> {
  await env.KV.delete(KV_KEY);
}