"use client";
import { UserPlus, ShieldAlert, AlertTriangle, Server, Clock } from "lucide-react";

const activities = [
    { icon: UserPlus, color: "#0d9488", title: "New Patient Registration", desc: "Sarah Johnson created an account", time: "2 mins ago" },
    { icon: ShieldAlert, color: "#f59e0b", title: "Verification Pending", desc: "Dr. David Kim awaiting document review", time: "15 mins ago" },
    { icon: AlertTriangle, color: "#ef4444", title: "Flagged Prescription", desc: "Unusual dosage detected for Patient #4521", time: "32 mins ago" },
    { icon: UserPlus, color: "#6366f1", title: "New Doctor Registration", desc: "Dr. Aisha Patel submitted credentials", time: "1 hour ago" },
    { icon: Server, color: "#8b5cf6", title: "System Alert", desc: "Database backup completed successfully", time: "2 hours ago" },
    { icon: UserPlus, color: "#0891b2", title: "New Pharmacist Registration", desc: "QuickMeds Store applied for license", time: "3 hours ago" },
    { icon: ShieldAlert, color: "#f59e0b", title: "License Renewal Required", desc: "HealthFirst Drugs license expiring in 7 days", time: "5 hours ago" },
];

export default function ActivityPanel() {
    return (
        <div className="admin-glass-card admin-activity-panel">
            <div className="admin-activity-header">
                <h3>Recent Activity</h3>
                <button className="admin-see-all">View All</button>
            </div>
            <div className="admin-activity-list">
                {activities.map((a, i) => (
                    <div key={i} className="admin-activity-item">
                        <div className="admin-activity-icon" style={{ background: `${a.color}14`, color: a.color }}>
                            <a.icon size={16} />
                        </div>
                        <div className="admin-activity-content">
                            <div className="admin-activity-title">{a.title}</div>
                            <div className="admin-activity-desc">{a.desc}</div>
                        </div>
                        <div className="admin-activity-time">
                            <Clock size={12} />
                            <span>{a.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
