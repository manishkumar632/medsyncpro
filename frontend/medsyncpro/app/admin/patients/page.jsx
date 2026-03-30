"use client";
import "./patients.css";
import { useState, useMemo, useRef, useEffect } from "react";
import { fetchUsersAction, suspendUserAction } from "@/actions/adminAction";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Shield,
  ShieldAlert,
  Eye,
  UserPlus,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Award,
  AlertTriangle,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  BadgeCheck,
  ShieldOff,
  Flag,
  MessageSquare,
  ArrowUpDown,
  Check,
  BarChart3,
  Heart,
  Pill,
  Stethoscope,
  UserCheck,
  UserX,
  AlertCircle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════ */
const STATUS_MAP = {
  active: { label: "Active", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  inactive: {
    label: "Inactive",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
  },
  suspended: {
    label: "Suspended",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
  },
  flagged: { label: "Flagged", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  under_review: {
    label: "Under Review",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
  },
};

const RISK_MAP = {
  normal: { label: "Normal", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  flagged: { label: "Flagged", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  high: { label: "High Risk", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
};

const PAGE_SIZE = 8;

/* ═══════════════════════════════════════════════════════ */
export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("joined");
  const [sortDir, setSortDir] = useState("desc");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [selected, setSelected] = useState(new Set());
  const [drawerDoc, setDrawerDoc] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  // Fetch Real Data from Backend
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        const result = await fetchUsersAction({
          role: "PATIENT",
          page: page,
          size: PAGE_SIZE,
          search: search,
        });

        if (result.success) {
          setPatients(result.content || []);
          setTotalPages(result.totalPages || 1);
          setTotalElements(result.totalElements || 0);
        }
      } catch (error) {
        console.error("Failed to load patients:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      loadPatients();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  // Client-side visual filtering for status & risk (since backend might not support it yet)
  const filtered = useMemo(() => {
    let list = [...patients];
    if (statusFilter !== "all")
      list = list.filter(
        (p) => (p.status?.toLowerCase() || "active") === statusFilter,
      );
    if (riskFilter !== "all")
      list = list.filter(
        (p) => (p.risk?.toLowerCase() || "normal") === riskFilter,
      );
    return list;
  }, [patients, statusFilter, riskFilter]);

  const flaggedPatients = useMemo(
    () => patients.filter((p) => p.riskFlag),
    [patients],
  );

  const stats = useMemo(
    () => ({
      total: totalElements,
      active: patients.filter(
        (p) => (p.status?.toLowerCase() || "active") === "active",
      ).length,
      flagged: flaggedPatients.length,
      suspended: patients.filter((p) => p.status?.toLowerCase() === "suspended")
        .length,
    }),
    [totalElements, patients, flaggedPatients],
  );

  const updatePatient = (id, updates) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
    if (drawerDoc?.id === id) setDrawerDoc((prev) => ({ ...prev, ...updates }));
  };

  const handleAction = (type, doc) => setConfirmAction({ type, patient: doc });

  const confirmActionHandler = async () => {
    if (!confirmAction) return;
    const { type, patient } = confirmAction;

    try {
      if (type === "suspend") {
        await suspendUserAction(patient.id);
        updatePatient(patient.id, { status: "suspended" });
      } else if (type === "activate") {
        updatePatient(patient.id, { status: "active", riskFlag: false });
      } else if (type === "flag") {
        updatePatient(patient.id, {
          status: "flagged",
          risk: "flagged",
          riskFlag: true,
        });
      } else if (type === "unflag") {
        updatePatient(patient.id, { risk: "normal", riskFlag: false });
      } else if (type === "review") {
        updatePatient(patient.id, { status: "under_review" });
      }
    } catch (err) {
      console.error("Action failed:", err);
    }

    setConfirmAction(null);
  };

  const bulkAction = (type) => {
    selected.forEach(async (id) => {
      if (type === "suspend") {
        await suspendUserAction(id);
        updatePatient(id, { status: "suspended" });
      } else if (type === "activate") {
        updatePatient(id, { status: "active" });
      }
    });
    setSelected(new Set());
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    selected.size === filtered.length
      ? setSelected(new Set())
      : setSelected(new Set(filtered.map((p) => p.id)));
  };

  const getInitials = (n) =>
    (n || "??")
      .split(" ")
      .filter(Boolean)
      .map((x) => x[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getColor = (n) => {
    const c = [
      "#0d9488",
      "#0891b2",
      "#6366f1",
      "#8b5cf6",
      "#ec4899",
      "#f59e0b",
      "#10b981",
      "#3b82f6",
    ];
    let h = 0;
    const str = n || "";
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return c[Math.abs(h) % c.length];
  };

  return (
    <div className="pt-page">
      {/* Header */}
      <div className="pt-page-header">
        <div>
          <h1 className="pt-page-title">
            <Users size={28} style={{ color: "#0d9488" }} /> Patients
          </h1>
          <p className="pt-page-subtitle">
            View, manage, and support all patients on the platform
          </p>
        </div>
        <button className="pt-add-btn">
          <UserPlus size={16} /> Add Patient
        </button>
      </div>

      {/* KPIs */}
      <div className="pt-kpi-row">
        {[
          {
            label: "Total Patients",
            value: stats.total,
            icon: <Users size={20} />,
            color: "#0891b2",
            trend: "Live Data",
          },
          {
            label: "Active",
            value: stats.active,
            icon: <UserCheck size={20} />,
            color: "#10b981",
            trend: "This Page",
          },
          {
            label: "Flagged / At Risk",
            value: stats.flagged,
            icon: <AlertTriangle size={20} />,
            color: "#f59e0b",
            trend: `${stats.flagged} alerts`,
          },
          {
            label: "Suspended",
            value: stats.suspended,
            icon: <ShieldAlert size={20} />,
            color: "#8b5cf6",
            trend: "—",
          },
        ].map((kpi, i) => (
          <div key={i} className="pt-kpi-card admin-glass-card">
            <div
              className="pt-kpi-icon"
              style={{ background: `${kpi.color}15`, color: kpi.color }}
            >
              {kpi.icon}
            </div>
            <div className="pt-kpi-value">{kpi.value}</div>
            <div className="pt-kpi-label">{kpi.label}</div>
            <span className="pt-kpi-trend" style={{ color: kpi.color }}>
              {kpi.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Flagged Patients Widget */}
      {flaggedPatients.length > 0 && (
        <div className="pt-flagged admin-glass-card">
          <div className="pt-flagged-header">
            <div className="pt-flagged-title">
              <AlertTriangle size={18} style={{ color: "#ef4444" }} />
              <h3>Flagged Patients</h3>
              <span className="pt-flagged-count">
                {flaggedPatients.length} alerts
              </span>
            </div>
          </div>
          <div className="pt-flagged-list">
            {flaggedPatients.map((p) => (
              <div key={p.id} className="pt-flagged-item">
                <div
                  className="pt-flagged-avatar"
                  style={{ background: getColor(p.name) }}
                >
                  {p.profileImageUrl ? (
                    <img src={p.profileImageUrl} alt="avatar" />
                  ) : (
                    getInitials(p.name)
                  )}
                </div>
                <div className="pt-flagged-info">
                  <span className="pt-flagged-name">{p.name}</span>
                  <span className="pt-flagged-meta">
                    {p.status === "suspended"
                      ? "Suspended account"
                      : "Needs review"}
                  </span>
                  <span
                    className="pt-flagged-reason"
                    style={{
                      color: RISK_MAP[p.risk || "flagged"]?.color,
                      background: RISK_MAP[p.risk || "flagged"]?.bg,
                    }}
                  >
                    {RISK_MAP[p.risk || "flagged"]?.label}
                  </span>
                </div>
                <div className="pt-flagged-actions">
                  <button
                    className="pt-fl-view"
                    onClick={() => setDrawerDoc(p)}
                    title="Review"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="pt-fl-unflag"
                    onClick={() => handleAction("unflag", p)}
                    title="Clear Flag"
                  >
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="pt-toolbar admin-glass-card">
        <div className="pt-search-box">
          <Search size={16} className="pt-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0); // Reset to first page on search
            }}
          />
        </div>
        <div className="pt-filter-group">
          <select
            className="pt-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            className="pt-select"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="all">All Risk</option>
            {Object.entries(RISK_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            className="pt-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="joined">Sort: Joined</option>
            <option value="name">Sort: Name</option>
          </select>
          <button
            className="pt-sort-dir"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          >
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      {/* Bulk */}
      {selected.size > 0 && (
        <div className="pt-bulk-bar">
          <span>{selected.size} patient(s) selected</span>
          <div className="pt-bulk-actions">
            <button
              className="pt-bulk-activate"
              onClick={() => bulkAction("activate")}
            >
              <CheckCircle2 size={14} /> Activate
            </button>
            <button
              className="pt-bulk-suspend"
              onClick={() => bulkAction("suspend")}
            >
              <ShieldOff size={14} /> Suspend
            </button>
            <button
              className="pt-bulk-clear"
              onClick={() => setSelected(new Set())}
            >
              <X size={14} /> Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="pt-table-wrapper admin-glass-card">
        <table className="pt-table">
          <thead>
            <tr>
              <th className="pt-th-check">
                <input
                  type="checkbox"
                  checked={
                    selected.size === filtered.length && filtered.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Patient</th>
              <th>Age / Gender</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Appointments</th>
              <th>Prescriptions</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="pt-empty">
                  <p>Loading patients...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="pt-empty">
                  <Search size={40} strokeWidth={1} />
                  <p>No patients found.</p>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className={selected.has(p.id) ? "pt-row-selected" : ""}
                >
                  <td className="pt-td-check">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td>
                    <div
                      className="pt-cell"
                      onClick={() => setDrawerDoc(p)}
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="pt-avatar"
                        style={{ background: getColor(p.name) }}
                      >
                        {p.profileImageUrl ? (
                          <img
                            src={p.profileImageUrl}
                            alt="avatar"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          getInitials(p.name)
                        )}
                      </div>
                      <div>
                        <div className="pt-name">
                          {p.name}
                          {p.riskFlag && (
                            <Flag size={12} className="pt-risk-flag" />
                          )}
                        </div>
                        <div className="pt-email">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="pt-age">
                      {p.age || "N/A"} · {p.gender || "N/A"}
                    </span>
                  </td>
                  <td className="pt-phone">{p.phone || "Not provided"}</td>
                  <td>
                    <span
                      className="pt-status-badge"
                      style={{
                        color:
                          STATUS_MAP[p.status?.toLowerCase() || "active"]
                            ?.color,
                        background:
                          STATUS_MAP[p.status?.toLowerCase() || "active"]?.bg,
                      }}
                    >
                      {STATUS_MAP[p.status?.toLowerCase() || "active"]?.label}
                    </span>
                  </td>
                  <td>
                    <span
                      className="pt-risk-badge"
                      style={{
                        color:
                          RISK_MAP[p.risk?.toLowerCase() || "normal"]?.color,
                        background:
                          RISK_MAP[p.risk?.toLowerCase() || "normal"]?.bg,
                      }}
                    >
                      {RISK_MAP[p.risk?.toLowerCase() || "normal"]?.label}
                    </span>
                  </td>
                  <td className="pt-metric">{p.appointments || 0}</td>
                  <td className="pt-metric">{p.prescriptions || 0}</td>
                  <td className="pt-date">
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </td>
                  <td>
                    <PatientActions
                      doc={p}
                      onAction={handleAction}
                      onView={() => setDrawerDoc(p)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Server-Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-pagination">
            <span className="pt-page-info">
              Showing {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, totalElements)} of{" "}
              {totalElements}
            </span>
            <div className="pt-page-btns">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>

              {/* Dynamic Page Buttons */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = page < 3 ? i : page - 2 + i;
                if (pageNum >= totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    className={pageNum === page ? "active" : ""}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analytics */}
      <div className="pt-analytics-row">
        <div className="pt-analytics-card admin-glass-card">
          <h3>
            <BarChart3 size={16} /> Engagement Distribution
          </h3>
          <div className="pt-spec-bars">
            {["High", "Medium", "Low", "None"].map((lvl) => {
              const count = patients.filter(
                (p) => (p.engagement || "Medium") === lvl,
              ).length;
              const colors = {
                High: "#10b981",
                Medium: "#0891b2",
                Low: "#f59e0b",
                None: "#94a3b8",
              };
              const pct =
                patients.length > 0 ? (count / patients.length) * 100 : 0;
              return (
                <div key={lvl} className="pt-spec-bar">
                  <span className="pt-spec-label">{lvl}</span>
                  <div className="pt-spec-track">
                    <div
                      className="pt-spec-fill"
                      style={{ width: `${pct}%`, background: colors[lvl] }}
                    ></div>
                  </div>
                  <span
                    className="pt-spec-count"
                    style={{ color: colors[lvl] }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="pt-analytics-card admin-glass-card">
          <h3>
            <Activity size={16} /> Status Overview
          </h3>
          <div className="pt-status-overview">
            {Object.entries(STATUS_MAP).map(([key, val]) => {
              const count = patients.filter(
                (p) => (p.status?.toLowerCase() || "active") === key,
              ).length;
              const pct =
                patients.length > 0
                  ? ((count / patients.length) * 100).toFixed(0)
                  : 0;
              return (
                <div key={key} className="pt-status-row">
                  <span
                    className="pt-so-dot"
                    style={{ background: val.color }}
                  ></span>
                  <span className="pt-so-label">{val.label}</span>
                  <div className="pt-so-bar-track">
                    <div
                      className="pt-so-bar-fill"
                      style={{ width: `${pct}%`, background: val.color }}
                    ></div>
                  </div>
                  <span className="pt-so-count" style={{ color: val.color }}>
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerDoc && (
        <PatientDrawer
          doc={drawerDoc}
          onClose={() => setDrawerDoc(null)}
          onAction={handleAction}
          getInitials={getInitials}
          getColor={getColor}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          updatePatient={updatePatient}
        />
      )}

      {/* Confirm */}
      {confirmAction && (
        <div
          className="pt-modal-overlay"
          onClick={() => setConfirmAction(null)}
        >
          <div className="pt-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              Confirm{" "}
              {confirmAction.type.charAt(0).toUpperCase() +
                confirmAction.type.slice(1)}
            </h3>
            <p>
              Are you sure you want to <strong>{confirmAction.type}</strong>{" "}
              <strong>{confirmAction.patient.name}</strong>?
            </p>
            <div className="pt-modal-actions">
              <button
                className="pt-modal-cancel"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                className={`pt-modal-confirm ${confirmAction.type}`}
                onClick={confirmActionHandler}
              >
                {confirmAction.type === "suspend" && <ShieldOff size={14} />}
                {confirmAction.type === "activate" && <Shield size={14} />}
                {confirmAction.type === "flag" && <Flag size={14} />}
                {confirmAction.type === "unflag" && <Check size={14} />}
                {confirmAction.type === "review" && <AlertCircle size={14} />}
                {confirmAction.type.charAt(0).toUpperCase() +
                  confirmAction.type.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════ Actions Component ═══════ */
function PatientActions({ doc, onAction, onView }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      )
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // Recalculate on scroll/resize so the menu stays aligned
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        setMenuPos({
          top: r.bottom + 4,
          right: window.innerWidth - r.right,
        });
      }
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const handleOpen = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: r.bottom + 4,
        right: window.innerWidth - r.right,
      });
    }
    setOpen((v) => !v);
  };

  const docStatus = doc.status?.toLowerCase() || "active";

  return (
    <div className="pt-actions-wrap" ref={btnRef}>
      <button className="pt-actions-btn" onClick={handleOpen}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div
          ref={menuRef}
          className="pt-actions-menu"
          style={{
            position: "fixed",
            top: menuPos.top,
            right: menuPos.right,
            left: "auto",
          }}
        >
          <button
            onClick={() => {
              onView();
              setOpen(false);
            }}
          >
            <Eye size={14} /> View Profile
          </button>
          {docStatus !== "suspended" && (
            <button
              className="pt-act-suspend"
              onClick={() => {
                onAction("suspend", doc);
                setOpen(false);
              }}
            >
              <ShieldOff size={14} /> Suspend
            </button>
          )}
          {(docStatus === "suspended" || docStatus === "inactive") && (
            <button
              className="pt-act-activate"
              onClick={() => {
                onAction("activate", doc);
                setOpen(false);
              }}
            >
              <Shield size={14} /> Activate
            </button>
          )}
          {!doc.riskFlag && (
            <button
              className="pt-act-flag"
              onClick={() => {
                onAction("flag", doc);
                setOpen(false);
              }}
            >
              <Flag size={14} /> Flag Account
            </button>
          )}
          {doc.riskFlag && (
            <button
              className="pt-act-unflag"
              onClick={() => {
                onAction("unflag", doc);
                setOpen(false);
              }}
            >
              <Check size={14} /> Clear Flag
            </button>
          )}
          <button
            onClick={() => {
              onAction("review", doc);
              setOpen(false);
            }}
          >
            <AlertCircle size={14} /> Mark for Review
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════ Detail Drawer ═══════ */
function PatientDrawer({
  doc,
  onClose,
  onAction,
  getInitials,
  getColor,
  adminNote,
  setAdminNote,
  updatePatient,
}) {
  const [tab, setTab] = useState("profile");
  const docStatus = doc.status?.toLowerCase() || "active";
  const docRisk = doc.risk?.toLowerCase() || "normal";

  return (
    <>
      <div className="pt-drawer-overlay" onClick={onClose}></div>
      <aside className="pt-drawer">
        <div className="pt-drawer-header">
          <h2>Patient Details</h2>
          <button className="pt-drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="pt-drawer-profile">
          <div
            className="pt-drawer-avatar"
            style={{ background: getColor(doc.name) }}
          >
            {doc.profileImageUrl ? (
              <img
                src={doc.profileImageUrl}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              getInitials(doc.name)
            )}
          </div>
          <div className="pt-drawer-info">
            <h3>
              {doc.name}{" "}
              {doc.riskFlag && <Flag size={14} className="pt-risk-flag" />}
            </h3>
            <span className="pt-drawer-age">
              {doc.age || "N/A"} yrs · {doc.gender || "N/A"}
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span
                className="pt-status-badge"
                style={{
                  color: STATUS_MAP[docStatus]?.color,
                  background: STATUS_MAP[docStatus]?.bg,
                }}
              >
                {STATUS_MAP[docStatus]?.label}
              </span>
              <span
                className="pt-risk-badge"
                style={{
                  color: RISK_MAP[docRisk]?.color,
                  background: RISK_MAP[docRisk]?.bg,
                }}
              >
                {RISK_MAP[docRisk]?.label}
              </span>
            </div>
          </div>
        </div>
        <div className="pt-drawer-contact">
          <div>
            <Mail size={14} /> {doc.email}
          </div>
          <div>
            <Phone size={14} /> {doc.phone || "Not provided"}
          </div>
          <div>
            <MapPin size={14} /> {doc.address || "No address on file"}
          </div>
          <div>
            <Heart size={14} /> Emergency:{" "}
            {doc.emergencyContact || "None listed"}
          </div>
        </div>
        <div className="pt-drawer-tabs">
          {["profile", "activity", "medical", "notes"].map((t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="pt-drawer-body">
          {tab === "profile" && (
            <div className="pt-drawer-section">
              <div className="pt-detail-grid">
                <div className="pt-detail-item">
                  <span className="pt-detail-label">Chronic Conditions</span>
                  <span className="pt-detail-value">
                    {doc.chronicConditions || "N/A"}
                  </span>
                </div>
                <div className="pt-detail-item">
                  <span className="pt-detail-label">Engagement</span>
                  <span className="pt-detail-value">
                    {doc.engagement || "Medium"}
                  </span>
                </div>
                <div className="pt-detail-item">
                  <span className="pt-detail-label">Last Login</span>
                  <span className="pt-detail-value">
                    {doc.lastLogin || "N/A"}
                  </span>
                </div>
                <div className="pt-detail-item">
                  <span className="pt-detail-label">Joined</span>
                  <span className="pt-detail-value">
                    {doc.createdAt
                      ? new Date(doc.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
          {tab === "activity" && (
            <div className="pt-drawer-section">
              <div className="pt-activity-stats">
                <div className="pt-stat-card">
                  <Stethoscope size={20} style={{ color: "#0891b2" }} />
                  <span className="pt-stat-val">{doc.appointments || 0}</span>
                  <span className="pt-stat-label">Appointments</span>
                </div>
                <div className="pt-stat-card">
                  <Pill size={20} style={{ color: "#10b981" }} />
                  <span className="pt-stat-val">{doc.prescriptions || 0}</span>
                  <span className="pt-stat-label">Prescriptions</span>
                </div>
                <div className="pt-stat-card">
                  <MessageSquare size={20} style={{ color: "#6366f1" }} />
                  <span className="pt-stat-val">{doc.messages || 0}</span>
                  <span className="pt-stat-label">Messages</span>
                </div>
                <div className="pt-stat-card">
                  <TrendingUp size={20} style={{ color: "#f59e0b" }} />
                  <span className="pt-stat-val">
                    {doc.engagement || "Medium"}
                  </span>
                  <span className="pt-stat-label">Engagement</span>
                </div>
              </div>
            </div>
          )}
          {tab === "medical" && (
            <div className="pt-drawer-section">
              <div className="pt-medical-snapshot">
                <div className="pt-med-block">
                  <h4>
                    <Stethoscope size={15} /> Recent Visits
                  </h4>
                  <ul>
                    {doc.recentVisits?.length > 0 ? (
                      doc.recentVisits.map((v, i) => <li key={i}>{v}</li>)
                    ) : (
                      <li>No recent visits</li>
                    )}
                  </ul>
                </div>
                <div className="pt-med-block">
                  <h4>
                    <Pill size={15} /> Current Prescriptions
                  </h4>
                  <ul>
                    {doc.latestRx?.length > 0 ? (
                      doc.latestRx.map((rx, i) => <li key={i}>{rx}</li>)
                    ) : (
                      <li>No active prescriptions</li>
                    )}
                  </ul>
                </div>
                <div className="pt-med-block">
                  <h4>
                    <Heart size={15} /> Chronic Conditions
                  </h4>
                  <p>{doc.chronicConditions || "None reported"}</p>
                </div>
              </div>
              <div className="pt-med-disclaimer">
                <AlertCircle size={12} /> Read-only medical summary for admin
                reference
              </div>
            </div>
          )}
          {tab === "notes" && (
            <div className="pt-drawer-section">
              {doc.notes && (
                <div className="pt-existing-note">
                  <MessageSquare size={14} />
                  <p>{doc.notes}</p>
                </div>
              )}
              <textarea
                className="pt-note-input"
                placeholder="Add an admin note..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
              <button
                className="pt-save-note"
                onClick={() => {
                  if (adminNote.trim()) {
                    updatePatient(doc.id, { notes: adminNote.trim() });
                    setAdminNote("");
                  }
                }}
              >
                <MessageSquare size={14} /> Save Note
              </button>
            </div>
          )}
        </div>
        <div className="pt-drawer-footer">
          {docStatus !== "suspended" && (
            <button
              className="pt-drawer-suspend"
              onClick={() => onAction("suspend", doc)}
            >
              <ShieldOff size={16} /> Suspend
            </button>
          )}
          {(docStatus === "suspended" || docStatus === "inactive") && (
            <button
              className="pt-drawer-activate"
              onClick={() => onAction("activate", doc)}
            >
              <Shield size={16} /> Activate
            </button>
          )}
          {!doc.riskFlag ? (
            <button
              className="pt-drawer-flag"
              onClick={() => onAction("flag", doc)}
            >
              <Flag size={16} /> Flag
            </button>
          ) : (
            <button
              className="pt-drawer-unflag"
              onClick={() => onAction("unflag", doc)}
            >
              <Check size={16} /> Clear Flag
            </button>
          )}
          {doc.riskFlag && (
            <div className="pt-drawer-risk">
              <AlertTriangle size={14} /> Flagged for review
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
