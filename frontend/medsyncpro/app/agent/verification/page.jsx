"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Shield, Upload, FileText, CheckCircle, Loader2 } from "lucide-react";

export default function AgentVerificationPage() {
    const { user } = useAuth();
    const [status, setStatus] = useState("loading");
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        if (user?.approved === true || user?.verificationStatus === "VERIFIED") {
            setStatus("VERIFIED");
        } else if (user?.verificationStatus === "REJECTED") {
            setStatus("REJECTED");
        } else if (user?.verificationStatus === "UNDER_REVIEW" || user?.verificationStatus === "DOCUMENT_SUBMITTED") {
            setStatus("PENDING");
        } else {
            setStatus("NOT_SUBMITTED");
        }
    }, [user]);

    if (status === "loading") {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
            </div>
        );
    }

    if (status === "VERIFIED") {
        return (
            <div className="agent-glass-card agent-verification-card">
                <div className="agent-verification-icon verified">
                    <CheckCircle size={36} />
                </div>
                <h2 className="agent-verification-title">Already Verified</h2>
                <p className="agent-verification-desc">Your profile is fully verified. No further action is needed.</p>
            </div>
        );
    }

    if (status === "PENDING") {
        return (
            <div className="agent-glass-card agent-verification-card">
                <div className="agent-verification-icon pending">
                    <Shield size={36} />
                </div>
                <h2 className="agent-verification-title">Under Review</h2>
                <p className="agent-verification-desc">Your documents are being reviewed by our team. You'll be notified once a decision is made.</p>
            </div>
        );
    }

    return (
        <div className="agent-dashboard">
            <div className="agent-welcome">
                <div>
                    <h1 className="agent-welcome-title">Document Verification</h1>
                    <p className="agent-welcome-sub">Upload your identity and professional documents to get verified.</p>
                </div>
            </div>

            <div className="agent-glass-card" style={{ maxWidth: 600 }}>
                <h3 style={{ fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={18} /> Required Documents
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: 20, lineHeight: 1.6 }}>
                    Please upload the following documents for verification:
                </p>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    <li style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, border: "1px solid #e2e8f0", borderRadius: 10 }}>
                        <Upload size={16} style={{ color: "#6366f1" }} />
                        <span style={{ fontSize: "0.88rem" }}>Government-issued ID (Passport, License, etc.)</span>
                    </li>
                    <li style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, border: "1px solid #e2e8f0", borderRadius: 10 }}>
                        <Upload size={16} style={{ color: "#6366f1" }} />
                        <span style={{ fontSize: "0.88rem" }}>Proof of Address</span>
                    </li>
                    <li style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, border: "1px solid #e2e8f0", borderRadius: 10 }}>
                        <Upload size={16} style={{ color: "#6366f1" }} />
                        <span style={{ fontSize: "0.88rem" }}>Professional License / Authorization Letter</span>
                    </li>
                </ul>
                <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginTop: 16 }}>
                    Document upload functionality will be integrated with the admin verification system.
                    Contact support if you need assistance.
                </p>
            </div>
        </div>
    );
}
