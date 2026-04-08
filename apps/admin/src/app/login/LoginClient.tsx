"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@repo/ui/auth/login-form";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-client";

export default function LoginClient() {
  const router = useRouter();
  const { data } = useSession();

  if (data?.session) {
    router.push("/overview");
    return null;
  }

  return (
    <LoginForm
      authClient={authClient}
      appUrl={process.env.NEXT_PUBLIC_APP_URL}
      onSuccess={() => router.push("/overview")}
    />
  );
}

// onSuccess is only for email login redirection