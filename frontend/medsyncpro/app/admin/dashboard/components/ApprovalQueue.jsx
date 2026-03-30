"use client";

/**
 * ApprovalQueue.jsx
 *
 * All data fetches done through server actions (adminAction.js).
 * No direct fetch() to Spring Boot — cookie domain mismatch fixed.
 */

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import {
  fetchPendingUsersAction,
  approveUserAction,
  rejectUserAction,
} from "@/actions/adminAction";

export default function ApprovalQueue() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsersAction()
      .then((result) => {
        if (result.success) setApprovals(result.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (userId, action) => {
    const fn = action === "approve" ? approveUserAction : rejectUserAction;
    const result = await fn(userId);
    if (result.success) {
      setApprovals((prev) => prev.filter((a) => a.id !== userId));
    }
  };

  const avatarColors = [
    "#6366f1",
    "#0d9488",
    "#f59e0b",
    "#8b5cf6",
    "#0891b2",
    "#ec4899",
  ];
  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  if (loading) {
    return (
      <div className="admin-glass-card admin-approval-queue">
        <div className="admin-approval-header">
          <h3>Approval Queue</h3>
          <span className="admin-approval-count">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-glass-card admin-approval-queue">
      <div className="admin-approval-header">
        <h3>Approval Queue</h3>
        <span className="admin-approval-count">{approvals.length} pending</span>
      </div>
      <div className="admin-approval-list">
        {approvals.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            No pending approvals 🎉
          </div>
        ) : (
          approvals.map((a, i) => (
            <div key={a.id} className="admin-approval-item">
              <div
                className="admin-approval-avatar"
                style={{ background: avatarColors[i % avatarColors.length] }}
              >
                {getInitials(a.name)}
              </div>
              <div className="admin-approval-info">
                <div className="admin-approval-name">{a.name}</div>
                <div className="admin-approval-meta">
                  <span className="admin-approval-role">{a.role}</span>
                  <span className="admin-approval-doc">{a.email}</span>
                </div>
                <div className="admin-approval-date">
                  <Clock size={11} />
                  <span>
                    {a.createdAt
                      ? new Date(a.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
              <div className="admin-approval-actions">
                <button
                  className="admin-approve-btn"
                  title="Approve"
                  onClick={() => handleAction(a.id, "approve")}
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  className="admin-reject-btn"
                  title="Reject"
                  onClick={() => handleAction(a.id, "reject")}
                >
                  <XCircle size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
