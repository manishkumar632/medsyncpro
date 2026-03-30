"use client";
import "./agent-dashboard.css";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import RouteGuard from "../components/RouteGuard";
import { LayoutDashboard, Shield, Settings, LogOut, Menu } from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
    { label: "Verification", href: "/agent/verification", icon: Shield },
    { label: "Settings", href: "/agent/settings", icon: Settings },
];

export default function AgentLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push("/auth/login");
    };

    return (
        <RouteGuard allowedRoles={["AGENT"]}>
            <div className="agent-layout">
                {/* Sidebar */}
                <aside className={`agent-sidebar ${sidebarOpen ? "open" : ""}`}>
                    <div className="agent-sidebar-brand">
                        <div className="agent-sidebar-brand-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
                        </div>
                        <span className="agent-sidebar-brand-text">MedSyncPro</span>
                    </div>
                    <nav className="agent-sidebar-nav">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.href}
                                className={`agent-sidebar-link ${pathname?.startsWith(item.href) ? "active" : ""}`}
                                onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                        <button className="agent-sidebar-link" onClick={handleLogout} style={{ marginTop: "auto" }}>
                            <LogOut size={18} />
                            Logout
                        </button>
                    </nav>
                </aside>

                {/* Main */}
                <div className="agent-main-wrapper">
                    <header className="agent-topbar">
                        <div className="agent-topbar-left">
                            <button onClick={() => setSidebarOpen((p) => !p)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                                <Menu size={22} />
                            </button>
                            <h2>Agent Portal</h2>
                        </div>
                        <div className="agent-topbar-right">
                            <div className="agent-topbar-avatar">
                                {user?.name?.substring(0, 2).toUpperCase() || "AG"}
                            </div>
                        </div>
                    </header>
                    <main className="agent-main-content">
                        {children}
                    </main>
                </div>
            </div>
        </RouteGuard>
    );
}
