"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronDown,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Truck,
  Clock,
  Package,
  Loader2,
  RefreshCw,
  AlertTriangle,
  MapPin,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchPharmacyRequests,
  updatePharmacyRequestStatus,
} from "@/actions/pharmacyAction";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    Icon: Clock,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "#6366f1",
    bg: "#eef2ff",
    border: "#c7d2fe",
    Icon: CheckCircle2,
  },
  DISPATCHED: {
    label: "Dispatched",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    border: "#bae6fd",
    Icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    color: "#22c55e",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
    Icon: XCircle,
  },
};

// Actions available per status
const NEXT_ACTIONS = {
  PENDING: [
    { status: "ACCEPTED", label: "Accept", color: "#6366f1", bg: "#eef2ff" },
    { status: "REJECTED", label: "Reject", color: "#ef4444", bg: "#fef2f2" },
  ],
  ACCEPTED: [
    {
      status: "DISPATCHED",
      label: "Mark Dispatched",
      color: "#0ea5e9",
      bg: "#f0f9ff",
    },
    { status: "REJECTED", label: "Cancel", color: "#ef4444", bg: "#fef2f2" },
  ],
  DISPATCHED: [
    {
      status: "DELIVERED",
      label: "Mark Delivered",
      color: "#22c55e",
      bg: "#f0fdf4",
    },
  ],
  DELIVERED: [],
  REJECTED: [],
};

const FILTER_OPTIONS = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "DISPATCHED",
  "DELIVERED",
  "REJECTED",
];

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dt) {
  if (!dt) return "";
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Action confirm modal ─────────────────────────────────────────────────────
function ActionModal({ request, action, onConfirm, onClose }) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    await onConfirm(request.id, action.status, note);
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          animation: "pharm-req-modal-in 0.2s ease",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#0f172a",
              marginBottom: 4,
            }}
          >
            {action.label} — {request.patientName}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
            Delivery to: {request.deliveryAddress}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#475569",
              marginBottom: 6,
            }}
          >
            Note{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400 }}>
              (optional — visible to patient)
            </span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Add a note about this ${action.label.toLowerCase()} action…`}
            rows={3}
            style={{
              width: "100%",
              border: "1.5px solid #e2e8f0",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: "0.85rem",
              outline: "none",
              fontFamily: "inherit",
              color: "#1e293b",
              background: "#f8fafc",
              resize: "none",
              boxSizing: "border-box",
              transition: "border 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = action.color)}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
              fontSize: "0.85rem",
              color: "#64748b",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            style={{
              flex: 2,
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: submitting ? "#94a3b8" : action.color,
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="pharm-req-spin" /> Processing…
              </>
            ) : (
              `Confirm ${action.label}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Request detail drawer ────────────────────────────────────────────────────
