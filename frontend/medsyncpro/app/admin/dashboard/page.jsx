"use client";
import KpiCards from "./components/KpiCards";
import AnalyticsCharts from "./components/AnalyticsCharts";
import RoleManagement from "./components/RoleManagement";
import ActivityPanel from "./components/ActivityPanel";
import ApprovalQueue from "./components/ApprovalQueue";

export default function AdminDashboardPage() {
    return (
        <div className="admin-dashboard">
            {/* Welcome */}
            <div className="admin-welcome">
                <div>
                    <h1 className="admin-welcome-title">Welcome back, Admin 👋</h1>
                    <p className="admin-welcome-sub">Here&apos;s what&apos;s happening on your platform today.</p>
                </div>
                <div className="admin-welcome-date">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
            </div>

            {/* KPI Cards */}
            <KpiCards />

            {/* Analytics Charts */}
            <AnalyticsCharts />

            {/* Bottom row: Activity + Approval */}
            <div className="admin-bottom-row">
                <ActivityPanel />
                <ApprovalQueue />
            </div>

            {/* Role Management */}
            <RoleManagement />
        </div>
    );
}
