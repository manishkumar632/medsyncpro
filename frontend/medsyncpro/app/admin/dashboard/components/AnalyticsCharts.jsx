"use client";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const userGrowthData = [
    { month: "Jan", patients: 800, doctors: 120, pharmacists: 80 },
    { month: "Feb", patients: 950, doctors: 135, pharmacists: 88 },
    { month: "Mar", patients: 1100, doctors: 150, pharmacists: 95 },
    { month: "Apr", patients: 1350, doctors: 170, pharmacists: 105 },
    { month: "May", patients: 1500, doctors: 185, pharmacists: 112 },
    { month: "Jun", patients: 1780, doctors: 210, pharmacists: 125 },
    { month: "Jul", patients: 2050, doctors: 230, pharmacists: 138 },
];

const appointmentData = [
    { day: "Mon", appointments: 145 },
    { day: "Tue", appointments: 210 },
    { day: "Wed", appointments: 185 },
    { day: "Thu", appointments: 260 },
    { day: "Fri", appointments: 230 },
    { day: "Sat", appointments: 180 },
    { day: "Sun", appointments: 95 },
];

const revenueData = [
    { month: "Jan", revenue: 42000 },
    { month: "Feb", revenue: 48000 },
    { month: "Mar", revenue: 55000 },
    { month: "Apr", revenue: 51000 },
    { month: "May", revenue: 62000 },
    { month: "Jun", revenue: 71000 },
    { month: "Jul", revenue: 84000 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="admin-chart-tooltip">
                <div className="admin-tooltip-label">{label}</div>
                {payload.map((p, i) => (
                    <div key={i} className="admin-tooltip-row">
                        <span className="admin-tooltip-dot" style={{ background: p.color }} />
                        <span>{p.name}: <strong>{typeof p.value === "number" && p.value > 1000 ? `$${(p.value / 1000).toFixed(1)}K` : p.value}</strong></span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsCharts() {
    return (
        <div className="admin-charts-grid">
            {/* User Growth */}
            <div className="admin-glass-card admin-chart-box">
                <div className="admin-chart-header">
                    <h3>User Growth</h3>
                    <span className="admin-chart-period">Last 7 months</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={userGrowthData}>
                        <defs>
                            <linearGradient id="gradPatients" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradDoctors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradPharmacists" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.78rem", paddingTop: 8 }} />
                        <Area type="monotone" dataKey="patients" name="Patients" stroke="#0d9488" fill="url(#gradPatients)" strokeWidth={2} />
                        <Area type="monotone" dataKey="doctors" name="Doctors" stroke="#6366f1" fill="url(#gradDoctors)" strokeWidth={2} />
                        <Area type="monotone" dataKey="pharmacists" name="Pharmacists" stroke="#8b5cf6" fill="url(#gradPharmacists)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Appointments */}
            <div className="admin-glass-card admin-chart-box">
                <div className="admin-chart-header">
                    <h3>Weekly Appointments</h3>
                    <span className="admin-chart-period">This week</span>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={appointmentData} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(13,148,136,0.05)" }} />
                        <Bar dataKey="appointments" name="Appointments" fill="#0891b2" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Revenue */}
            <div className="admin-glass-card admin-chart-box admin-chart-wide">
                <div className="admin-chart-header">
                    <h3>Revenue Overview</h3>
                    <span className="admin-chart-period">Last 7 months</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={revenueData}>
                        <defs>
                            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}K`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#059669" fill="url(#gradRevenue)" strokeWidth={2.5} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
