"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { fetchDoctorSlots, bookAppointment, fetchDoctorPublicProfile } from "@/actions/appointmentAction";
import "../../patient-dashboard.css";
import "./doctor-profile.css";

const I = ({ d, size = 18, stroke = "currentColor", fill = "none" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {typeof d === "string" ? <path d={d} /> : d}
    </svg>
);

/* ─── Book Appointment Modal ─── */
function BookAppointmentModal({ doctor, onClose }) {
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(true);
    const [slotsError, setSlotsError] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [consultType, setConsultType] = useState("ONLINE");
    const [reason, setReason] = useState("");
    const [booking, setBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState(null);

    const consultTypes = [];
    if (doctor.offersOnlineConsultation) consultTypes.push({ value: "ONLINE", label: "🎥 Online Consultation" });
    if (doctor.offersInPersonConsultation) consultTypes.push({ value: "IN_PERSON", label: "🏥 In-Person Visit" });
    if (consultTypes.length === 0) consultTypes.push({ value: "ONLINE", label: "🎥 Online Consultation" });

    useEffect(() => {
        setSlotsLoading(true);
        setSlotsError(null);
        fetchDoctorSlots(doctor.id, consultType)
            .then(result => {
                if (result.success) {
                    setSlots(result.data || []);
                } else {
                    setSlotsError(result.message || "Failed to load slots");
                }
            })
            .catch(err => setSlotsError(err.message))
            .finally(() => setSlotsLoading(false));
    }, [doctor.id, consultType]);

    const handleBook = async () => {
        if (!selectedSlot) return;
        setBooking(true);
        setBookingError(null);
        try {
            const result = await bookAppointment({
                doctorId: doctor.id,
                scheduledDate: selectedSlot.date,
                scheduledTime: selectedSlot.time,
                type: consultType === "ONLINE" ? "VIDEO" : consultType,
                symptoms: reason,
            });
            if (result.success) {
                setBookingSuccess(true);
            } else {
                setBookingError(result.message || "Booking failed");
            }
        } catch (err) {
            setBookingError(err.message);
        } finally {
            setBooking(false);
        }
    };

    // Group slots by date
    const slotsByDate = slots.reduce((acc, slot) => {
        const dateKey = slot.date || slot.slotDate || new Date(slot.startTime).toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(slot);
        return acc;
    }, {});

    return (
        <div className="dp-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="dp-modal">
                <div className="dp-modal-header">
                    <h2>Book Appointment</h2>
                    <p>with {doctor.name || doctor.fullName}</p>
                    <button className="dp-modal-close" onClick={onClose}>✕</button>
                </div>

                {bookingSuccess ? (
                    <div className="dp-booking-success">
                        <span className="dp-success-icon">✅</span>
                        <h3>Appointment Booked!</h3>
                        <p>Your appointment has been confirmed. You'll receive a notification shortly.</p>
                        <button className="dp-book-btn" onClick={onClose}>Done</button>
                    </div>
                ) : (
                    <div className="dp-modal-body">
                        {/* Consultation Type */}
                        <div className="dp-modal-section">
                            <label className="dp-label">Consultation Type</label>
                            <div className="dp-consult-types">
                                {consultTypes.map(ct => (
                                    <button
                                        key={ct.value}
                                        className={`dp-consult-btn ${consultType === ct.value ? "selected" : ""}`}
                                        onClick={() => { setConsultType(ct.value); setSelectedSlot(null); }}
                                    >
                                        {ct.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Slot Selection */}
                        <div className="dp-modal-section">
                            <label className="dp-label">Select Time Slot</label>
                            {slotsLoading && <div className="dp-slots-loading"><div className="fd-spinner" /></div>}
                            {slotsError && <p className="dp-slots-error">Could not load slots: {slotsError}</p>}
                            {!slotsLoading && slots.length === 0 && (
                                <p className="dp-no-slots">No available slots for this consultation type. Please try another type or check back later.</p>
                            )}
                            {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                                <div key={date} className="dp-slot-group">
                                    <div className="dp-slot-date">{date}</div>
                                    <div className="dp-slot-grid">
                                        {dateSlots.map(slot => {
                                            const time = slot.time || slot.startTime || slot.slotTime;
                                            const available = slot.available !== false && slot.status !== "BOOKED";
                                            return (
                                                <button
                                                    key={`${slot.date}-${slot.time}`}
                                                    className={`dp-slot-btn ${selectedSlot?.date === slot.date && selectedSlot?.time === slot.time ? "selected" : ""} ${!available ? "booked" : ""}`}
                                                    disabled={!available}
                                                    onClick={() => setSelectedSlot(slot)}
                                                >
                                                    {typeof time === "string" ? time.slice(0, 5) : time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reason */}
                        <div className="dp-modal-section">
                            <label className="dp-label">Reason for Visit <span className="dp-optional">(optional)</span></label>
                            <textarea
                                className="dp-reason-input"
                                placeholder="Briefly describe your symptoms or reason..."
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                rows={3}
                                maxLength={500}
                            />
                        </div>

                        {bookingError && <p className="dp-booking-error">⚠️ {bookingError}</p>}

                        <button
                            className="dp-book-btn"
                            disabled={!selectedSlot || booking}
                            onClick={handleBook}
                        >
                            {booking ? "Booking…" : "Confirm Appointment"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── MAIN COMPONENT ─── */
export default function DoctorProfileClient() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const doctorId = params?.id;
    const openBook = searchParams.get("action") === "book";

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBookModal, setShowBookModal] = useState(openBook);
    const [activeTab, setActiveTab] = useState("overview");

    const initials = user?.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "P";

    useEffect(() => {
        if (!doctorId) return;
        setLoading(true);
        fetchDoctorPublicProfile(doctorId)
            .then(result => {
                if (result.success) {
                    const data = result.data;
                    if (data.status === "UNVERIFIED" || data.status === "SUSPENDED") {
                        setError("This doctor is no longer available for appointments.");
                    } else {
                        setDoctor(data);
                    }
                } else {
                    setError(result.message || "Failed to load doctor profile");
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [doctorId]);

    if (loading) return (
        <div className="dp-full-loading">
            <div className="fd-spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
            <p>Loading doctor profile…</p>
        </div>
    );

    if (error) return (
        <div className="dp-full-error">
            <span style={{ fontSize: "2rem" }}>⚠️</span>
            <p>{error}</p>
            <button className="fd-retry-btn" onClick={() => router.push("/patient/find-doctor")}>Find Another Doctor</button>
        </div>
    );

    if (!doctor) return null;

    const name = doctor.name || doctor.fullName || "Doctor";
    const rating = doctor.averageRating ?? doctor.rating ?? null;
    const experience = doctor.experienceYears ?? doctor.yearsOfExperience ?? null;
    let rawQuals = doctor.qualifications || doctor.education;
    let qualifications = [];
    if (Array.isArray(rawQuals)) {
      qualifications = rawQuals;
    } else if (typeof rawQuals === "string") {
      // Convert comma-separated string from backend into an array
      qualifications = rawQuals
        .split(",")
        .map((q) => q.trim())
        .filter(Boolean);
    }
    const publicDocs = (doctor.documents || []).filter(d => d.isPublic !== false);

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "qualifications", label: "Qualifications" },
        { id: "clinic", label: "Clinic Info" },
        qualifications.length > 0 || publicDocs.length > 0 ? { id: "documents", label: "Documents" } : null,
    ].filter(Boolean);

    return (
        <div style={{ minHeight: "100vh", background: "var(--pd-bg)", fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Navbar */}
            <header className="pd-navbar dp-standalone-nav">
                <button className="fd-back-btn" onClick={() => router.back()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    Back
                </button>
                <span className="dp-nav-title">Doctor Profile</span>
                <div className="pd-avatar-sm" onClick={() => router.push("/patient")}>
                    {(user?.profileImage || user?.profileImageUrl) ? (
                        <img src={user.profileImage || user.profileImageUrl} alt={user?.name} />
                    ) : initials}
                </div>
            </header>

            <div className="dp-page">
                {/* ── Hero Card ── */}
                <div className="dp-hero-card">
                    <div className="dp-hero-inner">
                        <div className="dp-hero-avatar">
                            {doctor.profileImageUrl || doctor.profilePhoto ? (
                                <img src={doctor.profileImageUrl || doctor.profilePhoto} alt={name} />
                            ) : (
                                <span className="dp-hero-initials">
                                    {(name || "Dr").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                                </span>
                            )}
                            <span className={`fd-avail-dot ${(doctor.availableToday ?? true) ? "available" : "busy"}`} style={{ width: 16, height: 16, bottom: 4, right: 4 }} />
                        </div>
                        <div className="dp-hero-info">
                            <div className="dp-hero-badge">
                                <I d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" size={14} stroke="var(--pd-teal)" />
                                Verified Doctor
                            </div>
                            <h1 className="dp-hero-name">{name}</h1>
                            <p className="dp-hero-specialty">{doctor.specialtyName || doctor.specialty}</p>
                            <div className="dp-hero-stats">
                                {experience !== null && (
                                    <span className="dp-stat"><I d={<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>} size={14} /> {experience} yrs exp.</span>
                                )}
                                {rating !== null && (
                                    <span className="dp-stat"><span style={{ color: "var(--pd-orange)" }}>★</span> {Number(rating).toFixed(1)} {doctor.totalReviews && `(${doctor.totalReviews} reviews)`}</span>
                                )}
                                {doctor.clinicName && (
                                    <span className="dp-stat"><I d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={14} /> {doctor.clinicName}</span>
                                )}
                            </div>

                            {/* Consultation types */}
                            <div className="dp-consult-chips">
                                {doctor.offersOnlineConsultation && <span className="fd-tag online">🎥 Online</span>}
                                {doctor.offersInPersonConsultation && <span className="fd-tag inperson">🏥 In-Person</span>}
                                {(doctor.availableToday ?? true) && <span className="fd-tag avail">✅ Available Today</span>}
                            </div>
                        </div>
                        <div className="dp-hero-cta">
                            <button className="dp-book-hero-btn" onClick={() => setShowBookModal(true)}>
                                <I d="M12 5v14M5 12h14" size={16} />
                                Book Appointment
                            </button>
                            {doctor.consultationFee && (
                                <p className="dp-fee">Consultation fee: <strong>₹{doctor.consultationFee}</strong></p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="dp-tabs-bar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`dp-tab ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                <div className="dp-tab-content">
                    {activeTab === "overview" && (
                        <div className="dp-section-grid">
                            {doctor.bio && (
                                <div className="dp-info-card">
                                    <h3>About</h3>
                                    <p>{doctor.bio}</p>
                                </div>
                            )}
                            {doctor.languages && doctor.languages.length > 0 && (
                                <div className="dp-info-card">
                                    <h3>Languages</h3>
                                    <div className="dp-chip-row">
                                        {doctor.languages.map(l => <span key={l} className="dp-chip">{l}</span>)}
                                    </div>
                                </div>
                            )}
                            {doctor.specializations && doctor.specializations.length > 0 && (
                                <div className="dp-info-card">
                                    <h3>Specializations</h3>
                                    <div className="dp-chip-row">
                                        {doctor.specializations.map(s => <span key={s} className="dp-chip dp-chip-teal">{s}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "qualifications" && (
                        <div className="dp-section-grid">
                            {qualifications.length > 0 ? (
                                <div className="dp-info-card">
                                    <h3>Education & Qualifications</h3>
                                    <div className="dp-qual-list">
                                        {qualifications.map((q, i) => (
                                            <div key={i} className="dp-qual-item">
                                                <div className="dp-qual-icon">🎓</div>
                                                <div>
                                                    <div className="dp-qual-title">{q.degree || q.title || q}</div>
                                                    {q.institution && <div className="dp-qual-inst">{q.institution}</div>}
                                                    {q.year && <div className="dp-qual-year">{q.year}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : <p className="dp-empty-tab">No qualification information available.</p>}
                        </div>
                    )}

                    {activeTab === "clinic" && (
                        <div className="dp-section-grid">
                            {(doctor.clinicName || doctor.clinicAddress || doctor.clinicPhone) ? (
                                <div className="dp-info-card">
                                    <h3>Clinic Information</h3>
                                    <div className="dp-clinic-details">
                                        {doctor.clinicName && <div className="dp-clinic-row"><I d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" size={16} /> <span><strong>{doctor.clinicName}</strong></span></div>}
                                        {doctor.clinicAddress && <div className="dp-clinic-row"><I d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" size={16} /> <span>{doctor.clinicAddress}</span></div>}
                                        {doctor.clinicPhone && <div className="dp-clinic-row"><I d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6" size={16} /> <span>{doctor.clinicPhone}</span></div>}
                                        {doctor.consultationHours && <div className="dp-clinic-row"><I d={<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>} size={16} /> <span>{doctor.consultationHours}</span></div>}
                                    </div>
                                </div>
                            ) : <p className="dp-empty-tab">No clinic information available.</p>}
                        </div>
                    )}

                    {activeTab === "documents" && (
                        <div className="dp-section-grid">
                            {publicDocs.length > 0 ? (
                                <div className="dp-info-card">
                                    <h3>Public Documents</h3>
                                    <div className="dp-doc-list">
                                        {publicDocs.map(doc => (
                                            <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="dp-doc-item">
                                                <span className="dp-doc-icon">📄</span>
                                                <span className="dp-doc-name">{doc.name || doc.fileName || "Document"}</span>
                                                <I d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" size={14} stroke="var(--pd-teal)" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ) : <p className="dp-empty-tab">No public documents available.</p>}
                        </div>
                    )}
                </div>

                {/* Sticky book CTA (mobile) */}
                <div className="dp-sticky-cta">
                    <button className="dp-book-hero-btn" onClick={() => setShowBookModal(true)}>
                        <I d="M12 5v14M5 12h14" size={16} />
                        Book Appointment
                    </button>
                </div>
            </div>

            {/* Book Appointment Modal */}
            {showBookModal && doctor && (
                <BookAppointmentModal
                    doctor={doctor}
                    onClose={() => setShowBookModal(false)}
                />
            )}
        </div>
    );
}