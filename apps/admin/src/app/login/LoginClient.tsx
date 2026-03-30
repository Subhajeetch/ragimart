"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@repo/ui/auth/login-form";
import { authClient } from "@/lib/auth-client";

export default function LoginClient() {
  const router = useRouter();

  return (
    <LoginForm
      authClient={authClient}
      appUrl={process.env.NEXT_PUBLIC_APP_URL}
      onSuccess={() => router.push("/home")}
    />
  );
}