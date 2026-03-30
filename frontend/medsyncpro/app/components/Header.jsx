"use client";
import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { config } from "@/lib/config";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
    const { user, isLoggedIn, loading, logout, updateProfile } = useAuth();
    const fileInputRef = useRef(null);

    const handleAccountClick = () => {
        if (loading) return;
        if (!isLoggedIn) {
            window.location.href = "/online-medication/auth/login";
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${config.apiUrl}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // If API fails, still logout client-side
        }
        logout();
        window.location.href = "/online-medication";
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) return;
        if (file.size > 2 * 1024 * 1024) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            updateProfile({ profileImage: event.target.result });
        };
        reader.readAsDataURL(file);
    };

    const avatarStyle = {
        width: 36, height: 36, borderRadius: '50%',
        background: '#0d7377', color: '#fff',
        fontWeight: 700, fontSize: '0.8rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', border: '2px solid #e0f7fa',
        overflow: 'hidden', flexShrink: 0,
    };

    const renderAvatar = (size = 36) => {
        const style = { ...avatarStyle, width: size, height: size, fontSize: size > 36 ? '1rem' : '0.8rem' };
        const imgSrc = user?.profileImage || user?.profileImageUrl;
        if (imgSrc) {
            return (
                <div style={style}>
                    <img src={imgSrc} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            );
        }
        return <div style={style}>{getInitials(user?.name)}</div>;
    };

    return (
        <header className="nexcart-header">
            <div className="header-top-bar">
                🚚 Free Delivery on orders above ₹499 &nbsp;|&nbsp; 💊 Genuine Medicines &nbsp;|&nbsp; 🏥 Licensed Pharmacy
            </div>

            <div className="header-main">
                {/* Logo */}
                <a href="/online-medication" className="header-logo" style={{ textDecoration: "none" }}>
                    <div className="logo-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    MedSyncpro
                </a>

                {/* Search */}
                <div className="header-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input type="text" placeholder="Search medicines, health products..." />
                    <button className="search-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                    </button>
                </div>

                {/* Icons */}
                <div className="header-icons">
                    {/* Hidden file input for avatar upload */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarUpload}
                    />

                    {/* User Account */}
                    {isLoggedIn && user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div title={`Signed in as ${user.name}`}>
                                    {renderAvatar(36)}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" sideOffset={2}>
                                <DropdownMenuLabel>
                                    <div>{user.name}</div>
                                    <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {/* ── My Account Group ── */}
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => window.location.href = `/online-medication/patient`}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        Profile
                                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                            <line x1="3" y1="6" x2="21" y2="6" />
                                            <path d="M16 10a4 4 0 01-8 0" />
                                        </svg>
                                        My Orders
                                        <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                                        </svg>
                                        Settings
                                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />

                                {/* ── Quick Navigate Group ── */}
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                        Wishlist
                                    </DropdownMenuItem>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <line x1="3" y1="9" x2="21" y2="9" />
                                                <line x1="9" y1="21" x2="9" y2="9" />
                                            </svg>
                                            Quick Links
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => window.location.href = '/online-medication'}>
                                                    Home
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    Shop
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    Contact Us
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />

                                {/* ── Support & Help ── */}
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                        Help & Support
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />

                                {/* ── Logout ── */}
                                <DropdownMenuGroup>
                                    <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Log out
                                        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div
                            className="header-icon"
                            title="Sign In"
                            onClick={handleAccountClick}
                            style={{ cursor: "pointer" }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                    )}

                    <div className="header-icon" title="Wishlist">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="badge">3</span>
                    </div>
                    <div className="header-icon" title="Cart">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        <span className="badge">5</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="header-nav">
                <div className="header-nav-inner">
                    <div className="nav-links">
                        <span className="nav-link active">Home</span>
                        <span className="nav-link">Shop</span>
                        <span className="nav-link">Pages</span>
                        <span className="nav-link">Blog</span>
                        <span className="nav-link">Contact</span>
                    </div>
                    <div className="nav-contact">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        +91 1800-123-4567
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
