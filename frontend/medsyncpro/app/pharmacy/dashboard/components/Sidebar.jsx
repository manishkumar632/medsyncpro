"use client";
import { useState } from "react";
import {
    LayoutDashboard, Package, Grid3X3, ShoppingCart, TrendingUp, Users,
    CreditCard, FileText, Settings, ChevronUp, ChevronDown, Pill
} from "lucide-react";

const menuSections = [
    {
        label: "MAIN MENU",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, active: true },
            { name: "Products", icon: Package },
            { name: "Categories", icon: Grid3X3 },
        ],
    },
    {
        label: "LEADS",
        items: [
            { name: "Orders", icon: ShoppingCart },
            { name: "Sales", icon: TrendingUp },
            { name: "Customers", icon: Users },
        ],
    },
    {
        label: "COMMS",
        items: [
            { name: "Payments", icon: CreditCard },
            { name: "Reports", icon: FileText },
            { name: "Settings", icon: Settings },
        ],
    },
];

export default function Sidebar({ collapsed, onClose }) {
    const [expandedSections, setExpandedSections] = useState({
        "MAIN MENU": true,
        LEADS: true,
        COMMS: true,
    });

    const toggleSection = (label) => {
        setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <>
            {/* Mobile overlay */}
            {!collapsed && (
                <div className="pharm-sidebar-overlay" onClick={onClose} />
            )}
            <aside className={`pharm-sidebar ${collapsed ? "collapsed" : ""}`}>
                {/* Logo */}
                <div className="pharm-sidebar-logo">
                    <div className="pharm-logo-icon">
                        <Pill size={20} color="#fff" />
                    </div>
                    <span className="pharm-logo-text">MedSyncpro</span>
                </div>

                {/* Navigation */}
                <nav className="pharm-sidebar-nav">
                    {menuSections.map((section) => (
                        <div key={section.label} className="pharm-nav-section">
                            <button
                                className="pharm-nav-section-label"
                                onClick={() => toggleSection(section.label)}
                            >
                                <span>{section.label}</span>
                                {expandedSections[section.label] ? (
                                    <ChevronUp size={14} />
                                ) : (
                                    <ChevronDown size={14} />
                                )}
                            </button>
                            {expandedSections[section.label] && (
                                <ul className="pharm-nav-list">
                                    {section.items.map((item) => (
                                        <li key={item.name}>
                                            <a
                                                href="#"
                                                className={`pharm-nav-item ${item.active ? "active" : ""}`}
                                            >
                                                <item.icon size={18} />
                                                <span>{item.name}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Complete Profile Card */}
                <div className="pharm-profile-card">
                    <div className="pharm-profile-progress">
                        <svg viewBox="0 0 36 36" className="pharm-circular-progress">
                            <path
                                className="pharm-circle-bg"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="pharm-circle-fill"
                                strokeDasharray="50, 100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <text x="18" y="20.35" className="pharm-circle-text">
                                50%
                            </text>
                        </svg>
                    </div>
                    <h4 className="pharm-profile-card-title">Complete Profile</h4>
                    <p className="pharm-profile-card-desc">
                        Complete Your Profile to Unlock all Features
                    </p>
                    <button className="pharm-verify-btn">Verify Identity</button>
                </div>
            </aside>
        </>
    );
}
