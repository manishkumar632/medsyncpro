"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    fetchDoctorAppointments,
    updateAppointmentStatus,
    saveAppointmentNotes,
    saveAppointmentPrescription,
    rescheduleDoctorAppointment,
} from "@/actions/appointmentAction";
import RouteGuard from "../../components/RouteGuard";
import {
    Search, Plus, X, Clock, Calendar, CalendarDays,
    User, Video, Building2, Phone, Mail,
    Pill, StickyNote, Send, Eye, Play, RefreshCw, CheckCircle2,
    Timer, Filter, FileText, Stethoscope,
    ClipboardList, CalendarCheck, CalendarX, CalendarClock,
    XCircle, CircleAlert, ChevronDown, MessageSquare, Check, Loader2, AlertTriangle
} from "lucide-react";
import "../doctor-appointments.css";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

const STATUS_CONFIG = {
  PENDING: { label: "Pending", cls: "scheduled", icon: CalendarClock },
  CONFIRMED: { label: "Confirmed", cls: "confirmed", icon: CalendarCheck },
  IN_PROGRESS: { label: "In Progress", cls: "inprogress", icon: Play },
  COMPLETED: { label: "Completed", cls: "completed", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", cls: "cancelled", icon: XCircle },
  REJECTED: { label: "Rejected", cls: "cancelled", icon: XCircle },
  NO_SHOW: { label: "No Show", cls: "missed", icon: CircleAlert },
};

const VIEWS = [
    { id: "day", label: "Day", icon: Calendar },
    { id: "list", label: "List", icon: ClipboardList },
];

const STATUS_FILTERS = ["All", "Requested", "Confirmed", "In Progress", "Completed", "Cancelled"];
const STATUS_MAP = { Requested: "REQUESTED", Confirmed: "CONFIRMED", "In Progress": "IN_PROGRESS", Completed: "COMPLETED", Cancelled: "CANCELLED" };

function StatusBadge({ status }) {
    const s = STATUS_CONFIG[status] || STATUS_CONFIG.REQUESTED;
    const Icon = s.icon;
    return <span className={`da-status-badge ${s.cls}`}><Icon size={11} /> {s.label}</span>;
}

function TypeBadge({ type }) {
    return (
        <span className={`da-type-badge ${type === "VIDEO" ? "online" : "in-person"}`}>
            {type === "VIDEO" ? <Video size={11} /> : type === "CHAT" ? <MessageSquare size={11} /> : <Building2 size={11} />}
            {type === "VIDEO" ? "Video" : type === "IN_PERSON" ? "In-person" : "Chat"}
        </span>
    );
}

function formatTime12(t) {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function getColor(name) {
    const colors = ["#0d9488", "#dc2626", "#8b5cf6", "#ef4444", "#2563eb", "#059669", "#f59e0b", "#6366f1", "#f97316", "#06b6d4"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

// ═══ Summary Cards ═══
function SummaryCards({ appointments }) {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === "COMPLETED").length;
    const pending = appointments.filter(a => ["REQUESTED", "CONFIRMED"].includes(a.status)).length;
    const inProgress = appointments.filter(a => a.status === "IN_PROGRESS").length;
    const cancelled = appointments.filter(a => ["CANCELLED", "REJECTED"].includes(a.status)).length;
    const cards = [
        { label: "Total", value: total, icon: CalendarDays, cls: "total" },
        { label: "Completed", value: completed, icon: CheckCircle2, cls: "completed" },
        { label: "In Progress", value: inProgress, icon: Play, cls: "inprogress" },
        { label: "Pending", value: pending, icon: Timer, cls: "pending" },
        { label: "Cancelled", value: cancelled, icon: XCircle, cls: "cancelled" },
    ];
    return (
        <div className="da-summary-row">
            {cards.map(c => (
                <div key={c.label} className={`da-summary-card ${c.cls}`}>
                    <div className="da-summary-icon"><c.icon size={18} /></div>
                    <div>
                        <span className="da-summary-value">{c.value}</span>
                        <span className="da-summary-label">{c.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ═══ Next Appointment ═══
function NextAppointmentCard({ appointments }) {
    const next = appointments.find(a => ["REQUESTED", "CONFIRMED"].includes(a.status));
    if (!next) return null;
    return (
        <div className="da-next-card">
            <div className="da-next-label"><Clock size={13} /> Next Appointment</div>
            <div className="da-next-info">
                <div className="da-next-avatar" style={{ background: getColor(next.patientName) }}>{getInitials(next.patientName)}</div>
                <div>
                    <span className="da-next-name">{next.patientName || "Patient"}</span>
                    <span className="da-next-meta">{formatTime12(next.scheduledTime)}{next.endTime ? ` – ${formatTime12(next.endTime)}` : ""} · {next.symptoms || "Consultation"}</span>
                </div>
                <TypeBadge type={next.type} />
            </div>
        </div>
    );
}

// ═══ Day Timeline ═══
function DayTimeline({ appointments, onSelect, onAction }) {
    return (
        <div className="da-timeline">
            <div className="da-timeline-grid">
                {HOURS.map(hour => {
                    const hourAppts = appointments.filter(a => {
                        if (!a.scheduledTime) return false;
                        return parseInt(a.scheduledTime.split(":")[0]) === hour;
                    });
                    const timeLabel = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
                    return (
                      <div key={hour} className="da-timeline-row">
                        <div className="da-timeline-time">{timeLabel}</div>
                        <div className="da-timeline-slot">
                          <div className="da-timeline-line" />
                          {hourAppts.map((appt) => (
                            <div
                              key={appt.id}
                              className={`da-timeline-card ${STATUS_CONFIG[appt.status]?.cls || "scheduled"} ${appt.type === "VIDEO" ? "online" : "in-person"}`}
                              onClick={() => onSelect(appt)}
                            >
                              <div className="da-tc-header">
                                <div className="da-tc-patient">
                                  <div
                                    className="da-tc-avatar"
                                    style={{
                                      background: getColor(appt.patientName),
                                    }}
                                  >
                                    {getInitials(appt.patientName)}
                                  </div>
                                  <div>
                                    <span className="da-tc-name">
                                      {appt.patientName || "Patient"}
                                    </span>
                                    <span className="da-tc-condition">
                                      {appt.symptoms
                                        ? appt.symptoms.length > 30
                                          ? appt.symptoms.substring(0, 30) + "…"
                                          : appt.symptoms
                                        : "Consultation"}
                                    </span>
                                  </div>
                                </div>
                                <StatusBadge status={appt.status} />
                              </div>
                              <div className="da-tc-footer">
                                <span className="da-tc-time">
                                  <Clock size={11} />{" "}
                                  {formatTime12(appt.scheduledTime)}
                                  {appt.endTime
                                    ? ` – ${formatTime12(appt.endTime)}`
                                    : ""}
                                </span>
                                <TypeBadge type={appt.type} />
                              </div>
                              <div className="da-tc-actions">
                                {appt.status === "PENDING" && (
                                  <button
                                    className="da-tc-btn start"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAction("approve", appt);
                                    }}
                                  >
                                    <Check size={12} /> Approve
                                  </button>
                                )}
                                {appt.status === "CONFIRMED" && (
                                  <button
                                    className="da-tc-btn start"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAction("start", appt);
                                    }}
                                  >
                                    <Play size={12} /> Start
                                  </button>
                                )}
                                {appt.status === "IN_PROGRESS" && (
                                  <button
                                    className="da-tc-btn start"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAction("complete", appt);
                                    }}
                                  >
                                    <CheckCircle2 size={12} /> Complete
                                  </button>
                                )}
                                <button
                                  className="da-tc-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(appt);
                                  }}
                                >
                                  <Eye size={12} /> View
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                })}
            </div>
        </div>
    );
}

// ═══ List View ═══
function ListView({ appointments, onSelect, onAction }) {
    return (
      <div className="da-list-card">
        <table className="da-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              <th>Reason</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr
                key={appt.id}
                className={
                  ["CANCELLED", "REJECTED"].includes(appt.status)
                    ? "cancelled-row"
                    : ""
                }
                onClick={() => onSelect(appt)}
              >
                <td>
                  <div className="da-time-cell">
                    <Clock size={13} />
                    <div>
                      <span className="da-time-main">
                        {formatTime12(appt.scheduledTime)}
                      </span>
                      {appt.endTime && (
                        <span className="da-time-end">
                          to {formatTime12(appt.endTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="da-patient-cell">
                    <div
                      className="da-table-avatar"
                      style={{ background: getColor(appt.patientName) }}
                    >
                      {getInitials(appt.patientName)}
                    </div>
                    <div>
                      <span className="da-patient-name">
                        {appt.patientName || "Patient"}
                      </span>
                      <span className="da-patient-meta">
                        {appt.patientEmail || ""}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="da-reason-cell">{appt.symptoms || "–"}</td>
                <td>
                  <TypeBadge type={appt.type} />
                </td>
                <td>
                  <StatusBadge status={appt.status} />
                </td>
                <td>
                  <div
                    className="da-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {appt.status === "PENDING" && (
                      <>
                        <button
                          className="da-action-btn start"
                          title="Approve"
                          onClick={() => onAction("approve", appt)}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="da-action-btn"
                          title="Reject"
                          onClick={() => onAction("reject", appt)}
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                    {appt.status === "CONFIRMED" && (
                      <button
                        className="da-action-btn start"
                        title="Start"
                        onClick={() => onAction("start", appt)}
                      >
                        <Play size={14} />
                      </button>
                    )}
                    {appt.status === "IN_PROGRESS" && (
                      <button
                        className="da-action-btn start"
                        title="Complete"
                        onClick={() => onAction("complete", appt)}
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                    <button
                      className="da-action-btn"
                      title="View"
                      onClick={() => onSelect(appt)}
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
}

// ═══ Appointment Drawer ═══
function AppointmentDrawer({ appt, onClose, onAction }) {
    if (!appt) return null;
    const statusSteps = ["REQUESTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"];
    const currentIdx = statusSteps.indexOf(appt.status);

    return (
        <>
            <div className="da-drawer-overlay" onClick={onClose} />
            <aside className="da-drawer">
                <div className="da-drawer-header">
                    <h3>Appointment Details</h3>
                    <button onClick={onClose} className="da-drawer-close"><X size={18} /></button>
                </div>
                <div className="da-drawer-body">
                    {/* Patient Info */}
                    <div className="da-drawer-patient">
                        <div className="da-drawer-avatar" style={{ background: getColor(appt.patientName) }}>{getInitials(appt.patientName)}</div>
                        <div>
                            <h4 className="da-drawer-name">{appt.patientName || "Patient"}</h4>
                            <span className="da-drawer-meta">{appt.patientEmail || ""}</span>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="da-status-timeline">
                        <h5>Status</h5>
                        <div className="da-st-track">
                            {statusSteps.map((step, i) => {
                                const done = currentIdx >= 0 && i <= currentIdx && !["CANCELLED", "REJECTED"].includes(appt.status);
                                const isCurrent = i === currentIdx;
                                return (
                                    <div key={step} className={`da-st-step ${done ? "done" : ""} ${isCurrent ? "current" : ""}`}>
                                        <div className="da-st-dot" />
                                        <span>{STATUS_CONFIG[step]?.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {["CANCELLED", "REJECTED"].includes(appt.status) && (
                            <div className="da-cancelled-banner"><XCircle size={14} /> This appointment was {appt.status.toLowerCase()}</div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="da-drawer-section">
                        <h5>Details</h5>
                        <div className="da-detail-grid">
                            <div className="da-detail-item"><Calendar size={13} /> <span>{appt.scheduledDate || "—"}</span></div>
                            <div className="da-detail-item"><Clock size={13} /> <span>{formatTime12(appt.scheduledTime)}{appt.endTime ? ` – ${formatTime12(appt.endTime)}` : ""}</span></div>
                            <div className="da-detail-item">
                                {appt.type === "VIDEO" ? <Video size={13} /> : <Building2 size={13} />}
                                <span>{appt.type === "VIDEO" ? "Video" : appt.type === "IN_PERSON" ? "In-Person" : "Chat"}</span>
                            </div>
                            <div className="da-detail-item"><FileText size={13} /> <span>{appt.symptoms || "No symptoms described"}</span></div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="da-drawer-section">
                        <h5>Contact</h5>
                        <div className="da-detail-grid">
                            {appt.patientPhone && <div className="da-detail-item"><Phone size={13} /> <span>{appt.patientPhone}</span></div>}
                            {appt.patientEmail && <div className="da-detail-item"><Mail size={13} /> <span>{appt.patientEmail}</span></div>}
                        </div>
                    </div>

                    {/* Diagnosis/Notes */}
                    <div className="da-drawer-section">
                        <h5>Notes</h5>
                        {appt.doctorNotes ? (
                            <p className="da-drawer-notes">{appt.doctorNotes}</p>
                        ) : (
                            <p className="da-drawer-empty">No notes for this appointment</p>
                        )}
                        {appt.diagnosis && (
                            <div style={{ marginTop: 8, padding: 10, background: "#f0fdf4", borderRadius: 8, fontSize: "0.82rem" }}>
                                <strong style={{ color: "#16a34a" }}>Diagnosis:</strong> {appt.diagnosis}
                            </div>
                        )}
                    </div>

                    {/* Prescription */}
                    {appt.prescription && (
                        <div className="da-drawer-section">
                            <h5>Prescription</h5>
                            {appt.prescription.items?.map(item => (
                                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: "0.8rem" }}>
                                    <Pill size={14} style={{ color: "#0d9488" }} />
                                    <div style={{ flex: 1 }}>
                                        <strong>{item.medicineName}</strong>
                                        <div style={{ color: "#64748b", fontSize: "0.72rem" }}>{item.dosage} · {item.frequency} · {item.duration}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="da-drawer-footer">
                    {appt.status === "REQUESTED" && (
                        <>
                            <button className="da-btn-primary" onClick={() => onAction("approve", appt)}><Check size={14} /> Approve</button>
                            <button className="da-btn-danger-outline" onClick={() => onAction("reject", appt)}><X size={14} /> Reject</button>
                        </>
                    )}
                    {appt.status === "CONFIRMED" && (
                        <button className="da-btn-primary" onClick={() => onAction("start", appt)}><Play size={14} /> Start Consultation</button>
                    )}
                    {appt.status === "IN_PROGRESS" && (
                        <>
                            <button className="da-btn-primary" onClick={() => onAction("complete", appt)}><CheckCircle2 size={14} /> Complete</button>
                            <button className="da-btn-outline" onClick={() => onAction("prescribe", appt)}><Pill size={14} /> Prescribe</button>
                            <button className="da-btn-outline" onClick={() => onAction("notes", appt)}><StickyNote size={14} /> Notes</button>
                        </>
                    )}
                    {appt.status === "COMPLETED" && (
                        <button className="da-btn-outline"><RefreshCw size={14} /> Schedule Follow-up</button>
                    )}
                    {!["COMPLETED", "CANCELLED", "REJECTED", "NO_SHOW"].includes(appt.status) && (
                        <>
                            <button className="da-btn-outline" onClick={() => onAction("reschedule", appt)}><CalendarClock size={14} /> Reschedule</button>
                            <button className="da-btn-danger-outline" onClick={() => onAction("cancel", appt)}><XCircle size={14} /> Cancel</button>
                        </>
                    )}
                </div>
            </aside>
        </>
    );
}

// ═══ Prescription Modal ═══
function PrescriptionModal({ appt, onClose, onSave }) {
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState([{ medicineName: "", dosage: "", frequency: "", duration: "", instructions: "", quantity: null }]);
    const [saving, setSaving] = useState(false);

    const addItem = () => setItems(prev => [...prev, { medicineName: "", dosage: "", frequency: "", duration: "", instructions: "", quantity: null }]);
    const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
    const updateItem = (i, field, val) => setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

    const handleSave = async () => {
        setSaving(true);
        await onSave({ diagnosis, notes, medicines: items.filter(i => i.medicineName.trim()) });
        setSaving(false);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
            <div style={{ background: "white", borderRadius: 12, padding: 24, width: 560, maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Pill size={18} /> Create Prescription</h3>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Diagnosis</label>
                <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Enter diagnosis" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 12, fontSize: "0.85rem" }} />

                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Medications</label>
                {items.map((item, i) => (
                    <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                            <input placeholder="Medicine name *" value={item.medicineName} onChange={e => updateItem(i, "medicineName", e.target.value)} style={{ flex: 2, padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: "0.82rem" }} />
                            <input placeholder="Dosage" value={item.dosage} onChange={e => updateItem(i, "dosage", e.target.value)} style={{ flex: 1, padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: "0.82rem" }} />
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input placeholder="Frequency" value={item.frequency} onChange={e => updateItem(i, "frequency", e.target.value)} style={{ flex: 1, padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: "0.82rem" }} />
                            <input placeholder="Duration" value={item.duration} onChange={e => updateItem(i, "duration", e.target.value)} style={{ flex: 1, padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: "0.82rem" }} />
                            <input placeholder="Instructions" value={item.instructions} onChange={e => updateItem(i, "instructions", e.target.value)} style={{ flex: 1, padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: "0.82rem" }} />
                            {items.length > 1 && <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}><X size={16} /></button>}
                        </div>
                    </div>
                ))}
                <button onClick={addItem} style={{ background: "none", border: "1px dashed #e2e8f0", width: "100%", padding: 8, borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", color: "#64748b", marginBottom: 12 }}>+ Add Medicine</button>

                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Notes (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 16, fontSize: "0.82rem", minHeight: 50, fontFamily: "inherit", resize: "vertical" }} />

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose} className="da-btn-outline">Cancel</button>
                    <button onClick={handleSave} disabled={saving || !items.some(i => i.medicineName.trim())} className="da-btn-primary">
                        {saving ? "Saving..." : "Save Prescription"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ═══ Notes Modal ═══
function NotesModal({ appt, onClose, onSave }) {
    const [doctorNotes, setDoctorNotes] = useState(appt?.doctorNotes || "");
    const [diagnosis, setDiagnosis] = useState(appt?.diagnosis || "");
    const [followUpDate, setFollowUpDate] = useState(appt?.followUpDate || "");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSave({ doctorNotes, diagnosis, followUpDate: followUpDate || null });
        setSaving(false);
    };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={onClose}>
            <div style={{ background: "white", borderRadius: 12, padding: 24, width: 460, maxWidth: "95vw" }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><StickyNote size={18} /> Doctor Notes</h3>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Diagnosis</label>
                <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Enter diagnosis" style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 12, fontSize: "0.85rem" }} />
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Private Notes</label>
                <textarea value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)} placeholder="Clinical notes..." style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 12, fontSize: "0.85rem", minHeight: 80, fontFamily: "inherit", resize: "vertical" }} />
                <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Follow-up Date (optional)</label>
                <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 16, fontSize: "0.85rem" }} />
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose} className="da-btn-outline">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="da-btn-primary">{saving ? "Saving..." : "Save Notes"}</button>
                </div>
            </div>
        </div>
    );
}

// ═══ MAIN PAGE ═══
function DoctorAppointmentsPage() {
    const { user } = useAuth();
    const [view, setView] = useState("list");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Modals
    const [prescribeAppt, setPrescribeAppt] = useState(null);
    const [notesAppt, setNotesAppt] = useState(null);

    async function fetchAppointments() {
        setLoading(true);
        try {
            const result = await fetchDoctorAppointments(0, 50);
            if (result.success) {
                const pageData = result.data;
                setAppointments(pageData?.content || pageData || []);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    useEffect(() => {
        const id = setTimeout(() => {
            fetchAppointments();
        }, 0);
        return () => clearTimeout(id);
    }, []);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAction = async (action, appt) => {
        try {
            let actionName, body = null;
            switch (action) {
                case "approve":
                    actionName = "approve";
                    break;
                case "reject":
                    const reason = prompt("Reason for rejection:");
                    if (reason === null) return;
                    actionName = "reject";
                    body = { reason };
                    break;
                case "start":
                    actionName = "approve";
                    break;
                case "complete":
                    actionName = "complete";
                    break;
                case "cancel":
                    const cancelReason = prompt("Reason for cancellation:");
                    if (cancelReason === null) return;
                    actionName = "cancel";
                    body = { reason: cancelReason };
                    break;
                case "reschedule":
                    const newDate = prompt("New date (YYYY-MM-DD):");
                    if (!newDate) return;
                    const newTime = prompt("New time (HH:mm):");
                    if (!newTime) return;
                    const rescheduleReason = prompt("Reason for reschedule (optional):") || "";
                    const rescheduleResult = await rescheduleDoctorAppointment(appt.id, {
                        scheduledDate: newDate,
                        scheduledTime: newTime,
                        reason: rescheduleReason,
                    });
                    if (rescheduleResult.success) {
                        showToast("success", "Appointment rescheduled successfully");
                        fetchAppointments();
                        setSelectedAppt(null);
                    } else {
                        showToast("error", rescheduleResult.message || "Reschedule failed");
                    }
                    return;
                case "prescribe":
                    setPrescribeAppt(appt);
                    return;
                case "notes":
                    setNotesAppt(appt);
                    return;
                default: return;
            }
            const result = await updateAppointmentStatus(appt.id, actionName, body);
            if (result.success) {
                showToast("success", `Appointment ${action}d successfully`);
                fetchAppointments();
                setSelectedAppt(null);
            } else {
                showToast("error", result.message || "Action failed");
            }
        } catch (err) {
            showToast("error", "Network error");
        }
    };

    const handleSavePrescription = async (prescriptionData) => {
        try {
            const result = await saveAppointmentPrescription(prescribeAppt.id, prescriptionData);
            if (result.success) {
                showToast("success", "Prescription created");
                fetchAppointments();
                setPrescribeAppt(null);
            } else {
                showToast("error", result.message || "Failed");
            }
        } catch (err) {
            showToast("error", "Network error");
        }
    };

    const handleSaveNotes = async (notesData) => {
        try {
            const result = await saveAppointmentNotes(notesAppt.id, notesData);
            if (result.success) {
                showToast("success", "Notes saved");
                fetchAppointments();
                setNotesAppt(null);
            } else {
                showToast("error", result.message || "Failed");
            }
        } catch (err) {
            showToast("error", "Network error");
        }
    };

    const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const filtered = useMemo(() => {
        return appointments.filter(a => {
            const matchSearch = !search.trim() ||
                a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
                a.symptoms?.toLowerCase().includes(search.toLowerCase());
            const matchStatus = statusFilter === "All" ||
                STATUS_CONFIG[a.status]?.label === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [search, statusFilter, appointments]);

    if (loading) return <div className="da-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}><div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#0d9488", borderRadius: "50%", animation: "rg-spin 0.6s linear infinite" }} /><style>{`@keyframes rg-spin { to { transform: rotate(360deg); } }`}</style></div>;

    return (
        <div className="da-page">
            <div className="da-header">
                <div>
                    <h1 className="da-title">Appointments</h1>
                    <p className="da-subtitle">{dateStr}</p>
                </div>
            </div>

            <SummaryCards appointments={appointments} />
            <NextAppointmentCard appointments={filtered} />

            <div className="da-toolbar">
                <div className="da-search">
                    <Search size={16} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient name or symptoms..." />
                    {search && <button className="da-search-clear" onClick={() => setSearch("")}><X size={14} /></button>}
                </div>
                <div className="da-filter-pills">
                    {STATUS_FILTERS.map(f => (
                        <button key={f} className={`da-filter-pill ${statusFilter === f ? "active" : ""}`} onClick={() => setStatusFilter(f)}>{f}</button>
                    ))}
                </div>
                <div className="da-view-switcher">
                    {VIEWS.map(v => (
                        <button key={v.id} className={`da-view-btn ${view === v.id ? "active" : ""}`} onClick={() => setView(v.id)}>
                            <v.icon size={14} /> {v.label}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length > 0 ? (
                view === "day" ? (
                    <DayTimeline appointments={filtered} onSelect={setSelectedAppt} onAction={handleAction} />
                ) : (
                    <ListView appointments={filtered} onSelect={setSelectedAppt} onAction={handleAction} />
                )
            ) : (
                <div className="da-empty">
                    <CalendarX size={40} />
                    <h3>No appointments found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            )}

            <AppointmentDrawer appt={selectedAppt} onClose={() => setSelectedAppt(null)} onAction={handleAction} />

            {/* Prescription Modal */}
            {prescribeAppt && <PrescriptionModal appt={prescribeAppt} onClose={() => setPrescribeAppt(null)} onSave={handleSavePrescription} />}

            {/* Notes Modal */}
            {notesAppt && <NotesModal appt={notesAppt} onClose={() => setNotesAppt(null)} onSave={handleSaveNotes} />}

            {/* Toast */}
            {toast && (
                <div style={{
                    position: "fixed", bottom: 24, right: 24, padding: "12px 20px", borderRadius: 10,
                    fontSize: "0.85rem", fontWeight: 500, color: "white", zIndex: 1100,
                    background: toast.type === "success" ? "#16a34a" : "#dc2626",
                    boxShadow: "0 8px 20px rgba(0,0,0,.15)",
                    animation: "pw-slide-in 0.3s ease",
                }}>
                    {toast.message}
                </div>
            )}
            <style>{`@keyframes pw-slide-in { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
    );
}

export default function DoctorAppointmentsWrapper() {
    return (
        <RouteGuard allowedRoles={["DOCTOR"]}>
            <DoctorAppointmentsPage />
        </RouteGuard>
    );
}
