"use client";
import { useState, useRef, useEffect, useCallback, useActionState } from "react";
import {
    User, Briefcase, Building2, CalendarClock, MessageSquareText, Bell,
    FileCheck, ShieldCheck, Lock, UserX, Camera, X, Plus, Trash2, Upload,
    Save, RotateCcw, Eye, EyeOff, LogOut, Download, AlertTriangle,
    CheckCircle2, Clock, Globe, Phone, Mail, MapPin, Languages, Award,
    Stethoscope, IndianRupee, Loader2, RefreshCw, BadgeCheck, XCircle, FileUp
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { config } from "@/lib/config";
import { toast } from "sonner";
import {
    fetchDoctorDocumentTypesAction,
    fetchDoctorVerificationStatusAction,
    requestUploadSignatureAction,
    saveUploadedDocumentAction,
    submitDoctorVerificationAction,
} from "@/actions/doctorVerificationAction";
import "../doctor-settings.css";

import { fetchAllDocumentTypesAction } from "@/actions/documentTypeAction";

import { fetchDoctorProfileData } from "@/actions/doctorAction";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ── API helper ──
async function api(path, options = {}) {
    const res = await fetch(`${config.apiUrl}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data.data;
}

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            className={`ds-toggle ${checked ? "active" : ""}`}
            onClick={() => onChange(!checked)}
            aria-checked={checked}
            role="switch"
        >
            <span className="ds-toggle-thumb" />
        </button>
    );
}

function TagInput({ tags, onChange, placeholder }) {
    const [input, setInput] = useState("");
    const add = () => {
        const val = input.trim();
        if (val && !tags.includes(val)) {
            onChange([...tags, val]);
            setInput("");
        }
    };
    return (
        <div className="ds-tag-input">
            <div className="ds-tags">
                {tags.map((t) => (
                    <span key={t} className="ds-tag">
                        {t}
                        <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))}><X size={12} /></button>
                    </span>
                ))}
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
                placeholder={placeholder}
            />
        </div>
    );
}

// ────────────────────────── PROFILE ──────────────────────────
function ProfileSection({ data, onChange }) {
    const [photo, setPhoto] = useState(null);
    return (
      <div className="ds-section" id="profile">
        <h2 className="ds-section-title">
          <User size={20} /> Profile
        </h2>
        <p className="ds-section-desc">Manage your personal information</p>

        <div className="ds-photo-upload">
          <div className="ds-avatar">
            {photo ? (
              <img src={URL.createObjectURL(photo)} alt="avatar" />
            ) : data.profileImageUrl ? (
              <img src={data.profileImageUrl} alt="avatar" />
            ) : (
              <User size={36} />
            )}
            <label className="ds-avatar-edit">
              <Camera size={14} />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  setPhoto(e.target.files[0]);
                  onChange("_profileImage", e.target.files[0]);
                }}
              />
            </label>
          </div>
          <div className="ds-photo-info">
            <span className="ds-photo-label">Profile Photo</span>
            <span className="ds-photo-hint">
              JPG, PNG under 2 MB. Recommended 256×256px.
            </span>
          </div>
        </div>

        <div className="ds-form-grid">
          <div className="ds-field">
            <label>Full Name</label>
            <input
              type="text"
              value={data?.name || ""}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Dr. John Smith"
            />
          </div>
          <div className="ds-field">
            <label>
              Email <span className="ds-readonly-badge">Read-only</span>
            </label>
            <input
              type="email"
              value={data?.email || ""}
              readOnly
              className="ds-readonly"
            />
          </div>
          <div className="ds-field">
            <label>Phone Number</label>
            <div className="ds-input-icon">
              <Phone size={15} />
              <input
                type="tel"
                value={data?.phone || ""}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <div className="ds-field">
            <label>Gender</label>
            <select
              value={data.gender || ""}
              onChange={(e) => onChange("gender", e.target.value)}
            >
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="ds-field">
            <label>Date of Birth</label>
            <input
              type="date"
              value={data.dob || ""}
              onChange={(e) => onChange("dob", e.target.value)}
            />
          </div>
        </div>
        <div className="ds-field ds-full">
          <label>Bio / About</label>
          <textarea
            rows={4}
            value={data.bio || ""}
            onChange={(e) => onChange("bio", e.target.value)}
            placeholder="Write a short bio about yourself, your experience, and your approach to patient care..."
          />
        </div>
      </div>
    );
}

// ────────────────────────── PROFESSIONAL INFO ──────────────────────────
function ProfessionalSection({ data, onChange }) {
    return (
        <div className="ds-section" id="professional">
            <h2 className="ds-section-title"><Briefcase size={20} /> Professional Info</h2>
            <p className="ds-section-desc">Your medical qualifications and specialization</p>

            <div className="ds-form-grid">
                <div className="ds-field">
                    <label>Specialty</label>
                    <select value={data.specialty || ""} onChange={(e) => onChange("specialty", e.target.value)}>
                        <option value="">Select Specialty</option>
                        <option>Cardiology</option><option>Dermatology</option><option>Neurology</option>
                        <option>Orthopedics</option><option>Pediatrics</option><option>General Medicine</option>
                    </select>
                </div>
                <div className="ds-field">
                    <label>Qualifications</label>
                    <input type="text" value={data.qualifications || ""} onChange={(e) => onChange("qualifications", e.target.value)} placeholder="MBBS, MD, DM" />
                </div>
                <div className="ds-field">
                    <label>Experience (Years)</label>
                    <input type="number" value={data.experienceYears || ""} onChange={(e) => onChange("experienceYears", parseInt(e.target.value) || null)} placeholder="12" min="0" />
                </div>
                <div className="ds-field">
                    <label>Medical Registration Number</label>
                    <input type="text" value={data.medRegNumber || ""} onChange={(e) => onChange("medRegNumber", e.target.value)} placeholder="MCI-12345" />
                </div>
                <div className="ds-field">
                    <label>Consultation Fee</label>
                    <div className="ds-input-icon"><IndianRupee size={15} /><input type="number" value={data.consultationFee || ""} onChange={(e) => onChange("consultationFee", parseFloat(e.target.value) || null)} placeholder="500" /></div>
                </div>
            </div>
            <div className="ds-field ds-full">
                <label>Languages Spoken</label>
                <TagInput tags={data.languages || []} onChange={(v) => onChange("languages", v)} placeholder="Add language..." />
            </div>
            <div className="ds-field ds-full">
                <label>Areas of Expertise</label>
                <TagInput tags={data.expertise || []} onChange={(v) => onChange("expertise", v)} placeholder="Add expertise..." />
            </div>
        </div>
    );
}

// ────────────────────────── CLINIC ──────────────────────────
function ClinicSection({ clinics, onAddClinic, onDeleteClinic, clinicForm, onClinicFormChange }) {
    return (
        <div className="ds-section" id="clinic">
            <h2 className="ds-section-title"><Building2 size={20} /> Clinic / Practice Info</h2>
            <p className="ds-section-desc">Where do your consultations take place?</p>

            <div className="ds-form-grid">
                <div className="ds-field">
                    <label>Clinic Name</label>
                    <input type="text" value={clinicForm.clinicName || ""} onChange={(e) => onClinicFormChange("clinicName", e.target.value)} placeholder="HeartCare Clinics" />
                </div>
                <div className="ds-field">
                    <label>City</label>
                    <input type="text" value={clinicForm.city || ""} onChange={(e) => onClinicFormChange("city", e.target.value)} placeholder="Mumbai" />
                </div>
                <div className="ds-field ds-full">
                    <label>Address</label>
                    <div className="ds-input-icon"><MapPin size={15} /><input type="text" value={clinicForm.address || ""} onChange={(e) => onClinicFormChange("address", e.target.value)} placeholder="123, Marine Drive, Mumbai - 400001" /></div>
                </div>
            </div>
            <button type="button" className="ds-add-btn" onClick={onAddClinic}><Plus size={14} /> Add Location</button>

            {clinics.length > 0 && (
                <div className="ds-field ds-full" style={{ marginTop: 12 }}>
                    <label>Working Locations</label>
                    <div className="ds-location-list">
                        {clinics.map((c) => (
                            <div key={c.id} className="ds-location-item">
                                <MapPin size={14} />
                                <span>{c.clinicName} — {c.address}, {c.city}</span>
                                <button type="button" className="ds-remove-btn" onClick={() => onDeleteClinic(c.id)}><X size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ────────────────────────── AVAILABILITY & SCHEDULE ──────────────────────────
function AvailabilitySection({ data, onChange }) {
    const schedule = data.weeklySchedule || {};
    const toggleDay = (day) => {
        const updated = { ...schedule, [day]: { ...schedule[day], enabled: !schedule[day]?.enabled } };
        onChange("weeklySchedule", updated);
    };
    const updateSlot = (day, idx, field, val) => {
        const slots = [...(schedule[day]?.slots || [])];
        slots[idx] = { ...slots[idx], [field]: val };
        onChange("weeklySchedule", { ...schedule, [day]: { ...schedule[day], slots } });
    };
    const addSlot = (day) => {
        const slots = [...(schedule[day]?.slots || []), { start: "09:00", end: "17:00" }];
        onChange("weeklySchedule", { ...schedule, [day]: { ...schedule[day], slots } });
    };
    const removeSlot = (day, idx) => {
        const slots = (schedule[day]?.slots || []).filter((_, i) => i !== idx);
        onChange("weeklySchedule", { ...schedule, [day]: { ...schedule[day], slots } });
    };

    return (
        <div className="ds-section" id="availability">
            <h2 className="ds-section-title"><CalendarClock size={20} /> Availability & Schedule</h2>
            <p className="ds-section-desc">Set your weekly availability for consultations</p>

            <div className="ds-availability-toggle">
                <div>
                    <span className="ds-toggle-label">Available for Consultations</span>
                    <span className="ds-toggle-hint">Toggle off to pause all appointments</span>
                </div>
                <Toggle checked={data.availableForConsultation ?? true} onChange={(v) => onChange("availableForConsultation", v)} />
            </div>

            <div className="ds-schedule-editor">
                {DAYS.map((day) => (
                    <div key={day} className={`ds-schedule-row ${!schedule[day]?.enabled ? "disabled" : ""}`}>
                        <div className="ds-schedule-day">
                            <Toggle checked={schedule[day]?.enabled ?? false} onChange={() => toggleDay(day)} />
                            <span>{day}</span>
                        </div>
                        <div className="ds-schedule-slots">
                            {schedule[day]?.enabled ? (
                                <>
                                    {(schedule[day]?.slots || []).map((slot, idx) => (
                                        <div key={idx} className="ds-slot">
                                            <input type="time" value={slot.start} onChange={(e) => updateSlot(day, idx, "start", e.target.value)} />
                                            <span className="ds-slot-sep">to</span>
                                            <input type="time" value={slot.end} onChange={(e) => updateSlot(day, idx, "end", e.target.value)} />
                                            {(schedule[day]?.slots?.length || 0) > 1 && (
                                                <button type="button" className="ds-slot-remove" onClick={() => removeSlot(day, idx)}><X size={14} /></button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" className="ds-add-slot-btn" onClick={() => addSlot(day)}>
                                        <Plus size={13} /> Add Slot
                                    </button>
                                </>
                            ) : (
                                <span className="ds-day-off">Day Off</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ────────────────────────── CONSULTATION SETTINGS ──────────────────────────
function ConsultationSection({ data, onChange }) {
    return (
        <div className="ds-section" id="consultation">
            <h2 className="ds-section-title"><MessageSquareText size={20} /> Consultation Settings</h2>
            <p className="ds-section-desc">Configure how your consultations work</p>

            <div className="ds-form-grid">
                <div className="ds-field">
                    <label>Consultation Duration</label>
                    <select value={data.slotDurationMinutes || 30} onChange={(e) => onChange("slotDurationMinutes", parseInt(e.target.value))}>
                        <option value={15}>15 minutes</option><option value={20}>20 minutes</option><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option>
                    </select>
                </div>
                <div className="ds-field">
                    <label>Follow-up Window</label>
                    <select value={data.followUpWindowDays || 7} onChange={(e) => onChange("followUpWindowDays", parseInt(e.target.value))}>
                        <option value={3}>3 days</option><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option>
                    </select>
                </div>
                <div className="ds-field">
                    <label>Prescription Template</label>
                    <select value={data.prescriptionTemplate || "Default Template"} onChange={(e) => onChange("prescriptionTemplate", e.target.value)}>
                        <option>Default Template</option><option>Cardiology Template</option><option>Custom Template</option>
                    </select>
                </div>
            </div>

            <div className="ds-toggle-cards">
                <div className="ds-toggle-card">
                    <div>
                        <span className="ds-toggle-label">Auto-Approve Appointments</span>
                        <span className="ds-toggle-hint">Automatically confirm patient bookings</span>
                    </div>
                    <Toggle checked={data.autoApproveAppointments ?? true} onChange={(v) => onChange("autoApproveAppointments", v)} />
                </div>
                <div className="ds-toggle-card">
                    <div>
                        <span className="ds-toggle-label">Online Consultation</span>
                        <span className="ds-toggle-hint">Enable video / chat consultations</span>
                    </div>
                    <Toggle checked={data.onlineConsultationEnabled ?? true} onChange={(v) => onChange("onlineConsultationEnabled", v)} />
                </div>
            </div>
        </div>
    );
}

// ────────────────────────── NOTIFICATIONS ──────────────────────────
function NotificationsSection({ data, onChange }) {
    const items = [
        { key: "newAppointment", label: "New Appointment Alerts", desc: "Get notified when a patient books" },
        { key: "messages", label: "Messages", desc: "Notifications for new patient messages" },
        { key: "prescriptionReminders", label: "Prescription Reminders", desc: "Reminders for pending prescriptions" },
        { key: "followUpReminders", label: "Follow-up Reminders", desc: "Alerts for upcoming follow-ups" },
        { key: "systemUpdates", label: "System Updates", desc: "Platform updates and announcements" },
        { key: "emailNotifs", label: "Email Notifications", desc: "Receive notifications via email" },
        { key: "pushNotifs", label: "Push Notifications", desc: "Browser and mobile push alerts" },
    ];

    return (
        <div className="ds-section" id="notifications">
            <h2 className="ds-section-title"><Bell size={20} /> Notifications</h2>
            <p className="ds-section-desc">Choose how you&apos;d like to be notified</p>

            <div className="ds-toggle-cards">
                {items.map((it) => (
                    <div key={it.key} className="ds-toggle-card">
                        <div>
                            <span className="ds-toggle-label">{it.label}</span>
                            <span className="ds-toggle-hint">{it.desc}</span>
                        </div>
                        <Toggle checked={data[it.key] ?? true} onChange={(v) => onChange(it.key, v)} />
                    </div>
                ))}
            </div>
        </div>
    );
}


const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DOC_STATUS_MAP = {
    VERIFIED:           { label: "Verified",       cls: "verified", icon: BadgeCheck   },
    UPLOADED:           { label: "Uploaded",        cls: "pending",  icon: CheckCircle2 },
    PENDING:            { label: "Pending Review",  cls: "pending",  icon: Clock        },
    DOCUMENT_SUBMITTED: { label: "Under Review",    cls: "pending",  icon: Clock        },
    REJECTED:           { label: "Rejected",        cls: "rejected", icon: XCircle      },
    NOT_UPLOADED:       { label: "Not Uploaded",    cls: "missing",  icon: FileUp       },
};

function VerifyDocumentsSection() {
    const [docTypes, setDocTypes]   = useState([]);
    const [verStatus, setVerStatus] = useState(null);
    const [docItems, setDocItems]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [uploading, setUploading] = useState({});

    const [submitState, submitAction, submitPending] = useActionState(
        submitDoctorVerificationAction,
        { success: false },
    );

    // ── Load data ────────────────────────────────────────────────────────────
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [typesRes, statusRes] = await Promise.all([
                fetchDoctorDocumentTypesAction(),
                fetchDoctorVerificationStatusAction(),
            ]);

            if (typesRes.success) setDocTypes(typesRes.data);

            if (statusRes.success && statusRes.data) {
                setVerStatus(statusRes.data);

                const items = statusRes.data.requiredDocuments;

                if (Array.isArray(items) && items.length > 0) {
                    setDocItems(items);
                } else if (typesRes.success && typesRes.data.length > 0) {
                    // Status returned empty list — build from doc types
                    setDocItems(buildNotUploadedItems(typesRes.data));
                }
            } else if (typesRes.success && typesRes.data.length > 0) {
                // Status endpoint failed — build placeholder list from doc types.
                // We do NOT wipe docItems if they already exist (preserves upload state).
                setDocItems(prev =>
                    prev.length > 0
                        ? prev  // ✅ keep existing state if we already have items
                        : buildNotUploadedItems(typesRes.data)
                );
            }
        } catch (e) {
            console.error("Failed to load verification data", e);
        }
        setLoading(false);
    }, []);

    // Helper — builds a NOT_UPLOADED item list from raw document types
    function buildNotUploadedItems(types) {
        return types.map((dt) => ({
            documentTypeId: dt.id,
            label:          dt.name,
            description:    dt.description,
            required:       dt.required,
            status:         "NOT_UPLOADED",
            uploaded:       false,
            fileName:       null,
        }));
    }

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        if (submitState.success) {
            toast.success("Verification submitted! Our team will review your documents.");
            loadData();
        } else if (submitState.message && !submitState.success &&
                   submitState.message !== "Failed to submit verification.") {
            toast.error(submitState.message);
        }
    }, [submitState]);

    // ── Upload handler ───────────────────────────────────────────────────────
    const handleUpload = async (docTypeId, file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error("Invalid file type. Only PDF, JPG, and PNG are allowed.");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error("File too large. Maximum size is 10 MB.");
            return;
        }

        setUploading((prev) => ({ ...prev, [docTypeId]: true }));
        try {
            // Step 1 — Get Cloudinary signature
            const sigForm = new FormData();
            sigForm.set("documentTypeId", docTypeId);
            const sigResult = await requestUploadSignatureAction({}, sigForm);

            if (!sigResult.success) {
                toast.error(sigResult.message || "Failed to get upload signature.");
                return;
            }

            const { signature, timestamp, apiKey, cloudName, folder } = sigResult.data;

            // Step 2 — Upload directly to Cloudinary
            const cloudForm = new FormData();
            cloudForm.append("file",      file);
            cloudForm.append("signature", signature);
            cloudForm.append("timestamp", String(timestamp));
            cloudForm.append("api_key",   apiKey);
            cloudForm.append("folder",    folder);

            const cloudRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                { method: "POST", body: cloudForm },
            );

            if (!cloudRes.ok) {
                const errData = await cloudRes.json().catch(() => ({}));
                throw new Error(errData.error?.message || "Cloudinary upload failed");
            }

            const cloudData = await cloudRes.json();

            // Step 3 — Save metadata to backend
            const saveForm = new FormData();
            saveForm.set("documentTypeId",   docTypeId);
            saveForm.set("publicId",         cloudData.public_id);
            saveForm.set("secureUrl",        cloudData.secure_url);
            saveForm.set("resourceType",     cloudData.resource_type || "image");
            saveForm.set("format",           cloudData.format        || "");
            saveForm.set("originalFilename", cloudData.original_filename || file.name);
            saveForm.set("bytes",            String(cloudData.bytes || file.size));

            const saveResult = await saveUploadedDocumentAction({}, saveForm);

            if (saveResult.success) {
                toast.success("Document uploaded successfully!");

                // ✅ OPTIMISTIC UPDATE — update this specific card immediately
                // using the data returned from the save endpoint.
                // This works even when /verification-status returns 500.
                setDocItems(prev =>
                    prev.map(item =>
                        item.documentTypeId === docTypeId
                            ? {
                                ...item,
                                ...saveResult.data,  // status, fileUrl, fileName, fileSize, uploaded
                                uploaded: true,
                                status: saveResult.data?.status || "UPLOADED",
                              }
                            : item
                    )
                );

                // Background refresh — wrapped in try/catch so a 500 on
                // verification-status does NOT revert the optimistic update.
                // Once the backend UUID bug is fixed, this will update verStatus too.
                loadData().catch(() => {});
            } else {
                toast.error(saveResult.message || "Failed to save document.");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.message || "An error occurred during upload.");
        } finally {
            setUploading((prev) => ({ ...prev, [docTypeId]: false }));
        }
    };

    // ── Derived state ────────────────────────────────────────────────────────
    const overallStatus = verStatus?.status || "UNVERIFIED";

    // Locked = doctor submitted and is awaiting admin action (or already verified)
    // Re-upload and re-submit are only allowed when UNVERIFIED or REJECTED
    const isLocked = ["DOCUMENT_SUBMITTED", "UNDER_REVIEW", "VERIFIED"].includes(overallStatus);

    const allRequiredUploaded = docItems.filter(d => d.required).every(d => d.uploaded);
    const canSubmit =
        !isLocked &&
        allRequiredUploaded &&
        ["UNVERIFIED", "REJECTED"].includes(overallStatus) &&
        docItems.some(d => d.uploaded);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="ds-section" id="verify-document">
                <h2 className="ds-section-title"><ShieldCheck size={20} /> Verify Documents</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", padding: "24px 0" }}>
                    <Loader2 size={18} className="ds-spin" /> Loading verification data...
                </div>
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="ds-section" id="verify-document">
            <h2 className="ds-section-title"><ShieldCheck size={20} /> Verify Documents</h2>
            <p className="ds-section-desc">Upload your professional documents for verification</p>

            {overallStatus !== "UNVERIFIED" && (
                <div className={`ds-verification-banner ds-vb-${overallStatus.toLowerCase().replace("_", "-")}`}>
                    {overallStatus === "VERIFIED"           && <><BadgeCheck size={18} /> Your documents have been verified.</>}
                    {overallStatus === "DOCUMENT_SUBMITTED" && <><Clock size={18} /> Your documents are under review.</>}
                    {overallStatus === "UNDER_REVIEW"       && <><Clock size={18} /> Your documents are being reviewed.</>}
                    {overallStatus === "REJECTED"           && (
                        <><XCircle size={18} /> Verification rejected.{" "}
                          {verStatus?.verificationNotes && `Reason: ${verStatus.verificationNotes}`}{" "}
                          Please re-upload and resubmit.</>
                    )}
                </div>
            )}

            <div className="ds-doc-list">
                {docItems.length === 0 ? (
                    <div style={{ color: "#94a3b8", padding: "16px 0" }}>
                        No document types configured yet. Please check back later.
                    </div>
                ) : (
                    docItems.map((item) => {
                        const st          = DOC_STATUS_MAP[item.status] || DOC_STATUS_MAP.NOT_UPLOADED;
                        const StIcon      = st.icon;
                        const isUploading = uploading[item.documentTypeId];
                        // Allow upload only when:
                        //  • overall status lets the doctor act (not locked), AND
                        //  • the individual document slot needs a file
                        const canReupload = !isLocked && ["NOT_UPLOADED", "REJECTED", "UPLOADED"].includes(item.status);

                        return (
                            <div key={item.documentTypeId} className="ds-doc-card">
                                <div className="ds-doc-info">
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span className="ds-doc-name">{item.label}</span>
                                        {item.required
                                            ? <span className="ds-badge ds-badge-required">Required</span>
                                            : <span className="ds-badge ds-badge-optional">Optional</span>
                                        }
                                    </div>
                                    {item.description && <span className="ds-doc-file">{item.description}</span>}
                                    {item.fileName    && <span className="ds-doc-file">File: {item.fileName}</span>}
                                </div>
                                <div className="ds-doc-actions">
                                    <span className={`ds-doc-status ${st.cls}`}>
                                        <StIcon size={13} /> {st.label}
                                    </span>
                                    {canReupload && (
                                        <label className={`ds-upload-btn ${isUploading ? "disabled" : ""}`}>
                                            {isUploading ? (
                                                <><Loader2 size={13} className="ds-spin" /> Uploading...</>
                                            ) : (
                                                <><Upload size={13} /> {item.uploaded ? "Re-upload" : "Upload"}</>
                                            )}
                                            <input
                                                type="file"
                                                hidden
                                                disabled={isUploading}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleUpload(item.documentTypeId, file);
                                                    e.target.value = "";
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {docItems.length > 0 && (
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Only show submit button when the doctor is allowed to act */}
                    {!isLocked && (
                        <form action={submitAction}>
                            <button
                                type="submit"
                                className="ds-save-btn"
                                disabled={!canSubmit || submitPending}
                                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                            >
                                {submitPending
                                    ? <><Loader2 size={14} className="ds-spin" /> Submitting...</>
                                    : <><ShieldCheck size={14} /> Submit for Verification</>
                                }
                            </button>
                        </form>
                    )}

                    {/* Helper text — only when unlocked and missing required docs */}
                    {!isLocked && !allRequiredUploaded && (
                        <span style={{ color: "#f59e0b", fontSize: 13 }}>
                            <AlertTriangle size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                            Upload all required documents first
                        </span>
                    )}

                    {/* Locked state hint */}
                    {isLocked && overallStatus !== "VERIFIED" && (
                        <span style={{ color: "#94a3b8", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                            <Lock size={13} />
                            {overallStatus === "DOCUMENT_SUBMITTED" || overallStatus === "UNDER_REVIEW"
                                ? "Documents locked — awaiting admin review. Re-upload is available only if your verification is rejected."
                                : "Your account is verified."
                            }
                        </span>
                    )}

                    <button type="button" className="ds-discard-btn" onClick={loadData} style={{ marginLeft: "auto" }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            )}
        </div>
    );
}

// ────────────────────────── SECURITY ──────────────────────────
function SecuritySection({ twoFa, onTwoFaChange }) {
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [changingPw, setChangingPw] = useState(false);

    const handleChangePassword = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            toast.error("Please fill all password fields"); return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("New password and confirm password do not match"); return;
        }
        setChangingPw(true);
        try {
            await api("/doctor/settings/security/change-password", {
                method: "POST", body: JSON.stringify(passwords),
            });
            toast.success("Password changed successfully");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (e) { toast.error(e.message || "Failed to change password"); }
        setChangingPw(false);
    };

    return (
        <div className="ds-section" id="security">
            <h2 className="ds-section-title"><ShieldCheck size={20} /> Security & Password</h2>
            <p className="ds-section-desc">Keep your account secure</p>

            <div className="ds-subsection">
                <h3 className="ds-subsection-title">Change Password</h3>
                <div className="ds-form-grid ds-narrow">
                    <div className="ds-field ds-full">
                        <label>Current Password</label>
                        <div className="ds-input-icon">
                            <input type={showOld ? "text" : "password"} value={passwords.currentPassword} onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Enter current password" />
                            <button type="button" className="ds-eye-btn" onClick={() => setShowOld(!showOld)}>
                                {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>
                    <div className="ds-field ds-full">
                        <label>New Password</label>
                        <div className="ds-input-icon">
                            <input type={showNew ? "text" : "password"} value={passwords.newPassword} onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))} placeholder="Enter new password" />
                            <button type="button" className="ds-eye-btn" onClick={() => setShowNew(!showNew)}>
                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>
                    <div className="ds-field ds-full">
                        <label>Confirm New Password</label>
                        <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm new password" />
                    </div>
                    <button type="button" className="ds-save-btn" onClick={handleChangePassword} disabled={changingPw} style={{ marginTop: 8, width: "fit-content" }}>
                        {changingPw ? "Changing..." : "Update Password"}
                    </button>
                </div>
            </div>

            <div className="ds-toggle-cards">
                <div className="ds-toggle-card">
                    <div>
                        <span className="ds-toggle-label">Two-Factor Authentication</span>
                        <span className="ds-toggle-hint">Add an extra layer of security to your account</span>
                    </div>
                    <Toggle checked={twoFa} onChange={onTwoFaChange} />
                </div>
            </div>
        </div>
    );
}

// ────────────────────────── PRIVACY ──────────────────────────
function PrivacySection({ data, onChange }) {
    const items = [
        { key: "profileVisible", label: "Profile Visibility", desc: "Allow patients to view your profile" },
        { key: "allowReviews", label: "Allow Patient Reviews", desc: "Let patients leave public reviews" },
        { key: "showContact", label: "Show Contact Info", desc: "Display phone/email on public profile" },
        { key: "dataSharing", label: "Data Sharing", desc: "Share anonymized data for research" },
    ];

    return (
        <div className="ds-section" id="privacy">
            <h2 className="ds-section-title"><Lock size={20} /> Privacy</h2>
            <p className="ds-section-desc">Control how your information is shared</p>

            <div className="ds-toggle-cards">
                {items.map((it) => (
                    <div key={it.key} className="ds-toggle-card">
                        <div>
                            <span className="ds-toggle-label">{it.label}</span>
                            <span className="ds-toggle-hint">{it.desc}</span>
                        </div>
                        <Toggle checked={data[it.key] ?? false} onChange={(v) => onChange(it.key, v)} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ────────────────────────── ACCOUNT ──────────────────────────
function AccountSection() {
    const [showDeactivate, setShowDeactivate] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const { logout } = useAuth();

    const handleDeactivate = async () => {
        try {
            await api("/doctor/settings/account/deactivate", { method: "POST" });
            toast.success("Account deactivated");
            logout();
        } catch (e) { toast.error(e.message); }
    };

    const handleDelete = async () => {
        try {
            await api("/doctor/settings/account/delete", { method: "POST" });
            toast.success("Account deletion requested");
            logout();
        } catch (e) { toast.error(e.message); }
    };

    return (
        <div className="ds-section" id="account">
            <h2 className="ds-section-title ds-danger-title"><UserX size={20} /> Account</h2>
            <p className="ds-section-desc">Manage your account status</p>

            <div className="ds-danger-zone">
                <div className="ds-danger-card">
                    <div>
                        <span className="ds-danger-label">Export Your Data</span>
                        <span className="ds-danger-hint">Download all your data in a portable format</span>
                    </div>
                    <button type="button" className="ds-export-btn"><Download size={14} /> Export</button>
                </div>
                <div className="ds-danger-card">
                    <div>
                        <span className="ds-danger-label">Deactivate Account</span>
                        <span className="ds-danger-hint">Temporarily hide your profile. You can reactivate anytime.</span>
                    </div>
                    <button type="button" className="ds-danger-outline-btn" onClick={() => setShowDeactivate(true)}>Deactivate</button>
                </div>
                <div className="ds-danger-card">
                    <div>
                        <span className="ds-danger-label">Delete Account</span>
                        <span className="ds-danger-hint">Permanently delete your account and all data. This cannot be undone.</span>
                    </div>
                    <button type="button" className="ds-danger-btn" onClick={() => setShowDelete(true)}><Trash2 size={14} /> Delete</button>
                </div>
            </div>

            {(showDeactivate || showDelete) && (
                <div className="ds-modal-overlay" onClick={() => { setShowDeactivate(false); setShowDelete(false); }}>
                    <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ds-modal-icon"><AlertTriangle size={28} /></div>
                        <h3>{showDelete ? "Delete Account?" : "Deactivate Account?"}</h3>
                        <p>{showDelete
                            ? "This action is permanent and cannot be undone. All your data, appointments, and records will be permanently removed."
                            : "Your profile will be hidden from patients. You can reactivate your account by logging in again."
                        }</p>
                        <div className="ds-modal-actions">
                            <button type="button" className="ds-cancel-btn" onClick={() => { setShowDeactivate(false); setShowDelete(false); }}>Cancel</button>
                            <button type="button" className={showDelete ? "ds-danger-btn" : "ds-danger-outline-btn"} onClick={showDelete ? handleDelete : handleDeactivate}>
                                {showDelete ? "Yes, Delete Permanently" : "Yes, Deactivate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ────────────────────────── MAIN PAGE ──────────────────────────
export default function DoctorSettingsPage() {
    const { user, doctorProfileData, setDoctorProfileData } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [saved, setSaved] = useState(false);

    // Section state
    const [profile, setProfile] = useState({});
    const [professional, setProfessional] = useState({});
    const [clinics, setClinics] = useState([]);
    const [clinicForm, setClinicForm] = useState({ clinicName: "", address: "", city: "" });
    const [availability, setAvailability] = useState({});
    const [consultation, setConsultation] = useState({});
    const [notifPrefs, setNotifPrefs] = useState({});
    const [privacyPrefs, setPrivacyPrefs] = useState({});
    const [twoFa, setTwoFa] = useState(false);

    const profileImageRef = useRef(null);

    useEffect(() => {
      (async () => {
        const response = await fetchDoctorProfileData();
        if (response?.success && response.data) {
          const d = response.data;
          setDoctorProfileData(d);
          setProfile({
            name: d.name || "",
            email: d.email || "",
            phone: d.phone || "",
            bio: d.bio || "",
            gender: d.gender || "",
            dob: d.dob || "",
            profileImageUrl: d.profileImage || "",
          });
        } else {
          setDoctorProfileData({});
        }
      })();
    }, []);

    // ── Load all settings on mount ──
    const loadSettings = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [profileRes, settingsRes] = await Promise.allSettled([
                api("/users/profile"),
                api("/doctor/settings"),
            ]);

            if (profileRes.status === "fulfilled") setProfile(profileRes.value || {});
            if (settingsRes.status === "fulfilled") {
                const s = settingsRes.value || {};
                setProfessional(s.professional || {});
                setClinics(s.clinics || []);
                setAvailability(s.availability || {});
                setConsultation(s.consultation || {});
                setNotifPrefs(s.notifications || {});
                setPrivacyPrefs(s.privacy || {});
                setTwoFa(s.security?.twoFactorEnabled || false);
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        }
        setLoading(false);
        setDirty(false);
    }, [user]);

    useEffect(() => { loadSettings(); }, [loadSettings]);

    // ── Change handlers ──
    const handleProfileChange = (key, val) => {
        if (key === "_profileImage") { profileImageRef.current = val; }
        else { setProfile(p => ({ ...p, [key]: val })); }
        setDirty(true);
    };
    const handleProfChange = (key, val) => { setProfessional(p => ({ ...p, [key]: val })); setDirty(true); };
    const handleAvailChange = (key, val) => { setAvailability(p => ({ ...p, [key]: val })); setDirty(true); };
    const handleConsultChange = (key, val) => { setConsultation(p => ({ ...p, [key]: val })); setDirty(true); };
    const handleNotifChange = (key, val) => { setNotifPrefs(p => ({ ...p, [key]: val })); setDirty(true); };
    const handlePrivacyChange = (key, val) => { setPrivacyPrefs(p => ({ ...p, [key]: val })); setDirty(true); };
    const handleClinicFormChange = (key, val) => { setClinicForm(p => ({ ...p, [key]: val })); };

    const handleTwoFaChange = async (val) => {
        try {
            await api("/doctor/settings/security/two-factor", {
                method: "PUT", body: JSON.stringify({ enabled: val }),
            });
            setTwoFa(val);
            toast.success("Two-factor setting updated");
        } catch (e) { toast.error(e.message); }
    };

    const handleAddClinic = async () => {
        if (!clinicForm.clinicName) { toast.error("Clinic name is required"); return; }
        try {
            const newClinic = await api("/doctor/settings/clinics", {
                method: "POST", body: JSON.stringify(clinicForm),
            });
            setClinics(prev => [...prev, newClinic]);
            setClinicForm({ clinicName: "", address: "", city: "" });
            toast.success("Location added");
        } catch (e) { toast.error(e.message); }
    };

    const handleDeleteClinic = async (id) => {
        try {
            await api(`/doctor/settings/clinics/${id}`, { method: "DELETE" });
            setClinics(prev => prev.filter(c => c.id !== id));
            toast.success("Location removed");
        } catch (e) { toast.error(e.message); }
    };

    // ── Save all sections ──
    const handleSave = async () => {
        setSaving(true);
        setSaved(false);

        try {
            // 1. Profile
            const formData = new FormData();
            const profilePayload = {};
            if (profile.name) profilePayload.name = profile.name;
            if (profile.phone) profilePayload.phone = profile.phone;
            if (profile.gender) profilePayload.gender = profile.gender;
            if (profile.dob) profilePayload.dob = profile.dob;
            if (profile.bio !== undefined) profilePayload.bio = profile.bio;
            formData.append("profile", new Blob([JSON.stringify(profilePayload)], { type: "application/json" }));
            if (profileImageRef.current) formData.append("profileImage", profileImageRef.current);
            await fetch(`${config.apiUrl}/users/profile`, { method: "PATCH", credentials: "include", body: formData });

            // 2. Professional
            await api("/doctor/settings/professional", { method: "PUT", body: JSON.stringify(professional) });

            // 3. Availability
            await api("/doctor/settings/availability", { method: "PUT", body: JSON.stringify(availability) });

            // 4. Consultation
            await api("/doctor/settings/consultation", { method: "PUT", body: JSON.stringify(consultation) });

            // 5. Notification prefs
            await api("/doctor/settings/notifications", { method: "PUT", body: JSON.stringify({ prefs: notifPrefs }) });

            // 6. Privacy
            await api("/doctor/settings/privacy", { method: "PUT", body: JSON.stringify({ settings: privacyPrefs }) });

            setDirty(false);
            setSaved(true);
            toast.success("All settings saved!");
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            toast.error(e.message || "Failed to save settings");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="ds-page">
                <div className="ds-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
                    <div style={{ textAlign: "center", color: "#94a3b8" }}>
                        <div className="ds-spinner" />
                        <p>Loading settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ds-page">
            <div className="ds-content">
                <ProfileSection data={profile} onChange={handleProfileChange} />
                <ProfessionalSection data={professional} onChange={handleProfChange} />
                <ClinicSection clinics={clinics} onAddClinic={handleAddClinic} onDeleteClinic={handleDeleteClinic} clinicForm={clinicForm} onClinicFormChange={handleClinicFormChange} />
                <AvailabilitySection data={availability} onChange={handleAvailChange} />
                <ConsultationSection data={consultation} onChange={handleConsultChange} />
                <NotificationsSection data={notifPrefs} onChange={handleNotifChange} />
                <VerifyDocumentsSection />
                <SecuritySection twoFa={twoFa} onTwoFaChange={handleTwoFaChange} />
                <PrivacySection data={privacyPrefs} onChange={handlePrivacyChange} />
                <AccountSection />
            </div>

            {/* Sticky Save Bar */}
            <div className={`ds-save-bar ${dirty || saved ? "visible" : ""}`}>
                <div className="ds-save-bar-inner">
                    {saved ? (
                        <span className="ds-saved-msg"><CheckCircle2 size={16} /> Changes saved successfully!</span>
                    ) : (
                        <>
                            <span className="ds-unsaved-msg">You have unsaved changes</span>
                            <div className="ds-save-actions">
                                <button type="button" className="ds-discard-btn" onClick={loadSettings}><RotateCcw size={14} /> Discard</button>
                                <button type="button" className="ds-save-btn" onClick={handleSave} disabled={saving}>
                                    <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}