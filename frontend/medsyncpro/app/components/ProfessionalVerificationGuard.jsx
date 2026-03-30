"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import useVerification from "../../hooks/useVerification";
import { useAuth } from "../context/AuthContext";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Info,
  Shield,
  ShieldCheck,
  ShieldX,
  X,
  RefreshCw,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAllDocumentTypesAndFilterActivated } from "@/actions/documentTypeAction";

/* ─── Progress Steps ────────────────────────────────────────────── */
const STEPS = [
  { key: "UNVERIFIED", label: "Unverified" },
  { key: "DOCUMENT_SUBMITTED", label: "Documents Uploaded" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "VERIFIED", label: "Verified" },
];

function stepIndex(status) {
  if (status === "REJECTED") return 0; // reset to start
  const idx = STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

/* ─── Inline Styles ─────────────────────────────────────────────── */
const styles = {
  container: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    background:
      "linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 50%, #faf5ff 100%)",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: "800px",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    marginTop: "16px",
  },
  header: {
    background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
    padding: "32px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    position: "relative",
  },
  avatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid rgba(255,255,255,0.4)",
    backdropFilter: "blur(8px)",
    marginBottom: "12px",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  badge: (color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    marginTop: "8px",
    background:
      color === "orange"
        ? "rgba(251,146,60,0.2)"
        : color === "blue"
          ? "rgba(59,130,246,0.2)"
          : color === "purple"
            ? "rgba(147,51,234,0.2)"
            : color === "green"
              ? "rgba(34,197,94,0.2)"
              : color === "red"
                ? "rgba(239,68,68,0.2)"
                : "rgba(255,255,255,0.2)",
    color: "#fff",
  }),
  body: {
    padding: "32px",
  },
  /* Progress bar */
  progressContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "32px",
    position: "relative",
  },
  progressStep: (active, completed, isRejected) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    position: "relative",
    zIndex: 1,
  }),
  progressDot: (active, completed, isRejected) => ({
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 700,
    transition: "all 0.3s ease",
    background: isRejected
      ? "#fef2f2"
      : completed
        ? "#0d9488"
        : active
          ? "#fff"
          : "#f3f4f6",
    color: isRejected
      ? "#dc2626"
      : completed
        ? "#fff"
        : active
          ? "#0d9488"
          : "#9ca3af",
    border: isRejected
      ? "2px solid #dc2626"
      : active
        ? "2px solid #0d9488"
        : completed
          ? "2px solid #0d9488"
          : "2px solid #e5e7eb",
    boxShadow: active ? "0 0 0 4px rgba(13,148,136,0.15)" : "none",
  }),
  progressLabel: (active, completed) => ({
    fontSize: "11px",
    fontWeight: active || completed ? 600 : 400,
    color: active || completed ? "#0d9488" : "#9ca3af",
    textAlign: "center",
    maxWidth: "90px",
  }),
  progressLine: (completed) => ({
    position: "absolute",
    top: "18px",
    left: "calc(50% + 18px)",
    right: "calc(-50% + 18px)",
    height: "3px",
    background: completed ? "#0d9488" : "#e5e7eb",
    transition: "background 0.3s ease",
    zIndex: 0,
  }),
  /* Status banners */
  banner: (color) => ({
    display: "flex",
    gap: "12px",
    padding: "16px 20px",
    borderRadius: "14px",
    marginBottom: "24px",
    background:
      color === "orange"
        ? "#fff7ed"
        : color === "blue"
          ? "#eff6ff"
          : color === "purple"
            ? "#faf5ff"
            : color === "red"
              ? "#fef2f2"
              : "#f0fdf4",
    border: `1px solid ${
      color === "orange"
        ? "#fed7aa"
        : color === "blue"
          ? "#bfdbfe"
          : color === "purple"
            ? "#e9d5ff"
            : color === "red"
              ? "#fecaca"
              : "#bbf7d0"
    }`,
  }),
  bannerTitle: (color) => ({
    fontWeight: 600,
    fontSize: "15px",
    color:
      color === "orange"
        ? "#9a3412"
        : color === "blue"
          ? "#1e40af"
          : color === "purple"
            ? "#6b21a8"
            : color === "red"
              ? "#991b1b"
              : "#166534",
    marginBottom: "4px",
  }),
  bannerText: (color) => ({
    fontSize: "13px",
    lineHeight: "1.5",
    color:
      color === "orange"
        ? "#c2410c"
        : color === "blue"
          ? "#1d4ed8"
          : color === "purple"
            ? "#7c3aed"
            : color === "red"
              ? "#b91c1c"
              : "#15803d",
  }),
  /* Checklist */
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  docItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    marginBottom: "10px",
    background: "#fff",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  docItemUploaded: {
    borderColor: "#86efac",
    background: "#f0fdf4",
  },
  docInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    minWidth: 0,
  },
  docIcon: (uploaded) => ({
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: uploaded ? "#dcfce7" : "#f3f4f6",
    color: uploaded ? "#16a34a" : "#9ca3af",
  }),
  docLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#111827",
  },
  docMeta: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "2px",
  },
  requiredTag: {
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "999px",
    background: "#fef3c7",
    color: "#92400e",
    marginLeft: "8px",
    whiteSpace: "nowrap",
  },
  optionalTag: {
    fontSize: "10px",
    fontWeight: 500,
    padding: "2px 8px",
    borderRadius: "999px",
    background: "#f3f4f6",
    color: "#6b7280",
    marginLeft: "8px",
    whiteSpace: "nowrap",
  },
  docActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
    marginLeft: "12px",
  },
  uploadBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "#0d9488",
    color: "#fff",
    transition: "background 0.2s ease",
    whiteSpace: "nowrap",
  },
  reuploadBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "7px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  removeBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px",
    borderRadius: "6px",
    cursor: "pointer",
    border: "none",
    background: "#fef2f2",
    color: "#dc2626",
    transition: "background 0.2s ease",
  },
  /* Submit button */
  submitBtn: (disabled) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "14px 24px",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: 600,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    background: disabled
      ? "#9ca3af"
      : "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
    color: "#fff",
    marginTop: "24px",
    transition: "all 0.3s ease",
    boxShadow: disabled ? "none" : "0 4px 14px rgba(13,148,136,0.3)",
    opacity: disabled ? 0.6 : 1,
  }),
  /* Admin notes */
  notesBox: {
    marginTop: "12px",
    padding: "14px 16px",
    background: "#fff",
    border: "1px solid #fecaca",
    borderRadius: "10px",
  },
  notesLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  notesText: {
    fontSize: "13px",
    color: "#374151",
    fontStyle: "italic",
    lineHeight: "1.5",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
};

