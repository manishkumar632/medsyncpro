"use server";

import { serverApiClient } from "@/lib/api-client";

// ─── Doctor Appointment Actions ──────────────────────────────────────────────

/**
 * Fetch appointments for the authenticated doctor.
 */
export async function fetchDoctorAppointments(page = 0, size = 50) {
  try {
    const res = await serverApiClient(
      `/doctor/appointments?page=${page}&size=${size}`
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Update appointment status (approve, reject, complete, cancel).
 * @param {string} id   - appointment UUID
 * @param {string} action - one of: approve, reject, complete, cancel
 * @param {object|null} body - optional JSON body (e.g. { reason })
 */
export async function updateAppointmentStatus(id, action, body = null) {
  try {
    const options = { method: "PATCH" };
    if (body) options.body = body;
    const res = await serverApiClient(
      `/doctor/appointments/${id}/${action}`,
      options
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Reschedule an appointment (doctor action).
 */
export async function rescheduleDoctorAppointment(id, payload) {
  try {
    const res = await serverApiClient(`/doctor/appointments/${id}/reschedule`, {
      method: "PATCH",
      body: payload,
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Save doctor notes for an appointment.
 */
export async function saveAppointmentNotes(id, data) {
  try {
    const res = await serverApiClient(`/doctor/appointments/${id}/notes`, {
      method: "POST",
      body: data,
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Save prescription for an appointment.
 */
export async function saveAppointmentPrescription(id, data) {
  try {
    const res = await serverApiClient(
      `/doctor/appointments/${id}/prescription`,
      {
        method: "POST",
        body: data,
      }
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ─── Patient Appointment Actions ─────────────────────────────────────────────

/**
 * Fetch appointments for the authenticated patient.
 */
export async function fetchPatientAppointments(page = 0, size = 20) {
  try {
    const res = await serverApiClient(
      `/patient/appointments?page=${page}&size=${size}`
    );
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Cancel a patient appointment.
 */
export async function cancelPatientAppointment(id) {
  try {
    const res = await serverApiClient(`/patient/appointments/${id}/cancel`, {
      method: "PATCH",
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Book a new appointment.
 * @param {{ doctorId, scheduledDate, scheduledTime, type, symptoms }} data
 */
export async function bookAppointment(data) {
  try {
    const res = await serverApiClient("/patient/appointments", {
      method: "POST",
      body: data,
    });
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

/**
 * Fetch a single patient appointment by ID.
 */
export async function fetchPatientAppointmentDetail(id) {
  try {
    // The backend doesn't have a single-appointment endpoint for patients,
    // so we fetch all and filter. If performance matters, a dedicated endpoint
    // could be added later.
    const res = await serverApiClient(`/patient/appointments?page=0&size=200`);
    const pageData = res.data?.data ?? res.data;
    const list = pageData?.content || pageData || [];
    const appt = list.find((a) => a.id === id);
    if (!appt) throw new Error("Appointment not found");
    return { success: true, data: appt };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ─── Public Doctor Actions ───────────────────────────────────────────────────

/**
 * Fetch available slots for a doctor.
 */
export async function fetchDoctorSlots(doctorId, type = "VIDEO") {
  try {
    const res = await serverApiClient(
      `/doctors/${doctorId}/slots?type=${type}`
    );
    const raw = res.data?.data ?? res.data;
    // The backend returns slots as an array directly or wrapped
    const slots = Array.isArray(raw) ? raw : raw?.content || [];
    return { success: true, data: slots };
  } catch (err) {
    return { success: false, message: err.message, data: [] };
  }
}

/**
 * Fetch a doctor's public profile.
 */
export async function fetchDoctorPublicProfile(doctorId) {
  try {
    const res = await serverApiClient(`/doctors/${doctorId}`);
    return { success: true, data: res.data?.data ?? res.data };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
