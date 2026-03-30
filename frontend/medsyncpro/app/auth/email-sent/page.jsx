"use client";

import { useActionState, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resendVerificationAction } from "@/actions/authAction";

// ─── Initial state ────────────────────────────────────────────────────────────
const initialState = { success: false, error: null };

// ─── Inner component (needs useSearchParams, so must be inside Suspense) ──────

function EmailSentContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";

  // ── Server action ─────────────────────────────────────────────────────────
  const [state, formAction, isPending] = useActionState(
    resendVerificationAction,
    initialState,
  );

  // ── Cooldown timer (pure UI state) ────────────────────────────────────────
  // The timer starts when the server action succeeds.
  // It lives here because it controls button appearance only — not any data.
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!state.success) return;

    // Start 60-second cooldown after a successful resend.
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.success, state]); // re-run each time a new success comes in

  const isDisabled = isPending || cooldown > 0;

  function getButtonLabel() {
    if (isPending) return "Sending…";
    if (state.success && cooldown > 0) return `Sent! Resend in ${cooldown}s`;
    if (state.error) return "Failed — try again";
    if (cooldown > 0) return `Resend in ${cooldown}s`;
    return "Resend Verification Email";
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-100 to-gray-100 p-6 font-sans">
      <div className="bg-white rounded-2xl px-10 py-12 max-w-md w-full text-center shadow-xl">
        {/* Envelope icon */}
        <div className="w-24 h-24 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-6">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0d7377"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Check Your Email
        </h1>
        <p className="text-gray-400 text-sm mb-1">
          We&rsquo;ve sent a verification link to
        </p>
        <p className="text-[#0d7377] font-semibold text-base mb-8 break-all">
          {email}
        </p>

        <div className="flex flex-col gap-4 mb-6 text-left">
          {[
            "Open your email inbox",
            "Click the verification link",
            "Start using MedSyncpro",
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3.5">
              <span className="w-8 h-8 rounded-full bg-[#0d7377] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-gray-600">{step}</span>
            </div>
          ))}
        </div>

        {/* Server error banner */}
        {state.error && (
          <div
            role="alert"
            className="p-2.5 px-3.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs mb-3 text-left"
          >
            {state.error}
          </div>
        )}

        {/*
         * The form carries the email in a hidden input so FormData has it.
         * The email comes from the URL — it was never typed here, so there's
         * nothing to validate on the client beyond "it exists".
         */}
        <form action={formAction}>
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            disabled={isDisabled}
            className={`w-full py-3 px-6 bg-transparent border-[1.5px] border-[#0d7377] rounded-full text-[#0d7377] text-sm font-semibold mb-4 transition-all ${
              isDisabled
                ? "opacity-60 cursor-not-allowed"
                : "cursor-pointer hover:bg-[#0d7377] hover:text-white"
            }`}
          >
            {getButtonLabel()}
          </button>
        </form>

        <p className="text-gray-400 text-xs mb-6">
          Didn&rsquo;t receive the email? Check your spam folder or{" "}
          <Link
            href="/auth/signup"
            className="text-[#0d7377] font-semibold no-underline hover:underline"
          >
            try signing up again
          </Link>
          .
        </p>

        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center bg-[#0d7377] text-white border-none rounded-full py-3.5 px-10 text-sm font-semibold no-underline cursor-pointer hover:bg-[#0a5c5f] transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailSentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading…
        </div>
      }
    >
      <EmailSentContent />
    </Suspense>
  );
}
