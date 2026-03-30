"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { config } from "../../lib/config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import "./patient-profile.css";
import "./patient-dashboard.css";
import PatientSidebarLayout from "./components/PatientSidebarLayout";

/* ── Tiny SVG helper ── */
const I = ({ d, size = 18, stroke = "currentColor", fill = "none" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{typeof d === "string" ? <path d={d} /> : d}</svg>
);

/* ── Sidebar nav items (reuse from dashboard) ── */
const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: <I d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>} /> },
    { id: "appointments", label: "Appointments", icon: <I d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM16 2v4M8 2v4M3 10h18" /> },
    { id: "prescriptions", label: "Prescriptions", icon: <I d={<><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v6m0 0H3m6 0h12M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 1-2-2V9" /></>} /> },
    { id: "vitals", label: "Health Vitals", icon: <I d="M22 12h-4l-3 9L9 3l-3 9H2" /> },
    { id: "history", label: "Medical History", icon: <I d={<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>} /> },
    { id: "messages", label: "Messages", icon: <I d={<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>} />, badge: 2 },
    { id: "reports", label: "Reports", icon: <I d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>} /> },
    { id: "profile", label: "My Profile", icon: <I d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} /> },
];

/* ──────────── COMPONENT ──────────── */
export default function PatientProfilePage() {
    const { user, updateProfile: updateAuthProfile } = useAuth();
    const router = useRouter();
    const fileRef = useRef(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    /* ── Section collapse states ── */
    const [sections, setSections] = useState({
        personal: true, health: true, emergency: true,
        documents: true, prefs: true, privacy: true, account: true,
    });
    const toggleSection = (s) => setSections(p => ({ ...p, [s]: !p[s] }));

    /* ── Profile Form Data ── */
    const [form, setForm] = useState({
        name: "", phone: "", gender: "", dob: "", address: "",
        city: "", state: "", bloodGroup: "", profileImageUrl: "",
    });

    const [allergies, setAllergies] = useState(["Penicillin", "Dust"]);
    const [conditions, setConditions] = useState(["Pre-diabetes", "Hypertension"]);
    const [allergyInput, setAllergyInput] = useState("");
    const [conditionInput, setConditionInput] = useState("");

    const [contacts, setContacts] = useState([
        { id: 1, name: "Jane Doe", relation: "Spouse", phone: "+91 98765 43210" },
        { id: 2, name: "Robert Doe", relation: "Father", phone: "+91 87654 32109" },
    ]);

    const [documents] = useState([
        { id: 1, name: "Blood_Report_Feb2026.pdf", size: "1.2 MB", date: "Feb 20, 2026", type: "pdf" },
        { id: 2, name: "ECG_Results.pdf", size: "820 KB", date: "Feb 15, 2026", type: "pdf" },
        { id: 3, name: "MRI_Scan.jpg", size: "3.4 MB", date: "Jan 28, 2026", type: "img" },
    ]);

    const [prefs, setPrefs] = useState({
        appointmentReminders: true, medicationReminders: true,
        emailNotifs: false, pushNotifs: true,
    });

    const [privacy, setPrivacy] = useState({
        shareWithDoctors: true, allowReviews: false, profileVisible: true,
    });

    /* ── Load profile from backend API ── */
    useEffect(() => {
        if (!user) return;
        const loadProfile = async () => {
            try {
                const res = await fetch(`${config.apiUrl}/users/profile`, {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        const p = data.data;
                        setForm({
                            name: p.name || "",
                            phone: p.phone || "",
                            gender: p.gender || "",
                            dob: p.dob || "",
                            address: p.address || "",
                            city: p.city || "",
                            state: p.state || "",
                            bloodGroup: p.bloodGroup || "",
                            profileImageUrl: p.profileImageUrl || "",
                        });
                        return;
                    }
                }
            } catch { /* fallback to auth context */ }
            // Fallback: use auth context data
            setForm({
                name: user.name || "",
                phone: user.phone || "",
                gender: user.gender || "",
                dob: user.dob || "",
                address: user.address || "",
                city: user.city || "",
                state: user.state || "",
                bloodGroup: user.bloodGroup || "",
                profileImageUrl: user.profileImageUrl || user.profileImage || "",
            });
        };
        loadProfile();
    }, [user?.userId]);

    const updateField = (field, value) => {
        setForm(p => ({ ...p, [field]: value }));
        setHasChanges(true);
    };

    /* ── Profile completeness ── */
    const computeCompleteness = () => {
        const fields = ["name", "phone", "gender", "dob", "address", "city", "bloodGroup", "profileImageUrl"];
        const filled = fields.filter(f => form[f] && form[f].trim()).length;
        const extras = (allergies.length > 0 ? 1 : 0) + (contacts.length > 0 ? 1 : 0);
        return Math.min(100, Math.round(((filled + extras) / (fields.length + 2)) * 100));
    };
    const completeness = computeCompleteness();

    /* ── Save handler ── */
    const handleSave = async () => {
        setSaving(true);
        try {
            // Filter out empty strings for enums/dates to avoid Jackson parsing errors
            const cleanedForm = { ...form };
            if (cleanedForm.gender === "") delete cleanedForm.gender;
            if (cleanedForm.bloodGroup === "") delete cleanedForm.bloodGroup;
            if (cleanedForm.dob === "") delete cleanedForm.dob;
            // The backend doesn't expect profileImageUrl in the DTO
            delete cleanedForm.profileImageUrl;

            const formData = new FormData();
            formData.append("profile", JSON.stringify(cleanedForm));

            if (selectedImageFile) {
                formData.append("profileImage", selectedImageFile);
            }

            const res = await fetch(`${config.apiUrl}/users/profile`, {
                method: "PATCH",
                credentials: "include",
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    updateAuthProfile({ ...data.data });
                    setForm(p => ({ ...p, profileImageUrl: data.data.profileImageUrl || p.profileImageUrl }));
                }
                setHasChanges(false);
                setSelectedImageFile(null);
                toast.success("Profile updated successfully!");
            } else {
                toast.error("Failed to update profile");
            }
        } catch {
            toast.error("Network error");
        } finally {
            setSaving(false);
        }
    };

    /* ── Image upload ── */
    const [selectedImageFile, setSelectedImageFile] = useState(null);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateField("profileImageUrl", ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const initials = user?.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "P";

    /* ── Section toggle chevron ── */
    const Chevron = ({ open }) => (
        <button className={`pp-section-toggle ${open ? "open" : ""}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
        </button>
    );

    /* ── Toggle switch ── */
    const Toggle = ({ checked, onChange }) => (
        <label className="pp-switch">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="pp-switch-slider" />
        </label>
    );

    /* ──────── RENDER ──────── */
    return (
      <div className="lg:px-20">

            {/* ── Content ── */}
            <div className="">
              {/* ── Profile Header ── */}
              <div className="pp-header-card">
                <div className="pp-avatar-wrap">
                  <div
                    className="pp-avatar"
                    onClick={() => fileRef.current?.click()}
                  >
                    {form.profileImageUrl ? (
                      <img src={form.profileImageUrl} alt={form.name} />
                    ) : (
                      initials
                    )}
                  </div>
                  <button
                    className="pp-avatar-upload-btn"
                    onClick={() => fileRef.current?.click()}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageSelect}
                  />
                </div>
                <div className="pp-header-info">
                  <h1>{form.name || "Patient"}</h1>
                  <div className="pp-header-meta">
                    <span>📧 {user?.email || "—"}</span>
                    <span>🆔 PID-{user?.userId?.slice(-6) || "000000"}</span>
                    <span className="pp-header-badge">✓ Verified</span>
                  </div>
                </div>
              </div>

              {/* ── Completeness ── */}
              <div className="pp-completeness">
                <div className="pp-completeness-text">
                  Profile Completeness: <span>{completeness}%</span>
                </div>
                <div className="pp-completeness-bar">
                  <div
                    className="pp-completeness-fill"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <div className="pp-completeness-pct">{completeness}%</div>
              </div>

              {/* ═══ 1. PERSONAL INFO ═══ */}
              <div className="pp-section">
                <div
                  className="pp-section-header"
                  onClick={() => toggleSection("personal")}
                >
                  <h3>
                    <div className="pp-section-icon teal">
                      <I
                        d={
                          <>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </>
                        }
                        size={16}
                      />
                    </div>
                    Personal Information
                  </h3>
                  <Chevron open={sections.personal} />
                </div>
                <div
                  className={`pp-section-body ${sections.personal ? "" : "collapsed"}`}
                >
                  <div className="pp-form-grid">
                    <div className="pp-form-group">
                      <label className="pp-form-label">
                        Full Name <span className="required">*</span>
                      </label>
                      <input
                        className="pp-form-input"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="pp-form-group">
                      <label className="pp-form-label">
                        Phone Number <span className="required">*</span>
                      </label>
                      <input
                        className="pp-form-input"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="pp-form-group">
                      <label className="pp-form-label">Gender</label>
                      <select
                        className="pp-form-select"
                        value={form.gender}
                        onChange={(e) => updateField("gender", e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="pp-form-group">
                      <label className="pp-form-label">Date of Birth</label>
                      <input
                        className="pp-form-input"
                        type="date"
                        value={form.dob}
                        onChange={(e) => updateField("dob", e.target.value)}
                      />
                    </div>
                    <div className="pp-form-group full">
                      <label className="pp-form-label">Address</label>
                      <input
                        className="pp-form-input"
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="Street address"
                      />
                    </div>
                    <div className="pp-form-group">
                      <label className="pp-form-label">City</label>
                      <input
                        className="pp-form-input"
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="pp-form-group">
                      <label className="pp-form-label">Blood Group</label>
                      <select
                        className="pp-form-select"
                        value={form.bloodGroup}
                        onChange={(e) =>
                          updateField("bloodGroup", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                          (bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══ 2. HEALTH INFO ═══ */}
              <div className="pp-section">
                <div
                  className="pp-section-header"
                  onClick={() => toggleSection("health")}
                >
                  <h3>
                    <div className="pp-section-icon mint">
                      <I d="M22 12h-4l-3 9L9 3l-3 9H2" size={16} />
                    </div>
                    Health Information
                  </h3>
                  <Chevron open={sections.health} />
                </div>
                <div
                  className={`pp-section-body ${sections.health ? "" : "collapsed"}`}
                >
                  {/* Allergies */}
                  <label className="pp-form-label" style={{ marginBottom: 8 }}>
                    Allergies
                  </label>
                  <div className="pp-tags">
                    {allergies.map((a, i) => (
                      <span key={i} className="pp-tag">
                        {a}
                        <button
                          className="pp-tag-remove"
                          onClick={() => {
                            setAllergies((p) => p.filter((_, j) => j !== i));
                            setHasChanges(true);
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="pp-tag-input">
                    <input
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      placeholder="Add allergy..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && allergyInput.trim()) {
                          setAllergies((p) => [...p, allergyInput.trim()]);
                          setAllergyInput("");
                          setHasChanges(true);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (allergyInput.trim()) {
                          setAllergies((p) => [...p, allergyInput.trim()]);
                          setAllergyInput("");
                          setHasChanges(true);
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {/* Conditions */}
                  <label
                    className="pp-form-label"
                    style={{ marginTop: 20, marginBottom: 8 }}
                  >
                    Chronic Conditions
                  </label>
                  <div className="pp-tags">
                    {conditions.map((c, i) => (
                      <span key={i} className="pp-tag purple">
                        {c}
                        <button
                          className="pp-tag-remove"
                          onClick={() => {
                            setConditions((p) => p.filter((_, j) => j !== i));
                            setHasChanges(true);
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="pp-tag-input">
                    <input
                      value={conditionInput}
                      onChange={(e) => setConditionInput(e.target.value)}
                      placeholder="Add condition..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && conditionInput.trim()) {
                          setConditions((p) => [...p, conditionInput.trim()]);
                          setConditionInput("");
                          setHasChanges(true);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (conditionInput.trim()) {
                          setConditions((p) => [...p, conditionInput.trim()]);
                          setConditionInput("");
                          setHasChanges(true);
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>

                  <div className="pp-form-grid" style={{ marginTop: 20 }}>
                    <div className="pp-form-group">
                      <label className="pp-form-label">Primary Doctor</label>
                      <input
                        className="pp-form-input"
                        defaultValue="Dr. Priya Sharma"
                        readOnly
                        disabled
                      />
                      <span className="pp-form-helper">Assigned by system</span>
                    </div>
                    <div className="pp-form-group">
                      <label className="pp-form-label">
                        Current Medications
                      </label>
                      <input
                        className="pp-form-input"
                        defaultValue="3 active prescriptions"
                        readOnly
                        disabled
                      />
                      <span className="pp-form-helper">
                        Managed in Prescriptions
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══ 3. EMERGENCY CONTACTS ═══ */}
              <div className="pp-section">
                <div
                  className="pp-section-header"
                  onClick={() => toggleSection("emergency")}
                >
                  <h3>
                    <div className="pp-section-icon red">
                      <I
                        d={
                          <>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.11 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72" />
                            <path d="M15 7a3 3 0 1 1 6 0" />
                          </>
                        }
                        size={16}
                      />
                    </div>
                    Emergency Contacts
                  </h3>
                  <Chevron open={sections.emergency} />
                </div>
                <div
                  className={`pp-section-body ${sections.emergency ? "" : "collapsed"}`}
                >
                  <div className="pp-contact-list">
                    {contacts.map((c) => (
                      <div key={c.id} className="pp-contact-item">
                        <div className="pp-contact-avatar">
                          {c.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")}
                        </div>
                        <div className="pp-contact-info">
                          <div className="contact-name">{c.name}</div>
                          <div className="contact-detail">
                            {c.relation} • {c.phone}
                          </div>
                        </div>
                        <div className="pp-contact-actions">
                          <button className="btn-edit">
                            <I
                              d={
                                <>
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </>
                              }
                              size={14}
                            />
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => {
                              setContacts((p) =>
                                p.filter((x) => x.id !== c.id),
                              );
                              setHasChanges(true);
                            }}
                          >
                            <I
                              d={
                                <>
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </>
                              }
                              size={14}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="pp-add-btn"
                    onClick={() => {
                      setContacts((p) => [
                        ...p,
                        {
                          id: Date.now(),
                          name: "New Contact",
                          relation: "Other",
                          phone: "",
                        },
                      ]);
                      setHasChanges(true);
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Emergency Contact
                  </button>
                </div>
              </div>

              {/* ═══ 4. DOCUMENTS ═══ */}
              <div className="pp-section">
                <div
                  className="pp-section-header"
                  onClick={() => toggleSection("documents")}
                >
                  <h3>
                    <div className="pp-section-icon blue">
                      <I
                        d={
                          <>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6" />
                          </>
                        }
                        size={16}
                      />
                    </div>
                    Documents & Reports
                  </h3>
                  <Chevron open={sections.documents} />
                </div>
                <div
                  className={`pp-section-body ${sections.documents ? "" : "collapsed"}`}
                >
                  <div className="pp-upload-area">
                    <div className="upload-icon">📁</div>
                    <div className="upload-text">
                      Drop files here or click to upload
                    </div>
                    <div className="upload-hint">PDF, JPG, PNG — Max 10 MB</div>
                  </div>
                  <div className="pp-doc-list">
                    {documents.map((doc) => (
                      <div key={doc.id} className="pp-doc-item">
                        <div className="pp-doc-icon">
                          {doc.type === "pdf" ? (
                            <I
                              d={
                                <>
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <path d="M14 2v6h6" />
                                </>
                              }
                              size={16}
                            />
                          ) : (
                            <I
                              d={
                                <>
                                  <rect
                                    x="3"
                                    y="3"
                                    width="18"
                                    height="18"
                                    rx="2"
                                  />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <path d="M21 15l-5-5L5 21" />
                                </>
                              }
                              size={16}
                            />
                          )}
                        </div>
                        <div className="pp-doc-info">
                          <div className="doc-name">{doc.name}</div>
                          <div className="doc-meta">
                            {doc.size} • {doc.date}
                          </div>
                        </div>
                        <div className="pp-doc-actions">
                          <button title="Download">
                            <I
                              d={
                                <>
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </>
                              }
                              size={14}
                            />
                          </button>
                          <button title="Delete">
                            <I
                              d={
                                <>
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                </>
                              }
                              size={14}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ═══ 5. PREFERENCES ═══ */}
              <div className="pp-section">
                <div
                  className="pp-section-header"
                  onClick={() => toggleSection("prefs")}
                >
                  <h3>
                    <div className="pp-section-icon orange">
                      <I
                        d={
                          <>
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                          </>
                        }
                        size={16}
                      />
                    </div>
                    Preferences & Notifications
                  </h3>
                  <Chevron open={sections.prefs} />
                </div>
                <div
                  className={`pp-section-body ${sections.prefs ? "" : "collapsed"}`}
                >
                  <div className="pp-toggle-list">
                    {[
                      {
                        key: "appointmentReminders",
                        label: "Appointment Reminders",
                        desc: "Get notified before scheduled appointments",
                      },
                      {
                        key: "medicationReminders",
                        label: "Medication Reminders",
                        desc: "Daily reminders for your medications",
                      },
                      {
                        key: "emailNotifs",
                        label: "Email Notifications",
                        desc: "Receive updates via email",
                      },
                      {
                        key: "pushNotifs",
                        label: "Push Notifications",
                        desc: "Real-time notifications on your device",
                      },
                    ].map((item) => (
                      <div key={item.key} className="pp-toggle-item">
                        <div className="pp-toggle-info">
                          <div className="toggle-label">{item.label}</div>
                          <div className="toggle-desc">{item.desc}</div>
                        </div>
                        <Toggle
                          checked={prefs[item.key]}
                          onChange={() => {
                            setPrefs((p) => ({
                              ...p,
                              [item.key]: !p[item.key],
                            }));
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ═══ 6. PRIVACY ═══ */}
              <div className="pp-section">
                <div
                  className="pp-section-header"
                  onClick={() => toggleSection("privacy")}
                >
                  <h3>
                    <div className="pp-section-icon purple">
                      <I
                        d={
                          <>
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </>
                        }
                        size={16}
                      />
                    </div>
                    Privacy Settings
                  </h3>
                  <Chevron open={sections.privacy} />
                </div>
                <div
                  className={`pp-section-body ${sections.privacy ? "" : "collapsed"}`}
                >
                  <div className="pp-toggle-list">
                    {[
                      {
                        key: "shareWithDoctors",
                        label: "Share Data with Doctors",
                        desc: "Allow assigned doctors to view your health data",
                      },
                      {
                        key: "allowReviews",
                        label: "Allow Reviews",
                        desc: "Let others see your doctor reviews",
                      },
                      {
                        key: "profileVisible",
                        label: "Profile Visibility",
                        desc: "Make your profile visible to healthcare providers",
                      },
                    ].map((item) => (
                      <div key={item.key} className="pp-toggle-item">
                        <div className="pp-toggle-info">
                          <div className="toggle-label">{item.label}</div>
                          <div className="toggle-desc">{item.desc}</div>
                        </div>
                        <Toggle
                          checked={privacy[item.key]}
                          onChange={() => {
                            setPrivacy((p) => ({
                              ...p,
                              [item.key]: !p[item.key],
                            }));
                            setHasChanges(true);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="pp-setting-item" style={{ marginTop: 8 }}>
                    <div className="pp-setting-info">
                      <div className="setting-label">Download My Data</div>
                      <div className="setting-desc">
                        Request a copy of your personal data
                      </div>
                    </div>
                    <button className="pp-setting-btn">Request Download</button>
                  </div>
                </div>
              </div>

              {/* ═══ 7. ACCOUNT SETTINGS ═══ */}
              <div className="pp-section">
                <div
                  className="pp-section-header"
                  onClick={() => toggleSection("account")}
                >
                  <h3>
                    <div className="pp-section-icon pink">
                      <I
                        d={
                          <>
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </>
                        }
                        size={16}
                      />
                    </div>
                    Account Settings
                  </h3>
                  <Chevron open={sections.account} />
                </div>
                <div
                  className={`pp-section-body ${sections.account ? "" : "collapsed"}`}
                >
                  {[
                    {
                      label: "Change Password",
                      desc: "Update your account password",
                      btn: "Change",
                      danger: false,
                    },
                    {
                      label: "Two-Factor Authentication",
                      desc: "Add an extra layer of security",
                      btn: "Enable",
                      danger: false,
                    },
                    {
                      label: "Active Sessions",
                      desc: "View and manage active sessions",
                      btn: "View",
                      danger: false,
                    },
                    {
                      label: "Logout Other Devices",
                      desc: "Sign out from all other devices",
                      btn: "Logout All",
                      danger: true,
                    },
                  ].map((item, i) => (
                    <div key={i} className="pp-setting-item">
                      <div className="pp-setting-info">
                        <div className="setting-label">{item.label}</div>
                        <div className="setting-desc">{item.desc}</div>
                      </div>
                      <button
                        className={`pp-setting-btn ${item.danger ? "danger" : ""}`}
                      >
                        {item.btn}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══ STICKY SAVE BAR ═══ */}
            {hasChanges && (
              <div className="pp-save-bar">
                <div className="save-hint">⚠️ You have unsaved changes</div>
                <button
                  className="btn-cancel"
                  onClick={() => setHasChanges(false)}
                >
                  Discard
                </button>
                <button
                  className="btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
      </div>
    );
}
