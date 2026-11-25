import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import {
  checkBackendHealth,
  apiRegister,
  apiLogin,
  apiGetPatients,
  apiCreatePatient,
  apiGetDoctors,
  apiGetAppointments,
  apiCreateAppointment,
  apiUpdateAppointmentStatus
} from "../services/api";

// Initial fallback seed data (used when operating in explicit Demo / Local Storage mode)
export const INITIAL_PATIENTS = [
  {
    id: "pat-101",
    name: "Aarav Sharma",
    age: "32",
    gender: "Male",
    phone: "9876543210",
    email: "aarav.sharma@example.com",
    address: "42 Park Street, Civil Lines, Delhi",
    bloodGroup: "O+",
    medicalNotes: "Hypertension (mild), regular checkups required",
    registeredAt: "2026-10-20T09:00:00"
  },
  {
    id: "pat-102",
    name: "Priya Patel",
    age: "27",
    gender: "Female",
    phone: "9812345678",
    email: "priya.patel@example.com",
    address: "15 Rosewood Enclave, Sector 14, Gurugram",
    bloodGroup: "B+",
    medicalNotes: "Occasional migraine attacks; allergic to penicillin",
    registeredAt: "2026-10-21T11:30:00"
  },
  {
    id: "pat-103",
    name: "Rohan Verma",
    age: "45",
    gender: "Male",
    phone: "9988776655",
    email: "rohan.verma@example.com",
    address: "78 Sunrise Heights, Model Town, Delhi",
    bloodGroup: "A+",
    medicalNotes: "Type 2 diabetes under dietary control",
    registeredAt: "2026-10-22T14:15:00"
  },
  {
    id: "pat-104",
    name: "Sneha Reddy",
    age: "19",
    gender: "Female",
    phone: "9123456789",
    email: "sneha.reddy@example.com",
    address: "23 Green Valley, Lake Road, Bengaluru",
    bloodGroup: "AB+",
    medicalNotes: "Seasonal pollen asthma; inhaler user",
    registeredAt: "2026-10-23T10:00:00"
  }
];

