import { NextResponse } from "next/server";
import {
  PROTECTED_PREFIXES,
  AUTH_ROUTES,
  ROUTES,
  ROLE_ALLOWED_PREFIXES,
  ROLE_ROUTES,
} from "@/lib/constants";

// ─── Security headers ─────────────────────────────────────────────────────────

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
};

function withSecurityHeaders(response) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) =>
    response.headers.set(key, value),
  );
  return response;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  console.log(`[Middleware] ${req.nextUrl.pathname}`);

  let token = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  let role = req.cookies.get("user_role")?.value;

  let response = NextResponse.next();

  if (!token && refreshToken) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
      const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          Cookie: `refresh_token=${refreshToken}`,
          Accept: "application/json",
        },
      });

      if (refreshRes.ok) {
        const setCookies = refreshRes.headers.getSetCookie();
        for (const cookieStr of setCookies) {
          response.headers.append("Set-Cookie", cookieStr);
        }

        // Update the 'token' variable so route guarding doesn't kick us out
        const newAccessStr = setCookies.find((c) => c.startsWith("access_token="));
        if (newAccessStr) {
          token = newAccessStr.split(";")[0].split("=")[1];
          req.cookies.set("access_token", token);
          // Pass the new cookie forward to the server components rendering the page
          response.headers.set("x-middleware-request-cookie", req.cookies.toString());
        }
      }
    } catch (err) {
      console.error("[Middleware] Silent refresh failed:", err);
    }
  }

  console.log(`  → Auth token: ${token ? "present" : "absent"}, role: ${role}`);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // 1. Unauthenticated user on a protected route → send to login.
  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = ROUTES.AUTH.LOGIN;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Authenticated user on an auth route → send to their dashboard.
  if (isAuthRoute && token) {
    const url = req.nextUrl.clone();
    url.pathname = (role && ROLE_ROUTES[role]) ?? ROUTES.HOME;
    url.searchParams.delete("redirect");
    const redirectRes = NextResponse.redirect(url);
    // If we refreshed cookies, carry them over to the redirect response
    response.headers.forEach((val, key) => {
      if (key.toLowerCase() === "set-cookie")
        redirectRes.headers.append(key, val);
    });
    return redirectRes;
  }

  // 3. Authenticated user on the wrong role's route → redirect to own dashboard.
  if (isProtected && token && role) {
    const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role] ?? [];
    const hasAccess = allowedPrefixes.some((prefix) =>
      pathname.startsWith(prefix),
    );

    if (!hasAccess) {
      const url = req.nextUrl.clone();
      url.pathname = ROLE_ROUTES[role] ?? ROUTES.HOME;
      const redirectRes = NextResponse.redirect(url);
      // If we refreshed cookies, carry them over to the redirect response
      response.headers.forEach((val, key) => {
        if (key.toLowerCase() === "set-cookie")
          redirectRes.headers.append(key, val);
      });
      return redirectRes;
    }
  }

  // 4. Allow through — attach security headers.
  return withSecurityHeaders(response);
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
