"use server";

/**
 * verificationAction.js — Server Actions for professional verification
 *
 * Covers all non-file operations.
 * Single-file upload/delete go through the Route Handler at
 * app/api/verification/documents/[type]/route.js (browser → Next.js proxy → Spring Boot).
 */

import { serverApiClient } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";

// ─── Fetch verification status ────────────────────────────────────────────────

export async function fetchVerificationStatusAction() {
  try {
    const body = await serverApiClient("/users/me/verification-status");
    if (body.success) return { success: true, data: body.data };
    return { success: false, data: null };
  } catch {
    return { success: false, data: null };
  }
}

// ─── Submit for verification ──────────────────────────────────────────────────

export async function submitForVerificationAction() {
  try {
    const body = await serverApiClient("/users/me/submit-verification", {
      method: "POST",
    });
    if (body.success)
      return { success: true, data: body.data, message: body.message };
    return {
      success: false,
      message: body.message ?? "Failed to submit verification.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Batch upload (legacy) ────────────────────────────────────────────────────

/**
 * @param {FormData} formData  must contain 'documents' files + 'documentTypes[key]' fields
 *
 * serverApiClient now detects FormData and skips setting Content-Type,
 * so the runtime attaches the correct multipart boundary automatically.
 */
export async function uploadDocumentsBatchAction(formData) {
  try {
    const body = await serverApiClient("/users/me/documents", {
      method: "POST",
      body: formData,
    });
    if (body.success) return { success: true, message: body.message };
    return {
      success: false,
      message: body.message ?? "Failed to upload documents.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}
