"use client";
import { useEffect, useState } from "react";
import { Video, MapPin, RefreshCw } from "lucide-react";
import { fetchDoctorAppointmentsAction } from "@/actions/doctorAction";

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function Avatar({ name, src, size = 36 }) {
  const [err, setErr] = useState(false);
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  const colors = [
    "#0d9488",
    "#2563eb",
    "#7c3aed",
    "#db2777",
    "#ea580c",
    "#059669",
    "#f59e0b",
  ];
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  );
}

const STATUS_LABEL = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
  CONFIRMED: "Upcoming",
  PENDING: "Upcoming",
  CANCELLED: "Cancelled",
};
const STATUS_CLASS = {
  COMPLETED: "completed",
  IN_PROGRESS: "in-progress",
  CONFIRMED: "upcoming",
  PENDING: "upcoming",
  CANCELLED: "cancelled",
};

export default function TodayAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetchDoctorAppointmentsAction(0, 200);
      const all =
        res?.data?.content ?? (Array.isArray(res?.data) ? res.data : []);
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayAppts = all
        .filter((a) => a.scheduledDate === todayStr)
        .sort((a, b) =>
          (a.scheduledTime ?? "").localeCompare(b.scheduledTime ?? ""),
        );
      setAppointments(todayAppts);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="doc-glass-card doc-appointments-card">
      <div className="doc-card-header">
        <h3>Today&apos;s Appointments</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!loading && (
            <span className="doc-card-count">
              {appointments.length} scheduled
            </span>
          )}
          <button
            onClick={load}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
            }}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "spinning" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 64,
                borderRadius: 10,
                background:
                  "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.2s infinite",
              }}
            />
          ))}
          <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @keyframes spin{to{transform:rotate(360deg)}} .spinning{animation:spin 0.8s linear infinite}`}</style>
        </div>
      ) : error ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
          <p>Failed to load appointments.</p>
          <button
            onClick={load}
            style={{
              marginTop: 8,
              padding: "6px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              color: "#475569",
            }}
          >
            Retry
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div
          style={{
            padding: "48px 20px",
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p style={{ margin: 0, fontWeight: 600, color: "#64748b" }}>
            No appointments today
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
            Enjoy your free day!
          </p>
        </div>
      ) : (
        <div className="doc-timeline">
          {appointments.map((a, i) => {
            const statusKey = a.status ?? "CONFIRMED";
            const cls = STATUS_CLASS[statusKey] ?? "upcoming";
            const label = STATUS_LABEL[statusKey] ?? statusKey;
            const isOnline = a.type === "ONLINE";
            return (
              <div key={a.id ?? i} className={`doc-timeline-item ${cls}`}>
                <div className="doc-timeline-time">
                  {formatTime(a.scheduledTime)}
                </div>
                <div className="doc-timeline-dot" />
                <div className="doc-timeline-content">
                  <div className="doc-timeline-row">
                    <Avatar
                      name={a.patientName}
                      src={a.patientProfileImage}
                      size={36}
                    />
                    <div className="doc-timeline-info">
                      <div className="doc-timeline-patient">
                        {a.patientName ?? "Unknown Patient"}
                      </div>
                      <div className="doc-timeline-condition">
                        {a.symptoms || a.diagnosis || "General Consultation"}
                      </div>
                    </div>
                    <div className="doc-timeline-meta">
                      <span
                        className={`doc-type-badge ${isOnline ? "online" : "in-person"}`}
                      >
                        {isOnline ? <Video size={11} /> : <MapPin size={11} />}
                        {isOnline ? "Online" : "In-person"}
                      </span>
                      <span className={`doc-status-pill ${cls}`}>{label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
