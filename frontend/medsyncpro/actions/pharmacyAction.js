"use server";

import { serverApiClient } from "@/lib/api-client";

// ─── Pharmacy Actions ────────────────────────────────────────────────────────

/**
 * Fetch prescriptions available to pharmacies.
 * By default, returns paginated newly published prescriptions.
 */
export async function fetchPharmacyPrescriptions(page = 0, size = 20) {
  try {
    const res = await serverApiClient(
      `/pharmacy/prescriptions?page=${page}&size=${size}`
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Fetch prescriptions specific to a patient (useful for pharmacy search).
 */
export async function fetchPrescriptionsByPatient(patientId, page = 0, size = 20) {
  try {
    if (!patientId) throw new Error("Patient ID is required");
    
    const res = await serverApiClient(
      `/pharmacy/prescriptions/patient/${patientId}?page=${page}&size=${size}`
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Search verified pharmacies by text and/or location.
 */
export async function searchPharmaciesAction({
  q,
  location,
  page = 0,
  size = 20,
} = {}) {
  try {
    const params = new URLSearchParams({ page, size });
    if (q) params.set("q", q);
    if (location) params.set("location", location);

    const res = await serverApiClient(`/patient/pharmacies?${params.toString()}`);
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Patient -> Pharmacy medicine request.
 */
export async function createPatientPharmacyRequest(payload) {
  try {
    const res = await serverApiClient("/patient/pharmacy-requests", {
      method: "POST",
      body: payload,
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchPatientPharmacyRequests(page = 0, size = 20) {
  try {
    const res = await serverApiClient(
      `/patient/pharmacy-requests?page=${page}&size=${size}`,
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchPharmacyRequests(page = 0, size = 20) {
  try {
    const res = await serverApiClient(
      `/pharmacy/requests?page=${page}&size=${size}`,
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function updatePharmacyRequestStatus(requestId, status, note = "") {
  try {
    const res = await serverApiClient(`/pharmacy/requests/${requestId}/status`, {
      method: "PATCH",
      body: { status, note },
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function assignAgentToRequest(requestId, agentId, note = "") {
  try {
    const res = await serverApiClient(
      `/pharmacy/requests/${requestId}/assign-agent`,
      {
        method: "PATCH",
        body: { agentId, note },
      },
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchAgentRequests(page = 0, size = 20) {
  try {
    const res = await serverApiClient(`/agent/requests?page=${page}&size=${size}`);
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function updateAgentRequestStatus(requestId, status, note = "") {
  try {
    const res = await serverApiClient(`/agent/requests/${requestId}/status`, {
      method: "PATCH",
      body: { status, note },
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
