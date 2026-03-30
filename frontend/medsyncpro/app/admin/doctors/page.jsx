// app/admin/doctors/page.jsx
"use client";
import "./doctors.css";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Shield,
  ShieldAlert,
  Eye,
  UserPlus,
  Stethoscope,
  Clock,
  Star,
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
  ClipboardCheck,
  BadgeCheck,
  ShieldOff,
  Flag,
  MessageSquare,
  Download,
  ArrowUpDown,
  Check,
  BarChart3,
} from "lucide-react";
import { config } from "@/lib/config";
import {
  fetchDoctorsAction,
  approveVerificationByUserIdAction,
  rejectVerificationByUserIdAction,
  requestResubmitAction,
} from "@/actions/adminAction";

/* ═══════════════════════════════════════════════════════
   MOCK DATA — Rich, realistic doctor data
   ═══════════════════════════════════════════════════════ */
const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "General Medicine",
  "Oncology",
  "Ophthalmology",
  "ENT",
];

const STATUS_MAP = {
  verified: { label: "Verified", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  suspended: {
    label: "Suspended",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
  },
  inactive: {
    label: "Inactive",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
  },
};

const PAGE_SIZE = 8;

function mapApiDoctor(u) {
  const deleted = u.deleted;
  const vs = u.professionalVerificationStatus;

  let status = "pending";
  if (deleted) status = "suspended";
  else if (vs === "VERIFIED") status = "verified";
  else if (vs === "REJECTED") status = "rejected";
  else if (vs === "DOCUMENT_SUBMITTED") status = "pending";
  else status = "inactive";

  return {
    id: u.id,
    name: u.name || "Unknown",
    email: u.email || "",
    phone: u.phone || "",
    specialty: "General",
    experience: 0,
    license: "",
    status,
    accountStatus: deleted
      ? "suspended"
      : vs === "VERIFIED"
        ? "active"
        : "inactive",
    joined: u.createdAt || "",
    avatar: u.profileImageUrl || null,
    rating: 0,
    patients: 0,
    appointments: 0,
    prescriptions: 0,
    bio: "",
    address: "",
    // ── Document summary booleans (used in table row badges) ──────────────
    // Use .includes() because the full codes are e.g. "MEDICAL_LICENSE",
    // "DEGREE_CERTIFICATE", "IDENTITY_PROOF" — not the short forms.
    documents: {
      license: (u.documents || []).some((d) => d.type?.includes("LICENSE")),
      degree: (u.documents || []).some((d) => d.type?.includes("DEGREE")),
      idProof: (u.documents || []).some(
        (d) => d.type?.includes("IDENTITY") || d.type?.includes("ID_PROOF"),
      ),
    },
    // ── Raw list for the drawer preview panel ─────────────────────────────
    // DocumentResponse shape: { type, url, fileName, fileSize, status }
    rawDocuments: (u.documents || []).map((d) => ({
      type: d.type,
      url: d.url, // ← DocumentResponse.url (was d.fileUrl — wrong field name)
      fileName: d.fileName,
      fileSize: d.fileSize,
      status: d.status,
    })),
    notes: "",
    lastActive: u.updatedAt ? getTimeAgo(u.updatedAt) : "—",
    riskFlag: false,
  };
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
}

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("joined");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [drawerDoc, setDrawerDoc] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectComment, setRejectComment] = useState("");
  const [resubmitModal, setResubmitModal] = useState(null);
  const [resubmitDocs, setResubmitDocs] = useState([]);
  const [resubmitComment, setResubmitComment] = useState("");
  const [resubmitLoading, setResubmitLoading] = useState(false);

  /* ── Fetch doctors from API ── */
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchDoctorsAction();
      if (result.success) {
        setDoctors((result.content || []).map(mapApiDoctor));
      }
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  /* ── Derived data ── */
  const filtered = useMemo(() => {
    let list = [...doctors];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q) ||
          d.license.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all")
      list = list.filter((d) => d.status === statusFilter);
    if (specialtyFilter !== "all")
      list = list.filter((d) => d.specialty === specialtyFilter);

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "joined") cmp = new Date(a.joined) - new Date(b.joined);
      else if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "experience") cmp = a.experience - b.experience;
      else if (sortBy === "rating") cmp = a.rating - b.rating;
      else if (sortBy === "patients") cmp = a.patients - b.patients;
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [doctors, search, statusFilter, specialtyFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const stats = useMemo(
    () => ({
      total: doctors.length,
      verified: doctors.filter((d) => d.status === "verified").length,
      pending: doctors.filter((d) => d.status === "pending").length,
      suspended: doctors.filter((d) => d.status === "suspended").length,
      rejected: doctors.filter((d) => d.status === "rejected").length,
    }),
    [doctors],
  );

  /* ── Actions ── */
  const updateDoctor = (id, updates) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    );
    if (drawerDoc?.id === id) setDrawerDoc((prev) => ({ ...prev, ...updates }));
  };

  const handleAction = (type, doctor) => {
    setConfirmAction({ type, doctor });
  };

  const confirmActionHandler = async () => {
    if (!confirmAction) return;
    const { type, doctor } = confirmAction;

    try {
      if (type === "approve") {
        const result = await approveVerificationByUserIdAction(doctor.id);
        if (result.success) {
          updateDoctor(doctor.id, {
            status: "verified",
            accountStatus: "active",
          });
          fetchDoctors();
        }
      } else if (type === "reject") {
        const result = await rejectVerificationByUserIdAction(
          doctor.id,
          rejectComment.trim() || "Rejected by admin.",
        );
        if (result.success) {
          updateDoctor(doctor.id, {
            status: "rejected",
            accountStatus: "inactive",
          });
          fetchDoctors();
        }
      }
      // suspend / activate handled separately when those endpoints are ready
    } catch {
      /* silent */
    }

    setConfirmAction(null);
    setRejectComment("");
  };

  const handleResubmitSubmit = async () => {
    if (!resubmitModal || resubmitDocs.length === 0) return;
    setResubmitLoading(true);
    try {
      const result = await requestResubmitAction(
        resubmitModal.doctor.id,
        resubmitDocs,
        resubmitComment,
      );
      if (result.success) {
        updateDoctor(resubmitModal.doctor.id, { status: "pending" });
        fetchDoctors();
      }
    } catch {
      /* silent */
    }
    setResubmitLoading(false);
    setResubmitModal(null);
    setResubmitDocs([]);
    setResubmitComment("");
  };

  const bulkAction = async (type) => {
    const endpoint = type === "approve" ? "approve" : "suspend";
    for (const id of selected) {
      try {
        await fetch(`${config.apiUrl}/admin/users/${id}/${endpoint}`, {
          method: "PATCH",
          credentials: "include",
        });
      } catch {
        /* silent */
      }
    }
    setSelected(new Set());
    fetchDoctors();
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((d) => d.id)));
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  const getAvatarColor = (name) => {
    const colors = [
      "#0d9488",
      "#0891b2",
      "#6366f1",
      "#8b5cf6",
      "#ec4899",
      "#f59e0b",
      "#10b981",
      "#3b82f6",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="dm-page">
      {/* ── Page Header ── */}
      <div className="dm-page-header">
        <div>
          <h1 className="dm-page-title">
            <Stethoscope size={28} style={{ color: "#0d9488" }} />
            Doctors
          </h1>
          <p className="dm-page-subtitle">
            Manage, verify, and monitor all doctors on the platform
          </p>
        </div>
        <button className="dm-add-doctor-btn">
          <UserPlus size={16} /> Add Doctor
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="dm-kpi-row">
        {[
          {
            label: "Total Doctors",
            value: stats.total,
            icon: <Users size={20} />,
            color: "#0891b2",
            trend: "+12%",
          },
          {
            label: "Verified",
            value: stats.verified,
            icon: <BadgeCheck size={20} />,
            color: "#10b981",
            trend: "+8%",
          },
          {
            label: "Pending Review",
            value: stats.pending,
            icon: <Clock size={20} />,
            color: "#f59e0b",
            trend: `${stats.pending} new`,
          },
          {
            label: "Suspended",
            value: stats.suspended,
            icon: <ShieldAlert size={20} />,
            color: "#8b5cf6",
            trend: "—",
          },
        ].map((kpi, i) => (
          <div key={i} className="dm-kpi-card admin-glass-card">
            <div
              className="dm-kpi-icon"
              style={{ background: `${kpi.color}15`, color: kpi.color }}
            >
              {kpi.icon}
            </div>
            <div className="dm-kpi-value">{kpi.value}</div>
            <div className="dm-kpi-label">{kpi.label}</div>
            <span className="dm-kpi-trend" style={{ color: kpi.color }}>
              {kpi.trend}
            </span>
          </div>
        ))}
      </div>

      {/* ── Verification Queue ── */}
      {doctors.filter((d) => d.status === "pending").length > 0 && (
        <div className="dm-verification-queue admin-glass-card">
          <div className="dm-vq-header">
            <div className="dm-vq-title">
              <ShieldAlert size={18} style={{ color: "#f59e0b" }} />
              <h3>Verification Queue</h3>
              <span className="dm-vq-count">
                {doctors.filter((d) => d.status === "pending").length} pending
              </span>
            </div>
            <button
              className="dm-vq-bulk-btn"
              onClick={async () => {
                for (const d of doctors.filter((d) => d.status === "pending")) {
                  try {
                    await fetch(
                      `${config.apiUrl}/admin/users/${d.id}/approve`,
                      { method: "PATCH", credentials: "include" },
                    );
                  } catch {}
                }
                fetchDoctors();
              }}
            >
              <CheckCircle2 size={14} /> Approve All
            </button>
          </div>
          <div className="dm-vq-list">
            {doctors
              .filter((d) => d.status === "pending")
              .map((doc) => (
                <div key={doc.id} className="dm-vq-item">
                  <div
                    className="dm-vq-avatar"
                    style={{ background: getAvatarColor(doc.name) }}
                  >
                    {getInitials(doc.name)}
                  </div>
                  <div className="dm-vq-info">
                    <span className="dm-vq-name">{doc.name}</span>
                    <span className="dm-vq-meta">
                      {doc.specialty} · {doc.experience} yrs exp
                    </span>
                    <div className="dm-vq-docs">
                      {Object.entries(doc.documents).map(([key, val]) => (
                        <span
                          key={key}
                          className={`dm-doc-badge ${val ? "ok" : "missing"}`}
                        >
                          {val ? (
                            <Check size={10} />
                          ) : (
                            <AlertTriangle size={10} />
                          )}
                          {key === "license"
                            ? "License"
                            : key === "degree"
                              ? "Degree"
                              : "ID"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="dm-vq-actions">
                    <button
                      className="dm-vq-approve"
                      onClick={() => handleAction("approve", doc)}
                      title="Approve"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button
                      className="dm-vq-reject"
                      onClick={() => handleAction("reject", doc)}
                      title="Reject"
                    >
                      <XCircle size={18} />
                    </button>
                    <button
                      className="dm-vq-view"
                      onClick={() => setDrawerDoc(doc)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Filters & Search ── */}
      <div className="dm-toolbar admin-glass-card">
        <div className="dm-search-box">
          <Search size={16} className="dm-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or license..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="dm-filter-group">
          <select
            className="dm-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            className="dm-select"
            value={specialtyFilter}
            onChange={(e) => {
              setSpecialtyFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Specialties</option>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="dm-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="joined">Sort: Joined</option>
            <option value="name">Sort: Name</option>
            <option value="experience">Sort: Experience</option>
            <option value="rating">Sort: Rating</option>
            <option value="patients">Sort: Patients</option>
          </select>
          <button
            className="dm-sort-dir"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            title="Toggle sort direction"
          >
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      {/* ── Bulk Actions ── */}
      {selected.size > 0 && (
        <div className="dm-bulk-bar">
          <span>{selected.size} doctor(s) selected</span>
          <div className="dm-bulk-actions">
            <button
              className="dm-bulk-approve"
              onClick={() => bulkAction("approve")}
            >
              <CheckCircle2 size={14} /> Bulk Approve
            </button>
            <button
              className="dm-bulk-suspend"
              onClick={() => bulkAction("suspend")}
            >
              <ShieldOff size={14} /> Bulk Suspend
            </button>
            <button
              className="dm-bulk-clear"
              onClick={() => setSelected(new Set())}
            >
              <X size={14} /> Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Doctors Table ── */}
      <div className="dm-table-wrapper admin-glass-card">
        <table className="dm-table">
          <thead>
            <tr>
              <th className="dm-th-check">
                <input
                  type="checkbox"
                  checked={
                    selected.size === paginated.length && paginated.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Doctor</th>
              <th>Specialty</th>
              <th>Experience</th>
              <th>License</th>
              <th>Verification</th>
              <th>Account</th>
              <th>Joined</th>
              <th>Activity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="dm-empty">
                  <Search size={40} strokeWidth={1} />
                  <p>No doctors found matching your criteria.</p>
                </td>
              </tr>
            ) : (
              paginated.map((doc) => (
                <tr
                  key={doc.id}
                  className={selected.has(doc.id) ? "dm-row-selected" : ""}
                >
                  <td className="dm-td-check">
                    <input
                      type="checkbox"
                      checked={selected.has(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                    />
                  </td>
                  <td>
                    <div
                      className="dm-doctor-cell"
                      onClick={() => setDrawerDoc(doc)}
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="dm-doctor-avatar"
                        style={{ background: getAvatarColor(doc.name) }}
                      >
                        {getInitials(doc.name)}
                      </div>
                      <div>
                        <div className="dm-doctor-name">
                          {doc.name}
                          {doc.riskFlag && (
                            <Flag size={12} className="dm-risk-flag" />
                          )}
                        </div>
                        <div className="dm-doctor-email">{doc.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="dm-specialty-tag">{doc.specialty}</span>
                  </td>
                  <td>
                    <span className="dm-exp">{doc.experience} yrs</span>
                  </td>
                  <td>
                    <code className="dm-license">{doc.license}</code>
                  </td>
                  <td>
                    <span
                      className="dm-status-badge"
                      style={{
                        color: STATUS_MAP[doc.status]?.color,
                        background: STATUS_MAP[doc.status]?.bg,
                      }}
                    >
                      {doc.status === "verified" && <CheckCircle2 size={12} />}
                      {doc.status === "pending" && <Clock size={12} />}
                      {doc.status === "rejected" && <XCircle size={12} />}
                      {doc.status === "suspended" && <ShieldAlert size={12} />}
                      {doc.status === "inactive" && <Shield size={12} />}
                      {STATUS_MAP[doc.status]?.label}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`dm-account-dot ${doc.accountStatus}`}
                    ></span>
                    {doc.accountStatus === "active"
                      ? "Active"
                      : doc.accountStatus === "suspended"
                        ? "Suspended"
                        : "Inactive"}
                  </td>
                  <td className="dm-date">
                    {new Date(doc.joined).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span
                      className={`dm-activity ${doc.lastActive.includes("hour") || doc.lastActive.includes("min") || doc.lastActive === "Just now" ? "online" : "offline"}`}
                    >
                      <span className="dm-activity-dot"></span>
                      {doc.lastActive}
                    </span>
                  </td>
                  <td>
                    <DoctorActions
                      doc={doc}
                      onAction={handleAction}
                      onView={() => setDrawerDoc(doc)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="dm-pagination">
            <span className="dm-page-info">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="dm-page-btns">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={p === currentPage ? "active" : ""}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Analytics Section ── */}
      <div className="dm-analytics-row">
        <div className="dm-analytics-card admin-glass-card">
          <h3>
            <BarChart3 size={16} /> Specialty Distribution
          </h3>
          <div className="dm-specialty-bars">
            {SPECIALTIES.map((s) => {
              const count = doctors.filter((d) => d.specialty === s).length;
              if (count === 0) return null;
              return (
                <div key={s} className="dm-spec-bar">
                  <span className="dm-spec-label">{s}</span>
                  <div className="dm-spec-track">
                    <div
                      className="dm-spec-fill"
                      style={{ width: `${(count / doctors.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="dm-spec-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="dm-analytics-card admin-glass-card">
          <h3>
            <Activity size={16} /> Status Overview
          </h3>
          <div className="dm-status-overview">
            {Object.entries(STATUS_MAP).map(([key, val]) => {
              const count = doctors.filter((d) => d.status === key).length;
              const pct =
                doctors.length > 0
                  ? ((count / doctors.length) * 100).toFixed(0)
                  : 0;
              return (
                <div key={key} className="dm-status-row">
                  <span
                    className="dm-so-dot"
                    style={{ background: val.color }}
                  ></span>
                  <span className="dm-so-label">{val.label}</span>
                  <div className="dm-so-bar-track">
                    <div
                      className="dm-so-bar-fill"
                      style={{ width: `${pct}%`, background: val.color }}
                    ></div>
                  </div>
                  <span className="dm-so-count" style={{ color: val.color }}>
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      {drawerDoc && (
        <DoctorDrawer
          doc={drawerDoc}
          onClose={() => setDrawerDoc(null)}
          onAction={handleAction}
          onResubmit={(doctor) => setResubmitModal({ doctor })}
          getInitials={getInitials}
          getAvatarColor={getAvatarColor}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          updateDoctor={updateDoctor}
        />
      )}

      {/* ── Confirm Modal ── */}
      {confirmAction && (
        <div
          className="dm-modal-overlay"
          onClick={() => {
            setConfirmAction(null);
            setRejectComment("");
          }}
        >
          <div className="dm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              Confirm{" "}
              {confirmAction.type.charAt(0).toUpperCase() +
                confirmAction.type.slice(1)}
            </h3>
            <p>
              Are you sure you want to <strong>{confirmAction.type}</strong>{" "}
              <strong>{confirmAction.doctor.name}</strong>?
            </p>

            {confirmAction.type === "reject" && (
              <textarea
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "8px 10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 13,
                  resize: "vertical",
                  minHeight: 72,
                  outline: "none",
                  fontFamily: "inherit",
                }}
                placeholder="Reason for rejection (required)..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
              />
            )}

            <div className="dm-modal-actions">
              <button
                className="dm-modal-cancel"
                onClick={() => {
                  setConfirmAction(null);
                  setRejectComment("");
                }}
              >
                Cancel
              </button>
              <button
                className={`dm-modal-confirm ${confirmAction.type}`}
                disabled={
                  confirmAction.type === "reject" && !rejectComment.trim()
                }
                onClick={confirmActionHandler}
              >
                {confirmAction.type === "approve" && <CheckCircle2 size={14} />}
                {confirmAction.type === "reject" && <XCircle size={14} />}
                {confirmAction.type === "suspend" && <ShieldOff size={14} />}
                {confirmAction.type === "activate" && <Shield size={14} />}
                {confirmAction.type.charAt(0).toUpperCase() +
                  confirmAction.type.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
      {resubmitModal && (
        <div
          className="dm-modal-overlay"
          onClick={() => {
            setResubmitModal(null);
            setResubmitDocs([]);
            setResubmitComment("");
          }}
        >
          <div
            className="dm-modal"
            style={{ maxWidth: 440 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>⚠️ Request Document Re-upload</h3>
            <p>
              Select which documents{" "}
              <strong>{resubmitModal.doctor.name}</strong> should re-upload,
              then add an optional note.
            </p>

            {/* Document checkboxes — matches the 3 known doc types */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                margin: "12px 0",
              }}
            >
              {[
                { code: "MEDICAL_LICENSE", label: "Medical License" },
                { code: "DEGREE_CERTIFICATE", label: "Degree Certificate" },
                { code: "IDENTITY_PROOF", label: "ID Proof" },
              ].map(({ code, label }) => (
                <label
                  key={code}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: resubmitDocs.includes(code)
                      ? "#f0fdf4"
                      : "#f8fafc",
                    border: `1px solid ${resubmitDocs.includes(code) ? "#0d9488" : "#e2e8f0"}`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={resubmitDocs.includes(code)}
                    onChange={() =>
                      setResubmitDocs((prev) =>
                        prev.includes(code)
                          ? prev.filter((c) => c !== code)
                          : [...prev, code],
                      )
                    }
                    style={{ accentColor: "#0d9488" }}
                  />
                  <span style={{ fontSize: 14 }}>{label}</span>
                </label>
              ))}
            </div>

            {/* Optional admin note */}
            <textarea
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 13,
                resize: "vertical",
                minHeight: 64,
                outline: "none",
                fontFamily: "inherit",
              }}
              placeholder="Optional note to doctor (e.g. 'Image is blurry, please re-upload')..."
              value={resubmitComment}
              onChange={(e) => setResubmitComment(e.target.value)}
            />

            <div className="dm-modal-actions" style={{ marginTop: 12 }}>
              <button
                className="dm-modal-cancel"
                onClick={() => {
                  setResubmitModal(null);
                  setResubmitDocs([]);
                  setResubmitComment("");
                }}
              >
                Cancel
              </button>
              <button
                className="dm-modal-confirm reject"
                disabled={resubmitDocs.length === 0 || resubmitLoading}
                onClick={handleResubmitSubmit}
                style={{ background: "#ca8a04", borderColor: "#ca8a04" }}
              >
                {resubmitLoading ? "Sending…" : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DOCTOR ACTIONS DROPDOWN
   ═══════════════════════════════════════════════════════ */
function DoctorActions({ doc, onAction, onView }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right });
    }
    setOpen(!open);
  };

  return (
    <div className="dm-actions-wrap" ref={ref}>
      <button className="dm-actions-btn" ref={btnRef} onClick={handleToggle}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div
          className="dm-actions-menu"
          style={{
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            transform: "translateX(-100%)",
            zIndex: 9999,
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
          {doc.status === "pending" && (
            <>
              <button
                className="dm-act-approve"
                onClick={() => {
                  onAction("approve", doc);
                  setOpen(false);
                }}
              >
                <CheckCircle2 size={14} /> Approve
              </button>
              <button
                className="dm-act-reject"
                onClick={() => {
                  onAction("reject", doc);
                  setOpen(false);
                }}
              >
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
          {doc.status === "pending" && (
            <button
              className="dm-act-warn"
              style={{ color: "#ca8a04" }}
              onClick={() => {
                setResubmitModal({ doctor: doc }); // ← pass the doctor object up via onResubmit prop
                setOpen(false);
              }}
            >
              <RefreshCw size={14} /> Request Re-upload
            </button>
          )}
          {doc.status !== "suspended" && doc.status !== "pending" && (
            <button
              className="dm-act-suspend"
              onClick={() => {
                onAction("suspend", doc);
                setOpen(false);
              }}
            >
              <ShieldOff size={14} /> Suspend
            </button>
          )}
          {(doc.status === "suspended" ||
            doc.status === "rejected" ||
            doc.status === "inactive") && (
            <button
              className="dm-act-activate"
              onClick={() => {
                onAction("activate", doc);
                setOpen(false);
              }}
            >
              <Shield size={14} /> Activate
            </button>
          )}
          <button onClick={() => setOpen(false)}>
            <FileText size={14} /> View Documents
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DOCTOR DETAIL DRAWER
   ═══════════════════════════════════════════════════════ */
function DoctorDrawer({
  doc,
  onClose,
  onAction,
  onResubmit,
  getInitials,
  getAvatarColor,
  adminNote,
  setAdminNote,
  updateDoctor,
}) {
  const [activeSection, setActiveSection] = useState("profile");
  const [previewDoc, setPreviewDoc] = useState(null);

  const findDocByKey = (key) => {
    const typeMap = {
      license: "MEDICAL_LICENSE", // was "LICENSE"
      degree: "DEGREE_CERTIFICATE", // was "DEGREE"
      idProof: "IDENTITY_PROOF", // was "ID_PROOF"
    };
    return (doc.rawDocuments || []).find((d) => d.type === typeMap[key]);
  };

  const isImage = (url) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return (
      lower.includes(".jpg") ||
      lower.includes(".jpeg") ||
      lower.includes(".png") ||
      lower.includes(".gif") ||
      lower.includes(".webp")
    );
  };

  return (
    <>
      <div className="dm-drawer-overlay" onClick={onClose}></div>
      <aside className="dm-drawer">
        {/* Header */}
        <div className="dm-drawer-header">
          <h2>Doctor Details</h2>
          <button className="dm-drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Profile summary */}
        <div className="dm-drawer-profile">
          <div
            className="dm-drawer-avatar"
            style={{ background: getAvatarColor(doc.name) }}
          >
            {getInitials(doc.name)}
          </div>
          <div className="dm-drawer-info">
            <h3>
              {doc.name}
              {doc.riskFlag && <Flag size={14} className="dm-risk-flag" />}
            </h3>
            <span className="dm-drawer-specialty">{doc.specialty}</span>
            <span
              className="dm-status-badge"
              style={{
                color: STATUS_MAP[doc.status]?.color,
                background: STATUS_MAP[doc.status]?.bg,
              }}
            >
              {STATUS_MAP[doc.status]?.label}
            </span>
          </div>
        </div>

        {/* Contact */}
        <div className="dm-drawer-contact">
          <div>
            <Mail size={14} /> {doc.email}
          </div>
          <div>
            <Phone size={14} /> {doc.phone}
          </div>
          <div>
            <MapPin size={14} /> {doc.address}
          </div>
        </div>

        {/* Bio */}
        <p className="dm-drawer-bio">{doc.bio}</p>

        {/* Tab navigation */}
        <div className="dm-drawer-tabs">
          {["profile", "documents", "activity", "notes"].map((tab) => (
            <button
              key={tab}
              className={activeSection === tab ? "active" : ""}
              onClick={() => setActiveSection(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="dm-drawer-body">
          {activeSection === "profile" && (
            <div className="dm-drawer-section">
              <div className="dm-detail-grid">
                <div className="dm-detail-item">
                  <span className="dm-detail-label">Experience</span>
                  <span className="dm-detail-value">
                    {doc.experience} years
                  </span>
                </div>
                <div className="dm-detail-item">
                  <span className="dm-detail-label">License</span>
                  <span className="dm-detail-value">
                    <code>{doc.license}</code>
                  </span>
                </div>
                <div className="dm-detail-item">
                  <span className="dm-detail-label">Rating</span>
                  <span className="dm-detail-value">
                    {doc.rating > 0 ? `⭐ ${doc.rating}` : "N/A"}
                  </span>
                </div>
                <div className="dm-detail-item">
                  <span className="dm-detail-label">Joined</span>
                  <span className="dm-detail-value">
                    {new Date(doc.joined).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="dm-detail-item">
                  <span className="dm-detail-label">Last Active</span>
                  <span className="dm-detail-value">{doc.lastActive}</span>
                </div>
                <div className="dm-detail-item">
                  <span className="dm-detail-label">Account</span>
                  <span
                    className="dm-detail-value"
                    style={{ textTransform: "capitalize" }}
                  >
                    {doc.accountStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSection === "documents" && (
            <div className="dm-drawer-section">
              <div className="dm-doc-list">
                {[
                  {
                    key: "license",
                    label: "Medical License",
                    icon: <Award size={18} />,
                  },
                  {
                    key: "degree",
                    label: "Degree Certificate",
                    icon: <ClipboardCheck size={18} />,
                  },
                  {
                    key: "idProof",
                    label: "ID Proof",
                    icon: <Shield size={18} />,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`dm-doc-row ${doc.documents[item.key] ? "uploaded" : "missing"}`}
                  >
                    <div className="dm-doc-icon">{item.icon}</div>
                    <div className="dm-doc-info">
                      <span className="dm-doc-label">{item.label}</span>
                      <span
                        className={`dm-doc-status ${doc.documents[item.key] ? "ok" : "warn"}`}
                      >
                        {doc.documents[item.key] ? "✓ Uploaded" : "⚠ Missing"}
                      </span>
                    </div>
                    {doc.documents[item.key] ? (
                      <button
                        className="dm-doc-preview-btn"
                        onClick={() => {
                          const found = findDocByKey(item.key);
                          if (found) setPreviewDoc(found);
                        }}
                      >
                        <Eye size={14} /> Preview
                      </button>
                    ) : (
                      <button className="dm-doc-request-btn">
                        Request Upload
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "activity" && (
            <div className="dm-drawer-section">
              <div className="dm-activity-stats">
                <div className="dm-stat-card">
                  <Users size={20} style={{ color: "#0891b2" }} />
                  <span className="dm-stat-val">{doc.patients}</span>
                  <span className="dm-stat-label">Patients</span>
                </div>
                <div className="dm-stat-card">
                  <Calendar size={20} style={{ color: "#10b981" }} />
                  <span className="dm-stat-val">
                    {doc.appointments.toLocaleString()}
                  </span>
                  <span className="dm-stat-label">Appointments</span>
                </div>
                <div className="dm-stat-card">
                  <FileText size={20} style={{ color: "#6366f1" }} />
                  <span className="dm-stat-val">
                    {doc.prescriptions.toLocaleString()}
                  </span>
                  <span className="dm-stat-label">Prescriptions</span>
                </div>
                <div className="dm-stat-card">
                  <Star size={20} style={{ color: "#f59e0b" }} />
                  <span className="dm-stat-val">
                    {doc.rating > 0 ? doc.rating : "—"}
                  </span>
                  <span className="dm-stat-label">Rating</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === "notes" && (
            <div className="dm-drawer-section">
              {doc.notes && (
                <div className="dm-existing-note">
                  <MessageSquare size={14} />
                  <p>{doc.notes}</p>
                </div>
              )}
              <textarea
                className="dm-note-input"
                placeholder="Add an admin note..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
              <button
                className="dm-save-note"
                onClick={() => {
                  if (adminNote.trim()) {
                    updateDoctor(doc.id, { notes: adminNote.trim() });
                    setAdminNote("");
                  }
                }}
              >
                <MessageSquare size={14} /> Save Note
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="dm-drawer-footer">
          {doc.status === "pending" && (
            <>
              <button
                className="dm-drawer-approve"
                onClick={() => onAction("approve", doc)}
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button
                className="dm-drawer-reject"
                onClick={() => onAction("reject", doc)}
              >
                <XCircle size={16} /> Reject
              </button>
              <button
                className="dm-drawer-resubmit"
                onClick={() => onResubmit(doc)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1.5px solid #d97706",
                  background: "#fffbeb",
                  color: "#d97706",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                Request Re-upload
              </button>
            </>
          )}
          {doc.status === "verified" && (
            <button
              className="dm-drawer-suspend"
              onClick={() => onAction("suspend", doc)}
            >
              <ShieldOff size={16} /> Suspend
            </button>
          )}
          {(doc.status === "suspended" || doc.status === "rejected") && (
            <button
              className="dm-drawer-activate"
              onClick={() => onAction("activate", doc)}
            >
              <Shield size={16} /> Activate
            </button>
          )}
          {doc.status === "inactive" && (
            <>
              <button
                className="dm-drawer-approve"
                onClick={() => onAction("approve", doc)}
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button
                className="dm-drawer-reject"
                onClick={() => onAction("reject", doc)}
              >
                <XCircle size={16} /> Reject
              </button>
            </>
          )}
          {doc.riskFlag && (
            <div className="dm-drawer-risk">
              <AlertTriangle size={14} /> This doctor has been flagged for
              review
            </div>
          )}
        </div>

        {/* Document Preview Modal */}
        {previewDoc && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setPreviewDoc(null)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                width: "90vw",
                maxWidth: 900,
                height: "85vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    {previewDoc.type}
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>
                    {previewDoc.fileName || "Document"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <a
                    href={previewDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 13,
                      color: "#0d9488",
                      textDecoration: "none",
                      padding: "6px 12px",
                      borderRadius: 8,
                    }}
                  >
                    Open in new tab
                  </a>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 8,
                      borderRadius: "50%",
                    }}
                  >
                    <X size={18} color="#666" />
                  </button>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  overflow: "auto",
                  background: "#f8f8f8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                }}
              >
                {isImage(previewDoc.url) ? (
                  <img
                    src={previewDoc.url}
                    alt={previewDoc.type}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <iframe
                    src={previewDoc.url}
                    title={previewDoc.type}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "1px solid #e5e5e5",
                      borderRadius: 8,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
