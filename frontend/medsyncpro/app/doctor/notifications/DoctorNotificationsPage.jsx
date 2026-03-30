"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  Stethoscope,
  Calendar,
  ShieldCheck,
  MessageSquare,
  Info,
} from "lucide-react";
import { useNotifications } from "@/app/context/NotificationContext";
import { fetchNotificationsAction } from "@/actions/notificationAction";

// Map notification type → icon + colour
const TYPE_META = {
  APPOINTMENT: { icon: Calendar, color: "#2563eb", bg: "#eff6ff" },
  MESSAGE: { icon: MessageSquare, color: "#6366f1", bg: "#eef2ff" },
  VERIFICATION: { icon: ShieldCheck, color: "#059669", bg: "#ecfdf5" },
  PRESCRIPTION: { icon: Stethoscope, color: "#0d9488", bg: "#f0fdfa" },
  DEFAULT: { icon: Info, color: "#64748b", bg: "#f8fafc" },
};

function getMeta(type) {
  return TYPE_META[type] || TYPE_META.DEFAULT;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DoctorNotificationsPage() {
  const [localNotifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  // Pull mark helpers from context — these update unreadCount in the sidebar too
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

  // Mark ALL — delegates to context (optimistic badge reset + server call)
  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllRead(); // ← context: zeroes unreadCount
      setLocalNotifications(
        (prev) => prev.map((n) => ({ ...n, isRead: true, read: true })), // keep UI in sync
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // Mark ONE — delegates to context (optimistic unreadCount decrement + server call)
  const handleMarkOne = async (id) => {
    await markAsRead(id); // ← context: decrements unreadCount
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n)),
    );
  };

  // Support both `isRead` (backend field name) and `read` (legacy) so either works
  const unread = localNotifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <>
      <style>{`
        .dn-page { max-width: 720px; margin: 0 auto; padding: 32px 20px; }
        .dn-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .dn-title { display: flex; align-items: center; gap: 10px; font-size: 1.35rem; font-weight: 700; color: #0f172a; }
        .dn-badge { background: #2563eb; color: #fff; border-radius: 999px; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; }
        .dn-mark-all { display: flex; align-items: center; gap: 6px; background: none; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 7px 14px; font-size: 0.82rem; font-weight: 600; color: #475569; cursor: pointer; transition: all .15s; }
        .dn-mark-all:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; }
        .dn-mark-all:disabled { opacity: 0.5; cursor: not-allowed; }
        .dn-list { display: flex; flex-direction: column; gap: 10px; }
        .dn-item { display: flex; align-items: flex-start; gap: 14px; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 16px; cursor: pointer; transition: border-color .15s, box-shadow .15s; position: relative; }
        .dn-item:hover { border-color: #94a3b8; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
        .dn-item.unread { border-left: 3px solid #2563eb; background: #fafbff; }
        .dn-icon-wrap { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .dn-body { flex: 1; min-width: 0; }
        .dn-item-title { font-size: 0.9rem; font-weight: 600; color: #0f172a; margin-bottom: 3px; line-height: 1.4; }
        .dn-item-msg { font-size: 0.82rem; color: #475569; line-height: 1.5; margin-bottom: 6px; }
        .dn-item-time { font-size: 0.75rem; color: #94a3b8; }
        .dn-unread-dot { width: 8px; height: 8px; background: #2563eb; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
        .dn-empty { text-align: center; padding: 60px 20px; color: #94a3b8; }
        .dn-empty svg { margin-bottom: 12px; opacity: .35; }
        .dn-empty p { font-size: 0.95rem; }
        .dn-skeleton { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size: 200% 100%; animation: dn-shimmer 1.4s infinite; border-radius: 12px; height: 76px; }
        @keyframes dn-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="dn-page">
        <div className="dn-header">
          <div className="dn-title">
            <Bell size={22} />
            Notifications
            {unread > 0 && <span className="dn-badge">{unread}</span>}
          </div>
          {unread > 0 && (
            <button
              className="dn-mark-all"
              onClick={handleMarkAll}
              disabled={markingAll}
            >
              <CheckCheck size={15} />
              {markingAll ? "Marking…" : "Mark all as read"}
            </button>
          )}
        </div>

        <div className="dn-list">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="dn-skeleton" />
            ))
          ) : localNotifications.length === 0 ? (
            <div className="dn-empty">
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
                  className={`dn-item ${isUnread ? "unread" : ""}`}
                  onClick={() => isUnread && handleMarkOne(notif.id)}
                >
                  <div className="dn-icon-wrap" style={{ background: meta.bg }}>
                    <Icon size={18} color={meta.color} />
                  </div>
                  <div className="dn-body">
                    <div className="dn-item-title">
                      {notif.title || notif.type}
                    </div>
                    <div className="dn-item-msg">{notif.message}</div>
                    <div className="dn-item-time">
                      {timeAgo(notif.createdAt)}
                    </div>
                  </div>
                  {isUnread && <div className="dn-unread-dot" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
