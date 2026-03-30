"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Clock, Pill, ArrowRight } from "lucide-react";
import { fetchDoctorPrescriptionsAction } from "@/actions/doctorAction";

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const QUICK_TEMPLATES = [
  { name: "Hypertension Standard", drugs: 2, icon: "💊" },
  { name: "Post-Surgery Recovery", drugs: 3, icon: "🩹" },
  { name: "Cardiac Maintenance", drugs: 3, icon: "❤️" },
];

export default function PrescriptionPanel() {
  const router = useRouter();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorPrescriptionsAction(0, 5)
      .then((res) => {
        const list =
          res?.data?.content ?? (Array.isArray(res?.data) ? res.data : []);
        setRecent(list.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="doc-glass-card doc-rx-panel">
      <div className="doc-card-header">
        <h3>Prescriptions</h3>
        <button
          className="doc-rx-create-btn"
          onClick={() => router.push("/doctor/prescription")}
        >
          <Plus size={14} /> Create New
        </button>
      </div>

      {/* Recent */}
      <div className="doc-rx-section">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <h4 className="doc-rx-subtitle">
            <FileText size={14} /> Recent Prescriptions
          </h4>
          <button
            onClick={() => router.push("/doctor/prescriptions")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#8b5cf6",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 600,
            }}
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: 50,
                  borderRadius: 8,
                  background:
                    "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.2s infinite",
                }}
              />
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : recent.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "0.875rem",
            }}
          >
            No prescriptions yet.
          </div>
        ) : (
          <div className="doc-rx-list">
            {recent.map((r, i) => {
              const meds = Array.isArray(r.medicines) ? r.medicines : [];
              const medSummary =
                meds.length > 0
                  ? meds
                      .map((m) => `${m.name}${m.dosage ? ` ${m.dosage}` : ""}`)
                      .join(", ")
                  : "—";
              return (
                <div key={r.id ?? i} className="doc-rx-item">
                  <div className="doc-rx-item-info">
                    <div className="doc-rx-patient">{r.patient ?? "—"}</div>
                    <div className="doc-rx-drug">
                      <Pill size={11} /> {medSummary}
                    </div>
                  </div>
                  <div className="doc-rx-item-meta">
                    <span
                      className={`doc-rx-status ${(r.status ?? "active").toLowerCase()}`}
                    >
                      {r.status ?? "Active"}
                    </span>
                    <span className="doc-rx-date">
                      <Clock size={11} /> {formatDate(r.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Templates */}
      <div className="doc-rx-section">
        <h4 className="doc-rx-subtitle">Quick Templates</h4>
        <div className="doc-rx-templates">
          {QUICK_TEMPLATES.map((t, i) => (
            <button
              key={i}
              className="doc-rx-template"
              onClick={() => router.push("/doctor/prescription")}
            >
              <span className="doc-rx-template-icon">{t.icon}</span>
              <span className="doc-rx-template-name">{t.name}</span>
              <span className="doc-rx-template-count">{t.drugs} drugs</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