export const INITIAL_DOCTORS = [
  {
    id: "doc-1",
    name: "Dr. Mehta",
    fullName: "Dr. Arvind Mehta",
    specialty: "Cardiology",
    qualification: "MD, DM (Cardiology), FACC",
    experience: "14 years",
    room: "OPD 102 (Block A)",
    phone: "+91 98765 00101",
    email: "dr.mehta@medicare.org",
    availableDays: "Mon, Wed, Fri",
    availableHours: "09:00 AM - 02:00 PM",
    rating: "4.9 / 5.0"
  },
  {
    id: "doc-2",
    name: "Dr. Singh",
    fullName: "Dr. Gurpreet Singh",
    specialty: "Neurology",
    qualification: "MD, DM (Neurology)",
    experience: "11 years",
    room: "OPD 204 (Block B)",
    phone: "+91 98765 00102",
    email: "dr.singh@medicare.org",
    availableDays: "Tue, Thu, Sat",
    availableHours: "10:00 AM - 04:00 PM",
    rating: "4.8 / 5.0"
  },
  {
    id: "doc-3",
    name: "Dr. Kapoor",
    fullName: "Dr. Sunita Kapoor",
    specialty: "Pediatrics",
    qualification: "MD (Pediatrics), DCH",
    experience: "9 years",
    room: "OPD 108 (Child Care Wing)",
    phone: "+91 98765 00103",
    email: "dr.kapoor@medicare.org",
    availableDays: "Mon to Fri",
    availableHours: "09:30 AM - 03:30 PM",
    rating: "4.9 / 5.0"
  },
  {
    id: "doc-4",
    name: "Dr. Ananya Sharma",
    fullName: "Dr. Ananya Sharma",
    specialty: "Orthopedics",
    qualification: "MS (Orthopedics), MCh",
    experience: "8 years",
    room: "OPD 301 (Trauma Center)",
    phone: "+91 98765 00104",
    email: "dr.asharma@medicare.org",
    availableDays: "Mon, Wed, Sat",
    availableHours: "11:00 AM - 05:00 PM",
    rating: "4.7 / 5.0"
  },
  {
    id: "doc-5",
    name: "Dr. Rajesh Verma",
    fullName: "Dr. Rajesh Verma",
    specialty: "General Medicine",
    qualification: "MD (Internal Medicine)",
    experience: "16 years",
    room: "OPD 105 (Block A)",
    phone: "+91 98765 00105",
    email: "dr.verma@medicare.org",
    availableDays: "Mon to Sat",
    availableHours: "08:30 AM - 02:30 PM",
    rating: "4.8 / 5.0"
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    id: "apt-1",
    patient: "Aarav Sharma",
    doctor: "Dr. Mehta",
    department: "Cardiology",
    date: "2026-10-26",
    time: "10:00",
    reason: "Routine cardiac checkup & ECG review",
    status: "Confirmed",
    createdAt: "2026-10-25T08:30:00"
  },
  {
    id: "apt-2",
    patient: "Priya Patel",
    doctor: "Dr. Singh",
    department: "Neurology",
    date: "2026-10-26",
    time: "11:30",
    reason: "Recurring migraine consultation",
    status: "Pending",
    createdAt: "2026-10-25T09:15:00"
  },
  {
    id: "apt-3",
    patient: "Rohan Verma",
    doctor: "Dr. Rajesh Verma",
    department: "General Medicine",
    date: "2026-10-26",
    time: "09:00",
    reason: "Blood pressure monitoring & medication review",
    status: "Completed",
    createdAt: "2026-10-24T14:20:00"
  },
  {
    id: "apt-4",
    patient: "Sneha Reddy",
    doctor: "Dr. Kapoor",
    department: "Pediatrics",
    date: "2026-10-27",
    time: "14:00",
    reason: "Allergy consultation and prescription refill",
    status: "Pending",
    createdAt: "2026-10-25T11:00:00"
  }
];

export const DEFAULT_AUTH_USER = {
  id: "usr-rec-001",
  name: "Receptionist",
  role: "Receptionist",
  title: "Hospital Front Desk Coordinator",
  email: "reception@medicare.org",
  avatar: "👩‍💼",
  authMode: "demo"
};

function loadFromLocalStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToLocalStorage(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.warn("Local storage write error:", e);
  }
}

// ============================================================================
// ASYNC THUNKS FOR API & LOCAL DEMO SYNCHRONIZATION
// ============================================================================

export const syncWithBackend = createAsyncThunk(
  "hospital/syncWithBackend",
  async (_, { rejectWithValue }) => {
    try {
      const healthRes = await checkBackendHealth();
      if (healthRes.status !== "ok") {
        throw new Error("Backend health check returned non-ok status");
      }

      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        apiGetPatients(),
        apiGetDoctors(),
        apiGetAppointments()
      ]);

      return {
        patients: Array.isArray(patientsRes.data) ? patientsRes.data : null,
        doctors: Array.isArray(doctorsRes.data) ? doctorsRes.data : null,
        appointments: Array.isArray(appointmentsRes.data) ? appointmentsRes.data : null
      };
    } catch (err) {
      return rejectWithValue(err.message || "Backend unreachable");
    }
  }
);

export const registerUserAsync = createAsyncThunk(
  "hospital/registerUser",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const result = await apiRegister(userData);
      if (result.success && result.user) {
        await dispatch(syncWithBackend());
        return {
          user: { ...result.user, authMode: "server" },
          redirect: result.redirect,
          source: "server",
          message: result.message || `Account created! Welcome, ${result.user.name}.`
        };
      }
      return rejectWithValue(result.error || "Registration failed.");
    } catch (err) {
      return rejectWithValue(err.message || "Could not create account.");
    }
  }
);

