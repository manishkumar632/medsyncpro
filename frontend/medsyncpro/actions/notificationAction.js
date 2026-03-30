"use server";

import { serverApiClient, ApiError } from "@/lib/api-client";

// ─── Fetch all notifications for the current user ─────────────────────────────
export async function fetchNotificationsAction() {
  try {
    const response = await serverApiClient("/notifications");
    if (response.data.success) {
      return { success: true, data: response.data.data ?? [] };
    }
    return { success: false, data: [], message: response.data.message };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Failed to fetch notifications.";
    return { success: false, data: [], message };
  }
}

// ─── Fetch unread count only (lightweight polling fallback) ───────────────────

export async function fetchUnreadCountAction() {
  try {
    const response = await serverApiClient("/notifications/unread-count");
    if (response.data.success) {
      return {
        success: true,
        count: response.data.data?.unreadCount ?? 0,
      };
    }
    return { success: false, count: 0 };
  } catch {
    return { success: false, count: 0 };
  }
}

// ─── Mark a single notification as read ──────────────────────────────────────

export async function markAsReadAction(notificationId) {
  try {
    const response = await serverApiClient(
      `/notifications/${notificationId}/read`,
      { method: "PUT" },
    );
    if (response.data.success) return { success: true };
    return {
      success: false,
      message: response.data.message ?? "Failed to mark as read.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "Failed to mark as read.";
    return { success: false, message };
  }
}

// ─── Mark ALL notifications as read ──────────────────────────────────────────

export async function markAllAsReadAction() {
  try {
    const response = await serverApiClient("/notifications/read-all", {
      method: "PUT",
    });
    if (response.data.success) return { success: true };
    return {
      success: false,
      message: response.data.message ?? "Failed to mark all as read.",
    };
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "Failed to mark all as read.";
    return { success: false, message };
  }
}

// ─── Register FCM token for push notifications (admin only) ──────────────────

export async function registerFcmTokenAction(fcmToken) {
  try {
    if (!fcmToken) return { success: false, message: "No FCM token provided." };

    const response = await serverApiClient(
      "/notifications/register-fcm-token",
      {
        method: "POST",
        body: JSON.stringify({ fcmToken }),
      },
    );

    if (response.data.success) return { success: true };
    return {
      success: false,
      message: response.data.message ?? "Failed to register FCM token.",
    };
  } catch (error) {
    // FCM registration failing is non-critical — log but don't surface to user
    console.warn("[FCM] Token registration failed:", error?.message);
    return { success: false };
  }
}
