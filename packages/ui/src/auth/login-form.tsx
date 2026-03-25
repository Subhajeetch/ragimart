"use client";

import { useState } from "react";



type AuthClient = {
  signIn: {
    social: (opts: { provider: string; callbackURL: string }) => Promise<unknown>;
    email: (opts: { email: string; password: string }) => Promise<{ error?: { message?: string } | null }>;
  };
  signUp: {
    email: (opts: { email: string; password: string; name: string }) => Promise<{ error?: { message?: string } | null }>;
  };
};

type Props = {
  authClient: AuthClient;
  appUrl: string;
  onSuccess: () => void; // for handling routing after successful login/signup
};

type Tab = "options" | "email";

export default function LoginPage( { authClient, appUrl, onSuccess }: Props) {
  const [tab, setTab] = useState<Tab>("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const APP_URL = appUrl ?? "http://localhost:8000";

  async function handleGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: `${APP_URL}/home` });
  }

  async function handleEmail(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);

  const name = email.split("@")[0] ?? email;

  try {
    if (isLogin) {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message ?? "Login failed");
      } else {
        onSuccess();  // ← manual redirect, no callbackURL
      }
    } else {
      const res = await authClient.signUp.email({ email, password, name });
      if (res.error) {
        setError(res.error.message ?? "Signup failed");
      } else {
        onSuccess(); // ← manual redirect, no callbackURL
      }
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-[rgb(124,145,189)] w-full flex items-center justify-center p-6">
      <div className="max-w-md bg-neutral-500 border border-neutral-800 rounded-2xl p-8 shadow-2xl">

        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-neutral-300 to-neutral-600" />
          <span className="text-sm font-bold tracking-widest text-neutral-200">s</span>
        </div>

        {tab === "options" && (
          <div>
            <h1 className="text-2xl font-bold text-neutral-100 tracking-tight mb-1">Welcome back</h1>
            <p className="text-sm text-neutral-500 mb-8">Sign in to continue shopping</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoogle}
                className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-200 text-sm font-medium hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-1">
                <span className="flex-1 h-px bg-neutral-800" />
                <span className="text-xs text-neutral-600">or</span>
                <span className="flex-1 h-px bg-neutral-800" />
              </div>

              <button
                onClick={() => setTab("email")}
                className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-neutral-800 text-neutral-500 text-sm font-medium hover:border-neutral-700 hover:text-neutral-400 transition-colors cursor-pointer"
              >
                <EmailIcon />
                Continue with Email
              </button>
            </div>
          </div>
        )}

        {tab === "email" && (
          <div>
            <button
              onClick={() => { setTab("options"); setError(""); }}
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors mb-6 cursor-pointer"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-bold text-neutral-100 tracking-tight mb-1">
              {isLogin ? "Sign in" : "Create account"}
            </h1>
            <p className="text-sm text-neutral-500 mb-8">
              {isLogin ? "Enter your credentials" : "Fill in your details"}
            </p>

            <form onSubmit={handleEmail} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-neutral-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-neutral-500 transition-colors"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-100 text-neutral-900 font-semibold text-sm py-3 rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1 cursor-pointer"
              >
                {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="text-center text-xs text-neutral-600 mt-6">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="text-neutral-300 underline underline-offset-2 hover:text-white transition-colors cursor-pointer"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}