"use client";
import { toast } from "sonner";
import "./settings.css";
import {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useActionState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Settings,
  Shield,
  Users,
  CheckCircle2,
  Calendar,
  Pill,
  Bell,
  Plug,
  Lock,
  Flag,
  FileText,
  CreditCard,
  Save,
  X,
  ChevronRight,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Download,
  Search,
  Globe,
  Mail,
  Clock,
  Monitor,
  Heart,
  Zap,
  AlertTriangle,
  Check,
  Copy,
  Server,
  Database,
  Cloud,
  Key,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader,
} from "lucide-react";
import {
  createDocumentType,
  removeDocumentType,
  toggleRequired,
  toggleActive,
  renameDocumentType,
  fetchAllDocumentTypesAction,
} from "@/actions/documentTypeAction";

/* ─── MOCK DATA ─── */
const INITIAL_GENERAL = {
  platformName: "MedSyncPro",
  supportEmail: "support@medsyncpro.com",
  language: "en",
  timezone: "America/New_York",
  maintenanceMode: false,
};
const ROLES = [
  {
    id: "admin",
    name: "Admin",
    desc: "Full system access",
    color: "#ef4444",
    perms: {
      dashboard: true,
      users: true,
      doctors: true,
      pharmacists: true,
      appointments: true,
      prescriptions: true,
      payments: true,
      reports: true,
      settings: true,
      audit: true,
    },
  },
  {
    id: "doctor",
    name: "Doctor",
    desc: "Medical operations",
    color: "#0891b2",
    perms: {
      dashboard: true,
      users: false,
      doctors: false,
      pharmacists: false,
      appointments: true,
      prescriptions: true,
      payments: false,
      reports: true,
      settings: false,
      audit: false,
    },
  },
  {
    id: "pharmacist",
    name: "Pharmacist",
    desc: "Pharmacy operations",
    color: "#8b5cf6",
    perms: {
      dashboard: true,
      users: false,
      doctors: false,
      pharmacists: false,
      appointments: false,
      prescriptions: true,
      payments: true,
      reports: true,
      settings: false,
      audit: false,
    },
  },
  {
    id: "patient",
    name: "Patient",
    desc: "Basic access",
    color: "#10b981",
    perms: {
      dashboard: true,
      users: false,
      doctors: false,
      pharmacists: false,
      appointments: true,
      prescriptions: true,
      payments: true,
      reports: false,
      settings: false,
      audit: false,
    },
  },
];
const PERM_LABELS = {
  dashboard: "Dashboard",
  users: "User Management",
  doctors: "Doctor Management",
  pharmacists: "Pharmacist Management",
  appointments: "Appointments",
  prescriptions: "Prescriptions",
  payments: "Payments",
  reports: "Reports",
  settings: "Settings",
  audit: "Audit Logs",
};

/* VERIF_RULES removed — now fetched dynamically from /api/admin/document-types/[model] */

const APPT_RULES = {
  defaultDuration: 30,
  cancellationWindow: 24,
  rescheduleLimit: 3,
  autoReminder: true,
  reminderHours: 2,
  noShowPolicy: "warn",
};
const RX_RULES = {
  expiryDays: 30,
  refillLimit: 3,
  controlledRestricted: true,
  templateEnabled: true,
};

const NOTIF_EVENTS = [
  {
    id: "new_user",
    label: "New User Registration",
    email: true,
    push: true,
    admin: true,
  },
  {
    id: "verification",
    label: "Verification Request",
    email: true,
    push: true,
    admin: true,
  },
  {
    id: "appointment",
    label: "Appointment Booked",
    email: true,
    push: true,
    admin: false,
  },
  {
    id: "cancellation",
    label: "Appointment Cancelled",
    email: true,
    push: false,
    admin: true,
  },
  {
    id: "prescription",
    label: "Prescription Issued",
    email: true,
    push: true,
    admin: false,
  },
  {
    id: "payment",
    label: "Payment Received",
    email: true,
    push: false,
    admin: false,
  },
  {
    id: "flag",
    label: "Account Flagged",
    email: true,
    push: true,
    admin: true,
  },
];

const INTEGRATIONS = [
  {
    id: "firebase",
    name: "Firebase",
    desc: "Push notifications & auth",
    icon: Zap,
    status: "connected",
    color: "#f59e0b",
  },
  {
    id: "smtp",
    name: "SMTP Email",
    desc: "Transactional email delivery",
    icon: Mail,
    status: "connected",
    color: "#10b981",
  },
  {
    id: "stripe",
    name: "Stripe",
    desc: "Payment processing",
    icon: CreditCard,
    status: "disconnected",
    color: "#6366f1",
  },
  {
    id: "aws",
    name: "AWS S3",
    desc: "File & document storage",
    icon: Cloud,
    status: "connected",
    color: "#0891b2",
  },
];

const SEC_SETTINGS = {
  minPassword: 8,
  require2FA: false,
  sessionTimeout: 30,
  loginMethods: ["email", "google"],
  ipAllowlist: "",
};

