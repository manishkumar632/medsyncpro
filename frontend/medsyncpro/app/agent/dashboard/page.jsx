"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Shield, Clock, CheckCircle, AlertTriangle, FileText, Upload } from "lucide-react";

export default function AgentDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [verificationStatus, setVerificationStatus] = useState("NOT_SUBMITTED");

    useEffect(() => {
        // The user object from AuthContext may contain an approval/verification status
        if (user?.approved === true || user?.verificationStatus === "VERIFIED") {
            setVerificationStatus("VERIFIED");
        } else if (user?.verificationStatus === "REJECTED") {
            setVerificationStatus("REJECTED");
        } else if (user?.verificationStatus === "UNDER_REVIEW" || user?.verificationStatus === "DOCUMENT_SUBMITTED") {
            setVerificationStatus("PENDING");
        }
    }, [user]);

    const statusConfig = {
        NOT_SUBMITTED: {
            icon: Upload,
            iconClass: "not-submitted",
            title: "Documents Not Yet Submitted",
            desc: "Please upload your verification documents so an admin can review your profile. Once approved, you'll have full access to the Agent portal.",
            action: "Upload Documents",
            href: "/agent/verification",
        },
        PENDING: {
            icon: Clock,
            iconClass: "pending",
            title: "Verification Under Review",
            desc: "Your documents have been submitted and are currently being reviewed by our admin team. This usually takes 1–2 business days.",
            action: null,
            href: null,
        },
        VERIFIED: {
            icon: CheckCircle,
            iconClass: "verified",
            title: "Profile Verified ✓",
            desc: "Congratulations! Your profile has been verified. You now have full access to the Agent portal features.",
            action: null,
            href: null,
        },
        REJECTED: {
            icon: AlertTriangle,
            iconClass: "rejected",
            title: "Verification Rejected",
            desc: "Unfortunately, your verification was not approved. Please review the admin feedback and re-upload your documents.",
            action: "Re-upload Documents",
            href: "/agent/verification",
        },
    };

    const cfg = statusConfig[verificationStatus];
    const StatusIcon = cfg.icon;

    return (
        <div className="agent-dashboard">
            {/* Welcome */}
            <div className="agent-welcome">
                <div>
                    <h1 className="agent-welcome-title">Welcome, {user?.name || "Agent"} 👋</h1>
                    <p className="agent-welcome-sub">Here's a quick overview of your agent portal.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="agent-stats-row">
                <div className="agent-glass-card agent-stat-card">
                    <div className="agent-stat-icon purple"><Shield size={22} /></div>
                    <div>
                        <div className="agent-stat-value">{verificationStatus === "VERIFIED" ? "Active" : "Pending"}</div>
                        <div className="agent-stat-label">Account Status</div>
                    </div>
                </div>
                <div className="agent-glass-card agent-stat-card">
                    <div className="agent-stat-icon teal"><FileText size={22} /></div>
                    <div>
                        <div className="agent-stat-value">{verificationStatus === "VERIFIED" ? "✓" : "—"}</div>
                        <div className="agent-stat-label">Verified Documents</div>
                    </div>
                </div>
            </div>

            {/* Verification Status Card */}
            <div className="agent-glass-card agent-verification-card">
                <div className={`agent-verification-icon ${cfg.iconClass}`}>
                    <StatusIcon size={36} />
                </div>
                <h2 className="agent-verification-title">{cfg.title}</h2>
                <p className="agent-verification-desc">{cfg.desc}</p>
                {cfg.action && (
                    <button
                        className="agent-btn agent-btn-primary"
                        onClick={() => router.push(cfg.href)}
                    >
                        <Upload size={16} /> {cfg.action}
                    </button>
                )}
            </div>
        </div>
    );
}
