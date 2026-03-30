"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search,
  X,
  Send,
  ChevronLeft,
  CheckCheck,
  Check,
  MessageSquare,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Filter,
  Calendar,
  Pill,
  FileText,
  User,
  Star,
  Archive,
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
  "#2563eb",
  "#0d9488",
  "#7c3aed",
  "#d97706",
  "#dc2626",
  "#0891b2",
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
    <div className={`dm-conv-row${active ? " active" : ""}`} onClick={onClick}>
      <Avatar name={conv.patientName} imageUrl={conv.patientAvatar} size={44} />
      <div className="dm-conv-info">
        <div className="dm-conv-top">
          <span className="dm-conv-name">
            <strong>{conv.patientName || "Unknown Patient"}</strong>
          </span>
          <span className="dm-conv-time">{formatTime(conv.lastMessageAt)}</span>
        </div>
        <div className="dm-conv-last">
          {conv.lastMessage || (
            <em style={{ color: "#cbd5e1" }}>No messages yet</em>
          )}
        </div>
      </div>
      {conv.unreadCount > 0 && (
        <div className="dm-unread-badge">
          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
        </div>
      )}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function Bubble({ msg, isDoctor }) {
  const statusIcon = () => {
    if (!isDoctor) return null;
    if (msg._status === "sending")
      return (
        <Loader2
          size={11}
          style={{ animation: "dm-spin 1s linear infinite" }}
        />
      );
    if (msg._status === "failed")
      return <AlertCircle size={11} color="rgba(255,255,255,0.8)" />;
    if (msg.isRead) return <CheckCheck size={11} />;
    return <Check size={11} />;
  };

  return (
    <div className={`dm-bubble-wrap${isDoctor ? " doctor" : " patient"}`}>
      <div
        className={`dm-bubble${isDoctor ? " doctor" : " patient"}${msg._status === "failed" ? " failed" : ""}`}
      >
        <p>{msg.content}</p>
        <div className="dm-bubble-meta">
          <span>{formatMessageTime(msg.createdAt || msg._sentAt)}</span>
          {statusIcon()}
        </div>
      </div>
    </div>
  );
}

// ─── Empty States ─────────────────────────────────────────────────────────────

function EmptyConversations({ onRetry, isError, filter }) {
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
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        {isError ? (
          <AlertCircle size={24} color="#ef4444" />
        ) : (
          <MessageSquare size={24} color="#94a3b8" />
        )}
      </div>
      <div
        style={{
          fontWeight: 700,
          color: "#1e293b",
          marginBottom: 4,
          fontSize: "0.9rem",
        }}
      >
        {isError
          ? "Failed to load"
          : filter === "unread"
            ? "No unread messages"
            : "No conversations"}
      </div>
      <div style={{ fontSize: "0.77rem", color: "#64748b", marginBottom: 12 }}>
        {isError
          ? "Check connection and retry."
          : "Patient conversations will appear here."}
      </div>
      {isError && (
        <button className="dm-retry-btn" onClick={onRetry}>
          <RefreshCw size={13} /> Retry
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
        padding: 40,
        textAlign: "center",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <MessageSquare size={38} color="#2563eb" />
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "#0f172a",
          marginBottom: 8,
        }}
      >
        Select a conversation
      </div>
      <div
        style={{
          fontSize: "0.82rem",
          color: "#64748b",
          lineHeight: 1.6,
          maxWidth: 280,
        }}
      >
        Choose a patient from the left panel to view your conversation and send
        messages.
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
          fontSize: "0.68rem",
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

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
            width: "55%",
            marginBottom: 8,
          }}
        />
        <div
          style={{
            height: 10,
            background: "#f1f5f9",
            borderRadius: 6,
            width: "75%",
          }}
        />
      </div>
    </div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