export const loginUserAsync = createAsyncThunk(
  "hospital/loginUser",
  async ({ role, credentials }, { getState, rejectWithValue }) => {
    const { backendStatus, doctors, patients } = getState().hospital;

    // 1. Try real backend API first unless explicitly offline
    if (backendStatus !== "offline") {
      try {
        const result = await apiLogin(role, credentials.identifier, credentials.password);
        if (result.success && result.user) {
          return {
            user: { ...result.user, authMode: "server" },
            redirect: result.redirect,
            source: "server",
            message: `Welcome back, ${result.user.name}! Signed in as ${result.user.role}.`
          };
        }
        return rejectWithValue(result.error || "Invalid credentials.");
      } catch (err) {
        if (!err.isNetworkError) {
          return rejectWithValue(err.message || "Authentication failed.");
        }
      }
    }

    // 2. Offline Fallback Authentication
    await new Promise((r) => setTimeout(r, 250));

    if (!credentials.password || credentials.password.length < 4) {
      return rejectWithValue("Password must be at least 4 characters long.");
    }

    let userSession = null;
    let redirectPath = "/dashboard";

    if (role === "Doctor") {
      const idLower = (credentials.identifier || "").trim().toLowerCase();
      const docMatch = doctors.find(
        (d) =>
          (d.name && d.name.toLowerCase() === idLower) ||
          (d.fullName && d.fullName.toLowerCase() === idLower) ||
          (d.email && d.email.toLowerCase() === idLower)
      );

      if (!docMatch) {
        return rejectWithValue(
          `No Doctor found matching "${credentials.identifier}". Please check your credentials or create an account.`
        );
      }

      userSession = {
        id: docMatch.id,
        name: docMatch.name,
        role: "Doctor",
        title: `Attending Physician • ${docMatch.specialty}`,
        specialty: docMatch.specialty,
        email: docMatch.email || "doctor@medicare.org",
        avatar: "🩺",
        authMode: "offline"
      };
      redirectPath = "/doctor-dashboard";
    } else if (role === "Patient") {
      const idClean = (credentials.identifier || "").trim();
      const patMatch = patients.find(
        (p) =>
          p.phone === idClean ||
          (p.name && p.name.toLowerCase() === idClean.toLowerCase()) ||
          (p.email && p.email.toLowerCase() === idClean.toLowerCase())
      );

      if (!patMatch) {
        return rejectWithValue(
          `No registered patient found matching "${credentials.identifier}". Please create an account first.`
        );
      }

      userSession = {
        id: patMatch.id,
        name: patMatch.name,
        role: "Patient",
        title: `Hospital Patient • Reg: ${patMatch.phone}`,
        phone: patMatch.phone,
        email: patMatch.email || "patient@example.com",
        bloodGroup: patMatch.bloodGroup || "O+",
        avatar: "👤",
        authMode: "offline"
      };
      redirectPath = "/patient-portal";
    } else {
      userSession = {
        id: "usr-rec-001",
        name: credentials.name || "Receptionist Staff",
        role: "Receptionist",
        title: "Hospital Front Desk Coordinator",
        email: credentials.identifier || "reception@medicare.org",
        avatar: "👩‍💼",
        authMode: "offline"
      };
      redirectPath = "/dashboard";
    }

    return {
      user: userSession,
      redirect: redirectPath,
      source: "local",
      message: `Welcome, ${userSession.name}! Signed in as ${userSession.role}.`
    };
  }
);

