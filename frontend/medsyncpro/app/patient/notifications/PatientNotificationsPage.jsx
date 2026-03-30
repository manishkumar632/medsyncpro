"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  Calendar,
  ShieldCheck,
  MessageSquare,
  FileText,
  Info,
  Stethoscope,
} from "lucide-react";
import { useNotifications } from "@/app/context/NotificationContext";
import { fetchNotificationsAction } from "@/actions/notificationAction";

// Notification type → icon + colour mapping
// Matches the types sent by NotificationDispatchService
const TYPE_META = {
  APPOINTMENT: { icon: Calendar, color: "#6366f1", bg: "#eef2ff" },
  APPOINTMENT_UPDATE: { icon: Calendar, color: "#6366f1", bg: "#eef2ff" },
  APPOINTMENT_BOOKED: { icon: Calendar, color: "#6366f1", bg: "#eef2ff" },
  MESSAGE: { icon: MessageSquare, color: "#0ea5e9", bg: "#f0f9ff" },
  NEW_MESSAGE: { icon: MessageSquare, color: "#0ea5e9", bg: "#f0f9ff" },
  PRESCRIPTION: { icon: Stethoscope, color: "#10b981", bg: "#f0fdf4" },
  PRESCRIPTION_UPDATE: { icon: Stethoscope, color: "#10b981", bg: "#f0fdf4" },
  VERIFICATION: { icon: ShieldCheck, color: "#f59e0b", bg: "#fffbeb" },
  VERIFICATION_DECISION: { icon: ShieldCheck, color: "#f59e0b", bg: "#fffbeb" },
  DEFAULT: { icon: Info, color: "#94a3b8", bg: "#f8fafc" },
};

function getMeta(type = "") {
  // Exact match first, then prefix match (e.g. "PRESCRIPTION_UPDATE" → PRESCRIPTION)
  if (TYPE_META[type]) return TYPE_META[type];
  const prefix = Object.keys(TYPE_META).find(
    (k) => k !== "DEFAULT" && type.startsWith(k),
  );
  return TYPE_META[prefix] || TYPE_META.DEFAULT;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export default function PatientNotificationsPage() {
  const [localNotifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const { markAsRead, markAllRead } = useNotifications();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchNotificationsAction();
      if (res?.data) setLocalNotifications(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllRead();
      setLocalNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true })),
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkOne = async (id) => {
    await markAsRead(id);
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n)),
    );
  };

  const unread = localNotifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <>
      <style>{`
        .pn-page        { max-width: 720px; margin: 0 auto; padding: 32px 20px; }
        .pn-header      { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; gap: 12px; flex-wrap: wrap; }
        .pn-title       { display: flex; align-items: center; gap: 10px; font-size: 1.35rem; font-weight: 700; color: #0f172a; }
        .pn-badge       { background: #6366f1; color: #fff; border-radius: 999px; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; }
        .pn-mark-all    { display: flex; align-items: center; gap: 6px; background: none; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 14px; font-size: 0.82rem; font-weight: 600; color: #475569; cursor: pointer; font-family: inherit; transition: all .15s; white-space: nowrap; }
        .pn-mark-all:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
        .pn-mark-all:disabled { opacity: 0.5; cursor: not-allowed; }

        .pn-list        { display: flex; flex-direction: column; gap: 10px; }

        .pn-item        { display: flex; align-items: flex-start; gap: 14px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 16px; cursor: pointer; transition: border-color .15s, box-shadow .15s; position: relative; }
        .pn-item:hover  { border-color: #c7d2fe; box-shadow: 0 2px 10px rgba(99,102,241,.08); }
        .pn-item.unread { border-left: 3px solid #6366f1; background: #fafbff; }

        .pn-icon-wrap   { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pn-body        { flex: 1; min-width: 0; }
        .pn-item-title  { font-size: 0.9rem; font-weight: 600; color: #0f172a; margin-bottom: 3px; line-height: 1.4; }
        .pn-item-msg    { font-size: 0.82rem; color: #475569; line-height: 1.5; margin-bottom: 6px; }
        .pn-item-time   { font-size: 0.75rem; color: #94a3b8; }
        .pn-unread-dot  { width: 8px; height: 8px; background: #6366f1; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }

        .pn-empty       { text-align: center; padding: 60px 20px; color: #94a3b8; }
        .pn-empty svg   { margin-bottom: 12px; opacity: .35; }
        .pn-empty p     { font-size: 0.95rem; margin: 0; }

        .pn-skeleton    { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size: 200% 100%; animation: pn-shimmer 1.4s infinite; border-radius: 14px; height: 80px; }
        @keyframes pn-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="pn-page">
        {/* Header */}
        <div className="pn-header">
          <div className="pn-title">
            <Bell size={22} />
            Notifications
            {unread > 0 && <span className="pn-badge">{unread}</span>}
          </div>
          {unread > 0 && (
            <button
              className="pn-mark-all"
              onClick={handleMarkAll}
              disabled={markingAll}
            >
              <CheckCheck size={15} />
              {markingAll ? "Marking…" : "Mark all as read"}
            </button>
          )}
        </div>

        {/* List */}
        <div className="pn-list">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="pn-skeleton" />
            ))
          ) : localNotifications.length === 0 ? (
            <div className="pn-empty">
              <Bell size={40} />
              <p>You're all caught up — no notifications yet.</p>
            </div>
          ) : (
            localNotifications.map((notif) => {
              const isUnread = !notif.isRead && !notif.read;
              const meta = getMeta(notif.type);
              const Icon = meta.icon;
              return (
                <div
                  key={notif.id}
                  className={`pn-item ${isUnread ? "unread" : ""}`}
                  onClick={() => isUnread && handleMarkOne(notif.id)}
                >
                  <div className="pn-icon-wrap" style={{ background: meta.bg }}>
                    <Icon size={18} color={meta.color} />
                  </div>
                  <div className="pn-body">
                    <div className="pn-item-title">
                      {notif.title || notif.type}
                    </div>
                    <div className="pn-item-msg">{notif.message}</div>
                    <div className="pn-item-time">
                      {timeAgo(notif.createdAt)}
                    </div>
                  </div>
                  {isUnread && <div className="pn-unread-dot" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
