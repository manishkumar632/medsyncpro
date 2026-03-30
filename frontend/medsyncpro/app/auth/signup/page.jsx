"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { signupAction } from "@/actions/authAction";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Role definitions (UI-only data) ─────────────────────────────────────────

const ROLES = [
  {
    value: "PATIENT",
    label: "Patient",
    icon: "🧑",
    desc: "Book appointments & order medicines",
  },
  {
    value: "DOCTOR",
    label: "Doctor",
    icon: "👨‍⚕️",
    desc: "Manage patients & prescriptions",
  },
  {
    value: "PHARMACY",
    label: "Pharmacy",
    icon: "💊",
    desc: "Fulfill & manage orders",
  },
  { value: "ADMIN", label: "Admin", icon: "🔒", desc: "Full system access" },
];

const DEFAULT_ROLE = "PATIENT";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  
  // ── UI state ────────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(DEFAULT_ROLE);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  function handleRoleSelect(value) {
    setSelectedRole(value);
  }

  async function handleFormAction() {
    setIsPending(true);
    const response = await fetch("/online-medication/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        role: selectedRole,
        name,
        confirmPassword,
        termsAccepted,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success(data.message || "Registration successful!");
      router.push(`/auth/email-sent?email=${encodeURIComponent(email)}`);
    } else {
      setError(data.message || "Registration failed");
      setIsPending(false);
    }
  }

  const currentRole = ROLES.find((r) => r.value === selectedRole);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen">
      {/* ── Left: form ── */}
      <div
        className="flex w-full lg:w-1/2 flex-col px-8 sm:px-16 lg:px-24 overflow-y-auto"
        style={{
          maxHeight: "100vh",
          paddingTop: 48,
          paddingBottom: 48,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-2">Create Your Account</h1>
          <p className="text-gray-400 mb-8">
            Let&apos;s get started by creating a new account.
          </p>

          {/* Google sign-up */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-full py-3 px-6 mb-6 hover:bg-gray-50 transition"
          >
            <GoogleIcon />
            <span className="text-gray-200 font-medium">
              Sign up with Google Account
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-gray-300" />
            <span className="text-gray-400 text-sm">Or</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Inline error banner */}
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4"
            >
              <ErrorIcon />
              {error}
            </div>
          )}

          <form action={handleFormAction} noValidate>
            {/* Full name */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm text-gray-600 mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="John Doe"
                required
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm text-gray-600 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm text-gray-600 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-11 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm text-gray-600 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-11 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Role dropdown */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Role</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between border border-gray-300 rounded-lg py-3 px-4 text-left focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                  >
                    <span className="flex items-center gap-2">
                      <span>{currentRole?.icon}</span>
                      <span className="text-gray-800 font-medium">
                        {currentRole?.label}
                      </span>
                    </span>
                    <ChevronDownIcon />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[var(--radix-dropdown-menu-trigger-width)]"
                  align="start"
                >
                  <DropdownMenuLabel>Select your role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {ROLES.map((role) => (
                      <DropdownMenuItem
                        key={role.value}
                        onSelect={() => handleRoleSelect(role.value)}
                        className={
                          selectedRole === role.value ? "bg-accent" : ""
                        }
                      >
                        <span className="text-lg mr-1">{role.icon}</span>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {role.desc}
                          </span>
                        </div>
                        {selectedRole === role.value && (
                          <CheckIcon className="ml-auto" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Terms */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  value="on"
                  onChange={(e) => setTermsAccepted(e.target.value)}
                  required
                  className="w-4 h-4 accent-cyan-500"
                />
                <span className="text-sm text-gray-600">
                  I accept the{" "}
                  <Link href="/terms" className="text-cyan-500 hover:underline">
                    terms and conditions
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-cyan-500 text-white rounded-full py-3 px-6 font-medium hover:bg-cyan-600 transition mb-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <SpinnerIcon /> Creating Account…
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          <p className="text-center text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-cyan-500 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: illustration ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 to-purple-100 items-center justify-center">
        <Image
          src="/online-medication/doctors_signup_page.png"
          alt="Doctors illustration"
          width={500}
          height={700}
          priority
        />
      </div>
    </div>
  );
}

// ─── Icon components ──────────────────────────────────────────────────────────

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
function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9ca3af"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function CheckIcon({ className = "" }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <polyline points="20 6 9 17 4 12" />
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