function QuickActions({ conv }) {
  if (!conv) return null;
  const actions = [
    { icon: Calendar, label: "Schedule", color: "#2563eb" },
    { icon: Pill, label: "Prescribe", color: "#0d9488" },
    { icon: FileText, label: "Records", color: "#7c3aed" },
  ];
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {actions.map(({ icon: Icon, label, color }) => (
        <button
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: 8,
            border: `1.5px solid ${color}22`,
            background: `${color}0f`,
            color,
            fontFamily: "inherit",
            fontSize: "0.74rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${color}18`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${color}0f`;
          }}
        >
          <Icon size={13} /> {label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
];

export default function DoctorMessages() {
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
  const [activeFilter, setActiveFilter] = useState("all");
  const [mobileView, setMobileView] = useState("list");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const activeConvRef = useRef(null);

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

  // ── Load messages ──────────────────────────────────────────────────────────

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

    const content =
      res.data?.content ?? (Array.isArray(res.data) ? res.data : []);
    setMessages((prev) => (page === 0 ? content : [...content, ...prev]));
    setHasMoreMessages(!res.data?.last && res.data?.totalPages > page + 1);
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
      markConversationReadAction(convId);
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c)),
      );
    },
    [activeConvId, loadMessages],
  );

  // ── Scroll ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!msgLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, msgLoading]);

  const handleScroll = useCallback(
    (e) => {
      if (e.target.scrollTop === 0 && hasMoreMessages && !loadingMore) {
        loadMessages(activeConvId, currentPage + 1);
      }
    },
    [hasMoreMessages, loadingMore, activeConvId, currentPage, loadMessages],
  );

  // ── SSE ────────────────────────────────────────────────────────────────────

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

      if (conversationId === activeConvRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === messageId)) return prev;
          return [...prev, newMsg];
        });
        markConversationReadAction(conversationId);
      }

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === conversationId);
        if (idx === -1) {
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
      senderRole: "DOCTOR",
      content: text,
      isRead: false,
      createdAt: new Date().toISOString(),
      _sentAt: new Date().toISOString(),
      _status: "sending",
    };

    setInputText("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    setMessages((prev) => [...prev, optimistic]);
    setIsSending(true);

    const res = await sendMessageAction(activeConvId, text);
    setIsSending(false);

    if (res.success) {
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
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, _status: "failed" } : m)),
      );
    }
  }, [inputText, activeConvId, isSending]);

  const handleRetry = useCallback((failedMsg) => {
    setMessages((prev) => prev.filter((m) => m.id !== failedMsg.id));
    setInputText(failedMsg.content);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Filtered conversations ─────────────────────────────────────────────────

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery || (c.patientName || "").toLowerCase().includes(q);
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "unread" && c.unreadCount > 0);
      return matchesSearch && matchesFilter;
    });
  }, [conversations, searchQuery, activeFilter]);

  const grouped = groupByDate(messages);

  const totalUnread = conversations.reduce(
    (s, c) => s + (c.unreadCount || 0),
    0,
  );

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes dm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes dm-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Scroll containment via :has() — preserves other pages ── */
        .doc-main-content:has(.dm-page) {
          overflow: hidden !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .dm-page {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .dm-root {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── Sidebar ──────────────────────────────── */
        .dm-sidebar {
          width: 300px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #f1f5f9;
          background: #fff;
          min-height: 0;
        }
        .dm-sidebar-head {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          flex-shrink: 0;
        }
        .dm-sidebar-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .dm-sidebar-title h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          flex: 1;
        }
        .dm-search-wrap { position: relative; margin-bottom: 10px; }
        .dm-search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .dm-search-input {
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
        .dm-search-input:focus { border-color: #2563eb; background: #fff; }

        /* ── Filter tabs ──────────────────────────── */
        .dm-filter-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .dm-filter-tabs::-webkit-scrollbar { display: none; }
        .dm-filter-tab {
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          font-family: inherit;
          white-space: nowrap;
          transition: all 0.12s;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .dm-filter-tab:hover  { border-color: #2563eb; color: #2563eb; }
        .dm-filter-tab.active { background: #2563eb; color: #fff; border-color: #2563eb; }

        /* ── Conversation list ────────────────────── */
        .dm-conv-list {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
        }
        .dm-conv-list::-webkit-scrollbar { width: 3px; }
        .dm-conv-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }

        .dm-conv-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          cursor: pointer;
          transition: background 0.12s;
          border-bottom: 1px solid #f8fafc;
        }
        .dm-conv-row:hover  { background: #f8fafc; }
        .dm-conv-row.active { background: #eff6ff; border-right: 3px solid #2563eb; }

        .dm-conv-info { flex: 1; min-width: 0; }
        .dm-conv-top  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
        .dm-conv-name { font-size: 0.875rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dm-conv-name strong { font-weight: 700; }
        .dm-conv-time { font-size: 0.68rem; color: #94a3b8; flex-shrink: 0; margin-left: 6px; }
        .dm-conv-last { font-size: 0.77rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dm-unread-badge {
          min-width: 20px; height: 20px;
          background: #2563eb; color: #fff;
          border-radius: 999px; font-size: 0.68rem;
          font-weight: 700; display: flex;
          align-items: center; justify-content: center;
          padding: 0 5px; flex-shrink: 0;
        }

        /* ── Chat area ────────────────────────────── */
        .dm-chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          min-width: 0;
          background: #f8fafc;
        }
        .dm-chat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 20px;
          border-bottom: 1px solid #f1f5f9;
          background: #fff;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .dm-chat-header-name { font-weight: 700; font-size: 0.95rem; color: #0f172a; }
        .dm-chat-header-sub  { font-size: 0.74rem; color: #94a3b8; }

        /* ── Messages ─────────────────────────────── */
        .dm-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-height: 0;
        }
        .dm-messages::-webkit-scrollbar { width: 4px; }
        .dm-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

        /* ── Bubbles ──────────────────────────────── */
        .dm-bubble-wrap {
          display: flex;
          margin: 2px 0;
          animation: dm-fade-in 0.15s ease;
        }
        .dm-bubble-wrap.doctor  { justify-content: flex-end; }
        .dm-bubble-wrap.patient { justify-content: flex-start; }

        .dm-bubble {
          max-width: min(68%, 420px);
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 0.875rem;
          line-height: 1.5;
          word-break: break-word;
        }
        .dm-bubble p { margin: 0; }
        .dm-bubble.doctor {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .dm-bubble.patient {
          background: #fff;
          color: #1e293b;
          border: 1px solid #f1f5f9;
          border-bottom-left-radius: 4px;
        }
        .dm-bubble.failed { opacity: 0.7; }
        .dm-bubble-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          margin-top: 4px;
          justify-content: flex-end;
        }
        .dm-bubble.doctor .dm-bubble-meta { color: rgba(255,255,255,0.6); }
        .dm-bubble.patient .dm-bubble-meta { color: #94a3b8; }

        .dm-load-more-btn {
          align-self: center;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          background: #f1f5f9;
          border: none;
          border-radius: 999px;
          font-size: 0.74rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          font-family: inherit;
          margin-bottom: 8px;
        }
        .dm-load-more-btn:hover { background: #e2e8f0; }

        /* ── Input bar ────────────────────────────── */
        .dm-input-bar {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          padding: 13px 16px;
          border-top: 1px solid #f1f5f9;
          background: #fff;
          flex-shrink: 0;
        }
        .dm-input-textarea {
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
        .dm-input-textarea:focus { border-color: #2563eb; background: #fff; }
        .dm-input-textarea::placeholder { color: #cbd5e1; }

        .dm-send-btn {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          transition: all 0.15s;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }
        .dm-send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 6px 16px rgba(37,99,235,0.4); }
        .dm-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .dm-retry-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
          font-family: inherit;
        }

        /* ── Mobile ───────────────────────────────── */
        @media (max-width: 768px) {
          .dm-sidebar { width: 100%; }
          .dm-sidebar.dm-hidden { display: none; }
          .dm-chat-area.dm-hidden { display: none; }
          .dm-page { margin: 0 -16px -16px; height: calc(100vh - 56px); }
        }
      `}</style>

      <div className="dm-page">
        <div className="dm-root">
          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div
            className={`dm-sidebar${mobileView === "chat" ? " dm-hidden" : ""}`}
          >
            <div className="dm-sidebar-head">
              <div className="dm-sidebar-title">
                <MessageSquare size={18} color="#2563eb" />
                <h2>Messages</h2>
                {totalUnread > 0 && (
                  <div
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      borderRadius: 999,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                    }}
                  >
                    {totalUnread}
                  </div>
                )}
              </div>
              <div className="dm-search-wrap">
                <Search size={14} />
                <input
                  className="dm-search-input"
                  placeholder="Search patients…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="dm-filter-tabs">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    className={`dm-filter-tab${activeFilter === f.id ? " active" : ""}`}
                    onClick={() => setActiveFilter(f.id)}
                  >
                    {f.label}
                    {f.id === "unread" && totalUnread > 0 && (
                      <span
                        style={{
                          background:
                            activeFilter === "unread"
                              ? "rgba(255,255,255,0.3)"
                              : "#dbeafe",
                          color: activeFilter === "unread" ? "#fff" : "#2563eb",
                          borderRadius: 999,
                          padding: "0 5px",
                          fontSize: "0.65rem",
                        }}
                      >
                        {totalUnread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="dm-conv-list">
              {convLoading ? (
                [1, 2, 3, 4].map((i) => <ConvSkeleton key={i} />)
              ) : convError || filteredConversations.length === 0 ? (
                <EmptyConversations
                  isError={convError}
                  filter={activeFilter}
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

          {/* ── Chat area ────────────────────────────────────────────────── */}
          <div
            className={`dm-chat-area${mobileView === "list" ? " dm-hidden" : ""}`}
          >
            {!activeConv ? (
              <NoChatSelected />
            ) : (
              <>
                {/* Header */}
                <div className="dm-chat-header">
                  <button
                    onClick={() => setMobileView("list")}
                    style={{
                      display: "flex",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                    className="dm-back-btn"
                  >
                    <ChevronLeft size={20} color="#64748b" />
                  </button>
                  <Avatar
                    name={activeConv.patientName}
                    imageUrl={activeConv.patientAvatar}
                    size={40}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="dm-chat-header-name">
                      {activeConv.patientName || "Patient"}
                    </div>
                    <div className="dm-chat-header-sub">Patient</div>
                  </div>
                  <QuickActions conv={activeConv} />
                </div>

                {/* Messages */}
                <div className="dm-messages" onScroll={handleScroll}>
                  {hasMoreMessages && (
                    <button
                      className="dm-load-more-btn"
                      onClick={() =>
                        loadMessages(activeConvId, currentPage + 1)
                      }
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <Loader2
                            size={12}
                            style={{ animation: "dm-spin 1s linear infinite" }}
                          />{" "}
                          Loading…
                        </>
                      ) : (
                        <>
                          <Clock size={12} /> Load earlier
                        </>
                      )}
                    </button>
                  )}

                  {msgLoading ? (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        color: "#94a3b8",
                      }}
                    >
                      <Loader2
                        size={18}
                        style={{ animation: "dm-spin 1s linear infinite" }}
                      />
                      <span style={{ fontSize: "0.83rem" }}>
                        Loading messages…
                      </span>
                    </div>
                  ) : msgError ? (
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                      }}
                    >
                      <AlertCircle size={24} color="#ef4444" />
                      <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                        Failed to load messages
                      </div>
                      <button
                        className="dm-retry-btn"
                        onClick={() => loadMessages(activeConvId, 0)}
                      >
                        <RefreshCw size={13} /> Retry
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
                      <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                        No messages yet. Start the conversation.
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
                            isDoctor={item.msg.senderRole === "DOCTOR"}
                          />
                          {item.msg._status === "failed" && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: 4,
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
                <div className="dm-input-bar">
                  <textarea
                    ref={inputRef}
                    className="dm-input-textarea"
                    rows={1}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${activeConv.patientName || "patient"}…`}
                  />
                  <button
                    className="dm-send-btn"
                    onClick={handleSend}
                    disabled={!inputText.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2
                        size={18}
                        style={{ animation: "dm-spin 1s linear infinite" }}
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
