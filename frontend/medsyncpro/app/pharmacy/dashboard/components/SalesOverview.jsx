"use client";
import { MoreHorizontal } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const data = [
    { day: "Mon", sales: 8000, color1: "#f87171", color2: "#fbbf24" },
    { day: "Tue", sales: 14000, color1: "#a78bfa", color2: "#6dd5a1" },
    { day: "Wed", sales: 10000, color1: "#60a5fa", color2: "#f9b572" },
    { day: "Thu", sales: 18000, color1: "#6dd5a1", color2: "#a78bfa" },
    { day: "Fri", sales: 12000, color1: "#f87171", color2: "#60a5fa" },
    { day: "Sat", sales: 30000, color1: "#fbbf24", color2: "#6dd5a1" },
];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="pharm-bar-tooltip">
                <span className="pharm-tooltip-label">Apr, 2025</span>
                <span className="pharm-tooltip-value">
                    ${(payload[0].value / 1000).toFixed(2)}K
                </span>
            </div>
        );
    }
    return null;
};

export default function SalesOverview() {
    return (
        <div className="pharm-glass-card pharm-chart-card">
            <div className="pharm-chart-header">
                <h3 className="pharm-chart-title">Total Sales Overview</h3>
                <button className="pharm-stat-menu">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            <div className="pharm-bar-wrapper">
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data} barSize={28} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6b7280", fontSize: 13 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            tickFormatter={(v) => `${v / 1000}K`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(13,115,119,0.06)" }} />
                        <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color1} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
