"use server";

import { serverApiClient } from "@/lib/api-client";

export async function createMedicationScheduleAction(payload) {
  try {
    const res = await serverApiClient("/patient/medications/schedules", {
      method: "POST",
      body: payload,
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchMedicationSchedulesAction() {
  try {
    const res = await serverApiClient("/patient/medications/schedules");
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function updateMedicationScheduleAction(id, payload) {
  try {
    const res = await serverApiClient(`/patient/medications/schedules/${id}`, {
      method: "PATCH",
      body: payload,
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function deactivateMedicationScheduleAction(id) {
  try {
    const res = await serverApiClient(`/patient/medications/schedules/${id}`, {
      method: "DELETE",
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchDoseLogsAction(page = 0, size = 20) {
  try {
    const res = await serverApiClient(
      `/patient/medications/dose-logs?page=${page}&size=${size}`,
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function markDoseTakenAction(id, note = "") {
  try {
    const res = await serverApiClient(`/patient/medications/dose-logs/${id}/taken`, {
      method: "PATCH",
      body: { note },
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function snoozeDoseAction(id, snoozeMinutes = 15, note = "") {
  try {
    const res = await serverApiClient(`/patient/medications/dose-logs/${id}/snooze`, {
      method: "PATCH",
      body: { snoozeMinutes, note },
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchAdherenceSummaryAction(days = 30) {
  try {
    const res = await serverApiClient(`/patient/medications/adherence?days=${days}`);
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function createHealthTrackerEntryAction(payload) {
  try {
    const res = await serverApiClient("/patient/health-tracker", {
      method: "POST",
      body: payload,
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchHealthTrackerEntriesAction(metricType) {
  try {
    const endpoint = metricType
      ? `/patient/health-tracker?metricType=${metricType}`
      : "/patient/health-tracker";
    const res = await serverApiClient(endpoint);
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchDoctorAdherenceAlertsAction() {
  try {
    const res = await serverApiClient("/doctor/adherence/alerts");
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
