"use client";
import { MoreHorizontal } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
    { name: "Purchases", value: 28, color: "#6dd5a1" },
    { name: "Suppliers", value: 18, color: "#f9b572" },
    { name: "Sales", value: 12, color: "#f87171" },
    { name: "No Sales", value: 42, color: "#a78bfa" },
];

export default function GraphReport() {
    return (
        <div className="pharm-glass-card pharm-chart-card">
            <div className="pharm-chart-header">
                <h3 className="pharm-chart-title">Graph Report</h3>
                <button className="pharm-stat-menu">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            <div className="pharm-donut-wrapper">
                <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={3}
                            dataKey="value"
                            cornerRadius={6}
                            stroke="none"
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center label */}
                <div className="pharm-donut-center">
                    <span className="pharm-donut-label">Total</span>
                    <span className="pharm-donut-value">755K</span>
                </div>
            </div>

            {/* Legend */}
            <div className="pharm-donut-legend">
                {data.map((d) => (
                    <div key={d.name} className="pharm-legend-item">
                        <span
                            className="pharm-legend-dot"
                            style={{ background: d.color }}
                        />
                        <span>{d.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
