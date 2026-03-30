"use client";
import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Users,
  Clock,
  Pill,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  fetchDoctorAppointmentsAction,
  fetchDoctorPrescriptionsAction,
  fetchDoctorPatientsAction,
} from "@/actions/doctorAction";

const spark = [25, 38, 30, 48, 42, 55, 50, 62, 58, 70, 64, 75];

function KpiCard({ label, value, trend, up, icon: Icon, color, bg, loading }) {
  return (
    <div className="doc-kpi-card" style={{ background: bg }}>
      <div className="doc-kpi-top">
        <div
          className="doc-kpi-icon"
          style={{ background: `${color}18`, color }}
        >
          <Icon size={20} />
        </div>
        {!loading && (
          <div className={`doc-kpi-trend ${up ? "up" : "down"}`}>
            {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="doc-kpi-value">
        {loading ? (
          <span
            style={{
              display: "inline-block",
              width: 56,
              height: 28,
              borderRadius: 6,
              background: `${color}22`,
              animation: "kpiPulse 1.2s ease-in-out infinite",
            }}
          />
        ) : (
          value
        )}
      </div>
      <div className="doc-kpi-label">{label}</div>
      <svg
        className="doc-kpi-spark"
        viewBox="0 0 120 30"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={spark
            .map(
              (v, i) =>
                `${(i / (spark.length - 1)) * 120},${30 - (v / 80) * 30}`,
            )
            .join(" ")}
        />
      </svg>
    </div>
  );
}

export default function DoctorKpiCards() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayAppts: 0,
    totalPatients: 0,
    pendingConsults: 0,
    totalPrescriptions: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const [apptRes, rxRes, patRes] = await Promise.all([
          fetchDoctorAppointmentsAction(0, 200),
          fetchDoctorPrescriptionsAction(0, 1),
          fetchDoctorPatientsAction(0, 1),
        ]);

        const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        // Appointments
        const apptList =
          apptRes?.data?.content ??
          (Array.isArray(apptRes?.data) ? apptRes.data : []);
        const todayAppts = apptList.filter(
          (a) => a.scheduledDate === todayStr,
        ).length;
        const pendingConsults = apptList.filter(
          (a) =>
            ["CONFIRMED", "PENDING"].includes(a.status) &&
            a.scheduledDate === todayStr,
        ).length;

        // Prescriptions total count
        const totalPrescriptions =
          rxRes?.data?.totalElements ??
          (Array.isArray(rxRes?.data) ? rxRes.data.length : 0);

        // Patients total count
        const totalPatients =
          patRes?.data?.totalElements ??
          (Array.isArray(patRes?.data) ? patRes.data.length : 0);

        setStats({
          todayAppts,
          totalPatients,
          pendingConsults,
          totalPrescriptions,
        });
      } catch {
        /* keep zeros */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    {
      label: "Today's Appointments",
      value: stats.todayAppts,
      trend: "Today",
      up: true,
      icon: CalendarCheck,
      color: "#2563eb",
      bg: "linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%)",
    },
    {
      label: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      trend: "All time",
      up: true,
      icon: Users,
      color: "#0d9488",
      bg: "linear-gradient(135deg,#ccfbf1 0%,#99f6e4 100%)",
    },
    {
      label: "Pending Consultations",
      value: stats.pendingConsults,
      trend: "Today",
      up: stats.pendingConsults === 0,
      icon: Clock,
      color: "#f59e0b",
      bg: "linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)",
    },
    {
      label: "Total Prescriptions",
      value: stats.totalPrescriptions.toLocaleString(),
      trend: "All time",
      up: true,
      icon: Pill,
      color: "#8b5cf6",
      bg: "linear-gradient(135deg,#ede9fe 0%,#ddd6fe 100%)",
    },
  ];

  return (
    <>
      <style>{`@keyframes kpiPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
      <div className="doc-kpi-grid">
        {cards.map((k) => (
          <KpiCard key={k.label} {...k} loading={loading} />
        ))}
      </div>
    </>
  );
}
