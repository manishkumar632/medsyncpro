"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Package,
  ChevronRight,
  X,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
  FileText,
  Building2,
  Info,
  Filter,
} from "lucide-react";
import {
  searchPharmaciesAction,
  createPatientPharmacyRequest,
  fetchPatientPharmacyRequests,
} from "@/actions/pharmacyAction";
import { fetchPatientPrescriptionsAction } from "@/actions/patientAction";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    Icon: Clock,
    step: 1,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "#6366f1",
    bg: "#eef2ff",
    border: "#c7d2fe",
    Icon: CheckCircle2,
    step: 2,
  },
  DISPATCHED: {
    label: "Dispatched",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    border: "#bae6fd",
    Icon: Truck,
    step: 3,
  },
  DELIVERED: {
    label: "Delivered",
    color: "#22c55e",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    Icon: CheckCircle2,
    step: 4,
  },
  REJECTED: {
    label: "Rejected",
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
    Icon: XCircle,
    step: 0,
  },
};

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Order Placed" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "DISPATCHED", label: "Dispatched" },
  { key: "DELIVERED", label: "Delivered" },
];

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dt) {
  if (!dt) return "";
  const diff = Date.now() - new Date(dt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Order modal ──────────────────────────────────────────────────────────────
function OrderModal({ pharmacy, onClose, onSuccess }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatientPrescriptionsAction(0, 50).then((res) => {
      if (res.success) {
        const list = res.data?.content ?? res.data ?? [];
        setPrescriptions(Array.isArray(list) ? list : []);
      }
      setLoadingRx(false);
    });
  }, []);

  const handleSubmit = async () => {
    if (!deliveryAddress.trim()) {
      setError("Delivery address is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload = {
      pharmacyId: pharmacy.id,
      deliveryAddress: deliveryAddress.trim(),
      note: note.trim() || null,
      ...(selectedPrescription ? { prescriptionId: selectedPrescription } : {}),
    };
    const res = await createPatientPharmacyRequest(payload);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.message || "Failed to place order. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          animation: "pp-modal-in 0.2s ease",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "24px 24px 0",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#eef2ff",
                  color: "#6366f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingBag size={18} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#0f172a",
                  }}
                >
                  Order Medicines
                </div>
                <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                  from {pharmacy.name}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: "20px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Prescription selector */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: 8,
              }}
            >
              Link a Prescription{" "}
              <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            {loadingRx ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#94a3b8",
                  fontSize: "0.82rem",
                }}
              >
                <Loader2 size={14} className="pp-spin" /> Loading prescriptions…
              </div>
            ) : prescriptions.length === 0 ? (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  fontSize: "0.8rem",
                  color: "#94a3b8",
                }}
              >
                No prescriptions found. You can still place an order.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 180,
                  overflowY: "auto",
                }}
              >
                <div
                  onClick={() => setSelectedPrescription(null)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border: `1.5px solid ${selectedPrescription === null ? "#6366f1" : "#e2e8f0"}`,
                    background:
                      selectedPrescription === null ? "#eef2ff" : "#f8fafc",
                    fontSize: "0.8rem",
                    color:
                      selectedPrescription === null ? "#4338ca" : "#64748b",
                    fontWeight: selectedPrescription === null ? 600 : 400,
                    transition: "all 0.15s",
                  }}
                >
                  No prescription (over-the-counter)
                </div>
                {prescriptions.map((rx) => {
                  const isSelected = selectedPrescription === rx.prescriptionId;
                  let medNames = "—";
                  try {
                    const parsed = JSON.parse(rx.medicines || "[]");
                    medNames = Array.isArray(parsed)
                      ? parsed
                          .map((m) => (typeof m === "object" ? m.name : m))
                          .join(", ")
                      : rx.medicines;
                  } catch {
                    medNames = rx.medicines || "—";
                  }

                  return (
                    <div
                      key={rx.prescriptionId || rx.id}
                      onClick={() =>
                        setSelectedPrescription(rx.prescriptionId || rx.id)
                      }
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        cursor: "pointer",
                        border: `1.5px solid ${isSelected ? "#6366f1" : "#e2e8f0"}`,
                        background: isSelected ? "#eef2ff" : "#f8fafc",
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: isSelected ? "#4338ca" : "#1e293b",
                          marginBottom: 2,
                        }}
                      >
                        Dr. {rx.doctorName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "#64748b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {medNames}
                      </div>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "#94a3b8",
                          marginTop: 2,
                        }}
                      >
                        {formatDate(rx.appointmentDate || rx.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delivery address */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: 8,
              }}
            >
              Delivery Address <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your full delivery address…"
              rows={3}
              style={{
                width: "100%",
                border: `1.5px solid ${error && !deliveryAddress.trim() ? "#ef4444" : "#e2e8f0"}`,
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: "0.85rem",
                outline: "none",
                fontFamily: "inherit",
                color: "#1e293b",
                background: "#f8fafc",
                resize: "none",
                boxSizing: "border-box",
                transition: "border 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
          </div>

          {/* Note */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: 8,
              }}
            >
              Note{" "}
              <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instructions or medicine details…"
              rows={2}
              style={{
                width: "100%",
                border: "1.5px solid #e2e8f0",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: "0.85rem",
                outline: "none",
                fontFamily: "inherit",
                color: "#1e293b",
                background: "#f8fafc",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1.5px solid #fecaca",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: "0.8rem",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                background: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
                fontSize: "0.85rem",
                color: "#64748b",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 2,
                padding: "12px",
                borderRadius: 10,
                border: "none",
                background: submitting ? "#94a3b8" : "#6366f1",
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                fontWeight: 700,
                fontSize: "0.85rem",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                boxShadow: submitting
                  ? "none"
                  : "0 4px 12px rgba(99,102,241,0.35)",
                transition: "all 0.15s",
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="pp-spin" /> Placing Order…
                </>
              ) : (
                <>
                  <ShoppingBag size={14} /> Place Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pharmacy card ────────────────────────────────────────────────────────────
function PharmacyCard({ pharmacy, onOrder }) {
  return (
    <div className="pp-pharmacy-card">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            flexShrink: 0,
            background: "#eef2ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {pharmacy.profileImage ? (
            <img
              src={pharmacy.profileImage}
              alt={pharmacy.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Building2 size={22} color="#6366f1" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}
            >
              {pharmacy.name}
            </span>
            {pharmacy.verified && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  background: "#f0fdf4",
                  color: "#16a34a",
                  borderRadius: 999,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  border: "1px solid #bbf7d0",
                }}
              >
                <ShieldCheck size={10} /> Verified
              </span>
            )}
          </div>
          {pharmacy.address && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 4,
                marginTop: 4,
                fontSize: "0.75rem",
                color: "#64748b",
              }}
            >
              <MapPin size={12} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ lineHeight: 1.4 }}>{pharmacy.address}</span>
            </div>
          )}
        </div>
      </div>
      <button onClick={() => onOrder(pharmacy)} className="pp-order-btn">
        <ShoppingBag size={14} /> Order Medicines
      </button>
    </div>
  );
}

