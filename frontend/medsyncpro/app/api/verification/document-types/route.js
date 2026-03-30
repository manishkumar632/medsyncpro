import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

/**
 * GET /api/verification/document-types
 *
 * Returns the active document types for the authenticated user's model.
 * Used by doctor/pharmacist/agent verification dashboards.
 */
export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 },
        );
    }

    try {
        const res = await fetch(`${API_URL}/users/me/document-types`, {
            headers: {
                Accept: "application/json",
                Cookie: `access_token=${token}`,
            },
            cache: "no-store",
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json(
            { success: false, message: "Failed to reach API server" },
            { status: 503 },
        );
    }
}
