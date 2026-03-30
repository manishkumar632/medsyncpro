"use server";

/**
 * doctorVerificationAction.js — Server Actions for doctor document verification
 *
 * All operations go through serverApiClient which reads the HttpOnly cookie
 * server-side and forwards it to Spring Boot. The client never sees the backend URL.
 *
 * Upload flow:
 *   1. requestUploadSignatureAction  → POST /api/doctor/documents/signature
 *                                      (or the generic /api/upload/signature)
 *   2. Browser uploads file directly to Cloudinary using the returned signature
 *   3. saveUploadedDocumentAction    → POST /api/doctor/documents/upload
 *   4. submitDoctorVerificationAction→ POST /api/doctor/documents/submit-verification
 */

import { serverApiClient, ApiError } from "@/lib/api-client";

// ─── Fetch active document types for DOCTOR role ──────────────────────────────

export async function fetchDoctorDocumentTypesAction() {
  try {
    const response = await serverApiClient("/doctor/document-types");
    if (response.data.success)
      return { success: true, data: response.data.data ?? [] };
    return {
      success: false,
      data: [],
      message: response.data.message ?? "Failed to fetch document types.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, data: [], message };
  }
}

// ─── Fetch verification status ────────────────────────────────────────────────
//
//  The response shape from the backend is:
//    {
//      status:             "UNVERIFIED" | "DOCUMENT_SUBMITTED" | "VERIFIED" | "REJECTED",
//      requiredDocuments:  RequiredDocumentItem[],   ← NOT "data"
//      verificationNotes:  string | null,
//      submittedAt:        string | null,
//      reviewedAt:         string | null,
//    }

export async function fetchDoctorVerificationStatusAction() {
  try {
    const response = await serverApiClient("/doctor/verification-status");
    if (response.data.success)
      return { success: true, data: response.data.data };
    return { success: false, data: null };
  } catch {
    return { success: false, data: null };
  }
}

// ─── Request Cloudinary upload signature ──────────────────────────────────────
//
//  Calls the doctor-scoped endpoint which validates that the requested
//  documentTypeId belongs to the DOCTOR role before generating the signature.
//
//  Alternative: call /api/upload/signature for the generic shared endpoint.

export async function requestUploadSignatureAction(prevState, formData) {
  "use server";
  try {
    const documentTypeId = formData.get("documentTypeId");
    if (!documentTypeId) {
      return { success: false, message: "Document type ID is required." };
    }

    const response = await serverApiClient("/doctor/documents/signature", {
      method: "POST",
      body: JSON.stringify({ documentTypeId }),
    });

    if (response.data.success) {
      return { success: true, data: response.data.data };
    }
    return {
      success: false,
      message: response.data.message ?? "Failed to generate upload signature.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Save uploaded document metadata ──────────────────────────────────────────

export async function saveUploadedDocumentAction(prevState, formData) {
  "use server";
  try {
    const documentTypeId = formData.get("documentTypeId");
    const publicId = formData.get("publicId");
    const secureUrl = formData.get("secureUrl");
    const resourceType = formData.get("resourceType");
    const format = formData.get("format");
    const originalFilename = formData.get("originalFilename");
    const bytes = formData.get("bytes");

    if (!documentTypeId || !publicId || !secureUrl) {
      return { success: false, message: "Missing required upload data." };
    }

    const response = await serverApiClient("/doctor/documents/upload", {
      method: "POST",
      body: JSON.stringify({
        documentTypeId,
        publicId,
        secureUrl,
        resourceType: resourceType || "image",
        format: format || "",
        originalFilename: originalFilename || "",
        bytes: bytes ? parseInt(bytes, 10) : null,
      }),
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: "Document saved.",
      };
    }
    return {
      success: false,
      message: response.data.message ?? "Failed to save document.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Submit for verification ──────────────────────────────────────────────────

export async function submitDoctorVerificationAction(prevState, formData) {
  "use server";
  try {
    const response = await serverApiClient(
      "/doctor/documents/submit-verification",
      { method: "POST" },
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }
    return {
      success: false,
      message: response.data.message ?? "Failed to submit verification.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}