// ─── Order status timeline ────────────────────────────────────────────────────
function OrderTimeline({ status }) {
  if (status === "REJECTED") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.72rem",
          color: "#ef4444",
        }}
      >
        <XCircle size={12} /> Order was rejected by the pharmacy
      </div>
    );
  }
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const currentStep = cfg.step;

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 12 }}
    >
      {TIMELINE_STEPS.map((step, i) => {
        const stepCfg = STATUS_CONFIG[step.key];
        const done = currentStep >= stepCfg.step;
        const active = currentStep === stepCfg.step;
        return (
          <div
            key={step.key}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < TIMELINE_STEPS.length - 1 ? 1 : 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: done ? stepCfg.color : "#f1f5f9",
                  border: `2px solid ${done ? stepCfg.color : "#e2e8f0"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: active ? `0 0 0 4px ${stepCfg.color}22` : "none",
                  transition: "all 0.3s",
                  flexShrink: 0,
                }}
              >
                {done ? (
                  <CheckCircle2 size={12} color="#fff" />
                ) : (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#cbd5e1",
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: "0.6rem",
                  color: done ? stepCfg.color : "#94a3b8",
                  fontWeight: done ? 700 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: "0 4px",
                  background:
                    done && currentStep > stepCfg.step
                      ? STATUS_CONFIG[TIMELINE_STEPS[i + 1].key]?.color ||
                        "#6366f1"
                      : "#e2e8f0",
                  marginBottom: 16,
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;

  return (
    <div className="pp-order-card">
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.92rem",
              color: "#0f172a",
              marginBottom: 3,
            }}
          >
            {order.pharmacyName || "Pharmacy"}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
            Ordered {timeAgo(order.createdAt)}
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: "0.7rem",
            fontWeight: 700,
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
            flexShrink: 0,
          }}
        >
          <cfg.Icon size={10} /> {cfg.label}
        </span>
      </div>

      {/* Details */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontSize: "0.78rem",
            color: "#475569",
          }}
        >
          <MapPin
            size={13}
            color="#94a3b8"
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <span>{order.deliveryAddress || "—"}</span>
        </div>
        {order.prescriptionId && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.78rem",
              color: "#475569",
            }}
          >
            <FileText size={13} color="#94a3b8" />
            <span>Prescription linked</span>
          </div>
        )}
        {order.agentName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.78rem",
              color: "#475569",
            }}
          >
            <Truck size={13} color="#94a3b8" />
            <span>Delivery agent: {order.agentName}</span>
          </div>
        )}
        {order.pharmacyNote && (
          <div
            style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: "0.74rem",
              color: "#64748b",
              borderLeft: "3px solid #e2e8f0",
            }}
          >
            <strong>Pharmacy note:</strong> {order.pharmacyNote}
          </div>
        )}
        {order.deliveredAt && (
          <div
            style={{
              fontSize: "0.72rem",
              color: "#22c55e",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <CheckCircle2 size={11} /> Delivered on{" "}
            {formatDate(order.deliveredAt)}
          </div>
        )}
      </div>

      {/* Timeline */}
      {order.status !== "REJECTED" && <OrderTimeline status={order.status} />}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        textAlign: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={24} color="#94a3b8" />
      </div>
      <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: "0.82rem", color: "#64748b", maxWidth: 280 }}>
          {subtitle}
        </div>
      )}
      {action}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function PharmacySkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 14,
      }}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 18,
            border: "1.5px solid #f1f5f9",
            animation: "pp-pulse 1.5s ease-in-out infinite",
          }}
        >
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "#f1f5f9",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 16,
                  background: "#f1f5f9",
                  borderRadius: 6,
                  marginBottom: 8,
                  width: "70%",
                }}
              />
              <div
                style={{
                  height: 12,
                  background: "#f1f5f9",
                  borderRadius: 6,
                  width: "90%",
                }}
              />
            </div>
          </div>
          <div
            style={{ height: 36, background: "#f1f5f9", borderRadius: 10 }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PatientPharmacyPage() {
  const [activeTab, setActiveTab] = useState("find");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [pharmacies, setPharmacies] = useState([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);
  const [pharmacyError, setPharmacyError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderPage, setOrderPage] = useState(0);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderModal, setOrderModal] = useState(null); // pharmacy object or null
  const [successBanner, setSuccessBanner] = useState(false);
  const debounceRef = useRef(null);

  // ── Fetch pharmacies ────────────────────────────────────────────────────────
  const fetchPharmacies = useCallback(async (q = "", loc = "") => {
    setLoadingPharmacies(true);
    setPharmacyError(null);
    const res = await searchPharmaciesAction({
      q: q || undefined,
      location: loc || undefined,
      page: 0,
      size: 40,
    });
    if (res.success) {
      const list = res.data?.content ?? res.data ?? [];
      setPharmacies(Array.isArray(list) ? list : []);
    } else {
      setPharmacyError(res.message || "Failed to load pharmacies.");
    }
    setLoadingPharmacies(false);
  }, []);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPharmacies(searchQuery, locationFilter);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, locationFilter, fetchPharmacies]);

  // ── Fetch orders ────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (page = 0) => {
    setLoadingOrders(true);
    setOrderError(null);
    const res = await fetchPatientPharmacyRequests(page, 10);
    if (res.success) {
      const data = res.data;
      const list = data?.content ?? data ?? [];
      setOrders(Array.isArray(list) ? list : []);
      setOrderTotal(data?.totalElements ?? list.length);
      setOrderTotalPages(data?.totalPages ?? 1);
    } else {
      setOrderError(res.message || "Failed to load your orders.");
    }
    setLoadingOrders(false);
  }, []);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders(orderPage);
  }, [activeTab, orderPage, fetchOrders]);

  const handleOrderSuccess = () => {
    setSuccessBanner(true);
    setTimeout(() => setSuccessBanner(false), 4000);
    if (activeTab === "orders") fetchOrders(0);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .pp-root { font-family: 'DM Sans', sans-serif; color: #1e293b; min-height: 100%; }

        .pp-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .pp-header h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 4px; display: flex; align-items: center; gap: 10px; }
        .pp-header p { margin: 0; font-size: 0.83rem; color: #64748b; }

        .pp-tabs { display: flex; gap: 4; background: #f1f5f9; border-radius: 12px; padding: 4px; margin-bottom: 24px; width: fit-content; }
        .pp-tab { padding: 8px 20px; border-radius: 9px; border: none; cursor: pointer; font-family: inherit; font-size: 0.82rem; font-weight: 600; transition: all 0.15s; background: transparent; color: #64748b; display: flex; align-items: center; gap: 6px; }
        .pp-tab.active { background: #fff; color: #0f172a; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

        .pp-search-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .pp-search-box { flex: 1; min-width: 200px; position: relative; }
        .pp-search-box input { width: 100%; padding: 10px 14px 10px 38px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; font-family: inherit; color: #1e293b; background: #fff; outline: none; transition: border 0.15s; box-sizing: border-box; }
        .pp-search-box input:focus { border-color: #6366f1; }
        .pp-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
        .pp-loc-box { position: relative; }
        .pp-loc-box input { padding: 10px 14px 10px 34px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; font-family: inherit; color: #1e293b; background: #fff; outline: none; transition: border 0.15s; width: 200px; }
        .pp-loc-box input:focus { border-color: #6366f1; }
        .pp-loc-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }

        .pp-pharmacy-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .pp-pharmacy-card { background: #fff; border-radius: 16px; padding: 18px; border: 1.5px solid #f1f5f9; transition: all 0.18s ease; }
        .pp-pharmacy-card:hover { border-color: #c7d2fe; box-shadow: 0 8px 24px rgba(99,102,241,0.08); }

        .pp-order-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border-radius: 10px; border: 1.5px solid #6366f1; background: transparent; color: #6366f1; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .pp-order-btn:hover { background: #6366f1; color: #fff; }

        .pp-orders-list { display: flex; flex-direction: column; gap: 14px; }
        .pp-order-card { background: #fff; border-radius: 16px; padding: 18px; border: 1.5px solid #f1f5f9; transition: border 0.18s; }
        .pp-order-card:hover { border-color: #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

        .pp-pagination { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; flex-wrap: wrap; gap: 10px; }
        .pp-page-btn { padding: 7px 14px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #475569; transition: all 0.15s; font-family: inherit; }
        .pp-page-btn:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
        .pp-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pp-page-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }
        .pp-page-info { font-size: 0.78rem; color: #64748b; }

        .pp-success-banner { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-size: 0.84rem; font-weight: 600; color: #16a34a; animation: pp-slide-in 0.3s ease; }
        .pp-error-banner { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .pp-results-count { font-size: 0.8rem; color: #64748b; margin-bottom: 14px; }

        @keyframes pp-modal-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes pp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pp-slide-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .pp-spin { animation: pp-spin 0.8s linear infinite; }

        @media (max-width: 640px) {
          .pp-loc-box input { width: 100%; }
          .pp-pharmacy-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="pp-root">
        {/* Header */}
        <div className="pp-header">
          <div>
            <h1>
              <ShoppingBag size={22} color="#6366f1" /> Pharmacy
            </h1>
            <p>
              Order your medicines online and get them delivered to your door
            </p>
          </div>
        </div>

        {/* Success banner */}
        {successBanner && (
          <div className="pp-success-banner">
            <CheckCircle2 size={16} />
            Order placed successfully! You can track it in the "My Orders" tab.
            <button
              onClick={() => {
                setActiveTab("orders");
                fetchOrders(0);
              }}
              style={{
                marginLeft: "auto",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "5px 12px",
                fontSize: "0.76rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              View Orders →
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="pp-tabs">
          <button
            className={`pp-tab ${activeTab === "find" ? "active" : ""}`}
            onClick={() => setActiveTab("find")}
          >
            <Search size={13} /> Find Pharmacy
          </button>
          <button
            className={`pp-tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <Package size={13} /> My Orders
            {orderTotal > 0 && (
              <span
                style={{
                  background: "#6366f1",
                  color: "#fff",
                  borderRadius: 999,
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  padding: "1px 6px",
                  minWidth: 16,
                }}
              >
                {orderTotal}
              </span>
            )}
          </button>
        </div>

        {/* ── Find Pharmacy tab ── */}
        {activeTab === "find" && (
          <>
            <div className="pp-search-row">
              <div className="pp-search-box">
                <Search size={15} className="pp-search-icon" />
                <input
                  type="text"
                  placeholder="Search pharmacies by name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="pp-loc-box">
                <MapPin size={14} className="pp-loc-icon" />
                <input
                  type="text"
                  placeholder="Filter by location…"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <button
                onClick={() => fetchPharmacies(searchQuery, locationFilter)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#475569",
                  fontFamily: "inherit",
                }}
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {pharmacyError && (
              <div className="pp-error-banner">
                <span
                  style={{
                    fontSize: "0.84rem",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={15} /> {pharmacyError}
                </span>
                <button
                  onClick={() => fetchPharmacies()}
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {!loadingPharmacies && !pharmacyError && (
              <div className="pp-results-count">
                {pharmacies.length === 0
                  ? "No pharmacies found"
                  : `${pharmacies.length} verified ${pharmacies.length === 1 ? "pharmacy" : "pharmacies"} available`}
              </div>
            )}

            {loadingPharmacies ? (
              <PharmacySkeleton />
            ) : pharmacies.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No pharmacies found"
                subtitle="Try adjusting your search or removing the location filter."
                action={
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setLocationFilter("");
                    }}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 10,
                      border: "1.5px solid #6366f1",
                      background: "transparent",
                      color: "#6366f1",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Clear Filters
                  </button>
                }
              />
            ) : (
              <div className="pp-pharmacy-grid">
                {pharmacies.map((p) => (
                  <PharmacyCard
                    key={p.id}
                    pharmacy={p}
                    onOrder={setOrderModal}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── My Orders tab ── */}
        {activeTab === "orders" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {orderTotal > 0
                  ? `${orderTotal} total order${orderTotal !== 1 ? "s" : ""}`
                  : ""}
              </div>
              <button
                onClick={() => fetchOrders(orderPage)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 9,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#475569",
                  fontFamily: "inherit",
                }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            {orderError && (
              <div className="pp-error-banner">
                <span
                  style={{
                    fontSize: "0.84rem",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertTriangle size={15} /> {orderError}
                </span>
                <button
                  onClick={() => fetchOrders(orderPage)}
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {loadingOrders ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 0",
                  gap: 10,
                  color: "#94a3b8",
                }}
              >
                <Loader2 size={20} className="pp-spin" />
                <span style={{ fontSize: "0.85rem" }}>
                  Loading your orders…
                </span>
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No orders yet"
                subtitle="Find a pharmacy and place your first medicine order."
                action={
                  <button
                    onClick={() => setActiveTab("find")}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 10,
                      border: "none",
                      background: "#6366f1",
                      color: "#fff",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Search size={13} /> Find a Pharmacy
                  </button>
                }
              />
            ) : (
              <>
                <div className="pp-orders-list">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>

                {orderTotalPages > 1 && (
                  <div className="pp-pagination">
                    <div className="pp-page-info">
                      Page {orderPage + 1} of {orderTotalPages}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="pp-page-btn"
                        disabled={orderPage === 0}
                        onClick={() => setOrderPage((p) => p - 1)}
                      >
                        ← Prev
                      </button>
                      {Array.from(
                        { length: Math.min(orderTotalPages, 5) },
                        (_, i) => i,
                      ).map((p) => (
                        <button
                          key={p}
                          className={`pp-page-btn ${p === orderPage ? "active" : ""}`}
                          onClick={() => setOrderPage(p)}
                        >
                          {p + 1}
                        </button>
                      ))}
                      <button
                        className="pp-page-btn"
                        disabled={orderPage >= orderTotalPages - 1}
                        onClick={() => setOrderPage((p) => p + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Order modal */}
      {orderModal && (
        <OrderModal
          pharmacy={orderModal}
          onClose={() => setOrderModal(null)}
          onSuccess={handleOrderSuccess}
        />
      )}
    </>
  );
}
