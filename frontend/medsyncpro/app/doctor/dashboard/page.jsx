"use client";
import { useEffect, useState } from "react";
import DoctorKpiCards from "./components/DoctorKpiCards";
import TodayAppointments from "./components/TodayAppointments";
import PrescriptionPanel from "./components/PrescriptionPanel";
import DoctorAnalytics from "./components/DoctorAnalytics";
import ScheduleWidget from "./components/ScheduleWidget";
import NotificationsPanel from "./components/NotificationsPanel";
import PatientsOverview from "./components/PatientsOverview";
import { fetchDoctorProfileData } from "@/actions/doctorAction";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DoctorDashboardPage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchDoctorProfileData()
      .then((res) => {
        if (res?.success) setProfile(res.data);
      })
      .catch(() => {});
  }, []);

  const doctorName = profile?.name
    ? `Dr. ${profile.name.split(" ")[0]}`
    : "Doctor";

  return (
    <div className="doc-dashboard">
      {/* Welcome */}
      <div className="doc-welcome">
        <div>
          <h1 className="doc-welcome-title">
            {getGreeting()}, {doctorName} 👋
          </h1>
          <p className="doc-welcome-sub">
            {profile?.specializationName
              ? `${profile.specializationName} · ${profile.clinicName || "Your Practice"}`
              : "Welcome to your dashboard"}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <DoctorKpiCards />

      {/* Appointments + Prescriptions */}
      <div className="doc-row-2col">
        <TodayAppointments />
        <PrescriptionPanel />
      </div>

      {/* Analytics */}
      <DoctorAnalytics />

      {/* Schedule + Notifications */}
      <div className="doc-row-2col">
        <ScheduleWidget />
        <NotificationsPanel />
      </div>

      {/* Patients */}
      <PatientsOverview />
    </div>
  );
}
