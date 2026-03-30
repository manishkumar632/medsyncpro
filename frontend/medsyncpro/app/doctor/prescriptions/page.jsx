"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pill,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { fetchDoctorPrescriptionsAction } from "@/actions/doctorAction";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PatientAvatar({ name, src, size = 36 }) {
  const [err, setErr] = useState(false);
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  const colors = ["#0d9488", "#2563eb", "#7c3aed", "#db2777", "#ea580c"];
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

export default function PrescriptionsListPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDoctorPrescriptionsAction(
        page,
        PAGE_SIZE,
        debouncedSearch,
      );
      if (res?.success) {
        const data = res.data;
        if (data?.content) {
          setPrescriptions(data.content);
          setTotalPages(data.totalPages ?? 1);
          setTotalElements(data.totalElements ?? data.content.length);
        } else if (Array.isArray(data)) {
          setPrescriptions(data);
          setTotalPages(1);
          setTotalElements(data.length);
        }
      }
    } catch {
      /* keep existing */
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="doc-prescriptions-page">
      {/* Page Header */}
      <div className="doc-page-header">
        <div>
          <h1 className="doc-page-title">
            <Pill size={22} style={{ color: "#8b5cf6" }} />
            Prescriptions
          </h1>
          <p className="doc-page-subtitle">
            {totalElements > 0
              ? `${totalElements} prescription${totalElements !== 1 ? "s" : ""} found`
              : "Manage all your patient prescriptions"}
          </p>
        </div>
        <button
          className="doc-new-rx-btn"
          onClick={() => router.push("/doctor/prescription")}
        >
          <Plus size={16} />
          New Prescription
        </button>
      </div>

      {/* Search + Refresh */}
      <div className="doc-rx-toolbar">
        <div className="doc-rx-search">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by patient name or diagnosis…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
        <button className="doc-rx-refresh-btn" onClick={load} title="Refresh">
          <RefreshCw size={15} className={loading ? "spinning" : ""} />
        </button>
      </div>

      {/* Table */}
      <div className="doc-glass-card doc-rx-table-card">
        {loading ? (
          <div className="doc-rx-loading">
            <div className="doc-rx-spinner" />
            <span>Loading prescriptions…</span>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="doc-rx-empty">
            <FileText
              size={40}
              style={{ color: "#cbd5e1", marginBottom: 12 }}
            />
            <h3>
              {debouncedSearch
                ? `No results for "${debouncedSearch}"`
                : "No prescriptions yet"}
            </h3>
            <p>
              {debouncedSearch
                ? "Try a different search term."
                : "Click New Prescription to create your first one."}
            </p>
            {!debouncedSearch && (
              <button
                className="doc-new-rx-btn"
                style={{ marginTop: 16 }}
                onClick={() => router.push("/doctor/prescription")}
              >
                <Plus size={15} /> New Prescription
              </button>
            )}
          </div>
        ) : (
          <div className="doc-rx-table-wrap">
            <table className="doc-rx-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Medications</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx, i) => {
                  const meds = Array.isArray(rx.medicines) ? rx.medicines : [];
                  const firstMed = meds[0];
                  return (
                    <tr key={rx.id ?? i}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <PatientAvatar
                            name={rx.patient}
                            src={rx.profileImageUrl}
                            size={36}
                          />
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>
                            {rx.patient ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{ color: "#475569", fontSize: "0.875rem" }}
                        >
                          {rx.diagnosis || (
                            <span style={{ color: "#94a3b8" }}>—</span>
                          )}
                        </span>
                      </td>
                      <td>
                        {firstMed ? (
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                color: "#334155",
                                fontSize: "0.875rem",
                              }}
                            >
                              <Pill size={13} style={{ color: "#8b5cf6" }} />
                              {firstMed.name}
                              {firstMed.dosage && (
                                <span style={{ color: "#94a3b8" }}>
                                  {firstMed.dosage}
                                </span>
                              )}
                            </div>
                            {meds.length > 1 && (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#8b5cf6",
                                  marginTop: 2,
                                  display: "block",
                                }}
                              >
                                +{meds.length - 1} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            color: "#64748b",
                            fontSize: "0.875rem",
                          }}
                        >
                          <Clock size={13} />
                          {formatDate(rx.createdAt)}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`doc-rx-status-badge ${(rx.status || "active").toLowerCase()}`}
                        >
                          {rx.status ?? "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="doc-rx-pagination">
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Page {page + 1} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="doc-rx-page-btn"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <button
                className="doc-rx-page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .doc-prescriptions-page {
          padding: 28px;
          max-width: 1200px;
        }
        .doc-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .doc-page-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 4px;
        }
        .doc-page-subtitle {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0;
        }
        .doc-new-rx-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .doc-new-rx-btn:hover {
          opacity: 0.88;
        }
        .doc-rx-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .doc-rx-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px 14px;
          flex: 1;
          max-width: 420px;
          transition: border-color 0.15s;
        }
        .doc-rx-search:focus-within {
          border-color: #8b5cf6;
        }
        .doc-rx-search input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 0.875rem;
          color: #334155;
          background: transparent;
        }
        .doc-rx-refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          color: #64748b;
          transition: all 0.15s;
        }
        .doc-rx-refresh-btn:hover {
          border-color: #8b5cf6;
          color: #8b5cf6;
        }
        .spinning {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .doc-rx-table-card {
          overflow: hidden;
        }
        .doc-rx-loading,
        .doc-rx-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 10px;
          color: #64748b;
        }
        .doc-rx-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e2e8f0;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .doc-rx-empty h3 {
          margin: 0;
          font-size: 1rem;
          color: #475569;
        }
        .doc-rx-empty p {
          margin: 0;
          font-size: 0.875rem;
        }
        .doc-rx-table-wrap {
          overflow-x: auto;
        }
        .doc-rx-table {
          width: 100%;
          border-collapse: collapse;
        }
        .doc-rx-table thead tr {
          background: #f8fafc;
        }
        .doc-rx-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #f1f5f9;
          white-space: nowrap;
        }
        .doc-rx-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f8fafc;
          vertical-align: middle;
        }
        .doc-rx-table tbody tr:hover {
          background: #fafbff;
        }
        .doc-rx-table tbody tr:last-child td {
          border-bottom: none;
        }
        .doc-rx-status-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .doc-rx-status-badge.active {
          background: #dcfce7;
          color: #166534;
        }
        .doc-rx-status-badge.refill {
          background: #fef9c3;
          color: #854d0e;
        }
        .doc-rx-status-badge.expired {
          background: #fee2e2;
          color: #991b1b;
        }
        .doc-rx-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-top: 1px solid #f1f5f9;
        }
        .doc-rx-page-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #475569;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.15s;
        }
        .doc-rx-page-btn:hover:not(:disabled) {
          border-color: #8b5cf6;
          color: #8b5cf6;
        }
        .doc-rx-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
