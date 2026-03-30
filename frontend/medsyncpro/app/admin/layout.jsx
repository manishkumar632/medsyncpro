"use client";
import { useState } from "react";
import AdminSidebar from "./dashboard/components/AdminSidebar";
import AdminNavbar from "./dashboard/components/AdminNavbar";
import RouteGuard from "../components/RouteGuard";
import "./admin-dashboard.css";

import { NotificationProvider } from "@/app/context/NotificationContext";

export default function AdminLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <RouteGuard allowedRoles={["ADMIN"]}>
            <NotificationProvider>
                <div className={`admin-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
                    <AdminSidebar
                        collapsed={collapsed}
                        onToggle={() => setCollapsed((p) => !p)}
                    />
                    <div className="admin-main-wrapper">
                        <AdminNavbar onMenuToggle={() => setCollapsed((p) => !p)} />
                        <main className="admin-main-content">{children}</main>
                    </div>
                </div>
            </NotificationProvider>
        </RouteGuard>
    );
}
