"use client";
import { useState, useEffect, useCallback } from "react";
import { fetchPatientPrescriptionsAction } from "@/actions/patientAction";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(d) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(d);
}

function doctorDisplay(name) {
  if (!name) return "Unknown Doctor";
  return /^Dr\.?\s/i.test(name) ? name : `Dr. ${name}`;
}

/* ── Doctor Avatar ───────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "#0d9488",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#059669",
];

function DoctorAvatar({ name, src, size = 42 }) {
  const [imgErr, setImgErr] = useState(false);
  const initials =
    (name ?? "")
      .replace(/^Dr\.?\s*/i, "")
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "DR";
  const bg = AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

  if (src && !imgErr) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgErr(true)}
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
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.33,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

/* ── Pill Icon ───────────────────────────────────────────────────────────── */
function PillIcon({ size = 12, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.5 4.5a6 6 0 0 1 8.5 8.5l-10 10-3-1-1-3 10-10z" />
      <path d="m7 7 2 2" />
    </svg>
  );
}

/* ── Skeleton Card ───────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="prx-skeleton">
      <div className="prx-skel-row">
        <div className="prx-skel-circle" />
        <div style={{ flex: 1 }}>
          <div className="prx-skel-line--lg" />
          <div className="prx-skel-line--sm" />
        </div>
      </div>
      <div className="prx-skel-line--md" />
      <div className="prx-skel-pills">
        <div className="prx-skel-pill" style={{ width: 90 }} />
        <div className="prx-skel-pill" style={{ width: 80 }} />
        <div className="prx-skel-pill" style={{ width: 70 }} />
      </div>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────────────────────── */
function EmptyState({ isFiltered }) {
  return (
    <div className="prx-empty">
      <div className="prx-empty-icon">
        <PillIcon size={34} color="#0d9488" />
      </div>
      <h3>
        {isFiltered ? "No matching prescriptions" : "No prescriptions yet"}
      </h3>
      <p>
        {isFiltered
          ? "Try adjusting your search terms or clearing the filter."
          : "Prescriptions issued by your doctors will appear here once they're ready."}
      </p>
    </div>
  );
}

/* ── Medicine Card (inside drawer) ──────────────────────────────────────── */
function DrawerMedCard({ med, index }) {
  const colorIndex = index % 5;
  return (
    <div className={`prx-med-card prx-med-card--${colorIndex}`}>
      <div className="prx-med-card-top">
        <div className={`prx-med-card-dot prx-med-card--${colorIndex}`} />
        <span className="prx-med-card-name">{med.name || "—"}</span>
        {med.dosage && (
          <span className={`prx-med-card-dosage prx-med-card--${colorIndex}`}>
            {med.dosage}
          </span>
        )}
      </div>
      {(med.frequency || med.duration) && (
        <div className="prx-med-card-details">
          {med.frequency && (
            <div className="prx-med-detail-item">
              <span className="prx-med-detail-key">Frequency</span>
              <span className="prx-med-detail-val">{med.frequency}</span>
            </div>
          )}
          {med.duration && (
            <div className="prx-med-detail-item">
              <span className="prx-med-detail-key">Duration</span>
              <span className="prx-med-detail-val">{med.duration}</span>
            </div>
          )}
        </div>
      )}
      {med.instructions && (
        <div className={`prx-med-card-note prx-med-card--${colorIndex}`}>
          💡 {med.instructions}
        </div>
      )}
    </div>
  );
}

