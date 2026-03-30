"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Pill,
  CalendarCheck,
  FileText,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Heart,
  LogOut,
  ChevronDown,
  Shield,
  CheckCircle2,
  Calendar,
  Lock,
  Flag,
  Plug,
  Monitor,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useNotifications } from "@/app/context/NotificationContext";

const basePath = "/admin";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: `${basePath}/dashboard` },
  { name: "Patients", icon: Users, href: `${basePath}/patients` },
  { name: "Doctors", icon: Stethoscope, href: `${basePath}/doctors` },
  { name: "Pharmacists", icon: Pill, href: `${basePath}/pharmacists` },
  {
    name: "Appointments",
    icon: CalendarCheck,
    href: `${basePath}/appointments`,
  },
  { name: "Prescriptions", icon: FileText, href: `${basePath}/prescriptions` },
  { name: "Payments", icon: CreditCard, href: `${basePath}/payments` },
  { name: "Reports", icon: BarChart3, href: `${basePath}/reports` },
  {
    name: "Notifications",
    icon: Bell,
    href: `${basePath}/notifications`,
    useBadge: "notifications",
  },
];

const settingsSubItems = [
  { id: "general", label: "General", icon: Settings },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "verification", label: "User Verification", icon: CheckCircle2 },
  { id: "appointments", label: "Appointment Rules", icon: Calendar },
  { id: "prescriptions", label: "Prescription Rules", icon: Pill },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "security", label: "Security", icon: Lock },
  { id: "features", label: "Feature Flags", icon: Flag },
  { id: "audit", label: "Audit Logs", icon: FileText },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "system", label: "System Preferences", icon: Monitor },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const rawPathname = usePathname();
  const pathname = rawPathname.replace(/^\/online-medication/, "") || "/";
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout } = useAuth();
  let unreadCount = 0;
  try {
    const n = useNotifications();
    unreadCount = n?.unreadCount || 0;
  } catch {}
  const [loggingOut, setLoggingOut] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith(`${basePath}/settings`),
  );

  const isSettingsPage = pathname.startsWith(`${basePath}/settings`);
  const activeSection = searchParams.get("section") || "general";

  const isItemActive = (item) => {
    if (item.name === "Dashboard") {
      return (
        pathname === item.href ||
        pathname === basePath ||
        pathname === basePath + "/"
      );
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const handleSettingsClick = () => {
    if (collapsed) {
      router.push(`${basePath}/settings?section=general`);
      return;
    }
    if (!isSettingsPage) {
      setSettingsOpen(true);
      router.push(`${basePath}/settings?section=general`);
    } else {
      setSettingsOpen((prev) => !prev);
    }
  };

  const handleSubClick = (sectionId) => {
    router.push(`${basePath}/settings?section=${sectionId}`);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    // logout() calls logoutAction (server action) which clears cookies server-side.
    // No direct fetch to Spring Boot needed — serverApiClient handles that.
    await logout();
    router.push("/");
  };

  return (
    <>
      {!collapsed && (
        <div className="admin-sidebar-overlay" onClick={onToggle} />
      )}
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <div className="admin-logo-icon">
            <Heart size={18} color="#fff" />
          </div>
          {!collapsed && <span className="admin-logo-text">MedSyncpro</span>}
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`admin-nav-item ${isItemActive(item) ? "active" : ""}`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon size={19} />
              {!collapsed && <span>{item.name}</span>}
              {!collapsed &&
                item.useBadge === "notifications" &&
                unreadCount > 0 && (
                  <span className="admin-nav-badge">{unreadCount}</span>
                )}
            </Link>
          ))}

          {/* Settings with dropdown */}
          <button
            className={`admin-nav-item admin-settings-trigger ${isSettingsPage ? "active" : ""}`}
            onClick={handleSettingsClick}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings size={19} />
            {!collapsed && <span>Settings</span>}
            {!collapsed && (
              <ChevronDown
                size={14}
                className={`admin-settings-chevron ${settingsOpen && isSettingsPage ? "open" : ""}`}
              />
            )}
          </button>

          {/* Settings sub-items dropdown */}
          {!collapsed && isSettingsPage && (
            <div
              className={`admin-settings-dropdown ${settingsOpen ? "open" : ""}`}
            >
              {settingsSubItems.map((sub) => (
                <button
                  key={sub.id}
                  className={`admin-settings-sub ${activeSection === sub.id ? "active" : ""}`}
                  onClick={() => handleSubClick(sub.id)}
                >
                  <sub.icon size={15} />
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Logout */}
        <button
          className="admin-logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={19} />
          {!collapsed && <span>{loggingOut ? "Logging out…" : "Logout"}</span>}
        </button>

        {/* Collapse toggle */}
        <button className="admin-collapse-btn" onClick={onToggle}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>
    </>
  );
}
