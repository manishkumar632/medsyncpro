"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  X,
  Send,
  ChevronLeft,
  CheckCheck,
  Check,
  MessageSquare,
  Stethoscope,
  Clock,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import { useNotifications } from "@/app/context/NotificationContext";
import {
  fetchConversationsAction,
  fetchMessagesAction,
  sendMessageAction,
  markConversationReadAction,
} from "@/actions/messageAction";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatMessageTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];
function colorForName(name) {
  if (!name) return COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, imageUrl, size = 40 }) {
  const color = colorForName(name);
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: "-0.5px",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── Conversation Row ─────────────────────────────────────────────────────────

function ConvRow({ conv, active, onClick }) {
  return (
    <div className={`msg-conv-row${active ? " active" : ""}`} onClick={onClick}>
      <Avatar name={conv.doctorName} imageUrl={conv.doctorAvatar} size={44} />
      <div className="msg-conv-info">
        <div className="msg-conv-top">
          <span className="msg-conv-name">
            {"Dr. " + (conv.doctorName || "Unknown")}
          </span>
          <span className="msg-conv-time">
            {formatTime(conv.lastMessageAt)}
          </span>
        </div>
        <div className="msg-conv-sub">
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Stethoscope
              size={10}
              style={{ flexShrink: 0, color: "#94a3b8" }}
            />
            <span>{conv.doctorSpecialty || "General"}</span>
          </div>
        </div>
        <div className="msg-conv-last">
          {conv.lastMessage || (
            <em style={{ color: "#cbd5e1" }}>No messages yet</em>
          )}
        </div>
      </div>
      {conv.unreadCount > 0 && (
        <div className="msg-unread-badge">
          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
        </div>
      )}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function Bubble({ msg, isOwn }) {
  const statusIcon = () => {
    if (!isOwn) return null;
    if (msg._status === "sending")
      return (
        <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} />
      );
    if (msg._status === "failed")
      return <AlertCircle size={11} color="#ef4444" />;
    if (msg.isRead) return <CheckCheck size={11} />;
    return <Check size={11} />;
  };

  return (
    <div className={`msg-bubble-wrap${isOwn ? " own" : ""}`}>
      <div
        className={`msg-bubble${isOwn ? " own" : ""}${msg._status === "failed" ? " failed" : ""}`}
      >
        <p>{msg.content}</p>
        <div className="msg-bubble-meta">
          <span>{formatMessageTime(msg.createdAt || msg._sentAt)}</span>
          {statusIcon()}
        </div>
      </div>
    </div>
  );
}

// ─── Empty States ─────────────────────────────────────────────────────────────

function EmptyConversations({ onRetry, isError }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {isError ? (
          <AlertCircle size={28} color="#ef4444" />
        ) : (
          <MessageSquare size={28} color="#94a3b8" />
        )}
      </div>
      <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
        {isError ? "Failed to load conversations" : "No conversations yet"}
      </div>
      <div
        style={{
          fontSize: "0.8rem",
          color: "#64748b",
          marginBottom: 16,
          lineHeight: 1.5,
        }}
      >
        {isError
          ? "Check your connection and try again."
          : "Visit a doctor's profile to start a conversation."}
      </div>
      {isError && (
        <button className="msg-retry-btn" onClick={onRetry}>
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}

function NoChatSelected() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
        background: "#fafbfc",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <MessageSquare size={36} color="#6366f1" />
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "#1e293b",
          marginBottom: 8,
        }}
      >
        Select a conversation
      </div>
      <div
        style={{
          fontSize: "0.83rem",
          color: "#64748b",
          lineHeight: 1.6,
          maxWidth: 300,
        }}
      >
        Choose a doctor from the left panel to view your conversation history.
      </div>
    </div>
  );
}

// ─── Date Separator ───────────────────────────────────────────────────────────

