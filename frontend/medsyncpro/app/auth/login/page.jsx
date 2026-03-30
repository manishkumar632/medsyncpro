"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth, getRedirectPath } from "@/app/context/AuthContext";

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/online-medication/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // Cache non-sensitive user data in sessionStorage for fast retrieval
      if (data.user) {
        login(data.user);
        try {
          sessionStorage.setItem(
            "medsyncpro_user",
            JSON.stringify({
              userId: data.user.userId,
              role: data.user.role,
              name: data.user.name,
              email: data.user.email,
            })
          );
        } catch {
          // sessionStorage unavailable — non-critical
        }
      }

      const redirectTo = searchParams.get("redirect");
      const destination = isSafeRedirect(redirectTo)
        ? redirectTo
        : getRedirectPath(data.user?.role);

      router.replace(destination);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* ── Left: Illustration ── */}
      <div className="login-illustration">
        <div className="login-illustration-content">
          <div className="login-brand">
            <div className="login-brand-icon">
              <CrossIcon />
            </div>
            <span className="login-brand-text">MedSyncPro</span>
          </div>
          <Image
            src="/online-medication/doctors.png"
            alt="Healthcare professionals illustration"
            width={480}
            height={480}
            priority
            className="login-hero-image"
          />
          <h2 className="login-illustration-title">
            Your Health, Our Priority
          </h2>
          <p className="login-illustration-subtitle">
            Access your prescriptions, appointments, and health records — all in
            one place.
          </p>
        </div>
        {/* Decorative floating elements */}
        <div className="login-float login-float-1" />
        <div className="login-float login-float-2" />
        <div className="login-float login-float-3" />
      </div>

      {/* ── Right: Login Form ── */}
      <div className="login-form-section">
        <div className="login-form-container">
          <h1 className="login-heading">Welcome Back</h1>
          <p className="login-subheading">
            Sign in to continue to your account
          </p>

          {/* Google sign-in */}
          <button type="button" className="login-google-btn" id="google-login-btn">
            <GoogleIcon />
            <span>Sign in with Google</span>
          </button>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">or sign in with email</span>
            <div className="login-divider-line" />
          </div>

          {/* Error banner */}
          {error && (
            <div className="login-error" role="alert" id="login-error-banner">
              <ErrorIcon />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="login-form">
            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">
                Email Address
              </label>
              <div className="login-input-wrapper">
                <MailIcon />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="login-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="login-password" className="login-label">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="login-forgot-link" id="forgot-password-link">
                  Forgot Password?
                </Link>
              </div>
              <div className="login-input-wrapper">
                <LockIcon />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="login-input"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="login-eye-btn"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
              id="login-submit-btn"
            >
              {loading ? (
                <>
                  <SpinnerIcon /> Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Create account */}
          <p className="login-signup-link">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" id="create-account-link">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}><SpinnerIcon /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function isSafeRedirect(path) {
  return (
    typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
  );
}

// ─── Icon components ──────────────────────────────────────────────────────────

function CrossIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v20M2 12h20"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path
        fill="#4285F4"
        d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
      />
      <path
        fill="#34A853"
        d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
      />
      <path
        fill="#FBBC05"
        d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
      />
      <path
        fill="#EA4335"
        d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 7l-10 7L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#dc2626"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
