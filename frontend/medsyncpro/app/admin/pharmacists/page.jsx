"use client";
import "./pharmacists.css";
import { useState, useMemo, useRef, useEffect } from "react";
import {
    Search, ChevronLeft, ChevronRight, MoreHorizontal,
    CheckCircle2, XCircle, Shield, ShieldAlert, Eye, UserPlus,
    Pill, Clock, TrendingUp, Users, FileText, Award,
    AlertTriangle, X, Phone, Mail, MapPin, Calendar, Activity,
    ClipboardCheck, BadgeCheck, ShieldOff, Flag, MessageSquare,
    ArrowUpDown, Check, BarChart3, Package, Truck, Store
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════ */
const PHARMACY_TYPES = ["Retail", "Hospital", "Online", "Compounding", "Specialty", "Community"];

const STATUS_MAP = {
    verified: { label: "Verified", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    suspended: { label: "Suspended", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    inactive: { label: "Inactive", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
};

const MOCK_PHARMACISTS = [
    { id: "p1", name: "Alice Turner", email: "alice.t@pharmawell.com", phone: "+1 (555) 111-2233", pharmacy: "PharmaWell Central", pharmacyType: "Retail", license: "PH-2020-4821", status: "verified", accountStatus: "active", joined: "2024-01-10", city: "New York, NY", rating: 4.7, orders: 4520, activeMeds: 1240, lastActive: "1 hour ago", bio: "Licensed pharmacist with 10 years of experience in retail pharmacy and medication therapy management.", address: "100 Pharmacy Blvd, New York, NY 10001", operatingHours: "8:00 AM – 10:00 PM", delivery: true, onlineOrders: true, documents: { license: true, certificates: true, idProof: true, compliance: true }, notes: "Excellent compliance record.", riskFlag: false },
    { id: "p2", name: "Brian Mitchell", email: "brian.m@citymeds.com", phone: "+1 (555) 222-3344", pharmacy: "CityMeds Pharmacy", pharmacyType: "Community", license: "PH-2019-7102", status: "verified", accountStatus: "active", joined: "2023-11-15", city: "Chicago, IL", rating: 4.5, orders: 3890, activeMeds: 980, lastActive: "3 hours ago", bio: "Community pharmacist focused on patient counseling and chronic disease management.", address: "250 Health St, Chicago, IL 60601", operatingHours: "9:00 AM – 9:00 PM", delivery: true, onlineOrders: false, documents: { license: true, certificates: true, idProof: true, compliance: true }, notes: "", riskFlag: false },
    { id: "p3", name: "Catherine Zhao", email: "cathy.z@quickrx.com", phone: "+1 (555) 333-4455", pharmacy: "QuickRx Online", pharmacyType: "Online", license: "PH-2021-3356", status: "pending", accountStatus: "active", joined: "2025-02-19", city: "San Francisco, CA", rating: 0, orders: 0, activeMeds: 0, lastActive: "Just now", bio: "Digital pharmacy specialist with expertise in telepharmacy and automated dispensing.", address: "500 Tech Ave, San Francisco, CA 94105", operatingHours: "24/7", delivery: true, onlineOrders: true, documents: { license: true, certificates: false, idProof: true, compliance: true }, notes: "Certificate upload pending.", riskFlag: false },
    { id: "p4", name: "Daniel Okafor", email: "daniel.o@healpharm.com", phone: "+1 (555) 444-5566", pharmacy: "HealPharm Hospital", pharmacyType: "Hospital", license: "PH-2018-8890", status: "pending", accountStatus: "active", joined: "2025-02-21", city: "Houston, TX", rating: 0, orders: 0, activeMeds: 0, lastActive: "2 hours ago", bio: "Hospital pharmacist specializing in clinical pharmacy, IV compounding, and oncology.", address: "800 Hospital Dr, Houston, TX 77001", operatingHours: "24/7", delivery: false, onlineOrders: false, documents: { license: true, certificates: true, idProof: false, compliance: true }, notes: "Awaiting ID proof.", riskFlag: false },
    { id: "p5", name: "Elena Rossi", email: "elena.r@compoundrx.com", phone: "+1 (555) 555-6677", pharmacy: "CompoundRx Lab", pharmacyType: "Compounding", license: "PH-2022-1190", status: "rejected", accountStatus: "inactive", joined: "2025-01-05", city: "Miami, FL", rating: 0, orders: 0, activeMeds: 0, lastActive: "3 weeks ago", bio: "Compounding pharmacist with training in sterile and non-sterile preparations.", address: "300 Lab Center, Miami, FL 33101", operatingHours: "8:00 AM – 6:00 PM", delivery: false, onlineOrders: false, documents: { license: false, certificates: false, idProof: true, compliance: false }, notes: "License expired. Compliance docs missing. Rejected on Jan 20.", riskFlag: true },
    { id: "p6", name: "Frank Wu", email: "frank.w@medsource.com", phone: "+1 (555) 666-7788", pharmacy: "MedSource Specialty", pharmacyType: "Specialty", license: "PH-2017-5567", status: "verified", accountStatus: "active", joined: "2023-08-20", city: "Boston, MA", rating: 4.9, orders: 6210, activeMeds: 2100, lastActive: "30 min ago", bio: "Specialty pharmacist managing complex medications for rare diseases and biologics.", address: "150 Biotech Rd, Boston, MA 02101", operatingHours: "8:00 AM – 8:00 PM", delivery: true, onlineOrders: true, documents: { license: true, certificates: true, idProof: true, compliance: true }, notes: "Top performer. Perfect compliance.", riskFlag: false },
    { id: "p7", name: "Grace Kim", email: "grace.k@wellcare.com", phone: "+1 (555) 777-8899", pharmacy: "WellCare Drugs", pharmacyType: "Retail", license: "PH-2020-9023", status: "suspended", accountStatus: "suspended", joined: "2024-04-10", city: "Seattle, WA", rating: 3.1, orders: 1560, activeMeds: 450, lastActive: "1 month ago", bio: "Retail pharmacist with interest in OTC consultation and patient education.", address: "400 Market St, Seattle, WA 98101", operatingHours: "9:00 AM – 7:00 PM", delivery: false, onlineOrders: false, documents: { license: true, certificates: true, idProof: true, compliance: true }, notes: "Suspended: compliance violation under review since Feb 1.", riskFlag: true },
    { id: "p8", name: "Hassan Ali", email: "hassan.a@fastpharm.com", phone: "+1 (555) 888-9900", pharmacy: "FastPharm Express", pharmacyType: "Online", license: "PH-2023-2201", status: "pending", accountStatus: "active", joined: "2025-02-23", city: "Dallas, TX", rating: 0, orders: 0, activeMeds: 0, lastActive: "5 hours ago", bio: "Pharmacist entrepreneur building a fast-delivery online pharmacy platform.", address: "600 Commerce Blvd, Dallas, TX 75201", operatingHours: "24/7", delivery: true, onlineOrders: true, documents: { license: true, certificates: true, idProof: true, compliance: true }, notes: "All documents uploaded. Ready for review.", riskFlag: false },
    { id: "p9", name: "Isabel Santos", email: "isabel.s@careplus.com", phone: "+1 (555) 999-0011", pharmacy: "CarePlus Pharmacy", pharmacyType: "Community", license: "PH-2019-6678", status: "verified", accountStatus: "active", joined: "2024-06-05", city: "Los Angeles, CA", rating: 4.6, orders: 3100, activeMeds: 870, lastActive: "2 hours ago", bio: "Community pharmacist passionate about medication adherence programs and immunizations.", address: "700 Wellness Ave, Los Angeles, CA 90001", operatingHours: "8:00 AM – 9:00 PM", delivery: true, onlineOrders: true, documents: { license: true, certificates: true, idProof: true, compliance: true }, notes: "", riskFlag: false },
    { id: "p10", name: "James Patel", email: "james.p@rxhub.com", phone: "+1 (555) 000-1122", pharmacy: "RxHub Pharmacy", pharmacyType: "Retail", license: "PH-2021-4490", status: "verified", accountStatus: "inactive", joined: "2024-07-01", city: "Denver, CO", rating: 4.3, orders: 2200, activeMeds: 620, lastActive: "5 days ago", bio: "Retail pharmacist with a focus on geriatric care and polypharmacy management.", address: "900 Mountain View, Denver, CO 80201", operatingHours: "9:00 AM – 6:00 PM", delivery: false, onlineOrders: false, documents: { license: true, certificates: true, idProof: true, compliance: true }, notes: "On extended leave.", riskFlag: false },
];

const VERIFICATION_QUEUE = MOCK_PHARMACISTS.filter(d => d.status === "pending");
const PAGE_SIZE = 8;

/* ═══════════════════════════════════════════════════════ */
export default function PharmacistsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [sortBy, setSortBy] = useState("joined");
    const [sortDir, setSortDir] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [selected, setSelected] = useState(new Set());
    const [drawerDoc, setDrawerDoc] = useState(null);
    const [pharmacists, setPharmacists] = useState(MOCK_PHARMACISTS);
    const [adminNote, setAdminNote] = useState("");
    const [confirmAction, setConfirmAction] = useState(null);

    const filtered = useMemo(() => {
        let list = [...pharmacists];
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(d => d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.license.toLowerCase().includes(q) || d.pharmacy.toLowerCase().includes(q));
        }
        if (statusFilter !== "all") list = list.filter(d => d.status === statusFilter);
        if (typeFilter !== "all") list = list.filter(d => d.pharmacyType === typeFilter);
        list.sort((a, b) => {
            let c = 0;
            if (sortBy === "joined") c = new Date(a.joined) - new Date(b.joined);
            else if (sortBy === "name") c = a.name.localeCompare(b.name);
            else if (sortBy === "orders") c = a.orders - b.orders;
            else if (sortBy === "rating") c = a.rating - b.rating;
            return sortDir === "desc" ? -c : c;
        });
        return list;
    }, [pharmacists, search, statusFilter, typeFilter, sortBy, sortDir]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const stats = useMemo(() => ({
        total: pharmacists.length,
        verified: pharmacists.filter(d => d.status === "verified").length,
        pending: pharmacists.filter(d => d.status === "pending").length,
        suspended: pharmacists.filter(d => d.status === "suspended").length,
    }), [pharmacists]);

    const updatePharmacist = (id, updates) => {
        setPharmacists(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
        if (drawerDoc?.id === id) setDrawerDoc(prev => ({ ...prev, ...updates }));
    };
    const handleAction = (type, doc) => setConfirmAction({ type, doctor: doc });
    const confirmActionHandler = () => {
        if (!confirmAction) return;
        const { type, doctor } = confirmAction;
        const map = { approve: { status: "verified", accountStatus: "active" }, reject: { status: "rejected", accountStatus: "inactive" }, suspend: { status: "suspended", accountStatus: "suspended" }, activate: { status: "verified", accountStatus: "active" } };
        if (map[type]) updatePharmacist(doctor.id, map[type]);
        setConfirmAction(null);
    };
    const bulkAction = (type) => { selected.forEach(id => { const m = { approve: { status: "verified", accountStatus: "active" }, suspend: { status: "suspended", accountStatus: "suspended" } }; if (m[type]) updatePharmacist(id, m[type]); }); setSelected(new Set()); };
    const toggleSelect = (id) => { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
    const toggleSelectAll = () => { selected.size === paginated.length ? setSelected(new Set()) : setSelected(new Set(paginated.map(d => d.id))); };
    const getInitials = (n) => n.split(" ").filter(Boolean).map(x => x[0]).join("").toUpperCase().slice(0, 2);
    const getColor = (n) => { const c = ["#0d9488", "#0891b2", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"]; let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return c[Math.abs(h) % c.length]; };

    return (
        <div className="pm-page">
            {/* Header */}
            <div className="pm-page-header">
                <div>
                    <h1 className="pm-page-title"><Pill size={28} style={{ color: "#0d9488" }} /> Pharmacists</h1>
                    <p className="pm-page-subtitle">Manage, verify, and monitor all pharmacists on the platform</p>
                </div>
                <button className="pm-add-btn"><UserPlus size={16} /> Add Pharmacist</button>
            </div>

            {/* KPIs */}
            <div className="pm-kpi-row">
                {[
                    { label: "Total Pharmacists", value: stats.total, icon: <Users size={20} />, color: "#0891b2", trend: "+15%" },
                    { label: "Verified", value: stats.verified, icon: <BadgeCheck size={20} />, color: "#10b981", trend: "+10%" },
                    { label: "Pending Review", value: stats.pending, icon: <Clock size={20} />, color: "#f59e0b", trend: `${stats.pending} new` },
                    { label: "Suspended", value: stats.suspended, icon: <ShieldAlert size={20} />, color: "#8b5cf6", trend: "—" },
                ].map((kpi, i) => (
                    <div key={i} className="pm-kpi-card admin-glass-card">
                        <div className="pm-kpi-icon" style={{ background: `${kpi.color}15`, color: kpi.color }}>{kpi.icon}</div>
                        <div className="pm-kpi-value">{kpi.value}</div>
                        <div className="pm-kpi-label">{kpi.label}</div>
                        <span className="pm-kpi-trend" style={{ color: kpi.color }}>{kpi.trend}</span>
                    </div>
                ))}
            </div>

            {/* Verification Queue */}
            {VERIFICATION_QUEUE.length > 0 && (
                <div className="pm-vq admin-glass-card">
                    <div className="pm-vq-header">
                        <div className="pm-vq-title"><ShieldAlert size={18} style={{ color: "#f59e0b" }} /><h3>Verification Queue</h3><span className="pm-vq-count">{VERIFICATION_QUEUE.length} pending</span></div>
                        <button className="pm-vq-bulk" onClick={() => VERIFICATION_QUEUE.forEach(d => updatePharmacist(d.id, { status: "verified", accountStatus: "active" }))}><CheckCircle2 size={14} /> Approve All</button>
                    </div>
                    <div className="pm-vq-list">
                        {VERIFICATION_QUEUE.map(doc => (
                            <div key={doc.id} className="pm-vq-item">
                                <div className="pm-vq-avatar" style={{ background: getColor(doc.name) }}>{getInitials(doc.name)}</div>
                                <div className="pm-vq-info">
                                    <span className="pm-vq-name">{doc.name}</span>
                                    <span className="pm-vq-meta">{doc.pharmacy} · {doc.pharmacyType}</span>
                                    <div className="pm-vq-docs">
                                        {Object.entries(doc.documents).map(([k, v]) => (
                                            <span key={k} className={`pm-doc-badge ${v ? "ok" : "missing"}`}>
                                                {v ? <Check size={10} /> : <AlertTriangle size={10} />}
                                                {k === "license" ? "License" : k === "certificates" ? "Certs" : k === "compliance" ? "Compliance" : "ID"}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="pm-vq-actions">
                                    <button className="pm-vq-approve" onClick={() => handleAction("approve", doc)} title="Approve"><CheckCircle2 size={18} /></button>
                                    <button className="pm-vq-reject" onClick={() => handleAction("reject", doc)} title="Reject"><XCircle size={18} /></button>
                                    <button className="pm-vq-view" onClick={() => setDrawerDoc(doc)} title="View"><Eye size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="pm-toolbar admin-glass-card">
                <div className="pm-search-box">
                    <Search size={16} className="pm-search-icon" />
                    <input type="text" placeholder="Search by name, pharmacy, email, or license..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
                </div>
                <div className="pm-filter-group">
                    <select className="pm-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="all">All Status</option>
                        {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <select className="pm-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
                        <option value="all">All Types</option>
                        {PHARMACY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="pm-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="joined">Sort: Joined</option>
                        <option value="name">Sort: Name</option>
                        <option value="orders">Sort: Orders</option>
                        <option value="rating">Sort: Rating</option>
                    </select>
                    <button className="pm-sort-dir" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}><ArrowUpDown size={14} /></button>
                </div>
            </div>

            {/* Bulk Actions */}
            {selected.size > 0 && (
                <div className="pm-bulk-bar">
                    <span>{selected.size} pharmacist(s) selected</span>
                    <div className="pm-bulk-actions">
                        <button className="pm-bulk-approve" onClick={() => bulkAction("approve")}><CheckCircle2 size={14} /> Bulk Approve</button>
                        <button className="pm-bulk-suspend" onClick={() => bulkAction("suspend")}><ShieldOff size={14} /> Bulk Suspend</button>
                        <button className="pm-bulk-clear" onClick={() => setSelected(new Set())}><X size={14} /> Clear</button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="pm-table-wrapper admin-glass-card">
                <table className="pm-table">
                    <thead>
                        <tr>
                            <th className="pm-th-check"><input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleSelectAll} /></th>
                            <th>Pharmacist</th>
                            <th>Pharmacy</th>
                            <th>License</th>
                            <th>Location</th>
                            <th>Verification</th>
                            <th>Account</th>
                            <th>Orders</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr><td colSpan={10} className="pm-empty"><Search size={40} strokeWidth={1} /><p>No pharmacists found.</p></td></tr>
                        ) : paginated.map(doc => (
                            <tr key={doc.id} className={selected.has(doc.id) ? "pm-row-selected" : ""}>
                                <td className="pm-td-check"><input type="checkbox" checked={selected.has(doc.id)} onChange={() => toggleSelect(doc.id)} /></td>
                                <td>
                                    <div className="pm-cell" onClick={() => setDrawerDoc(doc)} style={{ cursor: "pointer" }}>
                                        <div className="pm-avatar" style={{ background: getColor(doc.name) }}>{getInitials(doc.name)}</div>
                                        <div>
                                            <div className="pm-name">{doc.name}{doc.riskFlag && <Flag size={12} className="pm-risk-flag" />}</div>
                                            <div className="pm-email">{doc.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="pm-pharmacy-cell">
                                        <span className="pm-pharmacy-name">{doc.pharmacy}</span>
                                        <span className="pm-pharmacy-type">{doc.pharmacyType}</span>
                                    </div>
                                </td>
                                <td><code className="pm-license">{doc.license}</code></td>
                                <td className="pm-city">{doc.city}</td>
                                <td>
                                    <span className="pm-status-badge" style={{ color: STATUS_MAP[doc.status]?.color, background: STATUS_MAP[doc.status]?.bg }}>
                                        {doc.status === "verified" && <CheckCircle2 size={12} />}
                                        {doc.status === "pending" && <Clock size={12} />}
                                        {doc.status === "rejected" && <XCircle size={12} />}
                                        {doc.status === "suspended" && <ShieldAlert size={12} />}
                                        {STATUS_MAP[doc.status]?.label}
                                    </span>
                                </td>
                                <td><span className={`pm-account-dot ${doc.accountStatus}`}></span>{doc.accountStatus === "active" ? "Active" : doc.accountStatus === "suspended" ? "Suspended" : "Inactive"}</td>
                                <td className="pm-orders">{doc.orders.toLocaleString()}</td>
                                <td className="pm-date">{new Date(doc.joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                                <td><PharmacistActions doc={doc} onAction={handleAction} onView={() => setDrawerDoc(doc)} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="pm-pagination">
                        <span className="pm-page-info">Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
                        <div className="pm-page-btns">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /></button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} className={p === currentPage ? "active" : ""} onClick={() => setCurrentPage(p)}>{p}</button>
                            ))}
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Analytics */}
            <div className="pm-analytics-row">
                <div className="pm-analytics-card admin-glass-card">
                    <h3><BarChart3 size={16} /> Pharmacy Type Distribution</h3>
                    <div className="pm-spec-bars">
                        {PHARMACY_TYPES.map(t => {
                            const count = pharmacists.filter(d => d.pharmacyType === t).length;
                            if (count === 0) return null;
                            return (
                                <div key={t} className="pm-spec-bar">
                                    <span className="pm-spec-label">{t}</span>
                                    <div className="pm-spec-track"><div className="pm-spec-fill" style={{ width: `${(count / pharmacists.length) * 100}%` }}></div></div>
                                    <span className="pm-spec-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="pm-analytics-card admin-glass-card">
                    <h3><Activity size={16} /> Status Overview</h3>
                    <div className="pm-status-overview">
                        {Object.entries(STATUS_MAP).map(([key, val]) => {
                            const count = pharmacists.filter(d => d.status === key).length;
                            const pct = pharmacists.length > 0 ? ((count / pharmacists.length) * 100).toFixed(0) : 0;
                            return (
                                <div key={key} className="pm-status-row">
                                    <span className="pm-so-dot" style={{ background: val.color }}></span>
                                    <span className="pm-so-label">{val.label}</span>
                                    <div className="pm-so-bar-track"><div className="pm-so-bar-fill" style={{ width: `${pct}%`, background: val.color }}></div></div>
                                    <span className="pm-so-count" style={{ color: val.color }}>{count} ({pct}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Drawer */}
            {drawerDoc && <PharmacistDrawer doc={drawerDoc} onClose={() => setDrawerDoc(null)} onAction={handleAction} getInitials={getInitials} getColor={getColor} adminNote={adminNote} setAdminNote={setAdminNote} updatePharmacist={updatePharmacist} />}

            {/* Confirm Modal */}
            {confirmAction && (
                <div className="pm-modal-overlay" onClick={() => setConfirmAction(null)}>
                    <div className="pm-modal" onClick={e => e.stopPropagation()}>
                        <h3>Confirm {confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)}</h3>
                        <p>Are you sure you want to <strong>{confirmAction.type}</strong> <strong>{confirmAction.doctor.name}</strong>?</p>
                        <div className="pm-modal-actions">
                            <button className="pm-modal-cancel" onClick={() => setConfirmAction(null)}>Cancel</button>
                            <button className={`pm-modal-confirm ${confirmAction.type}`} onClick={confirmActionHandler}>
                                {confirmAction.type === "approve" && <CheckCircle2 size={14} />}
                                {confirmAction.type === "reject" && <XCircle size={14} />}
                                {confirmAction.type === "suspend" && <ShieldOff size={14} />}
                                {confirmAction.type === "activate" && <Shield size={14} />}
                                {confirmAction.type.charAt(0).toUpperCase() + confirmAction.type.slice(1)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ═══════ Actions Dropdown ═══════ */
function PharmacistActions({ doc, onAction, onView }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        if (open) document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open]);
    return (
        <div className="pm-actions-wrap" ref={ref}>
            <button className="pm-actions-btn" onClick={() => setOpen(!open)}><MoreHorizontal size={16} /></button>
            {open && (
                <div className="pm-actions-menu">
                    <button onClick={() => { onView(); setOpen(false); }}><Eye size={14} /> View Profile</button>
                    {doc.status === "pending" && (<><button className="pm-act-approve" onClick={() => { onAction("approve", doc); setOpen(false); }}><CheckCircle2 size={14} /> Approve</button><button className="pm-act-reject" onClick={() => { onAction("reject", doc); setOpen(false); }}><XCircle size={14} /> Reject</button></>)}
                    {doc.status !== "suspended" && doc.status !== "pending" && <button className="pm-act-suspend" onClick={() => { onAction("suspend", doc); setOpen(false); }}><ShieldOff size={14} /> Suspend</button>}
                    {(doc.status === "suspended" || doc.status === "rejected" || doc.status === "inactive") && <button className="pm-act-activate" onClick={() => { onAction("activate", doc); setOpen(false); }}><Shield size={14} /> Activate</button>}
                    <button onClick={() => setOpen(false)}><FileText size={14} /> View Documents</button>
                </div>
            )}
        </div>
    );
}

/* ═══════ Detail Drawer ═══════ */
function PharmacistDrawer({ doc, onClose, onAction, getInitials, getColor, adminNote, setAdminNote, updatePharmacist }) {
    const [tab, setTab] = useState("profile");
    return (
        <>
            <div className="pm-drawer-overlay" onClick={onClose}></div>
            <aside className="pm-drawer">
                <div className="pm-drawer-header"><h2>Pharmacist Details</h2><button className="pm-drawer-close" onClick={onClose}><X size={18} /></button></div>
                <div className="pm-drawer-profile">
                    <div className="pm-drawer-avatar" style={{ background: getColor(doc.name) }}>{getInitials(doc.name)}</div>
                    <div className="pm-drawer-info">
                        <h3>{doc.name}{doc.riskFlag && <Flag size={14} className="pm-risk-flag" />}</h3>
                        <span className="pm-drawer-pharmacy"><Store size={13} /> {doc.pharmacy}</span>
                        <span className="pm-status-badge" style={{ color: STATUS_MAP[doc.status]?.color, background: STATUS_MAP[doc.status]?.bg }}>{STATUS_MAP[doc.status]?.label}</span>
                    </div>
                </div>
                <div className="pm-drawer-contact">
                    <div><Mail size={14} /> {doc.email}</div>
                    <div><Phone size={14} /> {doc.phone}</div>
                    <div><MapPin size={14} /> {doc.address}</div>
                </div>
                <p className="pm-drawer-bio">{doc.bio}</p>
                <div className="pm-drawer-tabs">
                    {["profile", "documents", "activity", "notes"].map(t => (
                        <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                    ))}
                </div>
                <div className="pm-drawer-body">
                    {tab === "profile" && (
                        <div className="pm-drawer-section">
                            <div className="pm-detail-grid">
                                <div className="pm-detail-item"><span className="pm-detail-label">Pharmacy Type</span><span className="pm-detail-value">{doc.pharmacyType}</span></div>
                                <div className="pm-detail-item"><span className="pm-detail-label">License</span><span className="pm-detail-value"><code>{doc.license}</code></span></div>
                                <div className="pm-detail-item"><span className="pm-detail-label">Operating Hours</span><span className="pm-detail-value">{doc.operatingHours}</span></div>
                                <div className="pm-detail-item"><span className="pm-detail-label">Joined</span><span className="pm-detail-value">{new Date(doc.joined).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span></div>
                                <div className="pm-detail-item"><span className="pm-detail-label">Delivery</span><span className="pm-detail-value">{doc.delivery ? "✓ Available" : "✗ Not available"}</span></div>
                                <div className="pm-detail-item"><span className="pm-detail-label">Online Orders</span><span className="pm-detail-value">{doc.onlineOrders ? "✓ Supported" : "✗ Not supported"}</span></div>
                                <div className="pm-detail-item"><span className="pm-detail-label">Last Active</span><span className="pm-detail-value">{doc.lastActive}</span></div>
                                <div className="pm-detail-item"><span className="pm-detail-label">Rating</span><span className="pm-detail-value">{doc.rating > 0 ? `⭐ ${doc.rating}` : "N/A"}</span></div>
                            </div>
                        </div>
                    )}
                    {tab === "documents" && (
                        <div className="pm-drawer-section">
                            <div className="pm-doc-list">
                                {[
                                    { key: "license", label: "Pharmacy License", icon: <Award size={18} /> },
                                    { key: "certificates", label: "Certificates", icon: <ClipboardCheck size={18} /> },
                                    { key: "idProof", label: "ID Proof", icon: <Shield size={18} /> },
                                    { key: "compliance", label: "Compliance Docs", icon: <FileText size={18} /> },
                                ].map(item => (
                                    <div key={item.key} className={`pm-doc-row ${doc.documents[item.key] ? "uploaded" : "missing"}`}>
                                        <div className="pm-doc-icon">{item.icon}</div>
                                        <div className="pm-doc-info">
                                            <span className="pm-doc-label">{item.label}</span>
                                            <span className={`pm-doc-status ${doc.documents[item.key] ? "ok" : "warn"}`}>{doc.documents[item.key] ? "✓ Uploaded" : "⚠ Missing"}</span>
                                        </div>
                                        {doc.documents[item.key] ? <button className="pm-doc-preview-btn"><Eye size={14} /> Preview</button> : <button className="pm-doc-request-btn">Request Upload</button>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {tab === "activity" && (
                        <div className="pm-drawer-section">
                            <div className="pm-activity-stats">
                                <div className="pm-stat-card"><Package size={20} style={{ color: "#0891b2" }} /><span className="pm-stat-val">{doc.orders.toLocaleString()}</span><span className="pm-stat-label">Orders</span></div>
                                <div className="pm-stat-card"><Pill size={20} style={{ color: "#10b981" }} /><span className="pm-stat-val">{doc.activeMeds.toLocaleString()}</span><span className="pm-stat-label">Active Meds</span></div>
                                <div className="pm-stat-card"><Truck size={20} style={{ color: "#6366f1" }} /><span className="pm-stat-val">{doc.delivery ? "Yes" : "No"}</span><span className="pm-stat-label">Delivery</span></div>
                                <div className="pm-stat-card"><TrendingUp size={20} style={{ color: "#f59e0b" }} /><span className="pm-stat-val">{doc.rating > 0 ? doc.rating : "—"}</span><span className="pm-stat-label">Rating</span></div>
                            </div>
                        </div>
                    )}
                    {tab === "notes" && (
                        <div className="pm-drawer-section">
                            {doc.notes && <div className="pm-existing-note"><MessageSquare size={14} /><p>{doc.notes}</p></div>}
                            <textarea className="pm-note-input" placeholder="Add an admin note..." value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3} />
                            <button className="pm-save-note" onClick={() => { if (adminNote.trim()) { updatePharmacist(doc.id, { notes: adminNote.trim() }); setAdminNote(""); } }}><MessageSquare size={14} /> Save Note</button>
                        </div>
                    )}
                </div>
                <div className="pm-drawer-footer">
                    {doc.status === "pending" && (<><button className="pm-drawer-approve" onClick={() => onAction("approve", doc)}><CheckCircle2 size={16} /> Approve</button><button className="pm-drawer-reject" onClick={() => onAction("reject", doc)}><XCircle size={16} /> Reject</button></>)}
                    {doc.status === "verified" && <button className="pm-drawer-suspend" onClick={() => onAction("suspend", doc)}><ShieldOff size={16} /> Suspend</button>}
                    {(doc.status === "suspended" || doc.status === "rejected") && <button className="pm-drawer-activate" onClick={() => onAction("activate", doc)}><Shield size={16} /> Activate</button>}
                    {doc.riskFlag && <div className="pm-drawer-risk"><AlertTriangle size={14} /> Flagged for compliance review</div>}
                </div>
            </aside>
        </>
    );
}
