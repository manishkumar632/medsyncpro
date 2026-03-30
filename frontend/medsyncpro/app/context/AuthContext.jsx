"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getSession, logoutAction } from "@/actions/authAction";
import { ROLE_ROUTES, ROUTES } from "@/lib/constants";

const SESSION_KEY = "medsyncpro_user";

export function getRedirectPath(role) {
  return ROLE_ROUTES[role] ?? ROUTES.HOME;
}

function readSessionStorage() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSessionStorage(user) {
  try {
    if (user) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          userId: user.userId,
          role: user.role,
          name: user.name,
          email: user.email,
        }),
      );
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // sessionStorage unavailable — non-critical
  }
}

/** Resolves with `null` after `ms` milliseconds — used as a race-condition guard. */
function withTimeout(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [doctorProfileData, setDoctorProfileData] = useState(null);

  // Track whether the component is still mounted to avoid state updates after unmount.
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // 1. Paint instantly from cache (optimistic)
    const cached = readSessionStorage();
    if (cached) setUser(cached);

    // 2. Race the server action against a 6-second timeout.
    //    This guarantees `ready` is ALWAYS set, preventing an infinite spinner.
    Promise.race([
      getSession(),
      withTimeout(6000), // 6 s safety net
    ])
      .then((sessionUser) => {
        if (!mountedRef.current) return;
        setUser(sessionUser ?? null);
        writeSessionStorage(sessionUser);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        // Network / server error — fall back to cached user if available.
        // If no cache, user stays null (will be redirected to login).
        if (!cached) setUser(null);
      })
      .finally(() => {
        if (!mountedRef.current) return;
        setReady(true); // ALWAYS reached — no more infinite spinner
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Sync client state after a successful loginAction. */
  const login = useCallback((userData) => {
    setUser(userData);
    writeSessionStorage(userData);
  }, []);

  /**
   * Re-fetch the session from the server.
   * Used by NotificationContext when a VERIFICATION_DECISION event arrives.
   */
  const validateSession = useCallback(async () => {
    try {
      const sessionUser = await getSession();
      if (!mountedRef.current) return;
      setUser(sessionUser ?? null);
      writeSessionStorage(sessionUser);
    } catch {
      // Leave current state intact on failure.
    }
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      writeSessionStorage(updated);
      return updated;
    });
  }, []);

  const logout = useCallback(async () => {
    await logoutAction();
    setUser(null);
    setDoctorProfileData(null);
    writeSessionStorage(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        isLoggedIn: !!user && ready,
        doctorProfileData,
        setDoctorProfileData,
        login,
        logout,
        updateProfile,
        validateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>.");
  return ctx;
}