function DateSep({ label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "16px 0",
        padding: "0 16px",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
      <span
        style={{
          fontSize: "0.7rem",
          color: "#94a3b8",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
    </div>
  );
}

function getDateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function groupByDate(msgs) {
  const groups = [];
  let lastLabel = "";
  msgs.forEach((m) => {
    const label = getDateLabel(m.createdAt || m._sentAt);
    if (label !== lastLabel) {
      groups.push({ type: "sep", label });
      lastLabel = label;
    }
    groups.push({ type: "msg", msg: m });
  });
  return groups;
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ConvSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 16px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#f1f5f9",
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: 12,
            background: "#f1f5f9",
            borderRadius: 6,
            width: "60%",
            marginBottom: 8,
          }}
        />
        <div
          style={{
            height: 10,
            background: "#f1f5f9",
            borderRadius: 6,
            width: "80%",
          }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PatientMessages() {
  const { subscribeToMessages } = useNotifications();

  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [convError, setConvError] = useState(false);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState("list"); // "list" | "chat"

  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);
  const inputRef = useRef(null);
  const activeConvRef = useRef(null);

  // keep ref in sync so SSE callback has fresh value
  useEffect(() => {
    activeConvRef.current = activeConvId;
  }, [activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  // ── Load conversations ─────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    setConvLoading(true);
    setConvError(false);
    const res = await fetchConversationsAction();
    setConvLoading(false);
    if (res.success) {
      setConversations(Array.isArray(res.data) ? res.data : []);
    } else {
      setConvError(true);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Load messages for a conversation ──────────────────────────────────────

  const loadMessages = useCallback(async (convId, page = 0) => {
    if (page === 0) {
      setMsgLoading(true);
      setMsgError(false);
      setMessages([]);
    } else setLoadingMore(true);

    const res = await fetchMessagesAction(convId, page, 50);

    if (page === 0) setMsgLoading(false);
    else setLoadingMore(false);

    if (!res.success) {
      if (page === 0) setMsgError(true);
      return;
    }

    const pageData = res.data;
    const content =
      pageData?.content ?? (Array.isArray(pageData) ? pageData : []);

    setMessages((prev) => (page === 0 ? content : [...content, ...prev]));
    setHasMoreMessages(!pageData?.last && pageData?.totalPages > page + 1);
    setCurrentPage(page);
  }, []);

  // ── Select conversation ────────────────────────────────────────────────────

  const selectConversation = useCallback(
    async (convId) => {
      if (convId === activeConvId) return;
      setActiveConvId(convId);
      setInputText("");
      setMobileView("chat");
      loadMessages(convId, 0);
      markConversationReadAction(convId); // optimistic, best-effort
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c)),
      );
    },
    [activeConvId, loadMessages],
  );

  // ── Scroll to bottom ───────────────────────────────────────────────────────

  const scrollToBottom = useCallback((smooth = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    if (!msgLoading) scrollToBottom();
  }, [messages, msgLoading, scrollToBottom]);

  // ── Load more (scroll to top) ──────────────────────────────────────────────

  const handleScroll = useCallback(
    (e) => {
      if (e.target.scrollTop === 0 && hasMoreMessages && !loadingMore) {
        loadMessages(activeConvId, currentPage + 1);
      }
    },
    [hasMoreMessages, loadingMore, activeConvId, currentPage, loadMessages],
  );

  // ── SSE real-time messages ─────────────────────────────────────────────────

  useEffect(() => {
    return subscribeToMessages((payload) => {
      const {
        conversationId,
        content,
        senderId,
        senderName,
        senderRole,
        sentAt,
        messageId,
      } = payload;

      // Build a transient message object matching ChatMessageResponse shape
      const newMsg = {
        id: messageId,
        conversationId,
        senderId,
        senderRole,
        senderName,
        content,
        isRead: false,
        createdAt: sentAt,
      };

      // If this conversation is open → append message + mark as read
      if (conversationId === activeConvRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === messageId)) return prev; // de-dup
          return [...prev, newMsg];
        });
        markConversationReadAction(conversationId);
      }

      // Update sidebar preview and unread badge
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === conversationId);
        if (idx === -1) {
          // Unknown conversation — reload the list
          loadConversations();
          return prev;
        }
        const updated = [...prev];
        const isActive = conversationId === activeConvRef.current;
        updated[idx] = {
          ...updated[idx],
          lastMessage:
            content.length > 80 ? content.slice(0, 80) + "…" : content,
          lastMessageAt: sentAt,
          unreadCount: isActive ? 0 : (updated[idx].unreadCount || 0) + 1,
        };
        // Bubble updated conversation to top
        const [conv] = updated.splice(idx, 1);
        return [conv, ...updated];
      });
    });
  }, [subscribeToMessages, loadConversations]);

  // ── Send message ───────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !activeConvId || isSending) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      conversationId: activeConvId,
      senderRole: "PATIENT",
      content: text,
      isRead: false,
      createdAt: new Date().toISOString(),
      _sentAt: new Date().toISOString(),
      _status: "sending",
    };

    setInputText("");
    setMessages((prev) => [...prev, optimistic]);
    setIsSending(true);

    const res = await sendMessageAction(activeConvId, text);
    setIsSending(false);

    if (res.success) {
      // Replace optimistic with real message from server
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...res.data, _status: "sent" } : m,
        ),
      );
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === activeConvId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          lastMessage: text.length > 80 ? text.slice(0, 80) + "…" : text,
          lastMessageAt: new Date().toISOString(),
        };
        const [conv] = updated.splice(idx, 1);
        return [conv, ...updated];
      });
    } else {
      // Mark as failed — user can retry
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, _status: "failed" } : m)),
      );
    }
  }, [inputText, activeConvId, isSending]);

  const handleRetry = useCallback(async (failedMsg) => {
    setMessages((prev) => prev.filter((m) => m.id !== failedMsg.id));
    setInputText(failedMsg.content);
    inputRef.current?.focus();
  }, []);

  // ── Keyboard send ──────────────────────────────────────────────────────────

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Filtered conversations ─────────────────────────────────────────────────

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.doctorName || "").toLowerCase().includes(q) ||
      (c.doctorSpecialty || "").toLowerCase().includes(q)
    );
  });

  // ── Grouped messages ───────────────────────────────────────────────────────

  const grouped = groupByDate(messages);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes msg-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes msg-slide-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }

        /* ── Scroll containment ──────────────────────────────── */
        :root { --msg-pd-padding: 24px; --msg-navbar-h: 64px; }
        .msg-page-wrapper {
          margin: calc(-1 * var(--msg-pd-padding));
          height: calc(100vh - var(--msg-navbar-h));
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .msg-root {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Sidebar ─────────────────────────────────────────── */
        .msg-sidebar {
          width: 320px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #f1f5f9;
          background: #fff;
          min-height: 0;
        }
        .msg-sidebar-head {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          flex-shrink: 0;
        }
        .msg-sidebar-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .msg-sidebar-title h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        .msg-search-wrap {
          position: relative;
        }
        .msg-search-wrap svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .msg-search-input {
          width: 100%;
          padding: 8px 8px 8px 34px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.82rem;
          font-family: inherit;
          background: #f8fafc;
          color: #1e293b;
          outline: none;
          box-sizing: border-box;
          transition: border 0.15s;
        }
        .msg-search-input:focus { border-color: #6366f1; background: #fff; }

        .msg-conv-list {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }
        .msg-conv-list::-webkit-scrollbar { width: 3px; }
        .msg-conv-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }

        .msg-conv-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: background 0.12s;
          border-bottom: 1px solid #f8fafc;
        }
        .msg-conv-row:hover  { background: #f8fafc; }
        .msg-conv-row.active { background: #eef2ff; border-right: 3px solid #6366f1; }

        .msg-conv-info { flex: 1; min-width: 0; }
        .msg-conv-top  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
        .msg-conv-name { font-weight: 600; font-size: 0.875rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-conv-time { font-size: 0.7rem; color: #94a3b8; flex-shrink: 0; margin-left: 6px; }
        .msg-conv-sub  { font-size: 0.7rem; color: #94a3b8; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
        .msg-conv-last { font-size: 0.78rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-unread-badge {
          min-width: 20px; height: 20px;
          background: #6366f1; color: #fff;
          border-radius: 999px; font-size: 0.68rem;
          font-weight: 700; display: flex;
          align-items: center; justify-content: center;
          padding: 0 5px; flex-shrink: 0;
        }

        /* ── Chat area ───────────────────────────────────────── */
        .msg-chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          min-width: 0;
          background: #fafbfc;
        }
        .msg-chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #f1f5f9;
          background: #fff;
          flex-shrink: 0;
        }
        .msg-chat-header-name  { font-weight: 700; font-size: 0.95rem; color: #0f172a; }
        .msg-chat-header-sub   { display: flex; align-items: center; gap: 4px; font-size: 0.74rem; color: #94a3b8; }

        .msg-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-height: 0;
        }
        .msg-messages::-webkit-scrollbar { width: 4px; }
        .msg-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

        .msg-load-more-btn {
          align-self: center;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: #f1f5f9;
          border: none;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          font-family: inherit;
          margin-bottom: 8px;
        }
        .msg-load-more-btn:hover { background: #e2e8f0; }

        /* ── Bubbles ─────────────────────────────────────────── */
        .msg-bubble-wrap {
          display: flex;
          margin: 2px 0;
          animation: msg-fade-in 0.15s ease;
        }
        .msg-bubble-wrap.own { justify-content: flex-end; }

        .msg-bubble {
          max-width: min(68%, 420px);
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 0.875rem;
          line-height: 1.5;
          word-break: break-word;
          position: relative;
          background: #fff;
          color: #1e293b;
          border: 1px solid #f1f5f9;
          border-bottom-left-radius: 4px;
        }
        .msg-bubble.own {
          background: #6366f1;
          color: #fff;
          border: none;
          border-bottom-right-radius: 4px;
          border-bottom-left-radius: 16px;
        }
        .msg-bubble.failed { opacity: 0.7; border: 1.5px dashed #fca5a5; }
        .msg-bubble p { margin: 0; }
        .msg-bubble-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          margin-top: 4px;
          justify-content: flex-end;
          opacity: 0.7;
        }

        /* ── Input bar ───────────────────────────────────────── */
        .msg-input-bar {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          padding: 14px 16px;
          border-top: 1px solid #f1f5f9;
          background: #fff;
          flex-shrink: 0;
        }
        .msg-input-textarea {
          flex: 1;
          resize: none;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 0.875rem;
          font-family: inherit;
          color: #1e293b;
          background: #f8fafc;
          outline: none;
          max-height: 120px;
          line-height: 1.5;
          transition: border 0.15s;
        }
        .msg-input-textarea:focus { border-color: #6366f1; background: #fff; }
        .msg-input-textarea::placeholder { color: #cbd5e1; }

        .msg-send-btn {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: #6366f1;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .msg-send-btn:hover:not(:disabled) { background: #4f46e5; transform: scale(1.05); }
        .msg-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .msg-retry-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          font-size: 0.82rem;
          font-weight: 600;
          color: #475569;
          font-family: inherit;
        }

        /* ── Mobile ──────────────────────────────────────────── */
        @media (max-width: 768px) {
          .msg-sidebar { width: 100%; }
          .msg-sidebar.msg-hidden { display: none; }
          .msg-chat-area.msg-hidden { display: none; }
        }
      `}</style>

      <div className="msg-page-wrapper">
        <div className="msg-root">
          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <div
            className={`msg-sidebar${mobileView === "chat" ? " msg-hidden" : ""}`}
          >
            <div className="msg-sidebar-head">
              <div className="msg-sidebar-title">
                <MessageSquare size={18} color="#6366f1" />
                <h2>Messages</h2>
                {conversations.some((c) => c.unreadCount > 0) && (
                  <div
                    style={{
                      marginLeft: "auto",
                      background: "#6366f1",
                      color: "#fff",
                      borderRadius: 999,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                    }}
                  >
                    {conversations.reduce(
                      (s, c) => s + (c.unreadCount || 0),
                      0,
                    )}
                  </div>
                )}
              </div>
              <div className="msg-search-wrap">
                <Search size={14} />
                <input
                  className="msg-search-input"
                  placeholder="Search doctors…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="msg-conv-list">
              {convLoading ? (
                [1, 2, 3, 4].map((i) => <ConvSkeleton key={i} />)
              ) : convError || filteredConversations.length === 0 ? (
                <EmptyConversations
                  isError={convError}
                  onRetry={loadConversations}
                />
              ) : (
                filteredConversations.map((c) => (
                  <ConvRow
                    key={c.id}
                    conv={c}
                    active={c.id === activeConvId}
                    onClick={() => selectConversation(c.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Chat area ──────────────────────────────────────────────────── */}
          <div
            className={`msg-chat-area${mobileView === "list" ? " msg-hidden" : ""}`}
          >
            {!activeConv ? (
              <NoChatSelected />
            ) : (
              <>
                {/* Header */}
                <div className="msg-chat-header">
                  <button
                    onClick={() => setMobileView("list")}
                    style={{
                      display: "none",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 8,
                    }}
                    className="msg-back-btn"
                  >
                    <ChevronLeft size={20} color="#64748b" />
                  </button>
                  <Avatar
                    name={activeConv.doctorName}
                    imageUrl={activeConv.doctorAvatar}
                    size={40}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="msg-chat-header-name">
                      {"Dr. " + activeConv.doctorName}
                    </div>
                    <div className="msg-chat-header-sub">
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <Stethoscope size={11} />
                        {activeConv.doctorSpecialty || "General"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="msg-messages" onScroll={handleScroll}>
                  {/* Load more */}
                  {hasMoreMessages && (
                    <button
                      className="msg-load-more-btn"
                      onClick={() =>
                        loadMessages(activeConvId, currentPage + 1)
                      }
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <Loader2
                            size={12}
                            style={{ animation: "spin 1s linear infinite" }}
                          />{" "}
                          Loading…
                        </>
                      ) : (
                        <>
                          <Clock size={12} /> Load earlier messages
                        </>
                      )}
                    </button>
                  )}

                  {msgLoading ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                        gap: 8,
                        color: "#94a3b8",
                      }}
                    >
                      <Loader2
                        size={18}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      <span style={{ fontSize: "0.83rem" }}>
                        Loading messages…
                      </span>
                    </div>
                  ) : msgError ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                        gap: 10,
                      }}
                    >
                      <AlertCircle size={24} color="#ef4444" />
                      <div style={{ fontSize: "0.83rem", color: "#64748b" }}>
                        Failed to load messages
                      </div>
                      <button
                        className="msg-retry-btn"
                        onClick={() => loadMessages(activeConvId, 0)}
                      >
                        <RefreshCw size={14} /> Retry
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <MessageSquare size={32} color="#e2e8f0" />
                      <div style={{ fontSize: "0.83rem", color: "#94a3b8" }}>
                        No messages yet. Say hello!
                      </div>
                    </div>
                  ) : (
                    grouped.map((item, i) =>
                      item.type === "sep" ? (
                        <DateSep key={`sep-${i}`} label={item.label} />
                      ) : (
                        <div key={item.msg.id}>
                          <Bubble
                            msg={item.msg}
                            isOwn={item.msg.senderRole === "PATIENT"}
                          />
                          {item.msg._status === "failed" && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: 4,
                                paddingRight: 4,
                              }}
                            >
                              <button
                                onClick={() => handleRetry(item.msg)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: "0.7rem",
                                  color: "#ef4444",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                }}
                              >
                                <RefreshCw size={11} /> Failed — tap to retry
                              </button>
                            </div>
                          )}
                        </div>
                      ),
                    )
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="msg-input-bar">
                  <textarea
                    ref={inputRef}
                    className="msg-input-textarea"
                    rows={1}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message…"
                  />
                  <button
                    className="msg-send-btn"
                    onClick={handleSend}
                    disabled={!inputText.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2
                        size={18}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
