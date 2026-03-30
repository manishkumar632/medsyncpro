"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { fetchMessageUnreadCountAction } from "@/actions/messageAction";
import "../patient-dashboard.css";

const I = ({ d, size = 18, stroke = "currentColor", fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/patient/dashboard",
    icon: (
      <I
        d={
          <>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </>
        }
      />
    ),
  },
  {
    id: "appointments",
    label: "Appointments",
    href: "/patient/appointments",
    icon: (
      <I d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM16 2v4M8 2v4M3 10h18" />
    ),
  },
  {
    id: "find-doctor",
    label: "Find Doctor",
    href: "/patient/find-doctor",
    icon: (
      <I
        d={
          <>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </>
        }
      />
    ),
  },
  {
    id: "prescriptions",
    label: "Prescriptions",
    href: "/patient/prescriptions",
    icon: (
      <I
        d={
          <>
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 1 2 2v4M9 3v6m0 0H3m6 0h12M3 9v10a2 2 0 0 0 2 2h14" />
            <path d="M9 14h.01M9 17h.01M13 14h2M13 17h2" />
          </>
        }
      />
    ),
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    href: "/patient/pharmacy",
    icon: (
      <I
        d={
          <>
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </>
        }
      />
    ),
  },
  {
    id: "vitals",
    label: "Health Vitals",
    href: "/patient/vitals",
    icon: <I d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  },
  {
    id: "history",
    label: "Medical History",
    href: "/patient/dashboard",
    icon: (
      <I
        d={
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </>
        }
      />
    ),
  },
  {
    id: "messages",
    label: "Messages",
    href: "/patient/messages",
    icon: (
      <I
        d={
          <>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </>
        }
      />
    ),
  },
  // ── Notifications nav item ─────────────────────────────────────────────────
  {
    id: "notifications",
    label: "Notifications",
    href: "/patient/notifications",
    icon: (
      <I
        d={
          <>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </>
        }
      />
    ),
  },
  {
    id: "reports",
    label: "Reports",
    href: "/patient/dashboard",
    icon: (
      <I
        d={
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8M16 17H8M10 9H8" />
          </>
        }
      />
    ),
  },
  {
    id: "profile",
    label: "My Profile",
    href: "/patient",
    icon: (
      <I
        d={
          <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </>
        }
      />
    ),
  },
];

function getActiveId(pathname) {
  if (!pathname) return "dashboard";
  if (pathname === "/patient" || pathname.startsWith("/patient/profile"))
    return "profile";
  if (pathname.startsWith("/patient/appointments")) return "appointments";
  if (
    pathname.startsWith("/patient/find-doctor") ||
    pathname.startsWith("/patient/doctors")
  )
    return "find-doctor";
  if (pathname.startsWith("/patient/prescriptions")) return "prescriptions";
  if (pathname.startsWith("/patient/pharmacy")) return "pharmacy";
  if (pathname.startsWith("/patient/vitals")) return "vitals";
  if (pathname.startsWith("/patient/messages")) return "messages";
  if (pathname.startsWith("/patient/notifications")) return "notifications"; // ← NEW
  if (pathname.startsWith("/patient/dashboard")) return "dashboard";
  return "dashboard";
}

export default function PatientSidebarLayout({
  children,
  navbarTitle,
  navbarCenter,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadCount, subscribeToMessages } = useNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const isOnMessagesPage = pathname?.startsWith("/patient/messages");

  // Ref so the SSE callback always reads the latest page state
  // without tearing down and re-registering the subscription on every navigation
  const isOnMessagesPageRef = useRef(isOnMessagesPage);
  useEffect(() => {
    isOnMessagesPageRef.current = isOnMessagesPage;
  }, [isOnMessagesPage]);

  // Seed from API on mount
  useEffect(() => {
    fetchMessageUnreadCountAction().then((res) => {
      if (res.success) setUnreadMessages(res.count ?? 0);
    });
  }, []);

  // Clear badge when user visits the messages page
  useEffect(() => {
    if (isOnMessagesPage) setUnreadMessages(0);
  }, [isOnMessagesPage]);

  // SSE: one stable subscription — never torn down on navigation
  useEffect(() => {
    return subscribeToMessages(() => {
      if (!isOnMessagesPageRef.current) {
        setUnreadMessages((n) => n + 1);
      }
    });
  }, [subscribeToMessages]); // subscribeToMessages is a stable useCallback ref

  const activeId = getActiveId(pathname);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "P";

  return (
    <div className="pd-layout">
      <aside className={`pd-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="pd-sidebar-header">
          <div className="pd-sidebar-logo">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </div>
          <span className="pd-sidebar-brand">MedSync</span>
        </div>

        <nav className="pd-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            // Notifications badge (indigo) + Messages badge (blue)
            const badge =
              item.id === "notifications" && unreadCount > 0
                ? { count: unreadCount, color: "#6366f1" }
                : item.id === "messages" && unreadMessages > 0
                  ? { count: unreadMessages, color: "#2563eb" }
                  : null;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`pd-nav-item ${activeId === item.id ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {badge !== null && (
                  <span
                    className="pd-nav-badge"
                    style={{
                      marginLeft: "auto",
                      minWidth: 18,
                      height: 18,
                      background: badge.color,
                      color: "#fff",
                      borderRadius: 999,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 5px",
                      flexShrink: 0,
                    }}
                  >
                    {badge.count > 99 ? "99+" : badge.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pd-sidebar-footer">
          <button
            className="pd-sidebar-toggle"
            onClick={() => setCollapsed((c) => !c)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {collapsed ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="pd-main">
        <header className="pd-navbar">
          <button
            className="pd-nav-toggle"
            onClick={() => setCollapsed((c) => !c)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <div style={{ flex: 1, padding: "0 16px" }}>
            {navbarCenter ??
              (navbarTitle ? (
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                >
                  {navbarTitle}
                </span>
              ) : null)}
          </div>

          <div className="pd-navbar-right">
            {/* Navbar bell — navigates to /patient/notifications and shows live dot */}
            <button
              className="pd-icon-btn"
              title="Notifications"
              onClick={() => router.push("/patient/notifications")}
              style={{ position: "relative" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {/* Show red dot only when there are unread notifications */}
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 8,
                    height: 8,
                    background: "#ef4444",
                    borderRadius: "50%",
                    border: "1.5px solid #fff",
                  }}
                />
              )}
            </button>

            <div
              className="pd-avatar-sm"
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/patient")}
            >
              {user?.profileImage || user?.profileImageUrl ? (
                <img
                  src={user.profileImage || user.profileImageUrl}
                  alt={user?.name}
                />
              ) : (
                initials
              )}
            </div>
          </div>
        </header>

        <div className="pd-content">{children}</div>
      </div>
    </div>
  );
}