/* ─── Component ──────────────────────────────────────────────────── */
export default function ProfessionalVerificationGuard({ children }) {
  const { user } = useAuth();
  const {
    status,
    requiredDocuments,
    notes,
    loading,
    uploadSingleDocument,
    deleteSingleDocument,
    submitForVerification,
  } = useVerification();

  const [uploadingType, setUploadingType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingDocTypes, setFetchingDocTypes] = useState(false);
  // Stores the active doc-type schema for this user's role (ordered by displayOrder).
  // null = not yet loaded; [] = loaded but empty.
  const [docTypeSchema, setDocTypeSchema] = useState(null);
  const fileInputRefs = useRef({});

  const fetchAllDocTypes = useCallback(async () => {
    if (!user?.role) return;
    setFetchingDocTypes(true);
    try {
      const result = await fetchAllDocumentTypesAndFilterActivated(user.role);
      if (result.success) {
        // Store only the schema (id, code, name, required, displayOrder).
        // Upload state is sourced live from the hook so it stays in sync
        // without needing to re-fetch here after every upload/delete.
        setDocTypeSchema(result.data);
      } else {
        console.error("Failed to fetch doc type schema:", result.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingDocTypes(false);
    }
  }, [user?.role]); // re-fetch if the user's role ever changes

  // Single initial load — re-runs only when user.role changes
  useEffect(() => {
    fetchAllDocTypes();
  }, [fetchAllDocTypes]);

  if (loading || fetchingDocTypes) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2
          size={32}
          style={{ animation: "spin 1s linear infinite", color: "#0d9488" }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Fully verified → render dashboard
  if (status === "VERIFIED") {
    return children;
  }

  const isRejected = status === "REJECTED";
  const currentStep = stepIndex(status);
  const canUpload =
    status === "UNVERIFIED" ||
    status === "DOCUMENT_SUBMITTED" ||
    status === "REJECTED";

  /**
   * Merge the DB schema (active doc types for this role) with the live upload
   * state coming from useVerification().  The join key is code === type.
   *
   * Falls back to the hook's own list while the schema is still loading
   * (docTypeSchema === null) so the UI is never empty on slow connections.
   */
  const displayDocs =
    docTypeSchema !== null
      ? docTypeSchema.map((apiDoc) => {
          const hookDoc = requiredDocuments.find((d) => d.type === apiDoc.code);
          return {
            type: apiDoc.code,
            label: apiDoc.name,
            required: apiDoc.required, // DB is the source of truth for required flag
            uploaded: hookDoc?.uploaded ?? false,
            fileName: hookDoc?.fileName ?? null,
            fileSize: hookDoc?.fileSize ?? null,
          };
        })
      : requiredDocuments; // fallback: schema not loaded yet

  const allRequiredUploaded = displayDocs
    .filter((d) => d.required)
    .every((d) => d.uploaded);
  const canSubmit =
    canUpload && allRequiredUploaded && displayDocs.some((d) => d.uploaded);

  const handleFileSelect = async (type, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit");
      return;
    }
    const allowed = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    setUploadingType(type);
    await uploadSingleDocument(type, file);
    setUploadingType(null);

    // Reset file input
    if (fileInputRefs.current[type]) {
      fileInputRefs.current[type].value = "";
    }
  };

  const handleRemove = async (type) => {
    setUploadingType(type);
    await deleteSingleDocument(type);
    setUploadingType(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await submitForVerification();
    setSubmitting(false);
  };

  const getBadgeInfo = () => {
    switch (status) {
      case "UNVERIFIED":
        return {
          color: "orange",
          icon: <Shield size={14} />,
          text: "Unverified",
        };
      case "DOCUMENT_SUBMITTED":
        return {
          color: "blue",
          icon: <FileText size={14} />,
          text: "Documents Uploaded",
        };
      case "UNDER_REVIEW":
        return {
          color: "purple",
          icon: <Clock size={14} />,
          text: "Under Review",
        };
      case "REJECTED":
        return { color: "red", icon: <ShieldX size={14} />, text: "Rejected" };
      case "VERIFIED":
        return {
          color: "green",
          icon: <ShieldCheck size={14} />,
          text: "Verified",
        };
      default:
        return { color: "orange", icon: <Shield size={14} />, text: status };
    }
  };

  const badgeInfo = getBadgeInfo();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.avatar}>
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" style={styles.avatarImg} />
            ) : (
              <span style={{ fontSize: "24px", fontWeight: 700 }}>
                {user?.name ? user.name[0].toUpperCase() : "👤"}
              </span>
            )}
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>
            {user?.name}
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.8)",
              margin: "4px 0 0",
            }}
          >
            Professional Verification
          </p>
          <div style={styles.badge(badgeInfo.color)}>
            {badgeInfo.icon}
            {badgeInfo.text}
          </div>
        </div>

        <div style={styles.body}>
          {/* ── Progress Indicator ── */}
          <div style={styles.progressContainer}>
            {STEPS.map((step, idx) => {
              const completed = currentStep > idx;
              const active = currentStep === idx;
              return (
                <div
                  key={step.key}
                  style={{
                    ...styles.progressStep(
                      active,
                      completed,
                      isRejected && idx === 0,
                    ),
                    position: "relative",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={styles.progressDot(
                      active,
                      completed,
                      isRejected && idx === 0,
                    )}
                  >
                    {isRejected && idx === 0 ? (
                      <X size={16} />
                    ) : completed ? (
                      <CheckCircle size={16} />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span style={styles.progressLabel(active, completed)}>
                    {step.label}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "18px",
                        left: "calc(50% + 22px)",
                        right: "calc(-50% + 22px)",
                        height: "3px",
                        background: completed ? "#0d9488" : "#e5e7eb",
                        zIndex: -1,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Status Banners ── */}
          {status === "UNVERIFIED" && (
            <div style={styles.banner("orange")}>
              <AlertCircle
                size={22}
                style={{ color: "#ea580c", flexShrink: 0, marginTop: 2 }}
              />
              <div>
                <div style={styles.bannerTitle("orange")}>
                  Account Unverified
                </div>
                <div style={styles.bannerText("orange")}>
                  Upload your professional credentials below to get verified.
                  All required documents must be submitted.
                </div>
              </div>
            </div>
          )}

          {status === "DOCUMENT_SUBMITTED" && (
            <div style={styles.banner("blue")}>
              <FileText
                size={22}
                style={{ color: "#2563eb", flexShrink: 0, marginTop: 2 }}
              />
              <div>
                <div style={styles.bannerTitle("blue")}>Documents Uploaded</div>
                <div style={styles.bannerText("blue")}>
                  Your documents are ready. Click &quot;Submit for
                  Verification&quot; when you&apos;re ready for admin review.
                </div>
              </div>
            </div>
          )}

          {status === "UNDER_REVIEW" && (
            <div style={styles.banner("purple")}>
              <Clock
                size={22}
                style={{
                  color: "#7c3aed",
                  flexShrink: 0,
                  marginTop: 2,
                  animation: "pulse 2s infinite",
                }}
              />
              <div>
                <div style={styles.bannerTitle("purple")}>Under Review</div>
                <div style={styles.bannerText("purple")}>
                  An administrator is reviewing your credentials. You&apos;ll be
                  notified once the review is complete.
                </div>
              </div>
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            </div>
          )}

          {status === "REJECTED" && (
            <div style={styles.banner("red")}>
              <AlertCircle
                size={22}
                style={{ color: "#dc2626", flexShrink: 0, marginTop: 2 }}
              />
              <div>
                <div style={styles.bannerTitle("red")}>
                  Verification Rejected
                </div>
                <div style={styles.bannerText("red")}>
                  Your submission was rejected. Please review the feedback and
                  re-upload your documents.
                </div>
                {notes && (
                  <div style={styles.notesBox}>
                    <div style={styles.notesLabel}>
                      <Info size={12} />
                      Admin Notes
                    </div>
                    <div style={styles.notesText}>{notes}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Document Checklist ── */}
          <div>
            <div style={styles.sectionTitle}>
              <FileText size={18} style={{ color: "#0d9488" }} />
              Required Documents
            </div>

            {displayDocs.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                No document requirements have been configured for your role yet.
                Please check back later or contact support.
              </div>
            )}

            {displayDocs.map((doc) => {
              const isUploading = uploadingType === doc.type;
              return (
                <div
                  key={doc.type}
                  style={{
                    ...styles.docItem,
                    ...(doc.uploaded ? styles.docItemUploaded : {}),
                  }}
                >
                  <div style={styles.docInfo}>
                    <div style={styles.docIcon(doc.uploaded)}>
                      {isUploading ? (
                        <Loader2
                          size={18}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : doc.uploaded ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Upload size={18} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={styles.docLabel}>{doc.label}</span>
                        <span
                          style={
                            doc.required
                              ? styles.requiredTag
                              : styles.optionalTag
                          }
                        >
                          {doc.required ? "Required" : "Optional"}
                        </span>
                      </div>
                      {doc.uploaded && doc.fileName && (
                        <div style={styles.docMeta}>
                          {doc.fileName}
                          {doc.fileSize &&
                            ` • ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`}
                        </div>
                      )}
                      {!doc.uploaded && (
                        <div style={styles.docMeta}>
                          PDF, JPG, or PNG up to 10MB
                        </div>
                      )}
                    </div>
                  </div>

                  {canUpload && (
                    <div style={styles.docActions}>
                      <input
                        type="file"
                        ref={(el) => (fileInputRefs.current[doc.type] = el)}
                        style={{ display: "none" }}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileSelect(doc.type, e)}
                      />
                      {doc.uploaded ? (
                        <>
                          <button
                            style={styles.reuploadBtn}
                            onClick={() =>
                              fileInputRefs.current[doc.type]?.click()
                            }
                            disabled={isUploading}
                          >
                            <RefreshCw size={13} />
                            Re-upload
                          </button>
                          <button
                            style={styles.removeBtn}
                            onClick={() => handleRemove(doc.type)}
                            disabled={isUploading}
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <button
                          style={styles.uploadBtn}
                          onClick={() =>
                            fileInputRefs.current[doc.type]?.click()
                          }
                          disabled={isUploading}
                        >
                          <Upload size={14} />
                          Upload
                        </button>
                      )}
                    </div>
                  )}

                  {!canUpload && doc.uploaded && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#16a34a",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle size={16} />
                      Uploaded
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Submit Button ── */}
          {canUpload && (
            <button
              style={styles.submitBtn(!canSubmit || submitting)}
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit for Verification
                </>
              )}
            </button>
          )}

          {canUpload && !allRequiredUploaded && (
            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#9ca3af",
                marginTop: "10px",
              }}
            >
              Upload all required documents to enable submission
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
