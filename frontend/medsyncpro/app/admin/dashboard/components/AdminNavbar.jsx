"use client";
import { Search, Bell, Plus, ChevronDown, Menu } from "lucide-react";

import { useNotifications } from "@/app/context/NotificationContext";
import { useRouter } from "next/navigation";

export default function AdminNavbar({ onMenuToggle }) {
    const { unreadCount } = useNotifications();
    const router = useRouter();

    return (
        <header className="admin-topnav">
            <button className="admin-hamburger" onClick={onMenuToggle}>
                <Menu size={22} />
            </button>

            {/* Search */}
            <div className="admin-search">
                <Search size={16} className="admin-search-icon" />
                <input type="text" placeholder="Search patients, doctors, pharmacists..." />
            </div>

            {/* Right section */}
            <div className="admin-topnav-right">
                {/* Add user */}
                <button className="admin-add-btn">
                    <Plus size={16} />
                    <span>Add User</span>
                </button>

                {/* Notifications */}
                <button className="admin-notif-btn" onClick={() => router.push("/admin/notifications")}>
                    <Bell size={18} />
                    {unreadCount > 0 && <span className="admin-notif-badge">{unreadCount}</span>}
                </button>

                {/* Profile */}
                <div className="admin-profile">
                    <div className="admin-profile-avatar">
                        <img
                            src="https://ui-avatars.com/api/?name=Admin+User&background=0d7377&color=fff&size=80"
                            alt="admin"
                        />
                    </div>
                    <div className="admin-profile-info">
                        <span className="admin-profile-name">Admin User</span>
                        <span className="admin-profile-role">Super Admin</span>
                    </div>
                    <ChevronDown size={14} className="admin-profile-chevron" />
                </div>
            </div>
        </header>
    );
}
