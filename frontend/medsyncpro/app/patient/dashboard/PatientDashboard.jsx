"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  fetchAdherenceSummaryAction,
  fetchHealthTrackerEntriesAction,
} from "@/actions/medicationAction";
import "../patient-dashboard.css";
import FindDoctorClient from "../find-doctor/Finddoctorclient";
import PatientSidebarLayout from "../components/PatientSidebarLayout";

/* ─── Tiny SVG Icon helper ─── */
const I = ({ d, size = 18, stroke = "currentColor", fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

/* ──────────────── MOCK DATA ──────────────── */
const MOCK_APPOINTMENTS = [
  {
    id: 1,
    doctor: "Dr. Sarah Chen",
    specialty: "Cardiologist",
    date: "2026-03-02",
    time: "10:00 AM",
    type: "online",
    status: "confirmed",
  },
  {
    id: 2,
    doctor: "Dr. James Lee",
    specialty: "Dermatologist",
    date: "2026-03-05",
    time: "2:30 PM",
    type: "in-person",
    status: "confirmed",
  },
  {
    id: 3,
    doctor: "Dr. Priya Sharma",
    specialty: "General Physician",
    date: "2026-03-08",
    time: "11:15 AM",
    type: "online",
    status: "pending",
  },
  {
    id: 4,
    doctor: "Dr. Michael Brown",
    specialty: "Orthopedic",
    date: "2026-03-12",
    time: "9:00 AM",
    type: "in-person",
    status: "confirmed",
  },
];

const MOCK_PRESCRIPTIONS = [
  {
    id: 1,
    name: "Metformin 500mg",
    detail: "1 tablet twice daily • After meals",
    days: "18 days left",
    status: "active",
    color: "var(--pd-teal)",
  },
  {
    id: 2,
    name: "Amlodipine 5mg",
    detail: "1 tablet daily • Morning",
    days: "5 days left",
    status: "refill-needed",
    color: "var(--pd-orange)",
  },
  {
    id: 3,
    name: "Vitamin D3 60K",
    detail: "1 capsule weekly • Sunday",
    days: "3 weeks left",
    status: "active",
    color: "var(--pd-blue)",
  },
  {
    id: 4,
    name: "Omeprazole 20mg",
    detail: "1 capsule daily • Before breakfast",
    days: "Expired",
    status: "expired",
    color: "var(--pd-red)",
  },
];

const MOCK_TIMELINE = [
  {
    id: 1,
    type: "visit",
    date: "Feb 20, 2026",
    title: "General Checkup",
    desc: "Routine check with Dr. Sharma — vitals normal",
  },
  {
    id: 2,
    type: "prescription",
    date: "Feb 20, 2026",
    title: "Prescription Updated",
    desc: "Metformin dosage adjusted to 500mg",
  },
  {
    id: 3,
    type: "lab",
    date: "Feb 15, 2026",
    title: "Blood Work Results",
    desc: "CBC, Lipid panel, HbA1c — all within normal range",
  },
  {
    id: 4,
    type: "diagnosis",
    date: "Jan 28, 2026",
    title: "Diagnosis: Pre-diabetes",
    desc: "HbA1c at 6.2% — lifestyle changes recommended",
  },
  {
    id: 5,
    type: "visit",
    date: "Jan 10, 2026",
    title: "Orthopedic Consultation",
    desc: "Knee pain assessment — MRI ordered",
  },
];

const MOCK_MESSAGES = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    preview: "Your latest ECG report looks good. Keep up the...",
    time: "2h ago",
    unread: true,
    initials: "SC",
  },
  {
    id: 2,
    name: "Dr. Priya Sharma",
    preview: "Please fast for 12 hours before your next blood...",
    time: "5h ago",
    unread: true,
    initials: "PS",
  },
  {
    id: 3,
    name: "Dr. James Lee",
    preview: "The skin biopsy results are ready. No concerns...",
    time: "1d ago",
    unread: false,
    initials: "JL",
  },
  {
    id: 4,
    name: "Dr. Michael Brown",
    preview: "How is the knee feeling after the exercises?",
    time: "2d ago",
    unread: false,
    initials: "MB",
  },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "appointment",
    title: "Appointment tomorrow at 10:00 AM",
    time: "Just now",
    icon: "📅",
    bg: "var(--pd-teal-light)",
  },
  {
    id: 2,
    type: "prescription",
    title: "Amlodipine refill needed in 5 days",
    time: "1h ago",
    icon: "💊",
    bg: "var(--pd-orange-light)",
  },
  {
    id: 3,
    type: "lab",
    title: "Lab results available for review",
    time: "3h ago",
    icon: "🔬",
    bg: "var(--pd-blue-light)",
  },
  {
    id: 4,
    type: "followup",
    title: "Follow-up with Dr. Sharma due",
    time: "Yesterday",
    icon: "🔔",
    bg: "var(--pd-purple-light)",
  },
  {
    id: 5,
    type: "system",
    title: "Profile update completed",
    time: "2 days ago",
    icon: "✅",
    bg: "var(--pd-mint-light)",
  },
];

