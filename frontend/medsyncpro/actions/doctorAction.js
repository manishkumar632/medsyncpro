"use server";
import { serverApiClient } from "@/lib/api-client";

export async function fetchDoctorProfileData() {
  try {
    const response = await serverApiClient("/doctor/profile", {
      method: "GET",
    });
    return { success: true, data: response.data?.data ?? response.data };
  } catch (error) {
    return { success: false, data: null, message: error?.message };
  }
}

export async function fetchDoctorAdherenceAlertsAction() {
  try {
    const response = await serverApiClient("/doctor/adherence/alerts", {
      method: "GET",
    });
    return { success: true, data: response.data?.data ?? [] };
  } catch (error) {
    return { success: false, data: [], message: error?.message };
  }
}

export async function fetchDoctorPatientsAction(
  page = 0,
  size = 10,
  search = "",
) {
  try {
    const params = new URLSearchParams({ page, size });
    if (search) params.set("search", search);
    const response = await serverApiClient(
      `/doctor/patients?${params.toString()}`,
    );
    return { success: true, data: response.data?.data ?? response.data };
  } catch (error) {
    return { success: false, data: null, message: error?.message };
  }
}

export async function fetchDoctorPrescriptionsAction(
  page = 0,
  size = 10,
  search = "",
) {
  try {
    const params = new URLSearchParams({ page, size });
    if (search) params.set("search", search);
    const response = await serverApiClient(
      `/doctor/prescriptions?${params.toString()}`,
    );
    return { success: true, data: response.data?.data ?? response.data };
  } catch (error) {
    return { success: false, data: null, message: error?.message };
  }
}

/** All appointments for the authenticated doctor. */
export async function fetchDoctorAppointmentsAction(page = 0, size = 200) {
  try {
    const params = new URLSearchParams({ page, size });
    const response = await serverApiClient(
      `/doctor/appointments?${params.toString()}`,
    );
    return { success: true, data: response.data?.data ?? response.data };
  } catch (error) {
    return { success: false, data: null, message: error?.message };
  }
}

/** Confirmed/completed appointments for a specific patient (used in prescription modal). */
export async function fetchPatientAppointmentsAction(patientId) {
  try {
    const response = await serverApiClient(
      `/doctor/patients/${patientId}/appointments`,
      { method: "GET" },
    );
    return { success: true, data: response.data?.data ?? response.data ?? [] };
  } catch (error) {
    return { success: false, data: [], message: error?.message };
  }
}

export async function savePrescriptionAction(appointmentId, payload) {
  try {
    const response = await serverApiClient(
      `/doctor/appointments/${appointmentId}/prescription`,
      { method: "POST", body: payload },
    );
    return { success: true, data: response.data?.data ?? response.data };
  } catch (error) {
    return { success: false, data: null, message: error?.message };
  }
}
