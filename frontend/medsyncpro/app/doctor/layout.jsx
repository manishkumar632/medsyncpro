"use client";
import { useState } from "react";
import DoctorSidebar from "./dashboard/components/DoctorSidebar";
import DoctorNavbar from "./dashboard/components/DoctorNavbar";
import RouteGuard from "../components/RouteGuard";
import { NotificationProvider } from "@/app/context/NotificationContext";
import "./doctor-dashboard.css";

export default function DoctorLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <RouteGuard allowedRoles={["DOCTOR"]}>
      <NotificationProvider>
        <div className={`doc-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
          <DoctorSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((p) => !p)}
          />
          <div className="doc-main-wrapper">
            <DoctorNavbar onMenuToggle={() => setCollapsed((p) => !p)} />
            <main className="doc-main-content">{children}</main>
          </div>
        </div>
      </NotificationProvider>
    </RouteGuard>
  );
}
