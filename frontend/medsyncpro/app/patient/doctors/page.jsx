"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import RouteGuard from "../../components/RouteGuard";
import { searchDoctorsAction } from "@/actions/Finddoctoraction";
import {
    Search, X, MapPin, Clock, Star, Stethoscope, Video, Building2,
    ChevronRight, Filter, Users
} from "lucide-react";
import "../patient-workflow.css";

const SPECIALTIES = [
    "All", "Cardiology", "Dermatology", "Orthopedics", "General Medicine",
    "Pediatrics", "Neurology", "Gynecology", "Ophthalmology", "ENT",
    "Psychiatry", "Oncology", "Pulmonology", "Urology"
];

function formatFee(fee) {
    if (!fee) return "Free";
    return `₹${fee}`;
}

function getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function DoctorDiscovery() {
    const router = useRouter();
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [specialty, setSpecialty] = useState("All");

    useEffect(() => {
        fetchDoctors();
    }, [specialty]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            let query = "";
            if (specialty !== "All") query = specialty;
            if (search.trim()) {
                query = specialty !== "All" ? `${specialty} ${search.trim()}` : search.trim();
            }

            const result = await searchDoctorsAction({ query: query || undefined });
            if (result.success) {
                setDoctors(result.data?.content || []);
            }
        } catch (err) {
            console.error("[fetchDoctors] ERROR:", err);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDoctors();
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return doctors;
        const q = search.toLowerCase();
        return doctors.filter(d =>
            d.name?.toLowerCase().includes(q) ||
            d.specialty?.toLowerCase().includes(q)
        );
    }, [doctors, search]);

    return (
        <div className="pw-page">
            {/* Header */}
            <div className="pw-page-header">
                <div>
                    <h1><Stethoscope size={22} /> Find Doctors</h1>
                    <p>Discover verified doctors and book appointments</p>
                </div>
            </div>

            {/* Search */}
            <form className="pw-search-bar" onSubmit={handleSearch}>
                <Search size={18} />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, specialty..."
                />
                {search && <button type="button" onClick={() => { setSearch(""); fetchDoctors(); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} /></button>}
            </form>

            {/* Specialty Filters */}
            <div className="pw-filters">
                {SPECIALTIES.map(s => (
                    <button
                        key={s}
                        className={`pw-filter-chip ${specialty === s ? "active" : ""}`}
                        onClick={() => setSpecialty(s)}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Results */}
            {loading ? (
                <div className="pw-loading"><div className="pw-spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="pw-empty">
                    <Users size={48} />
                    <h3>No doctors found</h3>
                    <p>Try adjusting your search or specialty filter</p>
                </div>
            ) : (
                <div className="pw-doctor-grid">
                    {filtered.map(doc => (
                        <div
                            key={doc.id}
                            className="pw-doctor-card"
                            onClick={() => router.push(`/patient/doctors/${doc.id}`)}
                        >
                            <div className="pw-dc-top">
                                <div className="pw-dc-avatar">
                                    {doc.profileImageUrl
                                        ? <img src={doc.profileImageUrl} alt={doc.name} />
                                        : getInitials(doc.name)
                                    }
                                </div>
                                <div className="pw-dc-info">
                                    <h3>{doc.name}</h3>
                                    <div className="pw-dc-specialty">{doc.specialty || "General"}</div>
                                    <div className="pw-dc-meta">
                                        {doc.experienceYears && <span>{doc.experienceYears}+ yrs exp</span>}
                                        {doc.slotDurationMinutes && <span>· {doc.slotDurationMinutes} min slots</span>}
                                    </div>
                                </div>
                            </div>

                            {(doc.expertise?.length > 0 || doc.languages?.length > 0) && (
                                <div className="pw-dc-tags">
                                    {doc.expertise?.slice(0, 3).map(e => (
                                        <span key={e} className="pw-dc-tag">{e}</span>
                                    ))}
                                    {doc.languages?.slice(0, 2).map(l => (
                                        <span key={l} className="pw-dc-tag" style={{ background: "var(--pw-purple-light)", color: "var(--pw-purple)" }}>{l}</span>
                                    ))}
                                </div>
                            )}

                            <div className="pw-dc-bottom">
                                <div className="pw-dc-fee">
                                    {formatFee(doc.consultationFee)}
                                    <span> per consultation</span>
                                </div>
                                <button className="pw-btn pw-btn-primary pw-btn-sm" onClick={(e) => { e.stopPropagation(); router.push(`/patient/doctors/${doc.id}`); }}>
                                    Book <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function DoctorsPage() {
    return (
        <RouteGuard allowedRoles={["PATIENT"]}>
            <DoctorDiscovery />
        </RouteGuard>
    );
}
