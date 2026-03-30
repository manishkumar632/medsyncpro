"use client";
import { CalendarCheck, FlaskConical, MessageSquare, ArrowUpRight, Clock } from "lucide-react";

const notifications = [
    { icon: CalendarCheck, color: "#2563eb", title: "Upcoming: Emma Wilson", desc: "Annual Checkup in 15 minutes", time: "10:00 AM", type: "appointment" },
    { icon: FlaskConical, color: "#8b5cf6", title: "Lab Results Ready", desc: "James Brown — Lipid Panel results available", time: "9:45 AM", type: "lab" },
    { icon: MessageSquare, color: "#0d9488", title: "New Message", desc: "Lisa Anderson sent a follow-up question", time: "9:30 AM", type: "message" },
    { icon: ArrowUpRight, color: "#f59e0b", title: "Follow-up Reminder", desc: "Robert Taylor — Post-surgery follow-up overdue", time: "Yesterday", type: "followup" },
    { icon: CalendarCheck, color: "#2563eb", title: "Tomorrow: 8 Appointments", desc: "First appointment at 09:00 AM", time: "Schedule", type: "appointment" },
    { icon: FlaskConical, color: "#059669", title: "Lab Results Ready", desc: "Sarah Johnson — CBC results available", time: "Yesterday", type: "lab" },
];

export default function NotificationsPanel() {
    return (
        <div className="doc-glass-card doc-notif-panel">
            <div className="doc-card-header">
                <h3>Notifications & Tasks</h3>
                <button className="doc-see-all">View All</button>
            </div>
            <div className="doc-notif-list">
                {notifications.map((n, i) => (
                    <div key={i} className={`doc-notif-item ${n.type}`}>
                        <div className="doc-notif-icon" style={{ background: `${n.color}12`, color: n.color }}>
                            <n.icon size={16} />
                        </div>
                        <div className="doc-notif-content">
                            <div className="doc-notif-title">{n.title}</div>
                            <div className="doc-notif-desc">{n.desc}</div>
                        </div>
                        <div className="doc-notif-time">
                            <Clock size={11} />
                            <span>{n.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
