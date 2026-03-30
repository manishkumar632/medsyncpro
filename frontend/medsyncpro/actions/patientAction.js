"use server";
// ─── Add these to your existing actions/patientAction.js ──────────────────
// (or create the file if it doesn't exist yet)

import { serverApiClient } from "@/lib/api-client";

/**
 * GET /api/patient/prescriptions?page=&size=
 * Returns a Spring Page<Map> with content[], totalPages, totalElements.
 */
export async function fetchPatientPrescriptionsAction(page = 0, size = 12) {
  try {
    const params = new URLSearchParams({ page, size });
    const response = await serverApiClient(
      `/patient/prescriptions?${params.toString()}`,
      { method: "GET" },
    );
    // Unwrap Spring ApiResponse envelope → { data: Page }
    const payload = response?.data?.data ?? response?.data ?? response;
    return { success: true, data: payload };
  } catch (error) {
    console.error("[fetchPatientPrescriptionsAction]", error?.message);
    return {
      success: false,
      data: null,
      message: error?.message ?? "Unknown error",
    };
  }
}
