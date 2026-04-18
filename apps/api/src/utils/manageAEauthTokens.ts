const KV_KEY = "ali_tokens";
import config from "@/base.config";

const { AE_API_BASE, AE_AUTH_BASE } = config;

// Types
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

async function hmacSha256(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

async function generateSignSystem(
  params: Record<string, string>,
  appSecret: string,
  apiPath: string
): Promise<string> {
  const filtered: Record<string, string> = {};
  for (const key in params) {
    const value = params[key];
    if (key !== "sign" && value !== undefined && value !== null && value !== "") {
      filtered[key] = value;
    }
  }

  const sortedKeys = Object.keys(filtered).sort();
  const paramString = sortedKeys.map((k) => `${k}${filtered[k]}`).join("");
  const stringToSign = apiPath + paramString;

  console.log("SIGN STRING:", stringToSign);

  return hmacSha256(stringToSign, appSecret);
}


function buildQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

async function buildSystemParams(
  env: AEEnv,
  apiPath: string,
  extra: Record<string, string>
): Promise<Record<string, string>> {
  const base: Record<string, string> = {
    app_key: env.AE_APP_KEY,
    timestamp: Date.now().toString(),
    sign_method: "sha256",
    ...extra,
  };

  const sign = await generateSignSystem(base, env.AE_APP_SECRET, apiPath);
  return { ...base, sign };
}

//kvhelpers

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

//token fetcher
async function fetchNewTokens(env: AEEnv, code: string): Promise<TokenData> {
  const apiPath = "/auth/token/create";

  const params = await buildSystemParams(env, apiPath, {
    code,
    grant_type: "authorization_code",
  });

  const url = `${AE_AUTH_BASE}${apiPath}?${buildQueryString(params)}`;

  const res = await fetch(url, { method: "GET" });
  const data = await res.json<any>();
 // console.log("token create response:", data);

  if (!data.access_token) {
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
  const apiPath = "/auth/token/refresh";

  const params = await buildSystemParams(env, apiPath, {
    refresh_token: currentRefreshToken,
    grant_type: "refresh_token",
  });

  const url = `${AE_AUTH_BASE}${apiPath}?${buildQueryString(params)}`;

  const res = await fetch(url, { method: "GET" });
  const data = await res.json<any>();
  //console.log("token refresh response:", data);

  if (!data.access_token) {
    throw new Error(`AliExpress token refresh error: ${JSON.stringify(data)}`);
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + Number(data.expires_in) * 1000,
  };
}

//to get the tokens
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