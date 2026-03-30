"use server";
import { serverApiClient } from "@/lib/api-client";

// ─── Conversations ─────────────────────────────────────────────────────────

/** List all conversations for the logged-in user (DOCTOR or PATIENT). */
export async function fetchConversationsAction() {
  try {
    const response = await serverApiClient("/messaging/conversations");
    return { success: true, data: response.data?.data ?? [] };
  } catch (error) {
    return { success: false, data: [], message: error?.message };
  }
}

export async function startOrGetConversationAction({ doctorId, patientId }) {
  try {
    const body = doctorId ? { doctorId } : { patientId };
    const response = await serverApiClient("/messaging/conversations", {
      method: "POST",
      body,
    });
    return { success: true, data: response.data?.data ?? response.data };
  } catch (error) {
    return { success: false, data: null, message: error?.message };
  }
}

/**
 * Start (or resume) a conversation.
 *  PATIENT body: { doctorId: "<Doctor entity UUID>" }
 *  DOCTOR  body: { patientId: "<Patient entity UUID>" }
 */
export async function startConversationAction(payload) {
  try {
    const res = await serverApiClient("/messaging/conversations", {
      method: "POST",
      body: payload,
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (e) {
    console.error("[startConversationAction]", e?.message);
    return { success: false, data: null, message: e?.message };
  }
}

// ─── Messages ──────────────────────────────────────────────────────────────

/**
 * Fetch paginated messages (oldest first).
 * Returns a Spring Page: { content, totalPages, totalElements, last, … }
 */
export async function fetchMessagesAction(conversationId, page = 0, size = 50) {
  try {
    const params = new URLSearchParams({ page, size });
    const res = await serverApiClient(
      `/messaging/conversations/${conversationId}/messages?${params}`,
      { method: "GET" },
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (e) {
    console.error("[fetchMessagesAction]", e?.message);
    return { success: false, data: null, message: e?.message };
  }
}

/** Send a message. Returns the saved ChatMessageResponse. */
export async function sendMessageAction(conversationId, content) {
  try {
    const res = await serverApiClient(
      `/messaging/conversations/${conversationId}/messages`,
      { method: "POST", body: { content } },
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (e) {
    console.error("[sendMessageAction]", e?.message);
    return { success: false, data: null, message: e?.message };
  }
}

/** Mark all messages in a conversation as read (for the current user). */
export async function markConversationReadAction(conversationId) {
  try {
    await serverApiClient(`/messaging/conversations/${conversationId}/read`, {
      method: "PATCH",
    });
    return { success: true };
  } catch (e) {
    console.error("[markConversationReadAction]", e?.message);
    return { success: false, message: e?.message };
  }
}

/** Total unread messages across all conversations — used for sidebar badge. */
export async function fetchMessageUnreadCountAction() {
  try {
    const res = await serverApiClient("/messaging/unread-count", {
      method: "GET",
    });
    const data = res.data?.data ?? res.data;
    return { success: true, count: data?.unreadCount ?? 0 };
  } catch (e) {
    return { success: false, count: 0, message: e?.message };
  }
}