export const createPatientThunk = createAsyncThunk(
  "hospital/createPatient",
  async (newPatient, { getState, rejectWithValue }) => {
    const { backendStatus, patients } = getState().hospital;

    // Client-side duplicate check by phone or email before network/local write
    const phoneDup = patients.find((p) => p.phone === newPatient.phone);
    if (phoneDup) {
      return rejectWithValue(
        `A patient with phone number ${newPatient.phone} is already registered (${phoneDup.name}).`
      );
    }
    if (newPatient.email) {
      const emailDup = patients.find(
        (p) => p.email && p.email.toLowerCase() === newPatient.email.toLowerCase()
      );
      if (emailDup) {
        return rejectWithValue(
          `A patient with email ${newPatient.email} is already registered (${emailDup.name}).`
        );
      }
    }

    if (backendStatus !== "offline") {
      try {
        const result = await apiCreatePatient(newPatient);
        if (result.success && result.data) {
          return {
            patient: result.data,
            source: "server",
            message: `Patient "${result.data.name}" registered successfully!`
          };
        }
        return rejectWithValue(result.error || "Failed to register patient.");
      } catch (err) {
        if (!err.isNetworkError) {
          return rejectWithValue(err.message || "Server rejected patient registration.");
        }
      }
    }

    // Offline persistence fallback
    await new Promise((r) => setTimeout(r, 250));
    const patientWithId = {
      ...newPatient,
      id: `pat-${Date.now()}`,
      registeredAt: new Date().toISOString()
    };

    return {
      patient: patientWithId,
      source: "local",
      message: `Patient "${newPatient.name}" registered successfully!`
    };
  }
);

export const createAppointmentThunk = createAsyncThunk(
  "hospital/createAppointment",
  async (newAppointment, { getState, rejectWithValue }) => {
    const { backendStatus, appointments } = getState().hospital;

    // Check scheduling conflicts against active appointments (excluding Cancelled and Rejected)
    const conflict = appointments.find(
      (a) =>
        a.doctor === newAppointment.doctor &&
        a.date === newAppointment.date &&
        a.time === newAppointment.time &&
        a.status !== "Cancelled" &&
        a.status !== "Rejected"
    );

    if (conflict) {
      return rejectWithValue(
        `${newAppointment.doctor} is already booked at ${newAppointment.time} on ${newAppointment.date}. Please select another time slot.`
      );
    }

    // Prevent duplicate identical appointment submission for same patient, doctor, date, time
    const duplicateSub = appointments.find(
      (a) =>
        a.patient === newAppointment.patient &&
        a.doctor === newAppointment.doctor &&
        a.date === newAppointment.date &&
        a.time === newAppointment.time &&
        a.status !== "Cancelled" &&
        a.status !== "Rejected"
    );
    if (duplicateSub) {
      return rejectWithValue(
        `An appointment for ${newAppointment.patient} with ${newAppointment.doctor} on ${newAppointment.date} at ${newAppointment.time} already exists.`
      );
    }

    if (backendStatus !== "offline") {
      try {
        const result = await apiCreateAppointment(newAppointment);
        if (result.success && result.data) {
          return {
            appointment: result.data,
            source: "server",
            message: `Appointment scheduled for ${result.data.patient} with ${result.data.doctor}!`
          };
        }
        return rejectWithValue(result.error || "Failed to book appointment.");
      } catch (err) {
        if (!err.isNetworkError) {
          return rejectWithValue(err.message || "Server rejected appointment booking.");
        }
      }
    }

    // Offline persistence fallback
    await new Promise((r) => setTimeout(r, 250));
    const aptWithId = {
      ...newAppointment,
      id: `apt-${Date.now()}`,
      status: newAppointment.status || "Pending",
      createdAt: new Date().toISOString()
    };

    return {
      appointment: aptWithId,
      source: "local",
      message: `Appointment scheduled for ${newAppointment.patient} (Status: ${aptWithId.status}).`
    };
  }
);

