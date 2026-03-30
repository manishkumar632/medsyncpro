"use server";

import { serverApiClient } from "@/lib/api-client";

// ─── Approval Queue ───────────────────────────────────────────────────────────

export async function fetchPendingUsersAction() {
  try {
    const body = await serverApiClient("/admin/users/pending");
    return { success: true, data: body.data?.data ?? [] };
  } catch {
    return { success: false, data: [] };
  }
}

export async function approveUserAction(userId) {
  try {
    await serverApiClient(`/admin/users/${userId}/approve`, {
      method: "PATCH",
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function rejectUserAction(userId) {
  try {
    await serverApiClient(`/admin/users/${userId}/reject`, { method: "PATCH" });
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ─── Role Management ──────────────────────────────────────────────────────────

export async function fetchUsersAction({ role, page, size, search }) {
  try {
    const params = new URLSearchParams({ role, page, size });
    if (search?.trim()) params.append("search", search.trim());
    const body = await serverApiClient(`/admin/users?${params}`);
    const paged = body.data?.data;
    return {
      success: true,
      content: paged?.content ?? [],
      totalPages: paged?.totalPages ?? 0,
      totalElements: paged?.totalElements ?? 0,
    };
  } catch {
    return { success: false, content: [], totalPages: 0, totalElements: 0 };
  }
}

export async function fetchUserCountAction(role) {
  try {
    const body = await serverApiClient(
      `/admin/users?role=${role}&page=0&size=1`,
    );
    return { success: true, count: body.data?.data?.totalElements ?? 0 };
  } catch {
    return { success: false, count: 0 };
  }
}

export async function suspendUserAction(userId) {
  try {
    await serverApiClient(`/admin/users/${userId}/suspend`, {
      method: "PATCH",
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function fetchDoctorsAction({
  page = 0,
  size = 100,
  search,
} = {}) {
  try {
    const params = new URLSearchParams({ role: "DOCTOR", page, size });
    if (search?.trim()) params.append("search", search.trim());
    const body = await serverApiClient(`/admin/users?${params}`);
    const paged = body.data?.data;
    return {
      success: true,
      content: paged?.content ?? [],
      totalElements: paged?.totalElements ?? 0,
    };
  } catch {
    return { success: false, content: [], totalElements: 0 };
  }
}

// ─── Doctor verification: approve ─────────────────────────────────────────────
// POST /api/admin/users/{userId}/approve-verification
// → in-app notification + FCM push + congratulations email to doctor

export async function approveVerificationByUserIdAction(userId) {
  try {
    await serverApiClient(`/admin/users/${userId}/approve-verification`, {
      method: "POST",
    });
    return { success: true };
  } catch (err) {
    return { success: false, message: err?.message ?? "Approval failed." };
  }
}

// ─── Doctor verification: reject ──────────────────────────────────────────────
// POST /api/admin/users/{userId}/reject-verification  { comment }
// → in-app notification + FCM push + rejection email to doctor

export async function rejectVerificationByUserIdAction(userId, comment) {
  try {
    await serverApiClient(`/admin/users/${userId}/reject-verification`, {
      method: "POST",
      body: { comment: comment || "Rejected by admin." },
    });
    return { success: true };
  } catch (err) {
    return { success: false, message: err?.message ?? "Rejection failed." };
  }
}

// ─── Doctor verification: request document re-upload ─────────────────────────
// POST /api/admin/users/{userId}/request-resubmit
// Body: { comment, documentTypeCodes: ["MEDICAL_LICENSE", ...] }
// → in-app notification + FCM push + re-upload request email to doctor

export async function requestResubmitAction(
  userId,
  documentTypeCodes,
  comment,
) {
  try {
    await serverApiClient(`/admin/users/${userId}/request-resubmit`, {
      method: "POST",
      body: {
        comment: comment?.trim() || null,
        documentTypeCodes,
      },
    });
    return { success: true };
  } catch (err) {
    return { success: false, message: err?.message ?? "Request failed." };
  }
}
