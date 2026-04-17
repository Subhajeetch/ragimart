export default interface Env {
  DB: D1Database;
  KV: KVNamespace;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NODE_ENV?: string;
  API_URL?: string;
  ORIGINS?: string;
  DOMAIN?: string;
  AE_APP_KEY: string;
  AE_APP_SECRET: string;
}