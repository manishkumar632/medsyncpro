import { NextResponse } from "next/server";
import { config } from "@/lib/config";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;
    const confirmPassword = body?.confirmPassword;
    const name = body?.name;
    const role = body?.role;
    const termsAccepted = body?.termsAccepted === 'on';

    // 🔹 Log incoming request (safe logging)
    console.log("🔐 Signup Request:", {
      email,
      name,
      role,
      termsAccepted,
      password: password,
      confirmPassword: confirmPassword,
    });

    if (!termsAccepted) {
      return NextResponse.json(
        { success: false, message: "You must accept the terms and conditions." },
        { status: 400 },
      );
    }

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 },
      );
    }

    // Prevent extremely large payload abuse
    if (password.length > 32) {
      return NextResponse.json(
        { success: false, message: "Password should be less than 32 characters." },
        { status: 400 },
      );
    }

    const backendRes = await fetch(`${config.apiUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, confirmPassword, role, name, termsAccepted }),
    });

    const clonedRes = backendRes.clone();

    const responseData = await clonedRes.json();

    // 🔹 Log backend response metadata (safe logging)
    console.log("🔐 Backend Response:", {
      status: backendRes.status,
      message: backendRes.statusText,
      data: responseData,
      hasSetCookie: backendRes.headers.has("set-cookie"),
      timestamp: new Date().toISOString(),
    });

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: backendRes.headers,
    });
  } catch (error) {
    console.error("🔥 Login Error:", error);

    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 },
    );
  }
}