export const changeAppointmentStatusThunk = createAsyncThunk(
  "hospital/changeAppointmentStatus",
  async ({ indexOrId, newStatus }, { getState, rejectWithValue }) => {
    const { backendStatus, appointments } = getState().hospital;

    let targetId = typeof indexOrId === "string" ? indexOrId : null;
    if (typeof indexOrId === "number" && appointments[indexOrId]) {
      targetId = appointments[indexOrId].id;
    }

    if (!targetId) {
      return rejectWithValue("Appointment record ID not found.");
    }

    if (backendStatus !== "offline") {
      try {
        const res = await apiUpdateAppointmentStatus(targetId, newStatus);
        if (res.success && res.data) {
          return {
            id: targetId,
            status: res.data.status,
            source: "server",
            message: `Appointment status updated to "${res.data.status}".`
          };
        }
      } catch (err) {
        if (!err.isNetworkError) {
          return rejectWithValue(err.message || "Failed to update appointment status.");
        }
      }
    }

    return {
      id: targetId,
      status: newStatus,
      source: "local",
      message: `Appointment status updated to "${newStatus}".`
    };
  }
);

// ============================================================================
// HOSPITAL REDUX SLICE
// ============================================================================

const initialState = {
  patients: loadFromLocalStorage("medicare_patients_v2", INITIAL_PATIENTS),
  doctors: loadFromLocalStorage("medicare_doctors_v2", INITIAL_DOCTORS),
  appointments: loadFromLocalStorage("medicare_appointments_v2", INITIAL_APPOINTMENTS),
  currentUser: loadFromLocalStorage("medicare_auth_session", DEFAULT_AUTH_USER),
  backendStatus: "checking", // "connected" | "offline" | "checking"
  isSubmitting: false,
  notification: null,
  lastError: null
};

