"use server";

/**
 * documentTypeAction.js — Server Actions for admin document type management
 *
 * All mutations (create, delete, toggle, rename) go through server actions.
 * serverApiClient reads the HttpOnly cookie server-side and forwards it
 * to Spring Boot — the client never sees the backend URL.
 */

import { serverApiClient } from "@/lib/api-client";
import { ApiError } from "@/lib/api-client";

// ─── Fetch document types for a model (replaces Route Handler) ──────────────

export async function fetchDocumentTypesAction(modelType) {
  try {
    const response = await serverApiClient(
      `/admin/document-types/${modelType.toUpperCase()}`,
    );
    if (response.data.success) return { success: true, data: response.data.data ?? [] };
    return { success: false, data: [], message: response.data.message ?? "Failed to fetch document types." };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, data: [], message };
  }
}

// Fetch all the document types
export async function fetchAllDocumentTypesAction() {
  'use server';
  try {
    const response = await serverApiClient(`/get-all-document-types`);
    if (response.data.success) return { success: true, data: response.data.data ?? [] };
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

/**
 * Fetches all document types and returns only those that are:
 *  - active === true  (admin has enabled the doc type)
 *  - role matches the given role  (belongs to this user's role)
 *
 * Results are sorted by displayOrder so the checklist order is consistent.
 * Used by ProfessionalVerificationGuard to build the dynamic document checklist.
 *
 * @param {string} role  e.g. "DOCTOR" | "PHARMACY" | "AGENT" | "PATIENT"
 */
export async function fetchAllDocumentTypesAndFilterActivated(role) {
  "use server";
  try {
    if (!role) return { success: false, data: [], message: "Role is required." };
    console.log("📍 role : ", role);

    const normalizedRole = role.toUpperCase();
    const response = await serverApiClient(`/get-all-document-types`);

    if (response.data.success) {
      const filtered = (response.data.data ?? [])
        .filter((doc) => doc.active === true && doc.role === normalizedRole)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      return { success: true, data: filtered };
    }

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


// ─── Create document type & assign to model (useActionState compatible) ─────

export async function createDocumentType(prevState, formData) {
  "use server";
  try {
    const name = formData.get("name");
    const description = formData.get("description") || "";
    const role = formData.get("modelType");
    const required = formData.get("required") === "true";
    const active = formData.get("active") === "true";
    const displayOrder = Math.max(
      1,
      parseInt(formData.get("displayOrder") || "1", 10),
    );

    console.log(
      "name",
      name,
      "description",
      description,
      "role",
      role,
      "required",
      required,
      "displayOrder",
      displayOrder,
    );

    if (!name || !name.trim()) {
      return { success: false, message: "Document type name is required." };
    }
    if (name.trim().length > 100) {
      return { success: false, message: "Name must be at most 100 characters." };
    }
    const response = await serverApiClient("/admin/add-new-document-type", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
        role,
        code: name.trim().toUpperCase().replace(/\s+/g, "_"), // generate code
        required,
        active,
        displayOrder,
      }),
    });
    if (response.data.success) return { success: true, data: response.data.data };
    return {
      success: false,
      message: response.data.message ?? "Failed to create document type.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Remove document type from model (useActionState compatible) ────────────

export async function removeDocumentType(prevState, formData) {
  'use server'
  try {
    const mappingId = formData.get("deleteDocTypeBtn");
    const response = await serverApiClient(
      `/admin/document-types/mapping/${mappingId}`,
      { method: "DELETE" },
    );
    if (response.data.success) return { success: true };
    return {
      success: false,
      message: response.data.message ?? "Failed to remove document type.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Toggle required / optional (useActionState compatible) ─────────────────

export async function toggleRequired(prevState, formData) {
  'use server'
  try {
    const mappingId = formData.get("mappingId");
    const response = await serverApiClient(
      `/admin/document-types/mapping/${mappingId}/toggle-required`,
      { method: "PATCH" },
    );
    if (response.data.success) return { success: true, data: response.data.data };
    return {
      success: false,
      message: response.data.message ?? "Failed to toggle required status.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Toggle active / inactive (useActionState compatible) ───────────────────

export async function toggleActive(prevState, formData) {
  'use server'
  try {
    const mappingId = formData.get("mappingId");
    const response = await serverApiClient(
      `/admin/document-types/mapping/${mappingId}/toggle-active`,
      { method: "PATCH" },
    );
    if (response.data.success) return { success: true, data: response.data.data };
    return {
      success: false,
      message: response.data.message ?? "Failed to toggle active status.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Rename document type (useActionState compatible) ───────────────────────

export async function renameDocumentType(prevState, formData) {
  try {
    const mappingId = formData.get("mappingId");
    const newName = formData.get("newName");

    if (!newName || !newName.trim()) {
      return { success: false, message: "Document type name is required." };
    }
    if (newName.trim().length > 100) {
      return { success: false, message: "Name must be at most 100 characters." };
    }

    const response = await serverApiClient(
      `/admin/document-types/mapping/${mappingId}/rename`,
      {
        method: "PATCH",
        body: JSON.stringify({ name: newName.trim() }),
      },
    );
    if (response.data.success) return { success: true, data: response.data.data };
    return {
      success: false,
      message: response.data.message ?? "Failed to rename document type.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Standalone action exports (non-useActionState) ─────────────────────────

export async function toggleRequiredAction(mappingId) {
  'use server'
  try {
    const response = await serverApiClient(
      `/admin/document-types/mapping/${mappingId}/toggle-required`,
      { method: "PATCH" },
    );
    if (response.data.success) return { success: true, data: response.data.data };
    return {
      success: false,
      message: response.data.message ?? "Failed to toggle required status.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

export async function toggleActiveAction(mappingId) {
  'use server'
  try {
    const response = await serverApiClient(
      `/admin/document-types/mapping/${mappingId}/toggle-active`,
      { method: "PATCH" },
    );
    if (response.data.success) return { success: true, data: response.data.data };
    return {
      success: false,
      message: response.data.message ?? "Failed to toggle active status.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

export async function removeDocumentTypeMappingAction(mappingId) {
  'use server'
  try {
    const response = await serverApiClient(
      `/admin/document-types/mapping/${mappingId}`,
      { method: "DELETE" },
    );
    if (response.data.success) return { success: true };
    return {
      success: false,
      message: response.data.message ?? "Failed to remove document type.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Delete document type globally (soft delete) ────────────────────────────

export async function deleteDocumentTypeAction(documentTypeId) {
  'use server'
  try {
    const response = await serverApiClient(
      `/admin/document-types/${documentTypeId}`,
      { method: "DELETE" },
    );
    if (response.data.success) return { success: true };
    return {
      success: false,
      message: response.data.message ?? "Failed to delete document type.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}
