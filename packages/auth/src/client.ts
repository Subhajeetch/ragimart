import { createAuthClient } from "better-auth/react";

export { createAuthClient };
export type { Session } from "better-auth";
export type AuthClient = ReturnType<typeof createAuthClient>;