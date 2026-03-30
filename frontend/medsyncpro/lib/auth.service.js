import { cookies } from "next/headers";
import { config } from "./config";
import { ApiError, serverApiClient } from "./api-client";

// ─── Cookie constants ─────────────────────────────────────────────────────────

const ACCESS_TOKEN_COOKIE = "access_token";
const USER_ROLE_COOKIE = "user_role";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 h

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function parseSetCookieTokens(rawSetCookie) {
  const tokens = { access_token: null, refresh_token: null };
  const cookieStrings = rawSetCookie.split(/,\s*(?=[a-zA-Z_]+=)/);
  for (const cookieStr of cookieStrings) {
    const [nameVal] = cookieStr.trim().split(";");
    const eqIdx = nameVal.indexOf("=");
    if (eqIdx === -1) continue;
    const name = nameVal.slice(0, eqIdx).trim();
    const value = nameVal.slice(eqIdx + 1).trim();
    if (name === "access_token" || name === "refresh_token") {
      tokens[name] = value;
    }
  }
  return tokens;
}

async function setAuthCookies(token, role, refreshToken) {
  const store = await cookies();
  const shared = {
    path: "/",
    secure: config.isProd,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
  };
  store.set({ ...shared, name: ACCESS_TOKEN_COOKIE, value: token });
  store.set({ ...shared, name: USER_ROLE_COOKIE, value: role });
  if (refreshToken) {
    store.set({ ...shared, name: "refresh_token", value: refreshToken });
  }
}

async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(USER_ROLE_COOKIE);
  store.delete("refresh_token");
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginService(credentials) {
  let response;
  try {
    response = await fetch(`${config.apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-store",
    });
  } catch {
    return {
      success: false,
      message: "Network error — cannot reach the server.",
    };
  }

  let body;
  try {
    body = await response.json();
  } catch {
    return { success: false, message: "Invalid response from server." };
  }

  if (!response.ok || !body?.success) {
    return {
      success: false,
      message: body?.message ?? "Login failed. Please check your credentials.",
    };
  }

  const user = body.data;

  if (!user?.userId || !user?.role) {
    return {
      success: false,
      message: "Incomplete user data in server response.",
    };
  }

  const rawSetCookie = response.headers.get("set-cookie");
  const tokens = rawSetCookie ? parseSetCookieTokens(rawSetCookie) : { access_token: null, refresh_token: null };

  if (!tokens.access_token) {
    return {
      success: false,
      message: "Session token missing from server response.",
    };
  }

  await setAuthCookies(tokens.access_token, user.role, tokens.refresh_token);

  return { success: true, data: user };
}

// ─── Signup ───────────────────────────────────────────────────────────────────

export async function signupService(userData) {
  try {
    const response = await serverApiClient("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return { success: response.data.success, message: response.data.message };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Resend verification email ────────────────────────────────────────────────

export async function resendVerificationService(email) {
  try {
    const response = await serverApiClient(
      `/auth/resend-verification?email=${encodeURIComponent(email)}`,
      { method: "POST" },
    );
    return { success: response.data.success, message: response.data.message };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Verify email ─────────────────────────────────────────────────────────────

export async function verifyEmailService(token) {
  try {
    const response = await serverApiClient("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    return {
      success: response.data.success,
      message: response.data.message ?? "Your email has been verified successfully!",
    };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    return { success: false, message };
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutService() {
  try {
    await serverApiClient("/auth/logout", { method: "POST" });
  } catch {
    // Always clear local cookies regardless of API outcome.
  } finally {
    await clearAuthCookies();
  }
  return { success: true, message: "Logged out successfully." };
}