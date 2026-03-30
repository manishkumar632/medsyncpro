"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import RouteGuard from "../../components/RouteGuard";
import { fetchPatientAppointments } from "@/actions/appointmentAction";
import {
    Search, X, Calendar, Clock, Video, Building2, MessageSquare,
    ChevronRight, Filter, CalendarX, Plus, Stethoscope
} from "lucide-react";
import "../patient-workflow.css";

const STATUS_FILTERS = ["All", "REQUESTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED"];

const STATUS_LABELS = {
    REQUESTED: "Requested",
    CONFIRMED: "Confirmed",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REJECTED: "Rejected",
    NO_SHOW: "No Show",
};

const TYPE_ICONS = {
    VIDEO: Video,
    IN_PERSON: Building2,
    CHAT: MessageSquare,
};

function formatDate(dateStr) {
    if (!dateStr) return { day: "–", month: "" };
    const d = new Date(dateStr + "T00:00:00");
    return { day: d.getDate(), month: d.toLocaleString("default", { month: "short" }) };
}

function formatTime12(t) {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function PatientAppointments() {
    const router = useRouter();
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchAppointments();
    }, [page]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const result = await fetchPatientAppointments(page, 20);
            if (result.success) {
                const pageData = result.data;
                setAppointments(pageData?.content || pageData || []);
                setTotalPages(pageData?.totalPages || 1);
            }
        } catch (err) {
            console.error("Failed to fetch appointments", err);
        }
        setLoading(false);
    };

    const filtered = useMemo(() => {
        let list = appointments;
        if (statusFilter !== "All") {
            list = list.filter(a => a.status === statusFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(a =>
                a.doctorName?.toLowerCase().includes(q) ||
                a.doctorSpecialty?.toLowerCase().includes(q) ||
                a.symptoms?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [appointments, statusFilter, search]);

    return (
        <div className="pw-page">
            {/* Header */}
            <div className="pw-page-header">
                <div>
                    <h1><Calendar size={22} /> My Appointments</h1>
                    <p>View and manage your appointments</p>
                </div>
                <button className="pw-btn pw-btn-primary" onClick={() => router.push("/patient/doctors")}>
                    <Plus size={16} /> Book New
                </button>
            </div>

            {/* Search */}
            <div className="pw-search-bar">
                <Search size={18} />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by doctor name, specialty, symptoms..."
                />
                {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} /></button>}
            </div>

            {/* Status Filters */}
            <div className="pw-filters">
                {STATUS_FILTERS.map(s => (
                    <button
                        key={s}
                        className={`pw-filter-chip ${statusFilter === s ? "active" : ""}`}
                        onClick={() => setStatusFilter(s)}
                    >
                        {s === "All" ? "All" : STATUS_LABELS[s] || s}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="pw-appt-list">
                {loading ? (
                    <div className="pw-loading"><div className="pw-spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="pw-empty">
                        <CalendarX size={48} />
                        <h3>No appointments found</h3>
                        <p>{statusFilter !== "All" ? "Try changing the status filter" : "Book your first appointment"}</p>
                        <button className="pw-btn pw-btn-primary" style={{ margin: "16px auto 0" }} onClick={() => router.push("/patient/doctors")}>
                            <Plus size={16} /> Find Doctors
                        </button>
                    </div>
                ) : (
                    filtered.map(appt => {
                        const { day, month } = formatDate(appt.scheduledDate);
                        const TypeIcon = TYPE_ICONS[appt.type] || Video;
                        return (
                            <div
                                key={appt.id}
                                className="pw-appt-card"
                                onClick={() => router.push(`/patient/appointments/${appt.id}`)}
                            >
                                <div className="pw-appt-date-block">
                                    <div className="day">{day}</div>
                                    <div className="month">{month}</div>
                                </div>
                                <div className="pw-appt-divider" />
                                <div className="pw-appt-info">
                                    <div className="doctor-name">{appt.doctorName || "Doctor"}</div>
                                    <div className="appt-meta">
                                        <span>{appt.doctorSpecialty || "General"}</span>
                                        <span>•</span>
                                        <span><Clock size={12} style={{ verticalAlign: "middle" }} /> {formatTime12(appt.scheduledTime)}</span>
                                        <span className="pw-type-badge">
                                            <TypeIcon size={12} />
                                            {appt.type === "VIDEO" ? "Video" : appt.type === "IN_PERSON" ? "In-Person" : "Chat"}
                                        </span>
                                    </div>
                                    {appt.symptoms && (
                                        <div style={{ fontSize: "0.75rem", color: "var(--pw-muted)", marginTop: 4 }}>
                                            {appt.symptoms.length > 80 ? appt.symptoms.substring(0, 80) + "..." : appt.symptoms}
                                        </div>
                                    )}
                                </div>
                                <span className={`pw-status-badge ${appt.status}`}>
                                    {STATUS_LABELS[appt.status] || appt.status}
                                </span>
                                <ChevronRight size={18} style={{ color: "var(--pw-muted)" }} />
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
                    <button className="pw-btn pw-btn-outline pw-btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <span style={{ fontSize: "0.82rem", color: "var(--pw-muted)", lineHeight: "32px" }}>Page {page + 1} of {totalPages}</span>
                    <button className="pw-btn pw-btn-outline pw-btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            )}
        </div>
    );
}

export default function AppointmentsPage() {
    return (
        <RouteGuard allowedRoles={["PATIENT"]}>
            <PatientAppointments />
        </RouteGuard>
    );
}