function RequestDetail({ request, onClose }) {
  const cfg = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.PENDING;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(15,23,42,0.4)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          height: "100%",
          overflowY: "auto",
          padding: 24,
          boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
          animation: "pharm-req-slide-in 0.25s ease",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>
            Request Details
          </span>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
            }}
          >
            <XCircle size={16} />
          </button>
        </div>

        {/* Status badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 999,
            width: "fit-content",
            background: cfg.bg,
            color: cfg.color,
            border: `1.5px solid ${cfg.border}`,
            fontSize: "0.8rem",
            fontWeight: 700,
          }}
        >
          <cfg.Icon size={13} /> {cfg.label}
        </span>

        {/* Info rows */}
        {[
          { icon: User, label: "Patient", value: request.patientName },
          {
            icon: MapPin,
            label: "Delivery Address",
            value: request.deliveryAddress,
          },
          {
            icon: FileText,
            label: "Prescription",
            value: request.prescriptionId ? "Linked" : "Not linked",
          },
          {
            icon: Clock,
            label: "Placed",
            value: `${formatDate(request.createdAt)} · ${timeAgo(request.createdAt)}`,
          },
          ...(request.assignedAt
            ? [
                {
                  icon: Clock,
                  label: "Assigned At",
                  value: formatDate(request.assignedAt),
                },
              ]
            : []),
          ...(request.deliveredAt
            ? [
                {
                  icon: CheckCircle2,
                  label: "Delivered At",
                  value: formatDate(request.deliveredAt),
                },
              ]
            : []),
          ...(request.agentName
            ? [
                {
                  icon: Truck,
                  label: "Delivery Agent",
                  value: request.agentName,
                },
              ]
            : []),
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={14} color="#64748b" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                  fontWeight: 600,
                  marginBottom: 2,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: "0.84rem",
                  color: "#1e293b",
                  fontWeight: 500,
                }}
              >
                {value}
              </div>
            </div>
          </div>
        ))}

        {/* Notes */}
        {request.patientNote && (
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 10,
              padding: "12px 14px",
              borderLeft: "3px solid #6366f1",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                color: "#6366f1",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Patient Note
            </div>
            <div style={{ fontSize: "0.82rem", color: "#475569" }}>
              {request.patientNote}
            </div>
          </div>
        )}
        {request.pharmacyNote && (
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 10,
              padding: "12px 14px",
              borderLeft: "3px solid #0d9488",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                color: "#0d9488",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Pharmacy Note
            </div>
            <div style={{ fontSize: "0.82rem", color: "#475569" }}>
              {request.pharmacyNote}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PharmacyRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionModal, setActionModal] = useState(null); // { request, action }
  const [detailRequest, setDetailRequest] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchRequests = useCallback(async (page = 0) => {
    setLoading(true);
    setError(null);
    const res = await fetchPharmacyRequests(page, 15);
    if (res.success) {
      const data = res.data;
      const list = data?.content ?? data ?? [];
      setRequests(Array.isArray(list) ? list : []);
      setTotalPages(data?.totalPages ?? 1);
      setTotalElements(data?.totalElements ?? list.length);
    } else {
      setError(res.message || "Failed to load requests.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage, fetchRequests]);

  // Client-side filter by status + search (since backend doesn't support it)
  const filtered = requests.filter((r) => {
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      r.patientName?.toLowerCase().includes(q) ||
      r.deliveryAddress?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleAction = async (requestId, status, note) => {
    setActionError(null);
    const res = await updatePharmacyRequestStatus(requestId, status, note);
    if (res.success) {
      // Optimistic update
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status,
                pharmacyNote: note || r.pharmacyNote,
                ...(status === "DELIVERED"
                  ? { deliveredAt: new Date().toISOString() }
                  : {}),
              }
            : r,
        ),
      );
    } else {
      setActionError(res.message || "Action failed. Please try again.");
      // Re-fetch to get true state
      fetchRequests(currentPage);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <>
      <style>{`
        @keyframes pharm-req-modal-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pharm-req-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes pharm-req-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pharm-req-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .pharm-req-spin { animation: pharm-req-spin 0.8s linear infinite; }
      `}</style>

      <div className="pharm-glass-card pharm-table-card">
        {/* Header */}
        <div
          className="pharm-table-header"
          style={{ flexWrap: "wrap", gap: 12 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3 className="pharm-chart-title" style={{ margin: 0 }}>
              Medicine Requests
            </h3>
            {pendingCount > 0 && (
              <span
                style={{
                  background: "#fef3c7",
                  color: "#d97706",
                  border: "1px solid #fde68a",
                  borderRadius: 999,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Clock size={10} /> {pendingCount} pending
              </span>
            )}
          </div>
          <div
            className="pharm-table-controls"
            style={{ flexWrap: "wrap", gap: 8 }}
          >
            {/* Search */}
            <div className="pharm-table-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search patient or address…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: "1.5px solid #e5e7eb",
                background: "#fff",
                fontSize: "0.82rem",
                color: "#374151",
                fontFamily: "inherit",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {FILTER_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f === "ALL"
                    ? "All Statuses"
                    : (STATUS_CONFIG[f]?.label ?? f)}
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchRequests(currentPage)}
              className="pharm-stat-menu"
              title="Refresh"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Action error */}
        {actionError && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "10px 14px",
              margin: "0 0 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.82rem",
              color: "#dc2626",
            }}
          >
            <AlertTriangle size={14} /> {actionError}
            <button
              onClick={() => setActionError(null)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#dc2626",
              }}
            >
              <XCircle size={14} />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="pharm-table-wrap">
          <table className="pharm-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Delivery Address</th>
                <th>Prescription</th>
                <th>Status</th>
                <th>Placed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr
                    key={i}
                    style={{
                      animation: "pharm-req-pulse 1.5s ease-in-out infinite",
                    }}
                  >
                    {[...Array(6)].map((__, j) => (
                      <td key={j}>
                        <div
                          style={{
                            height: 16,
                            background: "#f1f5f9",
                            borderRadius: 6,
                            width: j === 1 ? "80%" : "60%",
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "40px 0",
                        gap: 10,
                        color: "#94a3b8",
                      }}
                    >
                      <Package size={32} opacity={0.4} />
                      <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                        {searchQuery || statusFilter !== "ALL"
                          ? "No requests match your filters"
                          : "No medicine requests yet"}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((req) => {
                  const cfg =
                    STATUS_CONFIG[req.status] ?? STATUS_CONFIG.PENDING;
                  const actions = NEXT_ACTIONS[req.status] ?? [];

                  return (
                    <tr
                      key={req.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => setDetailRequest(req)}
                    >
                      {/* Patient */}
                      <td>
                        <div className="pharm-table-user">
                          <div
                            className="pharm-table-avatar"
                            style={{ background: "#6dd5a1", flexShrink: 0 }}
                          >
                            {req.patientName?.substring(0, 2).toUpperCase() ||
                              "PT"}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                color: "#111827",
                                fontSize: "0.85rem",
                              }}
                            >
                              {req.patientName}
                            </div>
                            <div
                              style={{ fontSize: "0.72rem", color: "#9ca3af" }}
                            >
                              {timeAgo(req.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td style={{ maxWidth: 180 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 4,
                            fontSize: "0.82rem",
                            color: "#374151",
                          }}
                        >
                          <MapPin
                            size={12}
                            color="#9ca3af"
                            style={{ flexShrink: 0, marginTop: 2 }}
                          />
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 160,
                            }}
                          >
                            {req.deliveryAddress}
                          </span>
                        </div>
                      </td>

                      {/* Prescription */}
                      <td>
                        {req.prescriptionId ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              background: "#eef2ff",
                              color: "#6366f1",
                              borderRadius: 6,
                              padding: "3px 8px",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                            }}
                          >
                            <FileText size={10} /> Linked
                          </span>
                        ) : (
                          <span
                            style={{ color: "#9ca3af", fontSize: "0.8rem" }}
                          >
                            —
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <cfg.Icon size={10} /> {cfg.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td
                        style={{
                          fontSize: "0.82rem",
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(req.createdAt)}
                      </td>

                      {/* Actions */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "nowrap",
                          }}
                        >
                          {actions.map((action) => (
                            <button
                              key={action.status}
                              onClick={() =>
                                setActionModal({ request: req, action })
                              }
                              style={{
                                padding: "5px 10px",
                                borderRadius: 7,
                                border: `1px solid ${action.color}`,
                                background: action.bg,
                                color: action.color,
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                whiteSpace: "nowrap",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = action.color;
                                e.currentTarget.style.color = "#fff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = action.bg;
                                e.currentTarget.style.color = action.color;
                              }}
                            >
                              {action.label}
                            </button>
                          ))}
                          {actions.length === 0 && (
                            <span
                              style={{ fontSize: "0.75rem", color: "#9ca3af" }}
                            >
                              —
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && (
          <div className="pharm-pagination">
            <div className="pharm-page-info">
              Showing {filtered.length} of {totalElements} requests
            </div>
            <div className="pharm-page-buttons">
              <button
                className="pharm-page-btn"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft size={13} /> Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i).map(
                (p) => (
                  <button
                    key={p}
                    className={`pharm-page-btn ${p === currentPage ? "active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p + 1}
                  </button>
                ),
              )}
              <button
                className="pharm-page-btn"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action confirm modal */}
      {actionModal && (
        <ActionModal
          request={actionModal.request}
          action={actionModal.action}
          onConfirm={handleAction}
          onClose={() => setActionModal(null)}
        />
      )}

      {/* Request detail drawer */}
      {detailRequest && (
        <RequestDetail
          request={detailRequest}
          onClose={() => setDetailRequest(null)}
        />
      )}
    </>
  );
}
