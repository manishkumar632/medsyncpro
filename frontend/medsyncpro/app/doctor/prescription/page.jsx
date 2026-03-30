"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchDoctorPatientsAction,
  fetchPatientAppointmentsAction,
  savePrescriptionAction,
} from "@/actions/doctorAction";
import "./doctor-prescription.css";

// ─── Quick Templates ───────────────────────────────────────────────────────────
const QUICK_TEMPLATES = [
  {
    id: "hypertension",
    label: "Hypertension Standard",
    emoji: "💊",
    diagnosis: "Essential Hypertension",
    notes: "Monitor BP daily. Low sodium diet. Regular follow-up.",
    medicines: [
      {
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once daily (OD)",
        duration: "30 days",
        instructions: "Take in the morning",
      },
      {
        name: "Losartan",
        dosage: "50mg",
        frequency: "Once daily (OD)",
        duration: "30 days",
        instructions: "After meals",
      },
    ],
  },
  {
    id: "postsurgery",
    label: "Post-Surgery Recovery",
    emoji: "🩺",
    diagnosis: "Post-operative care",
    notes: "Rest for 7 days. Keep wound dry. Watch for signs of infection.",
    medicines: [
      {
        name: "Amoxicillin + Clavulanate",
        dosage: "625mg",
        frequency: "Twice daily (BD)",
        duration: "7 days",
        instructions: "After meals",
      },
      {
        name: "Paracetamol",
        dosage: "650mg",
        frequency: "SOS (as needed)",
        duration: "5 days",
        instructions: "For pain/fever",
      },
      {
        name: "Pantoprazole",
        dosage: "40mg",
        frequency: "Once daily (OD)",
        duration: "7 days",
        instructions: "Before breakfast",
      },
    ],
  },
  {
    id: "cardiac",
    label: "Cardiac Maintenance",
    emoji: "❤️",
    diagnosis: "Stable Coronary Artery Disease",
    notes: "Lifestyle modification. No smoking. Exercise 30 min/day.",
    medicines: [
      {
        name: "Aspirin",
        dosage: "75mg",
        frequency: "Once daily (OD)",
        duration: "90 days",
        instructions: "After meals",
      },
      {
        name: "Atorvastatin",
        dosage: "40mg",
        frequency: "Once at bedtime",
        duration: "90 days",
        instructions: "At night",
      },
      {
        name: "Metoprolol",
        dosage: "25mg",
        frequency: "Twice daily (BD)",
        duration: "90 days",
        instructions: "Morning & evening",
      },
    ],
  },
  {
    id: "diabetes",
    label: "Diabetes Management",
    emoji: "🩸",
    diagnosis: "Type 2 Diabetes Mellitus",
    notes: "Monitor blood sugar daily. Low carb diet. HbA1c check in 3 months.",
    medicines: [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily (BD)",
        duration: "30 days",
        instructions: "After meals",
      },
      {
        name: "Glimepiride",
        dosage: "1mg",
        frequency: "Once daily (OD)",
        duration: "30 days",
        instructions: "Before breakfast",
      },
    ],
  },
];

const EMPTY_MEDICINE = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (
    now.getMonth() - birth.getMonth() < 0 ||
    (now.getMonth() - birth.getMonth() === 0 && now.getDate() < birth.getDate())
  )
    age--;
  return age;
}
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

