"use client";

import { useState } from "react";
import "../styles/login-form.css";


type AuthClient = {
  signIn: {
    social: (opts: { provider: string; callbackURL: string }) => Promise<unknown>;
    email: (opts: { email: string; password: string }) => Promise<{ error?: { message?: string } | null }>;
  };
  signUp: {
    email: (opts: {
      email: string;
      password: string;
      name: string;
    }) => Promise<{ error?: { message?: string } | null }>;
  };
};

type Props = {
  authClient: AuthClient;
  appUrl?: string;
  onSuccess: () => void;
};


export default function LoginPage({ authClient, appUrl, onSuccess }: Props) {
  const [isLogin, setIsLogin] = useState(true);


  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);


  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const APP_URL = appUrl ?? "http://localhost:8000";


  function switchMode() {
    setIsLogin((v) => !v);
    setError("");
  }

  async function handleGoogle() {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${APP_URL}/home`,
      });
    } catch {
      setError("Google sign-in failed. Please try again.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!isLogin) {
      if (!name.trim()) return setError("Please enter your name.");
      if (!gender) return setError("Please select your gender.");
      if (signupPassword.length < 8) return setError("Password must be at least 8 characters.");
      if (signupPassword !== confirmPassword) return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await authClient.signIn.email({ email: loginEmail, password: loginPassword });
        if (res?.error) setError(res.error.message ?? "Login failed. Please try again.");
        else onSuccess();
      } else {
        const res = await authClient.signUp.email({
          email: signupEmail,
          password: signupPassword,
          name: name.trim(),
        });
        if (res?.error) setError(res.error.message ?? "Sign-up failed. Please try again.");
        else onSuccess();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="auth-page">
      <div className="auth-container">

        
        <div className="brand">
          
          <div className="brand-icon">R</div>
          <span className="brand-name">ragimart</span>
        </div>

        
        <h1 className="auth-heading">
          {isLogin ? "Log In" : "Create Account"}
        </h1>

        
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          
          {!isLogin && (
            <>
              
              <div className="field">
                <input
                  className="field-input"
                  type="text"
                  placeholder="Full name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              
              <div className="field">
                <input
                  className="field-input"
                  type="email"
                  placeholder="Email address"
                  required
                  autoComplete="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>

              
              <div className="field">
                <input
                  className="field-input"
                  type={showSignupPw ? "text" : "password"}
                  placeholder="Password"
                  required
                  autoComplete="new-password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowSignupPw((v) => !v)}
                  aria-label={showSignupPw ? "Hide password" : "Show password"}
                >
                  {showSignupPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              
              <div className="field">
                <input
                  className="field-input"
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="Confirm password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  aria-label={showConfirmPw ? "Hide password" : "Show password"}
                >
                  {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              
              <div className="field">
                <div className="select-wrapper">
                  <select
                    className={`gender-select${!gender ? " unselected" : ""}`}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  >
                    <option value="" disabled>Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  <span className="select-arrow">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            </>
          )}


          {isLogin && (
            <>
              <div className="field">
                <input
                  className="field-input"
                  type="email"
                  placeholder="Email address"
                  required
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <input
                  className="field-input"
                  type={showLoginPw ? "text" : "password"}
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowLoginPw((v) => !v)}
                  aria-label={showLoginPw ? "Hide password" : "Show password"}
                >
                  {showLoginPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </>
          )}

          {/* Error */}
          {error && <p className="error-msg" role="alert">{error}</p>}

         
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Please wait…" : isLogin ? "Log In" : "Create Account"}
          </button>
        </form>

        
        <button className="switch-link" onClick={switchMode} type="button">
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Log in"}
        </button>

        
        {isLogin ? (
                        <p className="legal-text">
                By logging in, it means that you have read and agreed to ragimart's{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
              </p>
        ) : (
              <p className="legal-text">
                By creating an account, it means that you have read and agreed to ragimart's{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
              </p>
          )}

        
        <p className="or-divider">or</p>

        
        <button className="btn-social" onClick={handleGoogle} type="button">
          <GoogleIcon />
          Continue with Google
        </button>

      </div>
    </main>
  );
}


function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}