"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  Menu,
  CalendarDays,
} from "lucide-react";
import { fetchDoctorProfileData } from "@/actions/doctorAction";
import { useNotifications } from "@/app/context/NotificationContext";

function Avatar({ name, src, size = 36 }) {
  const [err, setErr] = useState(false);
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "Dr";
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
        background: "linear-gradient(135deg,#2563eb,#0d9488)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

export default function DoctorNavbar({ onMenuToggle }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  let unreadCount = 0;
  try {
    const notifications = useNotifications();
    unreadCount = notifications?.unreadCount ?? 0;
  } catch {
    /* NotificationContext may not be available */
  }

  useEffect(() => {
    fetchDoctorProfileData()
      .then((res) => {
        if (res?.success && res.data) setProfile(res.data);
      })
      .catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const displayName = profile?.name ?? "Doctor";
  const displaySpec =
    profile?.specializationName ?? profile?.qualification ?? "";

  return (
    <header className="doc-topnav">
      <button className="doc-hamburger" onClick={onMenuToggle}>
        <Menu size={22} />
      </button>

      <div className="doc-search">
        <Search size={16} className="doc-search-icon" />
        <input type="text" placeholder="Search patients, records..." />
      </div>

      <div className="doc-topnav-right">
        <div className="doc-today-badge">
          <CalendarDays size={14} />
          <span>{today}</span>
        </div>

        <button
          className="doc-rx-btn"
          onClick={() => router.push("/doctor/prescription")}
        >
          <Plus size={16} />
          <span>New Prescription</span>
        </button>

        <button className="doc-notif-btn" style={{ position: "relative" }}>
          <Bell size={18} />
          {unreadCount > 0 && <span className="doc-notif-dot" />}
        </button>

        <div className="doc-profile">
          <div className="doc-profile-avatar">
            <Avatar name={displayName} src={profile?.profileImage} size={36} />
          </div>
          <div className="doc-profile-info">
            <span className="doc-profile-name">
              {profile ? (
                `Dr. ${displayName}`
              ) : (
                <span
                  style={{
                    display: "inline-block",
                    width: 80,
                    height: 12,
                    borderRadius: 4,
                    background: "#e2e8f0",
                    animation: "kpiPulse 1.2s infinite",
                  }}
                />
              )}
            </span>
            <span className="doc-profile-spec">
              {profile ? (
                displaySpec || "Doctor"
              ) : (
                <span
                  style={{
                    display: "inline-block",
                    width: 60,
                    height: 10,
                    borderRadius: 4,
                    background: "#f1f5f9",
                    animation: "kpiPulse 1.2s infinite",
                  }}
                />
              )}
            </span>
          </div>
          <ChevronDown size={14} className="doc-profile-chevron" />
        </div>
      </div>
      <style>{`@keyframes kpiPulse{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>
    </header>
  );
}
