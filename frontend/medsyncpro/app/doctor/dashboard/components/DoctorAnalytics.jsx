"use client";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const visitsData = [
    { week: "W1", visits: 42 }, { week: "W2", visits: 56 }, { week: "W3", visits: 48 },
    { week: "W4", visits: 63 }, { week: "W5", visits: 55 }, { week: "W6", visits: 71 },
    { week: "W7", visits: 68 }, { week: "W8", visits: 82 },
];

const completionData = [
    { day: "Mon", completed: 12, cancelled: 2 },
    { day: "Tue", completed: 15, cancelled: 1 },
    { day: "Wed", completed: 10, cancelled: 3 },
    { day: "Thu", completed: 18, cancelled: 1 },
    { day: "Fri", completed: 14, cancelled: 2 },
    { day: "Sat", completed: 8, cancelled: 0 },
];

const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="doc-chart-tooltip">
            <div className="doc-tip-label">{label}</div>
            {payload.map((p, i) => (
                <div key={i} className="doc-tip-row">
                    <span className="doc-tip-dot" style={{ background: p.color }} />
                    {p.name}: <strong>{p.value}</strong>
                </div>
            ))}
        </div>
    );
};

export default function DoctorAnalytics() {
    return (
        <div className="doc-analytics-grid">
            <div className="doc-glass-card doc-chart-box">
                <div className="doc-chart-header">
                    <h3>Patient Visits Trend</h3>
                    <span className="doc-chart-period">Last 8 weeks</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={visitsData}>
                        <defs>
                            <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <Tooltip content={<Tip />} />
                        <Area type="monotone" dataKey="visits" stroke="#2563eb" fill="url(#gVisits)" strokeWidth={2.5} name="Visits" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="doc-glass-card doc-chart-box">
                <div className="doc-chart-header">
                    <h3>Appointment Completion</h3>
                    <span className="doc-chart-period">This week</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={completionData} barSize={18} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                        <Tooltip content={<Tip />} cursor={{ fill: "rgba(37,99,235,0.04)" }} />
                        <Bar dataKey="completed" name="Completed" fill="#0d9488" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="cancelled" name="Cancelled" fill="#f87171" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
