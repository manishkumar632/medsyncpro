import { cookies } from "next/headers";
import { config } from "./config";

// ─── Error class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ─── Response Wrapper ─────────────────────────────────────────────────────────

export class ApiResponse {
  constructor(data, status, headers) {
    this.data = data;
    this.status = status;
    this.headers = headers;
  }
}

// ─── Token Refresh ────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshPromise = null;

/**
 * Refreshes tokens by calling the backend directly.
 * Sets new tokens in the cookie store so they're sent back to the browser.
 */
async function refreshTokens() {
  console.log("Attempting token refresh...");

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    throw new ApiError(401, "No refresh token available");
  }

  // Call backend refresh endpoint directly
  const response = await fetch(`${config.apiUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Cookie: `refresh_token=${refreshToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    // Clear invalid tokens from cookie store
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    throw new ApiError(401, "Token refresh failed");
  }

  // Extract and parse Set-Cookie headers from backend response
  const setCookieHeaders = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : [];

  // Set new tokens in Next.js cookie store (will be sent to browser)
  for (const setCookieHeader of setCookieHeaders) {
    const [nameVal] = setCookieHeader.split(";");
    const eqIdx = nameVal.indexOf("=");
    if (eqIdx !== -1) {
      const name = nameVal.slice(0, eqIdx).trim();
      const value = nameVal.slice(eqIdx + 1).trim();

      if (name === "access_token" || name === "refresh_token") {
        // Parse attributes from Set-Cookie header
        const pathMatch = setCookieHeader.match(/Path=([^;]+)/i);
        const maxAgeMatch = setCookieHeader.match(/Max-Age=(\d+)/i);
        const secureMatch = setCookieHeader.match(/Secure/i);
        const sameSiteMatch = setCookieHeader.match(/SameSite=(\w+)/i);

        try {
          cookieStore.set({
            name,
            value,
            path: pathMatch
              ? pathMatch[1]
              : name === "refresh_token"
                ? "/api/auth"
                : "/",
            maxAge: maxAgeMatch ? parseInt(maxAgeMatch[1]) : undefined,
            secure: !!secureMatch,
            httpOnly: true,
            sameSite: sameSiteMatch ? sameSiteMatch[1].toLowerCase() : "none",
          });
        } catch (err) {
          // Silently fail: Next.js blocks setting cookies during Server Component rendering.
          // This is fine because the Middleware or Route Handler already set it!
          console.error("Failed to set cookie in store (ignored):", err);
        }
      }
    }
  }

  console.log("Token refresh successful");
  return await response.json();
}

// ─── Client ───────────────────────────────────────────────────────────────────

export async function serverApiClient(endpoint, options = {}) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");

    if (typeof options.body === "object") {
      options.body = JSON.stringify(options.body);
    }
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Build cookie header with both tokens (refresh token needed for /auth endpoints)
  const cookieParts = [];
  if (accessToken) cookieParts.push(`access_token=${accessToken}`);
  if (refreshToken) cookieParts.push(`refresh_token=${refreshToken}`);
  if (cookieParts.length > 0) {
    headers.set("Cookie", cookieParts.join("; "));
  }

  let response;

  try {
    response = await fetch(`${config.apiUrl}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(503, "Network error — cannot reach the API server.");
  }

  let data = null;

  if (
    response.status !== 204 &&
    response.headers.get("content-length") !== "0"
  ) {
    try {
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      throw new ApiError(response.status, "Failed to parse API response.");
    }
  }

  // ─── DEBUG LOG ─────────────────────────────────────────────────
  const safeBody =
    options.body instanceof FormData ? "[FormData]" : options.body;

  console.log(
    "API REQUEST 👇 \n",
    JSON.stringify(
      {
        url: `${config.apiUrl}${endpoint}`,
        method: options.method || "GET",
        body: safeBody,
      },
      null,
      2,
    ),
  );

  console.log(
    "API RESPONSE 👇",
    JSON.stringify(
      {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: data,
      },
      null,
      2,
    ),
  );
  // ───────────────────────────────────────────────────────────────

  // Handle 401 - try token refresh and retry
  if (response.status === 401 && !options._isRetry) {
    console.log("Token expired, attempting refresh...");

    // Prevent concurrent refresh requests (use shared promise)
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens().finally(() => {
        isRefreshing = false;
      });
    }

    try {
      await refreshPromise;

      // Get new tokens from the updated cookie store
      const newCookieStore = await cookies();
      const newAccessToken = newCookieStore.get("access_token")?.value;
      const newRefreshToken = newCookieStore.get("refresh_token")?.value;

      if (!newAccessToken) {
        throw new ApiError(401, "Session expired. Please login again.");
      }

      // Build retry headers with new tokens
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set("Accept", "application/json");
      if (options.body && !(options.body instanceof FormData)) {
        retryHeaders.set("Content-Type", "application/json");
      }

      const retryCookieParts = [];
      if (newAccessToken) retryCookieParts.push(`access_token=${newAccessToken}`);
      if (newRefreshToken) retryCookieParts.push(`refresh_token=${newRefreshToken}`);
      if (retryCookieParts.length > 0) {
        retryHeaders.set("Cookie", retryCookieParts.join("; "));
      }

      // Mark as retry to prevent infinite loop
      const retryOptions = { ...options, _isRetry: true };

      const retryResponse = await fetch(`${config.apiUrl}${endpoint}`, {
        ...retryOptions,
        headers: retryHeaders,
        cache: "no-store",
      });

      if (retryResponse.ok || retryResponse.status === 204) {
        let retryData = null;
        if (
          retryResponse.status !== 204 &&
          retryResponse.headers.get("content-length") !== "0"
        ) {
          const contentType = retryResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            retryData = await retryResponse.json();
          } else {
            retryData = await retryResponse.text();
          }
        }
        console.log("Request retried successfully after token refresh");
        return new ApiResponse(retryData, retryResponse.status, retryResponse.headers);
      }

      // If retry also failed with 401, throw session expired
      if (retryResponse.status === 401) {
        throw new ApiError(401, "Session expired. Please login again.");
      }

      // Return error for other status codes
      let retryErrorData = null;
      if (
        retryResponse.status !== 204 &&
        retryResponse.headers.get("content-length") !== "0"
      ) {
        const contentType = retryResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          retryErrorData = await retryResponse.json();
        }
      }
      throw new ApiError(
        retryResponse.status,
        retryErrorData?.message ?? `Request failed with status ${retryResponse.status}.`
      );
    } catch (refreshError) {
      console.log("Token refresh failed:", refreshError.message);
      throw new ApiError(401, "Session expired. Please login again.");
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message ?? `Request failed with status ${response.status}.`,
    );
  }

  return new ApiResponse(data, response.status, response.headers);
}