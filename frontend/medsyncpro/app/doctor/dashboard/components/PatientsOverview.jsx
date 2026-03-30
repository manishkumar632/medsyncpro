"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import { fetchDoctorPatientsAction } from "@/actions/doctorAction";

function calcAge(dob) {
  if (!dob) return "—";
  const b = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (
    now.getMonth() - b.getMonth() < 0 ||
    (now.getMonth() - b.getMonth() === 0 && now.getDate() < b.getDate())
  )
    age--;
  return age;
}

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function Avatar({ name, src, size = 34 }) {
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

export default function PatientsOverview() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDoctorPatientsAction(0, 8, debouncedSearch);
      const list =
        res?.data?.content ?? (Array.isArray(res?.data) ? res.data : []);
      setPatients(list);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="doc-glass-card doc-patients-card">
      <div className="doc-card-header">
        <h3>My Patients</h3>
        <div className="doc-patients-controls">
          <div className="doc-mini-search">
            <Search size={13} />
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="doc-filter-pill" onClick={load} title="Refresh">
            <RefreshCw size={13} className={loading ? "spinning" : ""} />{" "}
            Refresh
          </button>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .spinning{animation:spin 0.7s linear infinite} @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {loading ? (
        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 44,
                borderRadius: 8,
                background:
                  "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.2s infinite",
              }}
            />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
          <p style={{ margin: 0 }}>
            {debouncedSearch
              ? `No patients found for "${debouncedSearch}"`
              : "No patients yet"}
          </p>
        </div>
      ) : (
        <div className="doc-patients-table-wrap">
          <table className="doc-patients-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Last Visit</th>
                <th>Visits</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => (
                <tr key={p.id ?? i}>
                  <td>
                    <div className="doc-table-user">
                      <Avatar name={p.name} src={p.profileImageUrl} size={34} />
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#1e293b",
                            fontSize: "0.875rem",
                          }}
                        >
                          {p.name}
                        </div>
                        {p.email && (
                          <div
                            style={{ fontSize: "0.75rem", color: "#94a3b8" }}
                          >
                            {p.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{calcAge(p.dateOfBirth)}</td>
                  <td
                    style={{
                      textTransform: "capitalize",
                      fontSize: "0.875rem",
                    }}
                  >
                    {p.gender
                      ? p.gender.charAt(0).toUpperCase() +
                        p.gender.slice(1).toLowerCase()
                      : "—"}
                  </td>
                  <td className="doc-muted">{formatDate(p.lastVisit)}</td>
                  <td>
                    <span
                      style={{
                        background: "#ede9fe",
                        color: "#6d28d9",
                        padding: "2px 8px",
                        borderRadius: 12,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {p.appointments ?? 0}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`doc-status-badge ${(p.status ?? "active").toLowerCase().replace("-", "")}`}
                    >
                      {p.status ?? "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
