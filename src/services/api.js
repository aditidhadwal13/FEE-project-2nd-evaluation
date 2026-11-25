// Frontend HTTP API Client for MediCare Hospital Management System
// Connects React Frontend to Express & SQLite Backend

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

function getAuthToken() {
  try {
    return localStorage.getItem("medicare_auth_token");
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.error ||
        data?.message ||
        `API request failed with status ${response.status} (${response.statusText})`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      const offlineError = new Error(
        `Unable to connect to MediCare Backend Server at ${API_BASE_URL}. Ensure the backend is running via 'npm run server'.`
      );
      offlineError.isNetworkError = true;
      throw offlineError;
    }
    throw err;
  }
}

// 1. Health & System
export async function checkBackendHealth() {
  return request("/health");
}

export async function resetSystemData() {
  return request("/system/reset", { method: "POST" });
}

// 2. Authentication APIs
export async function apiRegister(userData) {
  const result = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData)
  });

  if (result.token) {
    try {
      localStorage.setItem("medicare_auth_token", result.token);
    } catch (e) {
      console.warn("Could not save token to localStorage", e);
    }
  }

  return result;
}

export async function apiLogin(role, identifier, password) {
  const result = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ role, identifier, password })
  });

  if (result.token) {
    try {
      localStorage.setItem("medicare_auth_token", result.token);
    } catch (e) {
      console.warn("Could not save token to localStorage", e);
    }
  }

  return result;
}

export async function apiLogout() {
  try {
    await request("/auth/logout", { method: "POST" });
  } catch (e) {
    console.warn("Logout request completed locally", e);
  } finally {
    try {
      localStorage.removeItem("medicare_auth_token");
    } catch {
      // ignore
    }
  }
  return { success: true };
}

export async function apiGetAuthMe() {
  return request("/auth/me");
}

// 3. Patient APIs
export async function apiGetPatients(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.gender && params.gender !== "all") query.append("gender", params.gender);
  if (params.bloodGroup && params.bloodGroup !== "all") query.append("bloodGroup", params.bloodGroup);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return request(`/patients${queryString}`);
}

export async function apiGetPatientById(id) {
  return request(`/patients/${id}`);
}

export async function apiCreatePatient(patientData) {
  return request("/patients", {
    method: "POST",
    body: JSON.stringify(patientData)
  });
}

export async function apiUpdatePatient(id, patientData) {
  return request(`/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(patientData)
  });
}

export async function apiDeletePatient(id) {
  return request(`/patients/${id}`, {
    method: "DELETE"
  });
}

// 4. Doctor APIs
export async function apiGetDoctors(params = {}) {
  const query = new URLSearchParams();
  if (params.specialty && params.specialty !== "all") query.append("specialty", params.specialty);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return request(`/doctors${queryString}`);
}

export async function apiCreateDoctor(doctorData) {
  return request("/doctors", {
    method: "POST",
    body: JSON.stringify(doctorData)
  });
}

export async function apiDeleteDoctor(id) {
  return request(`/doctors/${id}`, {
    method: "DELETE"
  });
}

// 5. Appointment APIs
export async function apiGetAppointments(params = {}) {
  const query = new URLSearchParams();
  if (params.doctor) query.append("doctor", params.doctor);
  if (params.patient) query.append("patient", params.patient);
  if (params.status && params.status !== "all") query.append("status", params.status);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return request(`/appointments${queryString}`);
}

export async function apiCreateAppointment(appointmentData) {
  return request("/appointments", {
    method: "POST",
    body: JSON.stringify(appointmentData)
  });
}

export async function apiUpdateAppointmentStatus(id, status) {
  return request(`/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function apiDeleteAppointment(id) {
  return request(`/appointments/${id}`, {
    method: "DELETE"
  });
}

// 6. Dashboard Statistics API
export async function apiGetDashboardStats() {
  return request("/dashboard/stats");
}

export default {
  checkBackendHealth,
  resetSystemData,
  apiRegister,
  apiLogin,
  apiLogout,
  apiGetAuthMe,
  apiGetPatients,
  apiGetPatientById,
  apiCreatePatient,
  apiUpdatePatient,
  apiDeletePatient,
  apiGetDoctors,
  apiCreateDoctor,
  apiDeleteDoctor,
  apiGetAppointments,
  apiCreateAppointment,
  apiUpdateAppointmentStatus,
  apiDeleteAppointment,
  apiGetDashboardStats
};
