"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmailAction } from "@/actions/authAction";

// ─── Inner component (needs useSearchParams, so must be inside Suspense) ──────

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  // "verifying" | "success" | "error"
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    verifyEmailAction(token).then((result) => {
      if (result.success) {
        setStatus("success");
        setMessage(result.message);
      } else {
        setStatus("error");
        setMessage(result.message);
      }
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-100 to-gray-100 p-6 font-sans">
      <div className="bg-white rounded-2xl px-10 py-12 max-w-md w-full text-center shadow-xl">
        {/* ── Verifying ── */}
        {status === "verifying" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 border-4 border-[#0d7377]/15 border-t-[#0d7377] rounded-full animate-spin" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Verifying Your Email…
            </h2>
            <p className="text-gray-500 text-sm mb-7 leading-relaxed">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {/* ── Success ── */}
        {status === "success" && (
          <>
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Email Verified!
            </h2>
            <p className="text-gray-500 text-sm mb-7 leading-relaxed">
              {message}
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center bg-[#0d7377] text-white border-none rounded-full py-3.5 px-10 text-sm font-semibold no-underline cursor-pointer hover:bg-[#0a5c5f] transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <>
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Verification Failed
            </h2>
            <p className="text-gray-500 text-sm mb-7 leading-relaxed">
              {message}
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center bg-[#0d7377] text-white border-none rounded-full py-3.5 px-10 text-sm font-semibold no-underline cursor-pointer hover:bg-[#0a5c5f] transition-colors"
            >
              Back to Signup
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-cyan-100 to-gray-100 p-6 font-sans">
          <div className="flex justify-center">
            <div className="w-12 h-12 border-4 border-[#0d7377]/15 border-t-[#0d7377] rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
