import { createAuthClient } from "@repo/auth/client";
import type { AuthClient } from "@repo/auth/client";

export const authClient: AuthClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/auth`,
});

export const { signIn, signOut, signUp, useSession } = authClient;