const VITALS_DATA = {
  bp: [
    { date: "Feb 1", systolic: 128, diastolic: 82 },
    { date: "Feb 5", systolic: 125, diastolic: 80 },
    { date: "Feb 10", systolic: 130, diastolic: 85 },
    { date: "Feb 15", systolic: 122, diastolic: 78 },
    { date: "Feb 20", systolic: 124, diastolic: 80 },
    { date: "Feb 25", systolic: 120, diastolic: 76 },
  ],
  weight: [
    { date: "Jan", value: 78 },
    { date: "Feb", value: 77.2 },
    { date: "Mar", value: 76.5 },
  ],
  sugar: [
    { date: "Feb 1", fasting: 112, pp: 148 },
    { date: "Feb 8", fasting: 108, pp: 142 },
    { date: "Feb 15", fasting: 105, pp: 138 },
    { date: "Feb 22", fasting: 102, pp: 134 },
  ],
};

/* ─── Sidebar Items ─── */
const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <I
        d={
          <>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </>
        }
      />
    ),
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: (
      <I d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM16 2v4M8 2v4M3 10h18" />
    ),
  },
  {
    id: "find-doctor",
    label: "Find Doctor",
    icon: (
      <I
        d={
          <>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </>
        }
      />
    ),
  },
  {
    id: "prescriptions",
    label: "Prescriptions",
    icon: (
      <I
        d={
          <>
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v6m0 0H3m6 0h12M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 1-2-2V9" />
            <path d="M9 14h.01M9 17h.01M13 14h2M13 17h2" />
          </>
        }
      />
    ),
    badge: 2,
  },
  {
    id: "vitals",
    label: "Health Vitals",
    icon: <I d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  },
  {
    id: "history",
    label: "Medical History",
    icon: (
      <I
        d={
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </>
        }
      />
    ),
  },
  {
    id: "messages",
    label: "Messages",
    icon: (
      <I
        d={
          <>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </>
        }
      />
    ),
    badge: 2,
  },
  {
    id: "reports",
    label: "Reports",
    icon: (
      <I
        d={
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8M16 17H8M10 9H8" />
          </>
        }
      />
    ),
  },
  {
    id: "profile",
    label: "My Profile",
    icon: (
      <I
        d={
          <>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </>
        }
      />
    ),
  },
];