const hospitalSlice = createSlice({
  name: "hospital",
  initialState,
  reducers: {
    setNotification(state, action) {
      state.notification = action.payload;
    },
    clearNotification(state) {
      state.notification = null;
    },
    setBackendStatus(state, action) {
      state.backendStatus = action.payload;
    },
    hydrateAppointments(state, action) {
      if (Array.isArray(action.payload)) {
        state.appointments = action.payload;
        saveToLocalStorage("medicare_appointments_v2", state.appointments);
      }
    },
    addPatientSync(state, action) {
      const patientWithId = {
        ...action.payload,
        id: action.payload.id || `pat-${Date.now()}`,
        registeredAt: action.payload.registeredAt || new Date().toISOString()
      };
      // Avoid duplicates by id
      const exists = state.patients.some((p) => p.id === patientWithId.id);
      if (!exists) {
        state.patients.unshift(patientWithId);
        saveToLocalStorage("medicare_patients_v2", state.patients);
      }
    },
    updatePatientSync(state, action) {
      const { indexOrId, updatedPatient } = action.payload;
      let idx = -1;
      if (typeof indexOrId === "number") {
        idx = indexOrId;
      } else if (typeof indexOrId === "string") {
        idx = state.patients.findIndex((p) => p.id === indexOrId);
      }
      if (idx !== -1 && state.patients[idx]) {
        const oldName = state.patients[idx].name;
        const newName = updatedPatient.name || oldName;
        state.patients[idx] = { ...state.patients[idx], ...updatedPatient };
        saveToLocalStorage("medicare_patients_v2", state.patients);

        // Keep appointment patient names consistent if patient name was edited
        if (oldName && newName && oldName !== newName) {
          state.appointments = state.appointments.map((apt) =>
            apt.patient === oldName ? { ...apt, patient: newName } : apt
          );
          saveToLocalStorage("medicare_appointments_v2", state.appointments);
        }
      }
    },
    deletePatientSync(state, action) {
      const indexOrId = action.payload;
      if (typeof indexOrId === "number") {
        state.patients = state.patients.filter((_, i) => i !== indexOrId);
      } else {
        state.patients = state.patients.filter((p) => p.id !== indexOrId);
      }
      saveToLocalStorage("medicare_patients_v2", state.patients);
    },
    addAppointmentSync(state, action) {
      const aptWithId = {
        ...action.payload,
        id: action.payload.id || `apt-${Date.now()}`,
        status: action.payload.status || "Pending",
        createdAt: action.payload.createdAt || new Date().toISOString()
      };
      const exists = state.appointments.some((a) => a.id === aptWithId.id);
      if (!exists) {
        state.appointments.unshift(aptWithId);
        saveToLocalStorage("medicare_appointments_v2", state.appointments);
      }
    },
    updateAppointmentStatusSync(state, action) {
      const { indexOrId, newStatus } = action.payload;
      let idx = -1;
      if (typeof indexOrId === "number") {
        idx = indexOrId;
      } else if (typeof indexOrId === "string") {
        idx = state.appointments.findIndex((a) => a.id === indexOrId);
      }
      if (idx !== -1 && state.appointments[idx]) {
        state.appointments[idx].status = newStatus;
        saveToLocalStorage("medicare_appointments_v2", state.appointments);
      }
    },
    deleteAppointmentSync(state, action) {
      const indexOrId = action.payload;
      if (typeof indexOrId === "number") {
        state.appointments = state.appointments.filter((_, i) => i !== indexOrId);
      } else {
        state.appointments = state.appointments.filter((a) => a.id !== indexOrId);
      }
      saveToLocalStorage("medicare_appointments_v2", state.appointments);
    },
    addDoctorSync(state, action) {
      const docWithId = {
        ...action.payload,
        id: action.payload.id || `doc-${Date.now()}`
      };
      state.doctors.push(docWithId);
      saveToLocalStorage("medicare_doctors_v2", state.doctors);
    },
    deleteDoctorSync(state, action) {
      const targetId = action.payload;
      state.doctors = state.doctors.filter((d) => d.id !== targetId);
      saveToLocalStorage("medicare_doctors_v2", state.doctors);
    },
    logoutSync(state) {
      state.currentUser = null;
      saveToLocalStorage("medicare_auth_session", null);
      try {
        localStorage.removeItem("medicare_auth_token");
      } catch {
        // ignore
      }
    },
    resetAllToDefaultsSync(state) {
      state.patients = INITIAL_PATIENTS;
      state.doctors = INITIAL_DOCTORS;
      state.appointments = INITIAL_APPOINTMENTS;
      state.currentUser = DEFAULT_AUTH_USER;
      saveToLocalStorage("medicare_patients_v2", INITIAL_PATIENTS);
      saveToLocalStorage("medicare_doctors_v2", INITIAL_DOCTORS);
      saveToLocalStorage("medicare_appointments_v2", INITIAL_APPOINTMENTS);
      saveToLocalStorage("medicare_auth_session", DEFAULT_AUTH_USER);
      try {
        localStorage.removeItem("medicare_auth_token");
      } catch {
        // ignore
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // syncWithBackend
      .addCase(syncWithBackend.pending, (state) => {
        state.backendStatus = "checking";
      })
      .addCase(syncWithBackend.fulfilled, (state, action) => {
        state.backendStatus = "connected";
        if (action.payload.patients) {
          state.patients = action.payload.patients;
          saveToLocalStorage("medicare_patients_v2", state.patients);
        }
        if (action.payload.doctors) {
          state.doctors = action.payload.doctors;
          saveToLocalStorage("medicare_doctors_v2", state.doctors);
        }
        if (action.payload.appointments) {
          state.appointments = action.payload.appointments;
          saveToLocalStorage("medicare_appointments_v2", state.appointments);
        }
      })
      .addCase(syncWithBackend.rejected, (state) => {
        state.backendStatus = "offline";
      })

      // registerUserAsync
      .addCase(registerUserAsync.pending, (state) => {
        state.isSubmitting = true;
        state.lastError = null;
      })
      .addCase(registerUserAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.backendStatus = "connected";
        state.currentUser = action.payload.user;
        saveToLocalStorage("medicare_auth_session", action.payload.user);
      })
      .addCase(registerUserAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.lastError = action.payload;
      })

      // loginUserAsync
      .addCase(loginUserAsync.pending, (state) => {
        state.isSubmitting = true;
        state.lastError = null;
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentUser = action.payload.user;
        if (action.payload.source === "server") {
          state.backendStatus = "connected";
        } else if (action.payload.source === "local" && state.backendStatus === "connected") {
          state.backendStatus = "offline";
        }
        saveToLocalStorage("medicare_auth_session", action.payload.user);
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.isSubmitting = false;
        state.lastError = action.payload;
      })

      // createPatientThunk
      .addCase(createPatientThunk.pending, (state) => {
        state.isSubmitting = true;
        state.lastError = null;
      })
      .addCase(createPatientThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload.source === "server") {
          state.backendStatus = "connected";
        } else if (action.payload.source === "local" && state.backendStatus === "connected") {
          state.backendStatus = "offline";
        }
        const newPat = action.payload.patient;
        const exists = state.patients.some((p) => p.id === newPat.id || p.phone === newPat.phone);
        if (!exists) {
          state.patients.unshift(newPat);
          saveToLocalStorage("medicare_patients_v2", state.patients);
        }
      })
      .addCase(createPatientThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.lastError = action.payload;
      })

      // createAppointmentThunk
      .addCase(createAppointmentThunk.pending, (state) => {
        state.isSubmitting = true;
        state.lastError = null;
      })
      .addCase(createAppointmentThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        if (action.payload.source === "server") {
          state.backendStatus = "connected";
        } else if (action.payload.source === "local" && state.backendStatus === "connected") {
          state.backendStatus = "offline";
        }
        const newApt = action.payload.appointment;
        const exists = state.appointments.some((a) => a.id === newApt.id);
        if (!exists) {
          state.appointments.unshift(newApt);
          saveToLocalStorage("medicare_appointments_v2", state.appointments);
        }
      })
      .addCase(createAppointmentThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.lastError = action.payload;
      })

      // changeAppointmentStatusThunk
      .addCase(changeAppointmentStatusThunk.fulfilled, (state, action) => {
        if (action.payload.source === "server") {
          state.backendStatus = "connected";
        } else if (action.payload.source === "local" && state.backendStatus === "connected") {
          state.backendStatus = "offline";
        }
        const idx = state.appointments.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) {
          state.appointments[idx].status = action.payload.status;
          saveToLocalStorage("medicare_appointments_v2", state.appointments);
        }
      });
  }
});

