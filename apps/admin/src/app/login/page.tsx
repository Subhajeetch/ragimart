"use client";

import LoginForm from "@repo/ui/auth/login-form";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginForm
      authClient={authClient}
      appUrl={process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8001"}
      onSuccess={() => router.push("/home")}
    />
  );
}