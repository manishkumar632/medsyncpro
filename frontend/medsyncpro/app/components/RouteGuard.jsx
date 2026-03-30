"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, getRedirectPath } from "../context/AuthContext";

export default function RouteGuard({ children, allowedRoles = [] }) {
    const { user, ready, isLoggedIn } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (!ready) return; // Wait for auth state to hydrate

        if (!isLoggedIn || !user) {
            // Not logged in → redirect to login
            router.replace("/auth/login");
            return;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            // Wrong role → redirect to their correct dashboard
            const correctPath = getRedirectPath(user.role);
            router.replace(correctPath);
            return;
        }

        // All checks passed
        setAuthorized(true);
    }, [ready, isLoggedIn, user, allowedRoles, router, pathname]);

    // Show nothing while loading/checking (prevents flash)
    if (!ready || !authorized) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "#f8fafc",
            }}>
                <div style={{
                    width: 32,
                    height: 32,
                    border: "3px solid rgba(37, 99, 235, 0.15)",
                    borderTopColor: "#2563eb",
                    borderRadius: "50%",
                    animation: "rg-spin 0.6s linear infinite",
                }} />
                <style>{`@keyframes rg-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return children;
}