const FEATURE_FLAGS = [
  {
    id: "telemedicine",
    label: "Telemedicine Module",
    desc: "Video consultations",
    enabled: true,
    rollout: 100,
  },
  {
    id: "ai_chat",
    label: "AI Health Assistant",
    desc: "AI-powered chat for patients",
    enabled: false,
    rollout: 0,
  },
  {
    id: "pharmacy_delivery",
    label: "Pharmacy Delivery",
    desc: "Home delivery of medications",
    enabled: true,
    rollout: 80,
  },
  {
    id: "lab_integration",
    label: "Lab Results Integration",
    desc: "Sync with diagnostic labs",
    enabled: false,
    rollout: 0,
  },
  {
    id: "dark_mode",
    label: "Dark Mode",
    desc: "Dark theme for all users",
    enabled: false,
    rollout: 25,
  },
  {
    id: "referral_program",
    label: "Referral Program",
    desc: "Patient referral rewards",
    enabled: true,
    rollout: 100,
  },
];

const AUDIT_LOGS = [
  {
    id: 1,
    action: "Settings Updated",
    user: "Admin User",
    target: "General Settings",
    time: "2 hours ago",
    type: "settings",
  },
  {
    id: 2,
    action: "User Suspended",
    user: "Admin User",
    target: "Marcus Williams",
    time: "5 hours ago",
    type: "user",
  },
  {
    id: 3,
    action: "Doctor Verified",
    user: "Admin User",
    target: "Dr. Sarah Zhang",
    time: "1 day ago",
    type: "verification",
  },
  {
    id: 4,
    action: "Role Updated",
    user: "Admin User",
    target: "Pharmacist Role",
    time: "2 days ago",
    type: "role",
  },
  {
    id: 5,
    action: "Feature Flag Changed",
    user: "Admin User",
    target: "AI Health Assistant",
    time: "3 days ago",
    type: "feature",
  },
  {
    id: 6,
    action: "Integration Connected",
    user: "Admin User",
    target: "AWS S3 Storage",
    time: "5 days ago",
    type: "integration",
  },
  {
    id: 7,
    action: "Security Policy Updated",
    user: "Admin User",
    target: "Password Policy",
    time: "1 week ago",
    type: "security",
  },
  {
    id: 8,
    action: "User Approved",
    user: "Admin User",
    target: "Dr. Liam Patel",
    time: "1 week ago",
    type: "verification",
  },
];

