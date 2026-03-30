import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

/**
 * POST /api/verification/documents/[documentTypeId]
 *
 * Proxies the document upload to Spring Boot.
 * Reads the HttpOnly cookie server-side and pipes the multipart body.
 */
export async function POST(request, { params }) {
    const { documentTypeId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 },
        );
    }

    try {
        const formData = await request.formData();

        const res = await fetch(
            `${API_URL}/users/me/documents/${documentTypeId}`,
            {
                method: "POST",
                headers: {
                    Cookie: `access_token=${token}`,
                },
                body: formData,
            },
        );

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json(
            { success: false, message: "Failed to reach API server" },
            { status: 503 },
        );
    }
}

/**
 * DELETE /api/verification/documents/[documentTypeId]
 *
 * Proxies the document deletion to Spring Boot.
 */
export async function DELETE(_request, { params }) {
    const { documentTypeId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 },
        );
    }

    try {
        const res = await fetch(
            `${API_URL}/users/me/documents/${documentTypeId}`,
            {
                method: "DELETE",
                headers: {
                    Cookie: `access_token=${token}`,
                },
            },
        );

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch {
        return NextResponse.json(
            { success: false, message: "Failed to reach API server" },
            { status: 503 },
        );
    }
}
