"use server";

/**
 * authAction.js — Server Actions
 *
 * These are the ONLY entry points the client may call.
 * Validate input → delegate to auth.service.js → return plain objects.
 * Zero business logic lives here.
 */

import {
  logoutService,
  resendVerificationService,
  verifyEmailService,
} from "@/lib/auth.service";
import { serverApiClient } from "@/lib/api-client";

// ─── Resend verification ──────────────────────────────────────────────────────

export async function resendVerificationAction(prevState, formData) {
  const email = formData.get("email");

  if (typeof email !== "string" || !email.trim()) {
    return { success: false, error: "A valid email address is required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { success: false, error: "Please provide a valid email address." };
  }

  const result = await resendVerificationService(email.trim().toLowerCase());

  return result.success
    ? { success: true, error: null }
    : { success: false, error: result.message };
}

// ─── Verify email ─────────────────────────────────────────────────────────────

export async function verifyEmailAction(token) {
  if (typeof token !== "string" || !token.trim()) {
    return {
      success: false,
      message: "No verification token found. Please check your email link.",
    };
  }
  const result = await verifyEmailService(token.trim());
  return { success: result.success, message: result.message };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction() {
  await logoutService();
}

// ─── Session ──────────────────────────────────────────────────────────────────


export async function getSession() {
  'use server';
  try {
    const res = await serverApiClient("/auth/me", {
      method: "GET",
    });

    const body = res.data;

    if (!body?.success) return null;

    return body.data ?? null;
  } catch {
    return null;
  }
}
