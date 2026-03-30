"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useNotifications } from "../../../context/NotificationContext";
import RouteGuard from "../../../components/RouteGuard";
import {
  fetchPatientAppointmentDetail,
  cancelPatientAppointment,
} from "@/actions/appointmentAction";
import {
  startOrGetConversationAction,
  fetchMessagesAction,
  sendMessageAction,
  markConversationReadAction,
} from "@/actions/messageAction";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Building2,
  MessageSquare,
  FileText,
  Pill,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  AlertTriangle,
  Send,
  Shield,
  Stethoscope,
  Loader2,
} from "lucide-react";
import "../../patient-workflow.css";

const STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
  NO_SHOW: "No Show",
};

const STATUS_STEPS = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"];

function formatTime12(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatDateLong(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AppointmentDetailClient() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { subscribeToMessages } = useNotifications();
  const apptId = params?.id;

  // ── Appointment state ──────────────────────────────────────────────────────
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // ── Chat state ─────────────────────────────────────────────────────────────
  const [conversationId, setConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(false);

  const chatBottomRef = useRef(null);
  // Keep ref in sync so the SSE callback always sees the latest conversationId
  const convIdRef = useRef(null);
  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);

  // ── Auto-scroll chat to bottom ─────────────────────────────────────────────
  const scrollChat = useCallback(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollChat();
  }, [chatMessages, scrollChat]);

  // ── Fetch appointment detail ───────────────────────────────────────────────
  const fetchDetail = async () => {
    setLoading(true);
    try {
      const result = await fetchPatientAppointmentDetail(apptId);
      if (result.success) setAppt(result.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ── Initialise conversation + load messages ────────────────────────────────
  const initChat = useCallback(async (doctorId) => {
    if (!doctorId) return;
    setChatLoading(true);
    setChatError(false);
    try {
      // 1. Get or create the conversation for this doctor-patient pair
      const convResult = await startOrGetConversationAction({ doctorId });
      if (!convResult.success || !convResult.data?.id) {
        setChatError(true);
        return;
      }
      const cid = convResult.data.id;
      setConversationId(cid);

      // 2. Load the last 50 messages
      const msgResult = await fetchMessagesAction(cid, 0, 50);
      if (msgResult.success) {
        const content =
          msgResult.data?.content ??
          (Array.isArray(msgResult.data) ? msgResult.data : []);
        setChatMessages(content);
      }

      // 3. Mark messages from the doctor as read
      markConversationReadAction(cid);
    } catch (err) {
      console.error("[Chat] init error", err);
      setChatError(true);
    }
    setChatLoading(false);
  }, []);

  // ── Bootstrap on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!apptId) return;
    fetchDetail();
  }, [apptId]);

  // Once the appointment loads we have doctorId — init chat
  useEffect(() => {
    if (appt?.doctorId) initChat(appt.doctorId);
  }, [appt?.doctorId, initChat]);

  // ── SSE: real-time incoming messages ──────────────────────────────────────
  useEffect(() => {
    return subscribeToMessages((payload) => {
      // Only handle messages belonging to this conversation
      if (payload.conversationId !== convIdRef.current) return;

      const newMsg = {
        id: payload.messageId,
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        senderRole: payload.senderRole,
        senderName: payload.senderName,
        content: payload.content,
        isRead: false,
        createdAt: payload.sentAt,
      };

      setChatMessages((prev) => {
        // De-duplicate: ignore if we already have this messageId
        if (prev.some((m) => m.id === payload.messageId)) return prev;
        return [...prev, newMsg];
      });

      // Auto-mark the doctor's message as read since the panel is open
      if (convIdRef.current) {
        markConversationReadAction(convIdRef.current);
      }
    });
  }, [subscribeToMessages]);

  // ── Send a message ─────────────────────────────────────────────────────────
  const handleSendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || !conversationId || sendingChat) return;

    // Optimistic bubble — appears instantly
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      conversationId,
      senderId: user?.id,
      senderRole: "PATIENT",
      senderName: user?.name ?? "You",
      content: text,
      isRead: false,
      createdAt: new Date().toISOString(),
      _sending: true,
    };
    setChatMessages((prev) => [...prev, optimistic]);
    setChatInput("");
    setSendingChat(true);

    try {
      const result = await sendMessageAction(conversationId, text);
      if (result.success && result.data) {
        // Replace the optimistic bubble with the real server message
        setChatMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...result.data } : m)),
        );
      } else {
        // Mark as failed
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, _failed: true, _sending: false } : m,
          ),
        );
        setToast({
          type: "error",
          message: result.message || "Failed to send message",
        });
      }
    } catch {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, _failed: true, _sending: false } : m,
        ),
      );
      setToast({ type: "error", message: "Network error — message not sent" });
    }
    setSendingChat(false);
  }, [chatInput, conversationId, sendingChat, user]);

  // ── Retry a failed message ─────────────────────────────────────────────────
  const handleRetry = useCallback((failedMsg) => {
    setChatMessages((prev) => prev.filter((m) => m.id !== failedMsg.id));
    setChatInput(failedMsg.content);
  }, []);

  // ── Cancel appointment ─────────────────────────────────────────────────────
  const handleCancel = async () => {
    setCancelling(true);
    try {
      const result = await cancelPatientAppointment(apptId);
      if (result.success) {
        setToast({ type: "success", message: "Appointment cancelled" });
        setAppt(result.data);
        setCancelModal(false);
      } else {
        setToast({
          type: "error",
          message: result.message || "Failed to cancel",
        });
      }
    } catch {
      setToast({ type: "error", message: "Network error" });
    }
    setCancelling(false);
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading)
    return (
      <div className="pw-page">
        <div className="pw-loading">
          <div className="pw-spinner" />
        </div>
      </div>
    );
  if (!appt)
    return (
      <div className="pw-page">
        <div className="pw-empty">
          <h3>Appointment not found</h3>
        </div>
      </div>
    );

  const currentIdx = STATUS_STEPS.indexOf(appt.status);
  const isCancelled = appt.status === "CANCELLED" || appt.status === "REJECTED";
  const canCancel = ["REQUESTED", "CONFIRMED"].includes(appt.status);
  const TypeIcon =
    appt.type === "VIDEO"
      ? Video
      : appt.type === "IN_PERSON"
        ? Building2
        : MessageSquare;

  return (
    <RouteGuard allowedRoles={["PATIENT"]}>
      <div className="pw-page">
        <div className="pw-breadcrumb">
          <a
            onClick={() => router.push("/patient/appointments")}
            style={{ cursor: "pointer" }}
          >
            <ArrowLeft size={14} style={{ verticalAlign: "middle" }} />{" "}
            Appointments
          </a>
          <ChevronRight size={12} />
          <span>Appointment Detail</span>
        </div>

        <div className="pw-detail-layout">
          <div>
            {/* Status */}
            <div className="pw-detail-card">
              <h3>
                <span className={`pw-status-badge ${appt.status}`}>
                  {STATUS_LABELS[appt.status]}
                </span>
              </h3>
              {!isCancelled && (
                <div className="pw-status-timeline">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i < currentIdx;
                    const active = i === currentIdx;
                    return (
                      <div key={step} className="pw-timeline-step">
                        <div
                          className={`pw-timeline-dot ${done ? "done" : active ? "active" : ""}`}
                        >
                          {done && <Check size={10} />}
                        </div>
                        <div
                          className={`pw-timeline-label ${active ? "active" : ""}`}
                        >
                          {STATUS_LABELS[step]}
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div
                            className={`pw-timeline-line ${done ? "done" : ""}`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {isCancelled && (
                <div className="pw-cancelled-banner">
                  <AlertTriangle size={16} />
                  {appt.status === "REJECTED"
                    ? `Rejected${appt.rejectionReason ? `: ${appt.rejectionReason}` : ""}`
                    : `Cancelled${appt.cancellationReason ? `: ${appt.cancellationReason}` : ""}`}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="pw-detail-card">
              <h3>
                <Calendar size={16} /> Appointment Details
              </h3>
              <div className="pw-detail-grid">
                <div className="pw-detail-item">
                  <Calendar size={16} />
                  <div>
                    <div className="label">Date</div>
                    <div className="value">
                      {formatDateLong(appt.scheduledDate)}
                    </div>
                  </div>
                </div>
                <div className="pw-detail-item">
                  <Clock size={16} />
                  <div>
                    <div className="label">Time</div>
                    <div className="value">
                      {formatTime12(appt.scheduledTime)}
                      {appt.endTime ? ` – ${formatTime12(appt.endTime)}` : ""}
                    </div>
                  </div>
                </div>
                <div className="pw-detail-item">
                  <TypeIcon size={16} />
                  <div>
                    <div className="label">Type</div>
                    <div className="value">
                      {appt.type === "VIDEO"
                        ? "Video Call"
                        : appt.type === "IN_PERSON"
                          ? "In-Person"
                          : "Chat"}
                    </div>
                  </div>
                </div>
                {appt.clinicName && (
                  <div className="pw-detail-item">
                    <MapPin size={16} />
                    <div>
                      <div className="label">Clinic</div>
                      <div className="value">{appt.clinicName}</div>
                    </div>
                  </div>
                )}
              </div>
              {appt.symptoms && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    background: "var(--pw-bg)",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--pw-muted)",
                      marginBottom: 4,
                    }}
                  >
                    Symptoms
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--pw-text)" }}>
                    {appt.symptoms}
                  </div>
                </div>
              )}
              {appt.diagnosis && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: "var(--pw-green-light)",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--pw-green)",
                      marginBottom: 4,
                    }}
                  >
                    Diagnosis
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--pw-text)" }}>
                    {appt.diagnosis}
                  </div>
                </div>
              )}
              {appt.followUpDate && (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: "0.82rem",
                    color: "var(--pw-blue)",
                  }}
                >
                  📅 Follow-up: {formatDateLong(appt.followUpDate)}
                </div>
              )}
              {canCancel && (
                <div className="pw-actions-row">
                  <button
                    className="pw-btn pw-btn-outline pw-btn-sm"
                    style={{
                      color: "var(--pw-red)",
                      borderColor: "var(--pw-red)",
                    }}
                    onClick={() => setCancelModal(true)}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Prescription */}
            {appt.prescription && (
              <div className="pw-detail-card">
                <h3>
                  <Pill size={16} /> Prescription
                </h3>
                <div className="pw-rx-card">
                  {appt.prescription.diagnosis && (
                    <div style={{ marginBottom: 12, fontSize: "0.82rem" }}>
                      <strong>Diagnosis:</strong> {appt.prescription.diagnosis}
                    </div>
                  )}
                  {appt.prescription.items?.map((item) => (
                    <div key={item.id} className="pw-rx-item">
                      <div className="pw-rx-icon">
                        <Pill size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="pw-rx-name">{item.medicineName}</div>
                        <div className="pw-rx-detail">
                          {item.dosage && `${item.dosage} · `}
                          {item.frequency && `${item.frequency} · `}
                          {item.duration}
                        </div>
                        {item.instructions && (
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--pw-primary)",
                              marginTop: 2,
                            }}
                          >
                            💡 {item.instructions}
                          </div>
                        )}
                      </div>
                      {item.quantity && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--pw-muted)",
                          }}
                        >
                          Qty: {item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                  {appt.prescription.notes && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 10,
                        background: "white",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        color: "var(--pw-muted)",
                      }}
                    >
                      <strong>Notes:</strong> {appt.prescription.notes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            {appt.documents?.length > 0 && (
              <div className="pw-detail-card">
                <h3>
                  <FileText size={16} /> Documents
                </h3>
                {appt.documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 0",
                      borderBottom: "1px solid var(--pw-border)",
                    }}
                  >
                    <FileText size={16} style={{ color: "var(--pw-blue)" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 500 }}>
                        {doc.fileName}
                      </div>
                      <div
                        style={{ fontSize: "0.7rem", color: "var(--pw-muted)" }}
                      >
                        {doc.fileType}
                      </div>
                    </div>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        className="pw-btn pw-btn-outline pw-btn-sm"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Doctor + Chat */}
          <div>
            {/* Doctor card */}
            <div className="pw-detail-card">
              <h3>
                <Stethoscope size={16} /> Doctor
              </h3>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--pw-primary), var(--pw-blue))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {(appt.doctorName || "D").charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>
                    {appt.doctorName || "Doctor"}
                  </div>
                  <div
                    style={{ color: "var(--pw-primary)", fontSize: "0.8rem" }}
                  >
                    {appt.doctorSpecialty || "General"}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Chat panel ────────────────────────────────────────── */}
            <div
              className="pw-detail-card"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <h3 style={{ marginBottom: 12 }}>
                <MessageSquare size={16} /> Chat
              </h3>

              {/* Messages area */}
              <div
                style={{
                  maxHeight: 320,
                  minHeight: 120,
                  overflowY: "auto",
                  marginBottom: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "4px 0",
                }}
              >
                {/* Loading state */}
                {chatLoading && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 24,
                      gap: 8,
                      color: "var(--pw-muted)",
                    }}
                  >
                    <Loader2
                      size={16}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    <span style={{ fontSize: "0.8rem" }}>
                      Loading messages…
                    </span>
                  </div>
                )}

                {/* Error state */}
                {!chatLoading && chatError && (
                  <div style={{ textAlign: "center", padding: 20 }}>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--pw-red)",
                        marginBottom: 8,
                      }}
                    >
                      Failed to load chat
                    </p>
                    <button
                      className="pw-btn pw-btn-outline pw-btn-sm"
                      onClick={() => appt?.doctorId && initChat(appt.doctorId)}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Empty state */}
                {!chatLoading && !chatError && chatMessages.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--pw-muted)",
                      textAlign: "center",
                      padding: "20px 0",
                    }}
                  >
                    No messages yet. Say hello!
                  </p>
                )}

                {/* Message bubbles */}
                {!chatLoading &&
                  !chatError &&
                  chatMessages.map((msg) => {
                    const isMe = msg.senderRole === "PATIENT";
                    const isFailed = msg._failed;
                    const isSending = msg._sending;

                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex",
                          justifyContent: isMe ? "flex-end" : "flex-start",
                          opacity: isSending ? 0.6 : 1,
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "82%",
                            padding: "8px 12px",
                            borderRadius: isMe
                              ? "12px 12px 2px 12px"
                              : "12px 12px 12px 2px",
                            background: isFailed
                              ? "transparent"
                              : isMe
                                ? "var(--pw-primary)"
                                : "var(--pw-bg)",
                            color:
                              isMe && !isFailed ? "white" : "var(--pw-text)",
                            fontSize: "0.82rem",
                            border: isFailed
                              ? "1.5px dashed var(--pw-red)"
                              : "none",
                            cursor: isFailed ? "pointer" : "default",
                            lineHeight: 1.45,
                          }}
                          onClick={() => isFailed && handleRetry(msg)}
                          title={isFailed ? "Tap to retry" : undefined}
                        >
                          {/* Doctor name label */}
                          {!isMe && (
                            <div
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 600,
                                color: "var(--pw-primary)",
                                marginBottom: 2,
                              }}
                            >
                              {msg.senderName || appt.doctorName}
                            </div>
                          )}

                          {msg.content}

                          {/* Timestamp row */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: 4,
                              marginTop: 3,
                            }}
                          >
                            {isFailed && (
                              <span
                                style={{
                                  fontSize: "0.6rem",
                                  color: "var(--pw-red)",
                                }}
                              >
                                Failed · tap to retry
                              </span>
                            )}
                            {isSending && (
                              <Loader2
                                size={9}
                                style={{
                                  animation: "spin 1s linear infinite",
                                  opacity: 0.6,
                                }}
                              />
                            )}
                            <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>
                              {msg.createdAt
                                ? new Date(msg.createdAt).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Auto-scroll anchor */}
                <div ref={chatBottomRef} />
              </div>

              {/* Input row */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder={
                    conversationId ? "Type a message…" : "Loading chat…"
                  }
                  disabled={!conversationId || chatLoading}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "1px solid var(--pw-border)",
                    borderRadius: 8,
                    fontSize: "0.82rem",
                    outline: "none",
                    fontFamily: "inherit",
                    opacity: !conversationId ? 0.5 : 1,
                  }}
                />
                <button
                  className="pw-btn pw-btn-primary pw-btn-sm"
                  onClick={handleSendChat}
                  disabled={sendingChat || !chatInput.trim() || !conversationId}
                >
                  {sendingChat ? (
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>

              {/* "Open in full messages" link */}
              {conversationId && (
                <button
                  onClick={() => router.push("/patient/messages")}
                  style={{
                    marginTop: 10,
                    background: "none",
                    border: "none",
                    color: "var(--pw-primary)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  <MessageSquare size={12} />
                  Open full conversation →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Modal */}
        {cancelModal && (
          <div
            className="pw-modal-overlay"
            onClick={() => setCancelModal(false)}
          >
            <div className="pw-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Cancel Appointment</h3>
              <p>
                Are you sure you want to cancel your appointment with{" "}
                {appt.doctorName}?
              </p>
              <textarea
                className="pw-symptoms-input"
                placeholder="Reason (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ minHeight: 50 }}
              />
              <div className="pw-modal-actions">
                <button
                  className="pw-btn pw-btn-outline pw-btn-sm"
                  onClick={() => setCancelModal(false)}
                >
                  Keep
                </button>
                <button
                  className="pw-btn pw-btn-danger pw-btn-sm"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Appointment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className={`pw-toast ${toast.type}`}>{toast.message}</div>
        )}
      </div>
    </RouteGuard>
  );
}