// ─── PatientAvatar ─────────────────────────────────────────────────────────────
function PatientAvatar({ name, src, size = 40 }) {
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.36,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─── Discard Dialog ────────────────────────────────────────────────────────────
function DiscardDialog({ onConfirm, onCancel }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onCancel]);
  return (
    <div
      className="rx-discard-overlay"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="rx-discard-dialog">
        <div className="rx-discard-icon">⚠️</div>
        <div className="rx-discard-body">
          <h3 className="rx-discard-title">Discard changes?</h3>
          <p className="rx-discard-text">
            You have unsaved prescription data. This will be permanently lost.
          </p>
        </div>
        <div className="rx-discard-actions">
          <button
            className="rx-btn-ghost"
            onClick={onCancel}
            type="button"
            autoFocus
          >
            Keep editing
          </button>
          <button
            className="rx-discard-confirm-btn"
            onClick={onConfirm}
            type="button"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
// Works as a standalone Next.js page (no props → navigates to /doctor/prescriptions on close)
// OR as an embedded modal (with onClose/onSaved props).
export default function NewPrescriptionModal({ onClose, onSaved } = {}) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [patientAppointments, setPatientAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([{ ...EMPTY_MEDICINE }]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const errorRef = useRef(null);

  const hasUnsavedData = useCallback(
    () =>
      !!selectedPatient ||
      !!diagnosis.trim() ||
      !!notes.trim() ||
      medicines.some((m) => m.name.trim()),
    [selectedPatient, diagnosis, notes, medicines],
  );

  // ── THE FIX: go to prescriptions LIST, not router.back() ──────────────────
  const doClose = useCallback(() => {
    if (typeof onClose === "function") onClose();
    else router.push("/doctor/prescriptions");
  }, [onClose, router]);

  const handleClose = useCallback(() => {
    if (hasUnsavedData()) setShowDiscardDialog(true);
    else doClose();
  }, [hasUnsavedData, doClose]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") {
        if (showSuggestions) {
          setShowSuggestions(false);
          return;
        }
        if (showDiscardDialog) return;
        handleClose();
      }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [showSuggestions, showDiscardDialog, handleClose]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetchDoctorPatientsAction(0, 6, searchQuery.trim());
        const list =
          res?.data?.content ?? (Array.isArray(res?.data) ? res.data : []);
        setSuggestions(list);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    setApptLoading(true);
    setSelectedAppointment(null);
    setPatientAppointments([]);
    fetchPatientAppointmentsAction(selectedPatient.id)
      .then((res) =>
        setPatientAppointments(
          res?.success && Array.isArray(res.data) ? res.data : [],
        ),
      )
      .catch(() => setPatientAppointments([]))
      .finally(() => setApptLoading(false));
  }, [selectedPatient]);

  useEffect(() => {
    if (error && errorRef.current)
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [error]);

  function handleSelectPatient(p) {
    setSelectedPatient(p);
    setSearchQuery(p.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setError("");
  }
  function handleClearPatient() {
    setSelectedPatient(null);
    setSearchQuery("");
    setPatientAppointments([]);
    setSelectedAppointment(null);
    setError("");
    setTimeout(() => searchRef.current?.focus(), 50);
  }
  function applyTemplate(tpl) {
    setDiagnosis(tpl.diagnosis);
    setNotes(tpl.notes);
    setMedicines(tpl.medicines.map((m) => ({ ...m })));
    setError("");
  }
  function updateMed(idx, field, val) {
    setMedicines((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: val } : m)),
    );
  }

  async function handleSave() {
    if (!selectedPatient) {
      setError("Please search and select a patient first.");
      return;
    }
    if (!selectedAppointment) {
      setError("Please select an appointment to link this prescription to.");
      return;
    }
    if (!medicines.some((m) => m.name.trim())) {
      setError("Add at least one medication with a name.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await savePrescriptionAction(selectedAppointment.id, {
        diagnosis,
        notes,
        medicines: medicines.filter((m) => m.name.trim()),
      });
      if (res?.success) {
        setSuccess(true);
        setTimeout(() => {
          if (typeof onSaved === "function") onSaved();
          doClose();
        }, 1400);
      } else {
        setError(
          res?.message || "Failed to save prescription. Please try again.",
        );
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const age = calcAge(selectedPatient?.dateOfBirth);
  const genderLabel =
    selectedPatient?.gender === "MALE"
      ? "Male"
      : selectedPatient?.gender === "FEMALE"
        ? "Female"
        : selectedPatient?.gender || "";

  if (success) {
    return (
      <div className="rx-modal-overlay">
        <div
          className="rx-modal"
          style={{ textAlign: "center", padding: "52px 32px" }}
        >
          <div style={{ fontSize: 58, marginBottom: 16 }}>✅</div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#065f46",
              margin: "0 0 8px",
            }}
          >
            Prescription Saved!
          </h3>
          <p style={{ color: "#047857", fontSize: "0.88rem" }}>
            {selectedPatient?.name
              ? `${selectedPatient.name} has been notified.`
              : "The patient has been notified."}
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginTop: 6 }}>
            Redirecting to prescriptions list…
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showDiscardDialog && (
        <DiscardDialog
          onConfirm={() => {
            setShowDiscardDialog(false);
            doClose();
          }}
          onCancel={() => setShowDiscardDialog(false)}
        />
      )}
      <div
        className="rx-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="rx-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="rx-modal-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="rx-modal-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M9 12h6M12 9v6M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
                </svg>
              </div>
              <div>
                <h2 className="rx-modal-title">New Prescription</h2>
                <p className="rx-modal-subtitle">
                  Search patient · link appointment · add medications
                </p>
              </div>
            </div>
            <button
              className="rx-modal-close"
              onClick={handleClose}
              type="button"
            >
              <svg
                width="18"
                height="18"
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

          <div className="rx-modal-body">
            {/* Quick Templates */}
            <section className="rx-modal-section">
              <label className="rx-modal-section-label">Quick Templates</label>
              <div className="rx-tpl-grid">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    className="rx-tpl-btn"
                    onClick={() => applyTemplate(tpl)}
                    type="button"
                  >
                    <span className="rx-tpl-emoji">{tpl.emoji}</span>
                    {tpl.label}
                  </button>
                ))}
              </div>
            </section>

            <div className="rx-modal-divider" />

            {/* Patient Search */}
            <section className="rx-modal-section">
              <label className="rx-modal-section-label rx-modal-required">
                Patient
              </label>
              {!selectedPatient ? (
                <div className="rx-patient-search-wrap" ref={dropdownRef}>
                  <div className="rx-patient-search-input-row">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      ref={searchRef}
                      type="text"
                      className="rx-patient-search-input"
                      placeholder="Type patient name to search…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() =>
                        suggestions.length > 0 && setShowSuggestions(true)
                      }
                      autoComplete="off"
                    />
                    {searchLoading && <div className="rx-search-spinner" />}
                    {searchQuery && !searchLoading && (
                      <button
                        className="rx-input-clear-btn"
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSuggestions([]);
                          setShowSuggestions(false);
                          searchRef.current?.focus();
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {showSuggestions && (
                    <div className="rx-patient-dropdown">
                      {suggestions.length === 0 ? (
                        <div className="rx-patient-dropdown-empty">
                          No patients found for &ldquo;{searchQuery}&rdquo;
                        </div>
                      ) : (
                        suggestions.map((p) => (
                          <button
                            key={p.id}
                            className="rx-patient-suggestion"
                            onClick={() => handleSelectPatient(p)}
                            type="button"
                          >
                            <PatientAvatar
                              name={p.name}
                              src={p.profileImageUrl}
                              size={40}
                            />
                            <div className="rx-suggestion-info">
                              <span className="rx-suggestion-name">
                                {p.name}
                              </span>
                              <span className="rx-suggestion-meta">
                                {calcAge(p.dateOfBirth) != null &&
                                  `${calcAge(p.dateOfBirth)} yrs`}
                                {p.gender &&
                                  ` · ${p.gender === "MALE" ? "M" : p.gender === "FEMALE" ? "F" : p.gender}`}
                                {p.bloodGroup && ` · ${p.bloodGroup}`}
                              </span>
                            </div>
                            <div className="rx-suggestion-badge">
                              {p.appointments ?? 0} visit
                              {p.appointments !== 1 ? "s" : ""}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rx-patient-card">
                  <div className="rx-patient-card-header">
                    <PatientAvatar
                      name={selectedPatient.name}
                      src={selectedPatient.profileImageUrl}
                      size={52}
                    />
                    <div className="rx-patient-card-info">
                      <div className="rx-patient-card-name">
                        {selectedPatient.name}
                      </div>
                      <div className="rx-patient-card-meta">
                        {age != null && (
                          <span className="rx-patient-badge rx-badge-teal">
                            {age} yrs
                          </span>
                        )}
                        {genderLabel && (
                          <span className="rx-patient-badge rx-badge-blue">
                            {genderLabel}
                          </span>
                        )}
                        {selectedPatient.bloodGroup && (
                          <span className="rx-patient-badge rx-badge-red">
                            🩸 {selectedPatient.bloodGroup}
                          </span>
                        )}
                      </div>
                      <div className="rx-patient-card-contact">
                        {selectedPatient.phone && (
                          <span>📞 {selectedPatient.phone}</span>
                        )}
                        {selectedPatient.email && (
                          <span>✉️ {selectedPatient.email}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="rx-patient-card-change"
                      onClick={handleClearPatient}
                      type="button"
                    >
                      ↩ Change
                    </button>
                  </div>
                  {selectedPatient.medicalHistory && (
                    <div className="rx-patient-history-box">
                      <strong>Medical history:</strong>{" "}
                      {selectedPatient.medicalHistory}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Appointment Selector */}
            {selectedPatient && (
              <section className="rx-modal-section">
                <label className="rx-modal-section-label rx-modal-required">
                  Link to Appointment
                </label>
                {apptLoading ? (
                  <div className="rx-appt-loading">
                    <div className="rx-search-spinner" />
                    <span>Loading appointments…</span>
                  </div>
                ) : patientAppointments.length === 0 ? (
                  <div className="rx-appt-empty">
                    No confirmed appointments found for {selectedPatient.name}.
                  </div>
                ) : (
                  <div className="rx-appt-list">
                    {patientAppointments.map((appt) => {
                      const isSel = selectedAppointment?.id === appt.id;
                      return (
                        <button
                          key={appt.id}
                          className={`rx-appt-item ${isSel ? "rx-appt-item--selected" : ""} ${appt.prescription ? "rx-appt-item--has-rx" : ""}`}
                          onClick={() =>
                            setSelectedAppointment(isSel ? null : appt)
                          }
                          type="button"
                        >
                          <div className="rx-appt-check">
                            {isSel ? (
                              "✓"
                            ) : (
                              <div className="rx-appt-check-circle" />
                            )}
                          </div>
                          <div className="rx-appt-item-info">
                            <div className="rx-appt-item-date">
                              {formatDate(appt.scheduledDate)} ·{" "}
                              {formatTime(appt.scheduledTime)}
                            </div>
                            {appt.symptoms && (
                              <div className="rx-appt-item-symptoms">
                                {appt.symptoms}
                              </div>
                            )}
                          </div>
                          <div className="rx-appt-item-right">
                            <span
                              className={`rx-appt-status rx-appt-status--${(appt.status || "").toLowerCase()}`}
                            >
                              {appt.status}
                            </span>
                            {appt.prescription && (
                              <span className="rx-appt-rx-badge">Rx ✓</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Diagnosis + Notes */}
            <div className="rx-modal-row2">
              <div className="rx-modal-field">
                <label className="rx-modal-section-label">Diagnosis</label>
                <input
                  type="text"
                  className="rx-input"
                  placeholder="e.g. Viral Fever, Hypertension…"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>
              <div className="rx-modal-field">
                <label className="rx-modal-section-label">
                  Additional Notes
                </label>
                <input
                  type="text"
                  className="rx-input"
                  placeholder="Follow-up instructions, advice…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Medications */}
            <section className="rx-modal-section">
              <label className="rx-modal-section-label rx-modal-required">
                Medications
              </label>
              <div className="rx-med-list">
                {medicines.map((med, idx) => (
                  <div key={idx} className="rx-med-row">
                    <div className="rx-med-num">{idx + 1}</div>
                    <div className="rx-med-fields">
                      <input
                        type="text"
                        className="rx-input rx-med-name"
                        placeholder="Medicine name *"
                        value={med.name}
                        onChange={(e) => updateMed(idx, "name", e.target.value)}
                      />
                      <input
                        type="text"
                        className="rx-input rx-med-dosage"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) =>
                          updateMed(idx, "dosage", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="rx-input rx-med-freq"
                        placeholder="Frequency"
                        value={med.frequency}
                        onChange={(e) =>
                          updateMed(idx, "frequency", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="rx-input rx-med-dur"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) =>
                          updateMed(idx, "duration", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="rx-input rx-med-instructions"
                        placeholder="Instructions (optional)"
                        value={med.instructions}
                        onChange={(e) =>
                          updateMed(idx, "instructions", e.target.value)
                        }
                      />
                    </div>
                    {medicines.length > 1 && (
                      <button
                        className="rx-med-remove"
                        onClick={() =>
                          setMedicines((p) => p.filter((_, i) => i !== idx))
                        }
                        type="button"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="rx-add-med-btn"
                onClick={() =>
                  setMedicines((p) => [...p, { ...EMPTY_MEDICINE }])
                }
                type="button"
              >
                + Add Another Medication
              </button>
            </section>

            {error && (
              <div ref={errorRef} className="rx-modal-error">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="rx-modal-footer">
            <button
              className="rx-btn-ghost"
              onClick={handleClose}
              disabled={saving}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rx-btn-primary"
              onClick={handleSave}
              disabled={saving}
              type="button"
            >
              {saving ? "Saving…" : "Save Prescription"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
