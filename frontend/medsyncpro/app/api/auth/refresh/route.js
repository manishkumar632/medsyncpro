import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token available" },
        { status: 401 },
      );
    }

    const backendRes = await fetch(`${config.apiUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      // Clear invalid tokens
      const response = NextResponse.json(data, { status: backendRes.status });
      response.cookies.set("access_token", "", { path: "/", maxAge: 0 });
      response.cookies.set("refresh_token", "", { path: "/api/auth", maxAge: 0 });
      return response;
    }

    // Forward Set-Cookie headers from backend to browser
    const setCookieHeaders = backendRes.headers.getSetCookie
      ? backendRes.headers.getSetCookie()
      : [];

    const response = NextResponse.json(data, { status: backendRes.status });

    // Parse and forward each Set-Cookie header
    for (const setCookieHeader of setCookieHeaders) {
      // Extract cookie name and value
      const [nameVal] = setCookieHeader.split(";");
      const eqIdx = nameVal.indexOf("=");
      if (eqIdx !== -1) {
        const name = nameVal.slice(0, eqIdx).trim();
        const value = nameVal.slice(eqIdx + 1).trim();

        if (name === "access_token" || name === "refresh_token") {
          // Parse attributes from the Set-Cookie header
          const pathMatch = setCookieHeader.match(/Path=([^;]+)/i);
          const maxAgeMatch = setCookieHeader.match(/Max-Age=(\d+)/i);
          const secure = setCookieHeader.toLowerCase().includes("secure");
          const sameSiteMatch = setCookieHeader.match(/SameSite=(\w+)/i);

          response.cookies.set({
            name,
            value,
            path: pathMatch ? pathMatch[1] : name === "refresh_token" ? "/api/auth" : "/",
            maxAge: maxAgeMatch ? parseInt(maxAgeMatch[1]) : undefined,
            secure: secure || config.isProd,
            httpOnly: true,
            sameSite: sameSiteMatch ? sameSiteMatch[1].toLowerCase() : "none",
          });
        }
      }
    }

    return response;
  } catch (error) {
    console.error("REFRESH API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to refresh token" },
      { status: 500 },
    );
  }
}