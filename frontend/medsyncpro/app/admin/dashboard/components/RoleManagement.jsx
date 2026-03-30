"use client";

/**
 * RoleManagement.jsx
 *
 * All data fetches done through server actions (adminAction.js).
 * No direct fetch() to Spring Boot — cookie domain mismatch fixed.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchUsersAction,
  fetchUserCountAction,
  approveUserAction,
  suspendUserAction,
} from "@/actions/adminAction";

const avatarColors = [
  "#0d9488",
  "#6366f1",
  "#8b5cf6",
  "#0891b2",
  "#059669",
  "#f59e0b",
];
const PAGE_SIZE = 5;

const tabs = [
  { key: "patients", label: "Patients", role: "PATIENT" },
  { key: "doctors", label: "Doctors", role: "DOCTOR" },
  { key: "pharmacists", label: "Pharmacists", role: "PHARMACY" },
];

export default function RoleManagement() {
  const [activeTab, setActiveTab] = useState("patients");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");
  const [tabCounts, setTabCounts] = useState({
    patients: 0,
    doctors: 0,
    pharmacists: 0,
  });

  // Fetch users when tab / page / search changes
  const fetchUsers = useCallback(async (role, pageNum, searchQuery) => {
    setLoading(true);
    const result = await fetchUsersAction({
      role,
      page: pageNum,
      size: PAGE_SIZE,
      search: searchQuery,
    });
    if (result.success) {
      setUsers(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } else {
      setUsers([]);
    }
    setLoading(false);
  }, []);

  // Fetch tab counts once on mount
  useEffect(() => {
    Promise.all(
      tabs.map(async (tab) => {
        const result = await fetchUserCountAction(tab.role);
        return [tab.key, result.count];
      }),
    ).then((entries) => setTabCounts(Object.fromEntries(entries)));
  }, []);

  useEffect(() => {
    const tab = tabs.find((t) => t.key === activeTab);
    if (tab) fetchUsers(tab.role, page, search);
  }, [activeTab, page, search, fetchUsers]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(0);
    setSearch("");
  };

  const handleApprove = async (userId) => {
    const result = await approveUserAction(userId);
    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, approved: true } : u)),
      );
    }
  };

  const handleSuspend = async (userId) => {
    const result = await suspendUserAction(userId);
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotalElements((prev) => prev - 1);
    }
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const renderRow = (user, idx) => {
    const initials = getInitials(user.name);
    const isApproved = user.approved;
    const isVerified = user.emailVerified;

    return (
      <tr key={user.id}>
        <td>
          <div className="admin-table-user">
            <div
              className="admin-table-avatar"
              style={{ background: avatarColors[idx % avatarColors.length] }}
            >
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>{user.name}</span>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                {user.email}
              </div>
            </div>
          </div>
        </td>
        <td>{user.phone || "—"}</td>
        <td>
          <span
            className={`admin-status-badge ${isApproved ? "active" : "pending"}`}
          >
            {isApproved ? "Approved" : "Pending"}
          </span>
        </td>
        <td>
          <span
            className={`admin-status-badge ${isVerified ? "verified" : "pending"}`}
          >
            {isVerified ? "Verified" : "Unverified"}
          </span>
        </td>
        <td className="admin-muted">
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </td>
        <td>
          <div className="admin-table-actions">
            <button className="admin-action-btn" title="View">
              <Eye size={14} />
            </button>
            {!isApproved && (
              <button
                className="admin-action-btn admin-action-approve"
                title="Approve"
                onClick={() => handleApprove(user.id)}
              >
                <CheckCircle size={14} />
              </button>
            )}
            <button
              className="admin-action-btn admin-action-danger"
              title="Suspend"
              onClick={() => handleSuspend(user.id)}
            >
              <Ban size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="admin-glass-card admin-role-section">
      {/* Tabs */}
      <div className="admin-role-header">
        <div className="admin-role-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`admin-role-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
              <span className="admin-tab-count">
                {(tabCounts[tab.key] || 0).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
        <div className="admin-role-controls">
          <div className="admin-role-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        {loading ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}
          >
            Loading...
          </div>
        ) : users.length === 0 ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}
          >
            No {activeTab} found{search ? ` matching "${search}"` : ""}.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Approval</th>
                <th>Email Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{users.map((user, idx) => renderRow(user, idx))}</tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <div className="admin-page-btns">
            <button
              className="admin-page-btn"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = page < 3 ? i : page - 2 + i;
              if (pageNum >= totalPages) return null;
              return (
                <button
                  key={pageNum}
                  className={`admin-page-btn ${pageNum === page ? "active" : ""}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              className="admin-page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <span className="admin-page-info">
            Showing {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, totalElements)} of{" "}
            {totalElements.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
