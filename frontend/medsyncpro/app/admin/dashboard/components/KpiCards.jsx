"use client";
import { useState, useEffect } from "react";
import { Users, Stethoscope, Pill, CalendarCheck, DollarSign, ShieldCheck, TrendingUp, TrendingDown } from "lucide-react";
import { config } from "@/lib/config";

const sparkData = [30, 45, 35, 55, 48, 60, 52, 68, 58, 72, 65, 78];

export default function KpiCards() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${config.apiUrl}/admin/stats`, {
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (data.success) {
                    setStats(data.data);
                } else {
                    setError(data.message || "Failed to fetch stats");
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const kpis = [
        { label: "Total Patients", value: loading ? "..." : stats?.totalPatients?.toLocaleString() ?? "0", trend: "+12.5%", up: true, icon: Users, color: "#0d9488", bg: "linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)" },
        { label: "Total Doctors", value: loading ? "..." : stats?.totalDoctors?.toLocaleString() ?? "0", trend: "+8.2%", up: true, icon: Stethoscope, color: "#6366f1", bg: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)" },
        { label: "Total Pharmacists", value: loading ? "..." : stats?.totalPharmacists?.toLocaleString() ?? "0", trend: "+5.1%", up: true, icon: Pill, color: "#8b5cf6", bg: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)" },
        { label: "Active Appointments", value: "3,421", trend: "+18.3%", up: true, icon: CalendarCheck, color: "#0891b2", bg: "linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%)" },
        { label: "Revenue", value: "$284.5K", trend: "+22.1%", up: true, icon: DollarSign, color: "#059669", bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)" },
        { label: "Pending Verifications", value: loading ? "..." : stats?.pendingApprovals?.toLocaleString() ?? "0", trend: "-3.2%", up: false, icon: ShieldCheck, color: "#f59e0b", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" },
    ];

    return (
        <div className="admin-kpi-grid">
            {error && (
                <div style={{ gridColumn: "1 / -1", padding: "12px 16px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "14px" }}>
                    Failed to load stats: {error}
                </div>
            )}
            {kpis.map((kpi) => (
                <div key={kpi.label} className="admin-kpi-card" style={{ background: kpi.bg }}>
                    <div className="admin-kpi-top">
                        <div className="admin-kpi-icon" style={{ background: `${kpi.color}18`, color: kpi.color }}>
                            <kpi.icon size={20} />
                        </div>
                        <div className={`admin-kpi-trend ${kpi.up ? "up" : "down"}`}>
                            {kpi.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span>{kpi.trend}</span>
                        </div>
                    </div>
                    <div className="admin-kpi-value">{kpi.value}</div>
                    <div className="admin-kpi-label">{kpi.label}</div>
                    {/* Sparkline */}
                    <svg className="admin-kpi-spark" viewBox="0 0 120 30" preserveAspectRatio="none">
                        <polyline
                            fill="none"
                            stroke={kpi.color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={sparkData.map((v, i) => `${(i / (sparkData.length - 1)) * 120},${30 - (v / 80) * 30}`).join(" ")}
                        />
                    </svg>
                </div>
            ))}
        </div>
    );
}

