"use client";
import { ShoppingBag, Grid3X3, AlertTriangle, Users, MoreHorizontal } from "lucide-react";

const stats = [
    {
        label: "Todays Sales",
        value: "$ 95.00",
        trend: "+2.5% This Month",
        icon: ShoppingBag,
        gradient: "pharm-stat-green",
        bars: [40, 60, 35, 70, 50, 80, 45],
    },
    {
        label: "Available Categories",
        value: "1.457%",
        trend: "+2.5% This Month",
        icon: Grid3X3,
        gradient: "pharm-stat-yellow",
        bars: [50, 70, 45, 80, 55, 65, 75],
    },
    {
        label: "Expired Medicines",
        value: "0.00%",
        trend: "+2.5% This Month",
        icon: AlertTriangle,
        gradient: "pharm-stat-pink",
        bars: [30, 55, 40, 65, 50, 70, 60],
    },
    {
        label: "System Users",
        value: "255K",
        trend: "+2.5% This Month",
        icon: Users,
        gradient: "pharm-stat-purple",
        bars: [45, 65, 50, 75, 55, 85, 60],
    },
];

export default function StatsCards() {
    return (
        <div className="pharm-stats-grid">
            {stats.map((s) => (
                <div key={s.label} className={`pharm-stat-card ${s.gradient}`}>
                    <div className="pharm-stat-header">
                        <div className="pharm-stat-icon-wrap">
                            <s.icon size={16} />
                        </div>
                        <span className="pharm-stat-label">{s.label}</span>
                        <button className="pharm-stat-menu">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <div className="pharm-stat-value">{s.value}</div>
                    <div className="pharm-stat-trend">
                        <span className="pharm-trend-badge">↑ {s.trend}</span>
                    </div>
                    {/* Decorative mini bars */}
                    <div className="pharm-stat-bars">
                        {s.bars.map((h, i) => (
                            <div
                                key={i}
                                className="pharm-stat-bar"
                                style={{ height: `${h}%` }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
