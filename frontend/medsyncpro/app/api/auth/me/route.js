import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const backendRes = await fetch(`${config.apiUrl}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `access_token=${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("ME API error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch session" },
      { status: 500 },
    );
  }
}