const SECTION_TITLES = {
  general: {
    icon: Settings,
    title: "General Settings",
    desc: "Core platform configuration",
  },
  roles: {
    icon: Users,
    title: "Roles & Permissions",
    desc: "Manage user roles and access control",
  },
  verification: {
    icon: CheckCircle2,
    title: "User Verification Rules",
    desc: "Configure verification workflows for doctors, pharmacists, agents, and patients",
  },
  appointments: {
    icon: Calendar,
    title: "Appointment Rules",
    desc: "Configure scheduling and policies",
  },
  prescriptions: {
    icon: Pill,
    title: "Prescription Rules",
    desc: "Manage prescription policies and templates",
  },
  notifications: {
    icon: Bell,
    title: "Notification Settings",
    desc: "Configure notification channels per event",
  },
  integrations: {
    icon: Plug,
    title: "Integrations",
    desc: "Manage connected services and APIs",
  },
  security: {
    icon: Lock,
    title: "Security Settings",
    desc: "Configure authentication and access policies",
  },
  features: {
    icon: Flag,
    title: "Feature Flags",
    desc: "Enable or disable platform features with gradual rollout",
  },
  audit: {
    icon: FileText,
    title: "Audit Logs",
    desc: "Track all admin actions and changes",
  },
  billing: {
    icon: CreditCard,
    title: "Billing & Subscription",
    desc: "Manage platform billing and subscriptions",
  },
  system: {
    icon: Monitor,
    title: "System Preferences",
    desc: "Advanced system configuration",
  },
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
function SettingsContent() {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get("section") || "general";
  const [isDirty, setIsDirty] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [general, setGeneral] = useState(INITIAL_GENERAL);
  const [roles, setRoles] = useState(ROLES);

  const [appt, setAppt] = useState(APPT_RULES);
  const [rx, setRx] = useState(RX_RULES);
  const [notifs, setNotifs] = useState(NOTIF_EVENTS);
  const [sec, setSec] = useState(SEC_SETTINGS);
  const [features, setFeatures] = useState(FEATURE_FLAGS);
  const [auditFilter, setAuditFilter] = useState("all");

  const markDirty = () => {
    setIsDirty(true);
    setSaveMsg("");
  };
  const handleSave = () => {
    setIsDirty(false);
    setSaveMsg("Settings saved successfully!");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const updateGeneral = (k, v) => {
    setGeneral((p) => ({ ...p, [k]: v }));
    markDirty();
  };
  const togglePerm = (roleId, perm) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? { ...r, perms: { ...r.perms, [perm]: !r.perms[perm] } }
          : r,
      ),
    );
    markDirty();
  };
  const updateAppt = (k, v) => {
    setAppt((p) => ({ ...p, [k]: v }));
    markDirty();
  };
  const updateRx = (k, v) => {
    setRx((p) => ({ ...p, [k]: v }));
    markDirty();
  };
  const toggleNotif = (id, ch) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [ch]: !n[ch] } : n)),
    );
    markDirty();
  };
  const updateSec = (k, v) => {
    setSec((p) => ({ ...p, [k]: v }));
    markDirty();
  };
  const toggleFeature = (id) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    );
    markDirty();
  };
  const updateRollout = (id, v) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, rollout: Number(v) } : f)),
    );
    markDirty();
  };

  const sectionMeta = SECTION_TITLES[activeSection] || SECTION_TITLES.general;
  const SectionIcon = sectionMeta.icon;

  return (
    <div className="as-page">
      {/* Header */}
      <div className="as-header">
        <div>
          <h1 className="as-title">
            <Settings size={28} style={{ color: "#0d9488" }} /> Settings
          </h1>
          <p className="as-subtitle">
            Configure platform settings, security, and integrations
          </p>
        </div>
      </div>

      {/* Section header */}
      <div className="as-section-header">
        <h2>
          <SectionIcon size={20} /> {sectionMeta.title}
        </h2>
        <p>{sectionMeta.desc}</p>
      </div>

      {/* Content */}
      <div className="as-content">
        {activeSection === "general" && (
          <GeneralSection data={general} update={updateGeneral} />
        )}
        {activeSection === "roles" && (
          <RolesSection roles={roles} togglePerm={togglePerm} />
        )}
        {activeSection === "verification" && <VerificationSection />}
        {activeSection === "appointments" && (
          <AppointmentSection data={appt} update={updateAppt} />
        )}
        {activeSection === "prescriptions" && (
          <PrescriptionSection data={rx} update={updateRx} />
        )}
        {activeSection === "notifications" && (
          <NotifSection data={notifs} toggle={toggleNotif} />
        )}
        {activeSection === "integrations" && <IntegrationSection />}
        {activeSection === "security" && (
          <SecuritySection data={sec} update={updateSec} />
        )}
        {activeSection === "features" && (
          <FeatureFlagsSection
            data={features}
            toggle={toggleFeature}
            updateRollout={updateRollout}
          />
        )}
        {activeSection === "audit" && (
          <AuditSection filter={auditFilter} setFilter={setAuditFilter} />
        )}
        {activeSection === "billing" && <BillingSection />}
        {activeSection === "system" && <SystemSection />}
      </div>

      {/* Sticky Save Bar */}
      {(isDirty || saveMsg) && (
        <div className={`as-save-bar ${saveMsg ? "success" : ""}`}>
          {saveMsg ? (
            <>
              <Check size={16} /> {saveMsg}
            </>
          ) : (
            <>
              <span>
                <AlertTriangle size={14} /> You have unsaved changes
              </span>
              <div className="as-save-actions">
                <button
                  className="as-discard"
                  onClick={() => {
                    setIsDirty(false);
                    setGeneral(INITIAL_GENERAL);
                    setRoles(ROLES);
                    setAppt(APPT_RULES);
                    setRx(RX_RULES);
                    setNotifs(NOTIF_EVENTS);
                    setSec(SEC_SETTINGS);
                    setFeatures(FEATURE_FLAGS);
                  }}
                >
                  <X size={14} /> Discard
                </button>
                <button className="as-save" onClick={handleSave}>
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="as-page">
          <p>Loading...</p>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

/* ═══════════════ SECTION COMPONENTS ═══════════════ */

/* ─── General ─── */
function GeneralSection({ data, update }) {
  return (
    <div className="as-section">
      <div className="as-card admin-glass-card">
        <div className="as-form-grid">
          <div className="as-field">
            <label>Platform Name</label>
            <input
              type="text"
              value={data.platformName}
              onChange={(e) => update("platformName", e.target.value)}
            />
          </div>
          <div className="as-field">
            <label>Support Email</label>
            <input
              type="email"
              value={data.supportEmail}
              onChange={(e) => update("supportEmail", e.target.value)}
            />
          </div>
          <div className="as-field">
            <label>Default Language</label>
            <select
              value={data.language}
              onChange={(e) => update("language", e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div className="as-field">
            <label>Timezone</label>
            <select
              value={data.timezone}
              onChange={(e) => update("timezone", e.target.value)}
            >
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Chicago">Central (CT)</option>
              <option value="America/Denver">Mountain (MT)</option>
              <option value="America/Los_Angeles">Pacific (PT)</option>
              <option value="Asia/Kolkata">India (IST)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="as-card admin-glass-card">
        <h3>Branding</h3>
        <div className="as-upload-area">
          <Upload size={24} />
          <p>Drag & drop your logo here</p>
          <span>PNG, SVG, or JPG — max 2MB</span>
        </div>
      </div>
      <div className="as-card admin-glass-card">
        <div className="as-toggle-row">
          <div>
            <h3>Maintenance Mode</h3>
            <p className="as-toggle-desc">
              When enabled, only admins can access the platform
            </p>
          </div>
          <button
            className={`as-toggle ${data.maintenanceMode ? "on" : ""}`}
            onClick={() => update("maintenanceMode", !data.maintenanceMode)}
          >
            {data.maintenanceMode ? (
              <ToggleRight size={28} />
            ) : (
              <ToggleLeft size={28} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Roles & Permissions ─── */
function RolesSection({ roles, togglePerm }) {
  return (
    <div className="as-section">
      <div className="as-card admin-glass-card">
        <div className="as-roles-list">
          {roles.map((r) => (
            <div
              key={r.id}
              className="as-role-chip"
              style={{ borderColor: r.color + "40" }}
            >
              <div
                className="as-role-dot"
                style={{ background: r.color }}
              ></div>
              <div>
                <strong>{r.name}</strong>
                <span>{r.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="as-card admin-glass-card as-perm-card">
        <h3>Permission Matrix</h3>
        <div className="as-perm-table-wrap">
          <table className="as-perm-table">
            <thead>
              <tr>
                <th>Module</th>
                {roles.map((r) => (
                  <th key={r.id} style={{ color: r.color }}>
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(PERM_LABELS).map(([k, label]) => (
                <tr key={k}>
                  <td className="as-perm-label">{label}</td>
                  {roles.map((r) => (
                    <td key={r.id} className="as-perm-cell">
                      <button
                        className={`as-perm-toggle ${r.perms[k] ? "on" : ""}`}
                        onClick={() => r.id !== "admin" && togglePerm(r.id, k)}
                        disabled={r.id === "admin"}
                      >
                        {r.perms[k] ? <Check size={14} /> : <X size={14} />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Verification (dynamic, DB-driven) ─── */
const MODEL_TABS = [
  { key: "DOCTOR", label: "Doctor", color: "#0891b2" },
  { key: "PHARMACY", label: "Pharmacy", color: "#8b5cf6" },
  { key: "AGENT", label: "Agent", color: "#f59e0b" },
  { key: "PATIENT", label: "Patient", color: "#10b981" },
];

function VerificationSection() {
  const [activeModel, setActiveModel] = useState("DOCTOR");
  // All roles fetched once; tab view is derived by filtering — no re-fetch on tab switch
  const [allDocTypes, setAllDocTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formRequired, setFormRequired] = useState(true);
  const [formError, setFormError] = useState("");

  // Rename state
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Derive the visible list for the active tab without any extra fetch
  const docTypes = allDocTypes
    .filter((doc) => doc.role === activeModel)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  /* ── Fetch ALL document types once (and after every mutation) ── */
  const fetchAllDocTypes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchAllDocumentTypesAction();
      if (result.success) {
        setAllDocTypes(
          result.data.map((doc) => ({
            id: doc.id,
            name: doc.name,
            description: doc.description,
            code: doc.code,
            required: doc.required,
            active: doc.active,
            displayOrder: doc.displayOrder,
            role: doc.role, // ← kept so filtering works per tab
          })),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Single initial load — tab switches read from already-fetched allDocTypes
  useEffect(() => {
    fetchAllDocTypes();
  }, [fetchAllDocTypes]);

  /* ── useActionState: Remove ── */
  const [removeState, removeFormAction, removeIsPending] = useActionState(
    removeDocumentType,
    {},
  );

  useEffect(() => {
    if (!removeState?.success && !removeState?.message) return;
    if (removeState.success) {
      toast.success("Document type removed successfully.");
    } else {
      toast.error(removeState.message || "Failed to remove document type.");
    }
    fetchAllDocTypes();
  }, [removeState]);

  /* ── useActionState: Toggle Required ── */
  const [reqState, reqFormAction, reqIsPending] = useActionState(
    toggleRequired,
    {},
  );

  useEffect(() => {
    if (!reqState?.success && !reqState?.message) return;
    if (reqState.success) {
      toast.success("Required status toggled.");
    } else {
      toast.error(reqState.message || "Failed to toggle required status.");
    }
    fetchAllDocTypes();
  }, [reqState]);

  /* ── useActionState: Toggle Active ── */
  const [activeState, activeFormAction, activeIsPending] = useActionState(
    toggleActive,
    {},
  );

  useEffect(() => {
    if (!activeState?.success && !activeState?.message) return;
    if (activeState.success) {
      toast.success("Active status toggled.");
    } else {
      toast.error(activeState.message || "Failed to toggle active status.");
    }
    fetchAllDocTypes();
  }, [activeState]);

  /* ── useActionState: Create ── */
  const [createState, createFormAction, createIsPending] = useActionState(
    createDocumentType,
    {},
  );

  useEffect(() => {
    if (!createState?.success && !createState?.message) return;
    if (createState.success) {
      toast.success("Document type created successfully.");
      setFormName("");
      setFormDesc("");
      setFormRequired(true);
      setShowForm(false);
      setFormError("");
    } else {
      setFormError(createState.message || "Failed to create document type.");
    }
    fetchAllDocTypes();
  }, [createState]);

  /* ── useActionState: Rename ── */
  const [renameState, renameFormAction, renameIsPending] = useActionState(
    renameDocumentType,
    {},
  );

  useEffect(() => {
    if (!renameState?.success && !renameState?.message) return;
    if (renameState.success) {
      toast.success("Document type renamed successfully.");
      setRenamingId(null);
      setRenameValue("");
    } else {
      toast.error(renameState.message || "Failed to rename document type.");
    }
    fetchAllDocTypes();
  }, [renameState]);

  const activeTab = MODEL_TABS.find((t) => t.key === activeModel);

  return (
    <div className="as-section">
      {/* ── Model tab selector ── */}
      <div className="as-card admin-glass-card">
        <div className="vdt-tabs">
          {MODEL_TABS.map((t) => (
            <button
              key={t.key}
              className={`vdt-tab ${activeModel === t.key ? "active" : ""}`}
              style={
                activeModel === t.key
                  ? { borderColor: t.color, color: t.color }
                  : {}
              }
              onClick={() => setActiveModel(t.key)}
            >
              <span className="vdt-tab-dot" style={{ background: t.color }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Doc-type cards or loading ── */}
      {loading ? (
        <div
          className="as-card admin-glass-card"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <Loader
            size={20}
            className="vdt-spin"
            style={{ color: activeTab?.color }}
          />{" "}
          Loading document types…
        </div>
      ) : (
        <>
          {docTypes.length === 0 && (
            <div
              className="as-card admin-glass-card"
              style={{ textAlign: "center", padding: "1.5rem", opacity: 0.7 }}
            >
              No document types configured for{" "}
              <strong>{activeTab?.label}</strong> yet.
            </div>
          )}

          {docTypes.map((dt) => (
            <div
              key={dt.id}
              className={`as-card admin-glass-card vdt-doc-card ${!dt.active ? "vdt-inactive" : ""}`}
            >
              <div className="vdt-doc-row">
                <div className="vdt-doc-info">
                  {renamingId === dt.id ? (
                    <form
                      action={renameFormAction}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <input type="hidden" name="mappingId" value={dt.id} />
                      <input
                        type="text"
                        name="newName"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        style={{
                          padding: "0.3rem 0.5rem",
                          borderRadius: 6,
                          border: "1px solid #555",
                          background: "rgba(255,255,255,0.05)",
                          color: "inherit",
                          fontSize: "0.9rem",
                        }}
                        autoFocus
                        required
                      />
                      <button
                        type="submit"
                        className="vdt-btn save"
                        disabled={renameIsPending}
                        style={{ padding: "0.3rem 0.7rem" }}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        className="vdt-btn cancel"
                        onClick={() => {
                          setRenamingId(null);
                          setRenameValue("");
                        }}
                        style={{ padding: "0.3rem 0.7rem" }}
                      >
                        <X size={14} />
                      </button>
                    </form>
                  ) : (
                    <h4
                      onClick={() => {
                        setRenamingId(dt.id);
                        setRenameValue(dt.name);
                      }}
                      style={{ cursor: "pointer" }}
                      title="Click to rename"
                    >
                      {dt.name}
                    </h4>
                  )}
                  {dt.description && (
                    <p className="vdt-doc-desc">{dt.description}</p>
                  )}
                  <div className="vdt-badges">
                    <span
                      className={`vdt-badge ${dt.required ? "required" : "optional"}`}
                    >
                      {dt.required ? "Required" : "Optional"}
                    </span>
                    <span
                      className={`vdt-badge ${dt.active ? "active" : "inactive"}`}
                    >
                      {dt.active ? "Active" : "Inactive"}
                    </span>
                    <span className="vdt-badge code">{dt.code}</span>
                  </div>
                </div>

                <div className="vdt-doc-actions">
                  <form action={reqFormAction}>
                    <input type="hidden" name="mappingId" value={dt.id} />
                    <button
                      type="submit"
                      className={`as-toggle ${dt.required ? "on" : ""}`}
                      disabled={reqIsPending}
                      title={dt.required ? "Make optional" : "Make required"}
                    >
                      {dt.required ? (
                        <ToggleRight size={22} />
                      ) : (
                        <ToggleLeft size={22} />
                      )}
                    </button>
                  </form>
                  <form action={activeFormAction}>
                    <input type="hidden" name="mappingId" value={dt.id} />
                    <button
                      type="submit"
                      className={`vdt-btn ${dt.active ? "warn" : "ok"}`}
                      disabled={activeIsPending}
                    >
                      {dt.active ? <EyeOff size={14} /> : <Eye size={14} />}
                      {dt.active ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                  <form action={removeFormAction}>
                    <input
                      type="hidden"
                      name="deleteDocTypeBtn"
                      value={dt.id}
                    />
                    <button
                      className="vdt-btn danger"
                      disabled={removeIsPending}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* ── Create form (useActionState) ── */}
      {showForm ? (
        <div className="as-card admin-glass-card vdt-create-card">
          <form action={createFormAction} className="vdt-form">
            <h3>Add Document Type to {activeTab?.label}</h3>
            {formError && (
              <p className="vdt-form-error">
                <AlertTriangle size={14} /> {formError}
              </p>
            )}
            <input type="hidden" name="modelType" value={activeModel} />
            <input
              type="hidden"
              name="required"
              value={formRequired ? "true" : "false"}
            />
            <input
              type="hidden"
              name="displayOrder"
              value={String(docTypes.length + 1)}
            />
            <div className="as-form-grid">
              <div className="as-field">
                <label>Document Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Medical License"
                  required
                />
              </div>
              <div className="as-field">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <label className="vdt-check-row">
              <input
                type="checkbox"
                checked={formRequired}
                onChange={(e) => setFormRequired(e.target.checked)}
              />
              Required for verification
            </label>
            <div className="vdt-form-actions">
              <button
                type="button"
                className="vdt-btn cancel"
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
              >
                <X size={14} /> Cancel
              </button>
              <button
                type="submit"
                className="vdt-btn save"
                disabled={createIsPending}
              >
                {createIsPending ? (
                  <Loader size={14} className="vdt-spin" />
                ) : (
                  <Plus size={14} />
                )}{" "}
                Add Document Type
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button className="vdt-add-btn" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Document Type
        </button>
      )}

      {/* ── Workflow preview ── */}
      <div className="as-card admin-glass-card as-workflow-preview">
        <h3>Verification Workflow</h3>
        <div className="as-workflow-steps">
          {[
            "User Registers",
            "Documents Uploaded",
            "Admin Review",
            "Manual Approval",
            "Account Active",
          ].map((s, i) => (
            <div key={i} className="as-wf-step">
              <div className="as-wf-num">{i + 1}</div>
              <span>{s}</span>
              {i < 4 && <ChevronRight size={14} className="as-wf-arrow" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Appointments ─── */
function AppointmentSection({ data, update }) {
  return (
    <div className="as-section">
      <div className="as-card admin-glass-card">
        <div className="as-form-grid">
          <div className="as-field">
            <label>Default Duration (min)</label>
            <input
              type="number"
              value={data.defaultDuration}
              onChange={(e) =>
                update("defaultDuration", Number(e.target.value))
              }
            />
          </div>
          <div className="as-field">
            <label>Cancellation Window (hrs)</label>
            <input
              type="number"
              value={data.cancellationWindow}
              onChange={(e) =>
                update("cancellationWindow", Number(e.target.value))
              }
            />
          </div>
          <div className="as-field">
            <label>Reschedule Limit</label>
            <input
              type="number"
              value={data.rescheduleLimit}
              onChange={(e) =>
                update("rescheduleLimit", Number(e.target.value))
              }
            />
          </div>
          <div className="as-field">
            <label>Reminder Before (hrs)</label>
            <input
              type="number"
              value={data.reminderHours}
              onChange={(e) => update("reminderHours", Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className="as-card admin-glass-card">
        <div className="as-toggle-row">
          <div>
            <h3>Auto Reminders</h3>
            <p className="as-toggle-desc">
              Send appointment reminders automatically
            </p>
          </div>
          <button
            className={`as-toggle ${data.autoReminder ? "on" : ""}`}
            onClick={() => update("autoReminder", !data.autoReminder)}
          >
            {data.autoReminder ? (
              <ToggleRight size={28} />
            ) : (
              <ToggleLeft size={28} />
            )}
          </button>
        </div>
      </div>
      <div className="as-card admin-glass-card">
        <div className="as-field">
          <label>No-Show Policy</label>
          <select
            value={data.noShowPolicy}
            onChange={(e) => update("noShowPolicy", e.target.value)}
          >
            <option value="warn">Warn patient</option>
            <option value="charge">Charge cancellation fee</option>
            <option value="block">Block after 3 no-shows</option>
            <option value="none">No action</option>
          </select>
        </div>
      </div>
    </div>
  );
}

/* ─── Prescriptions ─── */
function PrescriptionSection({ data, update }) {
  return (
    <div className="as-section">
      <div className="as-card admin-glass-card">
        <div className="as-form-grid">
          <div className="as-field">
            <label>Prescription Expiry (days)</label>
            <input
              type="number"
              value={data.expiryDays}
              onChange={(e) => update("expiryDays", Number(e.target.value))}
            />
          </div>
          <div className="as-field">
            <label>Refill Limit</label>
            <input
              type="number"
              value={data.refillLimit}
              onChange={(e) => update("refillLimit", Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className="as-card admin-glass-card">
        <div className="as-toggle-row">
          <div>
            <h3>Controlled Substances Restrictions</h3>
            <p className="as-toggle-desc">
              Require additional verification for controlled substances
            </p>
          </div>
          <button
            className={`as-toggle ${data.controlledRestricted ? "on" : ""}`}
            onClick={() =>
              update("controlledRestricted", !data.controlledRestricted)
            }
          >
            {data.controlledRestricted ? (
              <ToggleRight size={28} />
            ) : (
              <ToggleLeft size={28} />
            )}
          </button>
        </div>
      </div>
      <div className="as-card admin-glass-card">
        <div className="as-toggle-row">
          <div>
            <h3>Prescription Templates</h3>
            <p className="as-toggle-desc">
              Enable standardized prescription templates for doctors
            </p>
          </div>
          <button
            className={`as-toggle ${data.templateEnabled ? "on" : ""}`}
            onClick={() => update("templateEnabled", !data.templateEnabled)}
          >
            {data.templateEnabled ? (
              <ToggleRight size={28} />
            ) : (
              <ToggleLeft size={28} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Notifications ─── */
function NotifSection({ data, toggle }) {
  return (
    <div className="as-section">
      <div className="as-card admin-glass-card as-notif-card">
        <div className="as-notif-table-wrap">
          <table className="as-notif-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>
                  <Mail size={14} /> Email
                </th>
                <th>
                  <Zap size={14} /> Push
                </th>
                <th>
                  <Shield size={14} /> Admin Alert
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((n) => (
                <tr key={n.id}>
                  <td className="as-notif-label">{n.label}</td>
                  <td className="as-notif-cell">
                    <button
                      className={`as-perm-toggle ${n.email ? "on" : ""}`}
                      onClick={() => toggle(n.id, "email")}
                    >
                      {n.email ? <Check size={14} /> : <X size={14} />}
                    </button>
                  </td>
                  <td className="as-notif-cell">
                    <button
                      className={`as-perm-toggle ${n.push ? "on" : ""}`}
                      onClick={() => toggle(n.id, "push")}
                    >
                      {n.push ? <Check size={14} /> : <X size={14} />}
                    </button>
                  </td>
                  <td className="as-notif-cell">
                    <button
                      className={`as-perm-toggle ${n.admin ? "on" : ""}`}
                      onClick={() => toggle(n.id, "admin")}
                    >
                      {n.admin ? <Check size={14} /> : <X size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Integrations ─── */
function IntegrationSection() {
  const [showKey, setShowKey] = useState({});
  return (
    <div className="as-section">
      {INTEGRATIONS.map((int) => (
        <div key={int.id} className="as-card admin-glass-card as-integ-card">
          <div className="as-integ-row">
            <div
              className="as-integ-icon"
              style={{ background: int.color + "15", color: int.color }}
            >
              <int.icon size={22} />
            </div>
            <div className="as-integ-info">
              <h3>{int.name}</h3>
              <p>{int.desc}</p>
            </div>
            <div className="as-integ-status-area">
              <span className={`as-integ-status ${int.status}`}>
                <span className="as-integ-dot"></span>
                {int.status === "connected" ? "Connected" : "Disconnected"}
              </span>
              <button
                className={`as-integ-btn ${int.status === "connected" ? "disconnect" : "connect"}`}
              >
                {int.status === "connected" ? "Disconnect" : "Connect"}
              </button>
            </div>
          </div>
          {int.status === "connected" && (
            <div className="as-integ-key-row">
              <label>API Key</label>
              <div className="as-key-box">
                <code>
                  {showKey[int.id]
                    ? `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
                    : "sk_live_••••••••••••••••••••••••"}
                </code>
                <button
                  onClick={() =>
                    setShowKey((p) => ({ ...p, [int.id]: !p[int.id] }))
                  }
                >
                  {showKey[int.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`,
                    )
                  }
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Security ─── */
function SecuritySection({ data, update }) {
  return (
    <div className="as-section">
      <div className="as-card admin-glass-card">
        <h3>Password Policy</h3>
        <div className="as-form-grid">
          <div className="as-field">
            <label>Minimum Password Length</label>
            <input
              type="number"
              value={data.minPassword}
              onChange={(e) => update("minPassword", Number(e.target.value))}
            />
          </div>
          <div className="as-field">
            <label>Session Timeout (min)</label>
            <input
              type="number"
              value={data.sessionTimeout}
              onChange={(e) => update("sessionTimeout", Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className="as-card admin-glass-card">
        <div className="as-toggle-row">
          <div>
            <h3>Enforce Two-Factor Authentication</h3>
            <p className="as-toggle-desc">
              Require 2FA for all admin and doctor accounts
            </p>
          </div>
          <button
            className={`as-toggle ${data.require2FA ? "on" : ""}`}
            onClick={() => update("require2FA", !data.require2FA)}
          >
            {data.require2FA ? (
              <ToggleRight size={28} />
            ) : (
              <ToggleLeft size={28} />
            )}
          </button>
        </div>
      </div>
      <div className="as-card admin-glass-card">
        <h3>Allowed Login Methods</h3>
        <div className="as-login-methods">
          {[
            { id: "email", label: "Email & Password", icon: Mail },
            { id: "google", label: "Google OAuth", icon: Globe },
            { id: "sso", label: "SSO / SAML", icon: Key },
          ].map((m) => (
            <label key={m.id} className="as-method-check">
              <input
                type="checkbox"
                checked={data.loginMethods.includes(m.id)}
                onChange={() => {
                  const n = data.loginMethods.includes(m.id)
                    ? data.loginMethods.filter((x) => x !== m.id)
                    : [...data.loginMethods, m.id];
                  update("loginMethods", n);
                }}
              />
              <m.icon size={16} /> {m.label}
            </label>
          ))}
        </div>
      </div>
      <div className="as-card admin-glass-card">
        <h3>IP Allowlist</h3>
        <p className="as-toggle-desc">
          Restrict admin access to specific IP addresses (one per line)
        </p>
        <textarea
          className="as-ip-input"
          placeholder={"192.168.1.1\n10.0.0.0/24"}
          value={data.ipAllowlist}
          onChange={(e) => update("ipAllowlist", e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}

/* ─── Feature Flags ─── */
function FeatureFlagsSection({ data, toggle, updateRollout }) {
  return (
    <div className="as-section">
      {data.map((f) => (
        <div key={f.id} className="as-card admin-glass-card as-flag-card">
          <div className="as-flag-row">
            <div className="as-flag-info">
              <h3>{f.label}</h3>
              <p>{f.desc}</p>
            </div>
            <button
              className={`as-toggle ${f.enabled ? "on" : ""}`}
              onClick={() => toggle(f.id)}
            >
              {f.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
          {f.enabled && (
            <div className="as-flag-rollout">
              <label>
                Rollout: <strong>{f.rollout}%</strong>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={f.rollout}
                onChange={(e) => updateRollout(f.id, e.target.value)}
                className="as-range"
              />
              <div className="as-rollout-bar">
                <div
                  className="as-rollout-fill"
                  style={{ width: `${f.rollout}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Audit Logs ─── */
function AuditSection({ filter, setFilter }) {
  const types = [
    "all",
    "settings",
    "user",
    "verification",
    "role",
    "feature",
    "integration",
    "security",
  ];
  const filtered =
    filter === "all" ? AUDIT_LOGS : AUDIT_LOGS.filter((l) => l.type === filter);
  const typeColors = {
    settings: "#0891b2",
    user: "#8b5cf6",
    verification: "#10b981",
    role: "#f59e0b",
    feature: "#6366f1",
    integration: "#0d9488",
    security: "#ef4444",
  };
  return (
    <div className="as-section">
      <div className="as-card admin-glass-card">
        <div className="as-audit-toolbar">
          <div className="as-audit-filters">
            {types.map((t) => (
              <button
                key={t}
                className={`as-audit-filter ${filter === t ? "active" : ""}`}
                onClick={() => setFilter(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <button className="as-export-btn">
            <Download size={14} /> Export
          </button>
        </div>
        <div className="as-audit-list">
          {filtered.map((log) => (
            <div key={log.id} className="as-audit-item">
              <div
                className="as-audit-type-dot"
                style={{ background: typeColors[log.type] }}
              ></div>
              <div className="as-audit-info">
                <span className="as-audit-action">{log.action}</span>
                <span className="as-audit-target">Target: {log.target}</span>
              </div>
              <div className="as-audit-meta">
                <span className="as-audit-user">{log.user}</span>
                <span className="as-audit-time">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Billing ─── */
function BillingSection() {
  return (
    <div className="as-section">
      <div className="as-card admin-glass-card">
        <div className="as-plan-card">
          <div className="as-plan-badge">Current Plan</div>
          <h3>Enterprise</h3>
          <p className="as-plan-price">
            $299<span>/month</span>
          </p>
          <ul className="as-plan-features">
            <li>
              <Check size={14} /> Unlimited users
            </li>
            <li>
              <Check size={14} /> All integrations
            </li>
            <li>
              <Check size={14} /> Priority support
            </li>
            <li>
              <Check size={14} /> Custom branding
            </li>
            <li>
              <Check size={14} /> Advanced analytics
            </li>
          </ul>
          <button className="as-upgrade-btn">Manage Subscription</button>
        </div>
      </div>
    </div>
  );
}

/* ─── System ─── */
function SystemSection() {
  return (
    <div className="as-section">
      <div className="as-card admin-glass-card">
        <div className="as-sys-grid">
          {[
            {
              icon: Server,
              label: "Server Status",
              value: "Healthy",
              color: "#10b981",
            },
            {
              icon: Database,
              label: "Database",
              value: "Connected",
              color: "#0891b2",
            },
            {
              icon: Cloud,
              label: "Storage Used",
              value: "45.2 GB / 100 GB",
              color: "#6366f1",
            },
            {
              icon: RefreshCw,
              label: "Last Backup",
              value: "2 hours ago",
              color: "#f59e0b",
            },
          ].map((s, i) => (
            <div key={i} className="as-sys-item">
              <div
                className="as-sys-icon"
                style={{ background: s.color + "15", color: s.color }}
              >
                <s.icon size={20} />
              </div>
              <div>
                <span className="as-sys-label">{s.label}</span>
                <span className="as-sys-value" style={{ color: s.color }}>
                  {s.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="as-card admin-glass-card">
        <div className="as-toggle-row">
          <div>
            <h3>Debug Mode</h3>
            <p className="as-toggle-desc">
              Enable verbose logging for troubleshooting
            </p>
          </div>
          <button className="as-toggle">
            <ToggleLeft size={28} />
          </button>
        </div>
      </div>
      <div className="as-card admin-glass-card">
        <div className="as-toggle-row">
          <div>
            <h3>API Rate Limiting</h3>
            <p className="as-toggle-desc">
              Restrict API calls to 100 requests/minute per user
            </p>
          </div>
          <button className="as-toggle on">
            <ToggleRight size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}