/* ── Detail Drawer ───────────────────────────────────────────────────────── */
function PrescriptionDrawer({ rx, onClose }) {
  const meds = Array.isArray(rx.medicines) ? rx.medicines : [];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <>
      <div className="prx-overlay" onClick={onClose} />
      <aside
        className="prx-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Prescription detail"
      >
        {/* Header */}
        <div className="prx-drawer-header">
          <div className="prx-drawer-title-row">
            <div className="prx-drawer-icon">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12h6M12 9v6" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div>
              <h2 className="prx-drawer-title">Prescription Detail</h2>
              <p className="prx-drawer-date">
                {formatDate(rx.scheduledDate || rx.createdAt)}
              </p>
            </div>
          </div>
          <button
            className="prx-drawer-close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="prx-drawer-body">
          {/* ── Doctor ── */}
          <div className="prx-drawer-doctor-card">
            <DoctorAvatar name={rx.doctorName} src={rx.doctorImage} size={50} />
            <div>
              <div className="prx-drawer-doctor-name">
                {doctorDisplay(rx.doctorName)}
              </div>
              {rx.doctorSpecialty && (
                <div className="prx-drawer-doctor-spec">
                  {rx.doctorSpecialty}
                </div>
              )}
              <div className="prx-drawer-doctor-when">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDate(rx.scheduledDate || rx.createdAt)}
              </div>
            </div>
          </div>

          {/* ── Clinical Info ── */}
          {(rx.diagnosis || rx.symptoms) && (
            <div>
              <div className="prx-drawer-section-label">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Clinical Info
              </div>
              <div className="prx-clinical-grid">
                {rx.diagnosis && (
                  <div className="prx-clinical-box prx-clinical-box--teal">
                    <div className="prx-clinical-box-label">Diagnosis</div>
                    <div className="prx-clinical-box-text">{rx.diagnosis}</div>
                  </div>
                )}
                {rx.symptoms && (
                  <div className="prx-clinical-box prx-clinical-box--blue">
                    <div className="prx-clinical-box-label">Symptoms</div>
                    <div className="prx-clinical-box-text">{rx.symptoms}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Medications ── */}
          <div>
            <div className="prx-drawer-section-label">
              <PillIcon size={12} color="#7c3aed" />
              Medications ({meds.length})
            </div>
            {meds.length === 0 ? (
              <div className="prx-no-meds">
                No medications recorded for this prescription.
              </div>
            ) : (
              <div className="prx-med-cards">
                {meds.map((med, i) => (
                  <DrawerMedCard key={i} med={med} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* ── Doctor's Notes ── */}
          {rx.notes && (
            <div className="prx-notes-box">
              <div className="prx-notes-label">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Doctor&apos;s Notes
              </div>
              <p className="prx-notes-text">{rx.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="prx-drawer-footer">
          <button className="prx-btn-ghost" onClick={onClose}>
            Close
          </button>
          <button className="prx-btn-primary" onClick={() => window.print()}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Prescription Card ───────────────────────────────────────────────────── */
function PrescriptionCard({ rx, onClick }) {
  const meds = Array.isArray(rx.medicines) ? rx.medicines : [];
  const shownMeds = meds.slice(0, 2);
  const hiddenCount = meds.length - 2;
  const dateLabel = rx.scheduledDate || rx.createdAt;

  return (
    <article
      className="prx-card"
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      role="button"
      aria-label={`Prescription from ${doctorDisplay(rx.doctorName)}`}
    >
      {/* Top colour accent */}
      <div className="prx-card-bar" />

      {/* Doctor row */}
      <div className="prx-card-doctor">
        <div className="prx-card-doctor-left">
          <DoctorAvatar name={rx.doctorName} src={rx.doctorImage} size={42} />
          <div style={{ minWidth: 0 }}>
            <div className="prx-doctor-name">
              {doctorDisplay(rx.doctorName)}
            </div>
            {rx.doctorSpecialty && (
              <div className="prx-doctor-specialty">{rx.doctorSpecialty}</div>
            )}
          </div>
        </div>
        <div className="prx-card-meta">
          <span className="prx-card-date">{timeAgo(dateLabel)}</span>
          <span className="prx-card-count">
            {meds.length} med{meds.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Diagnosis */}
      {rx.diagnosis && (
        <div className="prx-card-diagnosis">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="prx-card-diagnosis-label">Diagnosis:</span>
          <span className="prx-card-diagnosis-text">{rx.diagnosis}</span>
        </div>
      )}

      {/* Medicine pills */}
      {meds.length > 0 && (
        <div className="prx-card-meds">
          {shownMeds.map((med, i) => (
            <span key={i} className="prx-med-pill">
              <PillIcon size={10} />
              {med.name}
              {med.dosage ? ` ${med.dosage}` : ""}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="prx-med-pill prx-med-pill--more">
              +{hiddenCount} more
            </span>
          )}
        </div>
      )}

      {/* Card footer */}
      <div className="prx-card-footer">
        <div className="prx-card-footer-detail">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {formatDate(dateLabel)}
        </div>
        <button
          className="prx-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Details
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 12;

export default function PatientPrescriptions() {
  const [allPrescriptions, setAllPrescriptions] = useState([]); // current page data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "recent"
  const [selectedRx, setSelectedRx] = useState(null);
  const [spinning, setSpinning] = useState(false);

  // ── Load page from backend ────────────────────────────────────────────
  const load = useCallback(async (p = 0, animate = false) => {
    setLoading(true);
    setError(null);
    if (animate) setSpinning(true);

    try {
      const res = await fetchPatientPrescriptionsAction(p, PAGE_SIZE);

      if (!res?.success) {
        setError(res?.message || "Failed to load prescriptions.");
        return;
      }

      const data = res.data;

      // Spring Page envelope
      if (data && typeof data === "object" && "content" in data) {
        setAllPrescriptions(data.content ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotalElements(data.totalElements ?? data.content?.length ?? 0);
      } else if (Array.isArray(data)) {
        setAllPrescriptions(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setAllPrescriptions([]);
        setTotalPages(0);
        setTotalElements(0);
      }

      setPage(p);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      if (animate) setTimeout(() => setSpinning(false), 600);
    }
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  // ── Client-side search + filter ───────────────────────────────────────
  const displayed = (() => {
    let list = allPrescriptions;

    if (filter === "recent") {
      const cutoff = Date.now() - 30 * 86400000; // last 30 days
      list = list.filter((rx) => {
        const d = rx.scheduledDate || rx.createdAt;
        return d && new Date(d).getTime() >= cutoff;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (rx) =>
          rx.doctorName?.toLowerCase().includes(q) ||
          rx.doctorSpecialty?.toLowerCase().includes(q) ||
          rx.diagnosis?.toLowerCase().includes(q) ||
          rx.symptoms?.toLowerCase().includes(q) ||
          (Array.isArray(rx.medicines) &&
            rx.medicines.some((m) => m.name?.toLowerCase().includes(q))),
      );
    }

    return list;
  })();

  // ── Derived stats ─────────────────────────────────────────────────────
  const uniqueDoctors = new Set(
    allPrescriptions.map((r) => r.doctorName).filter(Boolean),
  ).size;
  const totalMeds = allPrescriptions.reduce(
    (s, r) => s + (Array.isArray(r.medicines) ? r.medicines.length : 0),
    0,
  );

  /* ──────────────────────────── RENDER ──────────────────────────────── */
  return (
    <main className="prx-page">
      {/* ── Header ── */}
      <div className="prx-header">
        <div className="prx-title-wrap">
          <h1 className="prx-title">
            <div className="prx-title-icon">
              <PillIcon size={22} color="#0d9488" />
            </div>
            My Prescriptions
          </h1>
          <p className="prx-subtitle">
            {totalElements > 0
              ? `${totalElements} prescription${totalElements !== 1 ? "s" : ""} from your doctors`
              : "Prescriptions issued by your doctors will appear here"}
          </p>
        </div>
      </div>

      {/* ── Stats Row (only when we have data) ── */}
      {!loading && allPrescriptions.length > 0 && (
        <div className="prx-stats-row">
          <div className="prx-stat-card prx-stat-card--teal">
            <div className="prx-stat-icon prx-stat-icon--teal">
              <PillIcon size={20} color="#0d9488" />
            </div>
            <div>
              <div className="prx-stat-value">{totalElements}</div>
              <div className="prx-stat-label">Total Prescriptions</div>
            </div>
          </div>
          <div className="prx-stat-card prx-stat-card--blue">
            <div className="prx-stat-icon prx-stat-icon--blue">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div className="prx-stat-value">{uniqueDoctors}</div>
              <div className="prx-stat-label">Unique Doctors</div>
            </div>
          </div>
          <div className="prx-stat-card prx-stat-card--purple">
            <div className="prx-stat-icon prx-stat-icon--purple">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M10.5 4.5a6 6 0 0 1 8.5 8.5l-10 10-3-1-1-3 10-10z" />
                <path d="m7 7 2 2" />
              </svg>
            </div>
            <div>
              <div className="prx-stat-value">{totalMeds}</div>
              <div className="prx-stat-label">Total Medications</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="prx-toolbar">
        {/* Search */}
        <div className="prx-search-wrap">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="prx-search-input"
            placeholder="Search by doctor, medicine, diagnosis…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="prx-clear-btn"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="prx-filter-pills">
          {[
            { id: "all", label: "All" },
            { id: "recent", label: "Last 30 days" },
          ].map((f) => (
            <button
              key={f.id}
              className={`prx-pill ${filter === f.id ? "prx-pill--active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          className={`prx-refresh-btn ${spinning ? "prx-refresh-btn--spinning" : ""}`}
          onClick={() => load(page, true)}
          aria-label="Refresh prescriptions"
          title="Refresh"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && !loading && (
        <div className="prx-error-banner" role="alert">
          <span>⚠️ {error}</span>
          <button className="prx-retry-btn" onClick={() => load(page, true)}>
            Retry
          </button>
        </div>
      )}

      {/* ── Card Grid ── */}
      <div className="prx-grid">
        {loading ? (
          [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
        ) : displayed.length === 0 ? (
          <EmptyState isFiltered={!!search || filter !== "all"} />
        ) : (
          displayed.map((rx) => (
            <PrescriptionCard
              key={rx.id}
              rx={rx}
              onClick={() => setSelectedRx(rx)}
            />
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && !search && (
        <div className="prx-pagination">
          <span className="prx-page-info">
            Page {page + 1} of {totalPages} · {totalElements} total
          </span>
          <div className="prx-page-btns">
            <button
              className="prx-page-btn"
              disabled={page === 0}
              onClick={() => load(page - 1)}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Prev
            </button>
            <button
              className="prx-page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => load(page + 1)}
            >
              Next
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selectedRx && (
        <PrescriptionDrawer
          rx={selectedRx}
          onClose={() => setSelectedRx(null)}
        />
      )}
    </main>
  );
}