export const {
  setNotification,
  clearNotification,
  setBackendStatus,
  hydrateAppointments,
  addPatientSync,
  updatePatientSync,
  deletePatientSync,
  addAppointmentSync,
  updateAppointmentStatusSync,
  deleteAppointmentSync,
  addDoctorSync,
  deleteDoctorSync,
  logoutSync,
  resetAllToDefaultsSync
} = hospitalSlice.actions;

// ============================================================================
// MEMOIZED REDUX SELECTORS
// ============================================================================
export const selectHospitalState = (state) => state.hospital;
export const selectPatients = (state) => state.hospital.patients;
export const selectDoctors = (state) => state.hospital.doctors;
export const selectAppointments = (state) => state.hospital.appointments;
export const selectCurrentUser = (state) => state.hospital.currentUser;
export const selectBackendStatus = (state) => state.hospital.backendStatus;
export const selectIsSubmitting = (state) => state.hospital.isSubmitting;
export const selectNotification = (state) => state.hospital.notification;

export const selectHospitalStats = createSelector(
  [selectPatients, selectDoctors, selectAppointments],
  (patients, doctors, appointments) => {
    const totalPatients = patients.length;
    const totalDoctors = doctors.length;
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter((a) => a.status === "Pending").length;
    const confirmedAppointments = appointments.filter((a) => a.status === "Confirmed").length;
    const completedAppointments = appointments.filter((a) => a.status === "Completed").length;
    const rejectedAppointments = appointments.filter(
      (a) => a.status === "Rejected" || a.status === "Cancelled"
    ).length;

    return {
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      rejectedAppointments
    };
  }
);

export default hospitalSlice.reducer;
