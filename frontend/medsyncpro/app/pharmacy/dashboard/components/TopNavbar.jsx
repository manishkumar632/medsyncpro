"use client";
import { Search, Globe, Bell, ChevronDown, Menu } from "lucide-react";

export default function TopNavbar({ onMenuToggle }) {
    return (
        <header className="pharm-topnav">
            {/* Hamburger for mobile */}
            <button className="pharm-hamburger" onClick={onMenuToggle}>
                <Menu size={22} />
            </button>

            {/* Search */}
            <div className="pharm-topnav-search">
                <Search size={16} className="pharm-search-icon" />
                <input type="text" placeholder="Search" />
                <button className="pharm-search-mic">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                </button>
            </div>

            {/* Right section */}
            <div className="pharm-topnav-right">
                {/* Language */}
                <button className="pharm-lang-btn">
                    <span className="pharm-lang-flag">EN</span>
                    <Globe size={16} />
                </button>

                {/* Notification */}
                <button className="pharm-notif-btn">
                    <Bell size={18} />
                    <span className="pharm-notif-dot" />
                </button>

                {/* User profile */}
                <div className="pharm-user-profile">
                    <div className="pharm-user-avatar">
                        <img
                            src="https://ui-avatars.com/api/?name=Budiono+Siregar&background=0d7377&color=fff&size=80"
                            alt="avatar"
                        />
                    </div>
                    <div className="pharm-user-info">
                        <span className="pharm-user-name">Budiono Siregar</span>
                        <span className="pharm-user-email">budionosiregar@gmail.com</span>
                    </div>
                    <ChevronDown size={14} className="pharm-user-chevron" />
                </div>
            </div>
        </header>
    );
}
