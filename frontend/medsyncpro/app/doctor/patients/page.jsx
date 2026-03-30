"use client";
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  FileText,
  Pill,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  Calendar,
  User,
  Stethoscope,
  MessageSquare,
  Filter,
} from "lucide-react";
import "../doctor-patients.css";
import { fetchDoctorPatientsAction } from "@/actions/doctorAction";

// ─── Mock Data for Drawer Timeline (Until backend supports history) ───
const TIMELINE = [
  {
    date: "Feb 25, 2026",
    type: "visit",
    title: "Regular Check-up",
    desc: "BP: 130/85, Heart Rate: 78 bpm. Medication adjusted.",
  },
  {
    date: "Feb 18, 2026",
    type: "prescription",
    title: "Prescription Updated",
    desc: "Amlodipine dose increased from 5mg to 10mg.",
  },
  {
    date: "Feb 10, 2026",
    type: "lab",
    title: "Lab Results",
    desc: "Lipid Panel: Total Cholesterol 210, LDL 130, HDL 45.",
  },
];

const MEDICAL_HISTORY = {
  conditions: ["Hypertension", "Type 2 Diabetes (Borderline)"],
  surgeries: ["Appendectomy (2015)"],
  family: ["Father: Heart Disease", "Mother: Asthma"],
};

function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Patient Drawer Component ───
function PatientDrawer({ patient, onClose }) {
  const [tab, setTab] = useState("overview");

  if (!patient) return null;

  return (
    <>
      <div className="dp-drawer-overlay" onClick={onClose} />
      <aside className="dp-drawer">
        <div className="dp-drawer-header">
          <h2>Patient Details</h2>
          <button className="dp-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="dp-drawer-profile">
          <div className="dp-drawer-avatar" style={{ background: "#0d9488" }}>
            {patient.profileImageUrl ? (
              <img
                src={patient.profileImageUrl}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              getInitials(patient.name)
            )}
          </div>
          <div className="dp-drawer-info">
            <h3>{patient.name}</h3>
            <span className="dp-drawer-meta">
              {patient.gender || "Patient"}
            </span>
            <span className={`dp-status active`}>
              {patient.status || "Active"}
            </span>
          </div>
        </div>

        <div className="dp-drawer-contact">
          <div>
            <Phone size={14} /> {patient.phone || "No phone provided"}
          </div>
          <div>
            <Mail size={14} /> {patient.email || "No email provided"}
          </div>
        </div>

        <div className="dp-drawer-tabs">
          <button
            className={tab === "overview" ? "active" : ""}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          <button
            className={tab === "history" ? "active" : ""}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </div>

        <div className="dp-drawer-body">
          {tab === "overview" && (
            <div className="dp-tab-content">
              <div className="dp-stats-grid">
                <div className="dp-stat-box">
                  <Stethoscope size={18} />
                  <span>Appointments</span>
                  <strong>{patient.appointments || 1}</strong>
                </div>
                <div className="dp-stat-box">
                  <Calendar size={18} />
                  <span>Last Visit</span>
                  <strong>
                    {patient.lastVisit
                      ? new Date(patient.lastVisit).toLocaleDateString()
                      : "N/A"}
                  </strong>
                </div>
              </div>
              <div className="dp-med-section">
                <h4>
                  <FileText size={16} /> Medical History
                </h4>
                <div className="dp-med-list">
                  <strong>Conditions:</strong>
                  <ul>
                    {MEDICAL_HISTORY.conditions.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                  <strong>Surgeries:</strong>
                  <ul>
                    {MEDICAL_HISTORY.surgeries.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="dp-tab-content">
              <div className="dp-timeline">
                {TIMELINE.map((item, idx) => (
                  <div key={idx} className="dp-timeline-item">
                    <div className="dp-timeline-icon">
                      {item.type === "visit" ? (
                        <Stethoscope size={14} />
                      ) : item.type === "prescription" ? (
                        <Pill size={14} />
                      ) : (
                        <FileText size={14} />
                      )}
                    </div>
                    <div className="dp-timeline-content">
                      <div className="dp-tl-header">
                        <strong>{item.title}</strong>
                        <span>{item.date}</span>
                      </div>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const perPage = 10;

  const [drawerPatient, setDrawerPatient] = useState(null);

  // Fetch real patients from backend
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        // Next.js passes UI Page (1-indexed), Spring Boot expects (0-indexed)
        const result = await fetchDoctorPatientsAction(
          page - 1,
          perPage,
          searchQuery,
        );
        if (result.success) {
          setPatients(result.data?.content || []);
          setTotalPages(result.data?.totalPages || 1);
          setTotalElements(result.data?.totalElements || 0);
        }
      } catch (error) {
        console.error("Failed to load patients:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => loadPatients(), 400);
    return () => clearTimeout(debounce);
  }, [page, searchQuery]);

  return (
    <div className="dp-container">
      <div className="dp-header">
        <div>
          <h1>My Patients</h1>
          <p>Manage and view records for all your patients</p>
        </div>
      </div>

      <div className="dp-toolbar">
        <div className="dp-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search patients by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button className="dp-filter-btn">
          <Filter size={16} /> Filters
        </button>
      </div>

      {loading ? (
        <div className="dp-empty">
          <p>Loading patients...</p>
        </div>
      ) : patients.length > 0 ? (
        <div className="dp-table-wrapper">
          <table className="dp-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Total Visits</th>
                <th>Last Visit</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} onClick={() => setDrawerPatient(patient)}>
                  <td>
                    <div className="dp-td-patient">
                      <div
                        className="dp-avatar"
                        style={{ background: "#0d9488" }}
                      >
                        {patient.profileImageUrl ? (
                          <img
                            src={patient.profileImageUrl}
                            alt="avatar"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          getInitials(patient.name)
                        )}
                      </div>
                      <div>
                        <div className="dp-name">{patient.name}</div>
                        <div className="dp-email">
                          {patient.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{patient.appointments || 1}</td>
                  <td>
                    <div className="dp-date-cell">
                      <Calendar size={14} />
                      <span>
                        {patient.lastVisit
                          ? new Date(patient.lastVisit).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </td>
                  <td>{patient.phone || "N/A"}</td>
                  <td>
                    <span
                      className={`dp-status ${patient.status === "active" ? "active" : "inactive"}`}
                    >
                      {patient.status || "Active"}
                    </span>
                  </td>
                  <td>
                    <div className="dp-actions">
                      <button
                        className="dp-action-btn"
                        title="View Profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawerPatient(patient);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="dp-action-btn"
                        title="Message"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="dp-empty">
          <User size={40} />
          <h3>No patients found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="dp-pagination">
          <span className="dp-page-info">
            Showing {(page - 1) * perPage + 1}–
            {Math.min(page * perPage, totalElements)} of {totalElements}
          </span>
          <div className="dp-page-btns">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={page === i + 1 ? "active" : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Quick Preview Drawer */}
      <PatientDrawer
        patient={drawerPatient}
        onClose={() => setDrawerPatient(null)}
      />
    </div>
  );
}