/* ──────────────── COMPONENT ──────────────── */
export default function PatientDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [vitalTab, setVitalTab] = useState("bp");
  const [adherencePct, setAdherencePct] = useState(87);
  const [healthEntries, setHealthEntries] = useState([]);

  const firstName = user?.name?.split(" ")[0] || "Patient";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "P";

  useEffect(() => {
    const loadPatientHealth = async () => {
      const [adherence, entries] = await Promise.all([
        fetchAdherenceSummaryAction(30),
        fetchHealthTrackerEntriesAction(),
      ]);

      if (adherence?.success && adherence?.data?.adherencePercentage != null) {
        const pct = Number(adherence.data.adherencePercentage);
        if (!Number.isNaN(pct)) {
          setAdherencePct(Math.max(0, Math.min(100, Math.round(pct))));
        }
      }

      if (entries?.success && Array.isArray(entries.data)) {
        setHealthEntries(entries.data);
      }
    };

    loadPatientHealth();
  }, []);

  const formatApptDate = (dateStr) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleString("default", { month: "short" }),
    };
  };

  /* ─── Simple sparkline SVG for vitals ─── */
  const renderMiniChart = () => {
    if (vitalTab === "bp") {
      const data = VITALS_DATA.bp;
      const maxY = 140,
        minY = 70;
      const w = 100,
        h = 100;
      const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * w,
        y1: h - ((d.systolic - minY) / (maxY - minY)) * h,
        y2: h - ((d.diastolic - minY) / (maxY - minY)) * h,
      }));
      const line1 = points.map((p) => `${p.x},${p.y1}`).join(" ");
      const line2 = points.map((p) => `${p.x},${p.y2}`).join(" ");
      return (
        <svg
          viewBox={`-4 -4 ${w + 8} ${h + 8}`}
          style={{ width: "100%", height: 200 }}
          preserveAspectRatio="none"
        >
          <polyline
            points={line1}
            fill="none"
            stroke="var(--pd-teal)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={line2}
            fill="none"
            stroke="var(--pd-blue)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y1} r="3" fill="var(--pd-teal)" />
              <circle cx={p.x} cy={p.y2} r="3" fill="var(--pd-blue)" />
            </g>
          ))}
        </svg>
      );
    }
    if (vitalTab === "weight") {
      const data = VITALS_DATA.weight;
      const maxY = 80,
        minY = 74;
      const w = 100,
        h = 100;
      const points = data.map((d, i) => ({
        x: (i / (data.length - 1 || 1)) * w,
        y: h - ((d.value - minY) / (maxY - minY)) * h,
      }));
      const area = `0,${h} ${points.map((p) => `${p.x},${p.y}`).join(" ")} ${w},${h}`;
      const line = points.map((p) => `${p.x},${p.y}`).join(" ");
      return (
        <svg
          viewBox={`-4 -4 ${w + 8} ${h + 8}`}
          style={{ width: "100%", height: 200 }}
          preserveAspectRatio="none"
        >
          <polygon points={area} fill="var(--pd-purple-light)" opacity="0.5" />
          <polyline
            points={line}
            fill="none"
            stroke="var(--pd-purple)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--pd-purple)" />
          ))}
        </svg>
      );
    }
    /* sugar */
    const data = VITALS_DATA.sugar;
    const maxY = 160,
      minY = 90;
    const w = 100,
      h = 100;
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * w,
      y1: h - ((d.fasting - minY) / (maxY - minY)) * h,
      y2: h - ((d.pp - minY) / (maxY - minY)) * h,
    }));
    const l1 = points.map((p) => `${p.x},${p.y1}`).join(" ");
    const l2 = points.map((p) => `${p.x},${p.y2}`).join(" ");
    return (
      <svg
        viewBox={`-4 -4 ${w + 8} ${h + 8}`}
        style={{ width: "100%", height: 200 }}
        preserveAspectRatio="none"
      >
        <polyline
          points={l1}
          fill="none"
          stroke="var(--pd-orange)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={l2}
          fill="none"
          stroke="var(--pd-red)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y1} r="3" fill="var(--pd-orange)" />
            <circle cx={p.x} cy={p.y2} r="3" fill="var(--pd-red)" />
          </g>
        ))}
      </svg>
    );
  };

  const vitalStats = {
    bp: [
      { label: "Systolic", value: "120", unit: "mmHg" },
      { label: "Diastolic", value: "76", unit: "mmHg" },
      { label: "Pulse", value: "72", unit: "bpm" },
    ],
    weight: [
      { label: "Current", value: "76.5", unit: "kg" },
      { label: "Goal", value: "74", unit: "kg" },
      { label: "BMI", value: "24.1", unit: "" },
    ],
    sugar: [
      { label: "Fasting", value: "102", unit: "mg/dL" },
      { label: "Post-meal", value: "134", unit: "mg/dL" },
      { label: "HbA1c", value: "6.2", unit: "%" },
    ],
  };

  /* ──────────── RENDER ──────────── */
    return (
      <div className="lg:px-20">
        {/* Greeting */}
        <div className="pd-greeting">
          <h1>Hello, {firstName} 👋</h1>
          <p>Here&apos;s your health overview for today — stay on track!</p>
        </div>

        {/* Reminder Banner */}
        <div className="pd-reminder-banner">
          <div className="banner-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <div className="banner-text">
            <h3>Upcoming: Dr. Sarah Chen — Cardiology</h3>
            <p>Tomorrow, March 2 at 10:00 AM • Video Consultation</p>
          </div>
          <button className="banner-action">View Details</button>
        </div>

        {/* KPI Cards */}
        <div className="pd-kpi-grid">
          <div className="pd-kpi-card">
            <div className="pd-kpi-icon teal">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <div className="pd-kpi-info">
              <div className="kpi-label">Upcoming Appointments</div>
              <div className="kpi-value">4</div>
              <div className="kpi-sub">Next: Tomorrow 10 AM</div>
            </div>
          </div>
          <div className="pd-kpi-card">
            <div className="pd-kpi-icon blue">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v6m0 0H3m6 0h12M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 1-2-2V9" />
              </svg>
            </div>
            <div className="pd-kpi-info">
              <div className="kpi-label">Active Prescriptions</div>
              <div className="kpi-value">3</div>
              <div className="kpi-sub">1 refill needed</div>
            </div>
          </div>
          <div className="pd-kpi-card">
            <div className="pd-kpi-icon purple">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="pd-kpi-info">
              <div className="kpi-label">Assigned Doctors</div>
              <div className="kpi-value">4</div>
              <div className="kpi-sub">2 unread messages</div>
            </div>
          </div>
          <div className="pd-kpi-card">
            <div className="pd-kpi-icon orange">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="pd-kpi-info">
              <div className="kpi-label">Health Alerts</div>
              <div className="kpi-value">1</div>
              <div className="kpi-sub">Refill reminder</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pd-quick-actions">
          <button className="pd-quick-btn primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Book Appointment
          </button>
          <button className="pd-quick-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Report
          </button>
          <button className="pd-quick-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
            Request Refill
          </button>
          <button
            className="pd-quick-btn"
            onClick={() => router.push("/patient/find-doctor")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Find Doctor
          </button>
          <button className="pd-quick-btn" style={{ color: "var(--pd-red)" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Emergency
          </button>
        </div>

        {/* ════════ MAIN GRID ════════ */}
        <div className="pd-grid">
          {/* ── Appointments ── */}
          <div className="pd-card">
            <div className="pd-card-header">
              <h3>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--pd-teal)"
                  strokeWidth="2"
                >
                  <path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                Upcoming Appointments
              </h3>
              <span className="card-link">View All →</span>
            </div>
            <div className="pd-card-body">
              <div className="pd-appt-list">
                {MOCK_APPOINTMENTS.map((appt) => {
                  const { day, month } = formatApptDate(appt.date);
                  return (
                    <div key={appt.id} className="pd-appt-item">
                      <div className="pd-appt-date">
                        <div className="date-day">{day}</div>
                        <div className="date-month">{month}</div>
                      </div>
                      <div className="pd-appt-divider" />
                      <div className="pd-appt-info">
                        <div className="appt-doctor">{appt.doctor}</div>
                        <div className="appt-detail">
                          <span>{appt.specialty}</span>
                          <span>•</span>
                          <span>{appt.time}</span>
                          <span className={`pd-badge ${appt.type}`}>
                            {appt.type === "online"
                              ? "🎥 Online"
                              : "🏥 In-person"}
                          </span>
                        </div>
                      </div>
                      <div className="pd-appt-actions">
                        <button className="btn-view">View</button>
                        <button className="btn-reschedule">Reschedule</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Prescriptions ── */}
          <div className="pd-card">
            <div className="pd-card-header">
              <h3>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--pd-blue)"
                  strokeWidth="2"
                >
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v6m0 0H3m6 0h12M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 1-2-2V9" />
                </svg>
                Prescriptions
              </h3>
              <span className="card-link">View All →</span>
            </div>
            <div className="pd-card-body">
              <div className="pd-rx-list">
                {MOCK_PRESCRIPTIONS.map((rx) => (
                  <div key={rx.id} className="pd-rx-item">
                    <div
                      className="pd-rx-icon"
                      style={{ background: rx.color + "20", color: rx.color }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-6 7.5h9m-9 3h9m-9 3h5.25" />
                      </svg>
                    </div>
                    <div className="pd-rx-info">
                      <div className="rx-name">{rx.name}</div>
                      <div className="rx-detail">{rx.detail}</div>
                    </div>
                    <div className="pd-rx-right">
                      <div className="rx-days">
                        <span className={`pd-badge ${rx.status}`}>
                          {rx.status === "active"
                            ? "Active"
                            : rx.status === "refill-needed"
                              ? "Refill Soon"
                              : "Expired"}
                        </span>
                      </div>
                      <div className="rx-dosage" style={{ marginTop: 4 }}>
                        {rx.days}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Adherence */}
              <div className="pd-adherence">
                <div className="pd-adherence-label">
                  <span>💊 Medication Adherence</span>
                  <span>{adherencePct}%</span>
                </div>
                <div className="pd-adherence-bar">
                  <div
                    className="pd-adherence-fill"
                    style={{ width: `${adherencePct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Health Vitals ── */}
          <div className="pd-card">
            <div className="pd-card-header">
              <h3>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--pd-teal)"
                  strokeWidth="2"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                Health Vitals
              </h3>
              <span className="card-link">
                {healthEntries.length > 0
                  ? `${healthEntries.length} entries`
                  : "+ Add Vitals"}
              </span>
            </div>
            <div className="pd-card-body">
              <div className="pd-vitals-tabs">
                {[
                  { id: "bp", label: "Blood Pressure" },
                  { id: "weight", label: "Weight" },
                  { id: "sugar", label: "Blood Sugar" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`pd-vital-tab ${vitalTab === tab.id ? "active" : ""}`}
                    onClick={() => setVitalTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="pd-chart-container">{renderMiniChart()}</div>
              <div className="pd-vital-stats">
                {vitalStats[vitalTab].map((s, i) => (
                  <div key={i} className="pd-vital-stat">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">
                      {s.value}
                      <span className="stat-unit"> {s.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Medical History ── */}
          <div className="pd-card">
            <div className="pd-card-header">
              <h3>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--pd-purple)"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Medical History
              </h3>
              <span className="card-link">Full History →</span>
            </div>
            <div className="pd-card-body">
              <div className="pd-timeline">
                {MOCK_TIMELINE.map((item) => (
                  <div key={item.id} className="pd-timeline-item">
                    <div className={`pd-timeline-dot ${item.type}`} />
                    <div className="pd-timeline-date">{item.date}</div>
                    <div className="pd-timeline-title">{item.title}</div>
                    <div className="pd-timeline-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="pd-card">
            <div className="pd-card-header">
              <h3>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--pd-blue)"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Messages
                <span
                  className="pd-badge confirmed"
                  style={{ marginLeft: 4, fontSize: "0.65rem" }}
                >
                  2 new
                </span>
              </h3>
              <span className="card-link">Open Inbox →</span>
            </div>
            <div className="pd-card-body">
              <div className="pd-msg-list">
                {MOCK_MESSAGES.map((msg) => (
                  <div
                    key={msg.id}
                    className={`pd-msg-item ${msg.unread ? "unread" : ""}`}
                  >
                    <div
                      className="pd-msg-avatar"
                      style={{
                        background: msg.unread
                          ? "var(--pd-blue)"
                          : "var(--pd-gray-400)",
                      }}
                    >
                      {msg.initials}
                    </div>
                    <div className="pd-msg-content">
                      <div className="msg-name">{msg.name}</div>
                      <div className="msg-preview">{msg.preview}</div>
                    </div>
                    <div className="pd-msg-time">{msg.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Notifications ── */}
          <div className="pd-card">
            <div className="pd-card-header">
              <h3>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--pd-orange)"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Notifications
              </h3>
              <span className="card-link">Mark all read</span>
            </div>
            <div className="pd-card-body">
              <div className="pd-notif-list">
                {MOCK_NOTIFICATIONS.map((notif) => (
                  <div key={notif.id} className="pd-notif-item">
                    <div
                      className="pd-notif-icon"
                      style={{ background: notif.bg }}
                    >
                      {notif.icon}
                    </div>
                    <div className="pd-notif-text">
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-time">{notif.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
