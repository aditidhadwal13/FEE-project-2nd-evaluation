import { createContext, useContext, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  syncWithBackend,
  registerUserAsync,
  loginUserAsync,
  createPatientThunk,
  createAppointmentThunk,
  changeAppointmentStatusThunk,
  setNotification,
  clearNotification,
  addPatientSync,
  updatePatientSync,
  deletePatientSync,
  addAppointmentSync,
  deleteAppointmentSync,
  addDoctorSync,
  deleteDoctorSync,
  logoutSync,
  resetAllToDefaultsSync,
  selectPatients,
  selectDoctors,
  selectAppointments,
  selectCurrentUser,
  selectBackendStatus,
  selectIsSubmitting,
  selectNotification,
  selectHospitalStats
} from "../state/hospitalSlice";
import {
  apiLogout,
  apiUpdatePatient,
  apiDeletePatient,
  apiDeleteAppointment,
  apiCreateDoctor,
  apiDeleteDoctor,
  resetSystemData
} from "../services/api";

const HospitalContext = createContext(null);

export function HospitalProvider({ children }) {
  const dispatch = useDispatch();

  // Selectors from Redux Store
  const patients = useSelector(selectPatients);
  const doctors = useSelector(selectDoctors);
  const appointments = useSelector(selectAppointments);
  const currentUser = useSelector(selectCurrentUser);
  const backendStatus = useSelector(selectBackendStatus);
  const isSubmitting = useSelector(selectIsSubmitting);
  const notification = useSelector(selectNotification);
  const stats = useSelector(selectHospitalStats);

  const notificationTimerRef = useRef(null);

  // Toast / Notification helper
  const showNotification = useCallback(
    (type, message) => {
      const id = Date.now();
      dispatch(setNotification({ type, message, id }));
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
      notificationTimerRef.current = setTimeout(() => {
        dispatch(clearNotification());
      }, 4500);
    },
    [dispatch]
  );

  const dismissNotification = useCallback(() => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    dispatch(clearNotification());
  }, [dispatch]);

  // Synchronize with backend on mount
  const refreshFromBackend = useCallback(async () => {
    await dispatch(syncWithBackend());
  }, [dispatch]);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  // --- Authentication Operations ---
  const register = useCallback(
    async (userData) => {
      try {
        const resultAction = await dispatch(registerUserAsync(userData));
        if (registerUserAsync.fulfilled.match(resultAction)) {
          const { user, redirect, source, message } = resultAction.payload;
          showNotification("success", message);
          return { success: true, user, redirect, source };
        } else {
          const errMsg = resultAction.payload || "Registration failed.";
          showNotification("error", errMsg);
          return { success: false, error: errMsg };
        }
      } catch (err) {
        showNotification("error", err.message || "Registration failed.");
        return { success: false, error: err.message };
      }
    },
    [dispatch, showNotification]
  );

  const login = useCallback(
    async (role, credentials) => {
      try {
        const resultAction = await dispatch(loginUserAsync({ role, credentials }));
        if (loginUserAsync.fulfilled.match(resultAction)) {
          const { user, redirect, source, message } = resultAction.payload;
          showNotification("success", message);
          return { success: true, user, redirect, source };
        } else {
          const errMsg = resultAction.payload || "Authentication failed.";
          showNotification("error", errMsg);
          return { success: false, error: errMsg };
        }
      } catch (err) {
        showNotification("error", err.message || "Authentication failed.");
        return { success: false, error: err.message };
      }
    },
    [dispatch, showNotification]
  );

  const logout = useCallback(async () => {
    if (backendStatus === "connected") {
      try {
        await apiLogout();
      } catch {
        // ignore
      }
    }
    dispatch(logoutSync());
    showNotification("info", "You have signed out of your portal session.");
  }, [backendStatus, dispatch, showNotification]);

  // --- Patient Management Operations ---
  const addPatient = useCallback(
    (newPatient) => {
      const patientWithId = {
        ...newPatient,
        id: newPatient.id || `pat-${Date.now()}`,
        registeredAt: new Date().toISOString()
      };
      dispatch(addPatientSync(patientWithId));
      showNotification("success", `Patient "${newPatient.name}" registered locally.`);
      return patientWithId;
    },
    [dispatch, showNotification]
  );

  const addPatientAsync = useCallback(
    async (newPatient) => {
      try {
        const resultAction = await dispatch(createPatientThunk(newPatient));
        if (createPatientThunk.fulfilled.match(resultAction)) {
          const { patient, source, message } = resultAction.payload;
          showNotification("success", message);
          return { success: true, patient, source };
        } else {
          const errMsg = resultAction.payload || "Failed to register patient.";
          showNotification("error", errMsg);
          return { success: false, error: errMsg };
        }
      } catch (error) {
        showNotification("error", error.message || "Failed to register patient.");
        return { success: false, error: error.message };
      }
    },
    [dispatch, showNotification]
  );

  const updatePatient = useCallback(
    async (indexOrId, updatedPatient) => {
      let targetId = typeof indexOrId === "string" ? indexOrId : null;
      if (!targetId && typeof indexOrId === "number" && patients[indexOrId]) {
        targetId = patients[indexOrId].id;
      }

      if (backendStatus !== "offline" && targetId) {
        try {
          const res = await apiUpdatePatient(targetId, updatedPatient);
          if (res.success && res.data) {
            dispatch(updatePatientSync({ indexOrId: targetId, updatedPatient: res.data }));
            showNotification("success", "Patient record updated successfully.");
            return { success: true, data: res.data };
          }
        } catch (err) {
          if (!err.isNetworkError) {
            showNotification("error", err.message || "Failed to update patient.");
            return { success: false, error: err.message };
          }
        }
      }

      dispatch(updatePatientSync({ indexOrId, updatedPatient }));
      showNotification("success", "Patient record updated successfully.");
      return { success: true };
    },
    [backendStatus, dispatch, patients, showNotification]
  );

  const deletePatient = useCallback(
    async (indexOrId) => {
      let targetId = typeof indexOrId === "string" ? indexOrId : null;
      let targetName = "Patient";

      if (typeof indexOrId === "number" && patients[indexOrId]) {
        targetId = patients[indexOrId].id;
        targetName = patients[indexOrId].name;
      } else if (targetId) {
        const found = patients.find((p) => p.id === targetId);
        if (found) targetName = found.name;
      }

      if (backendStatus !== "offline" && targetId) {
        try {
          await apiDeletePatient(targetId);
          dispatch(deletePatientSync(targetId));
          showNotification("info", `Patient "${targetName}" removed from hospital registry.`);
          return;
        } catch (err) {
          if (!err.isNetworkError) {
            showNotification("error", err.message || "Failed to delete patient.");
            return;
          }
        }
      }

      dispatch(deletePatientSync(indexOrId));
      showNotification("info", `Patient "${targetName}" removed from hospital registry.`);
    },
    [backendStatus, dispatch, patients, showNotification]
  );

  // --- Appointment Management Operations ---
  const addAppointment = useCallback(
    (newAppointment) => {
      const aptWithId = {
        ...newAppointment,
        id: newAppointment.id || `apt-${Date.now()}`,
        status: newAppointment.status || "Pending",
        createdAt: new Date().toISOString()
      };
      dispatch(addAppointmentSync(aptWithId));
      showNotification("success", `Appointment booked for ${newAppointment.patient}!`);
      return aptWithId;
    },
    [dispatch, showNotification]
  );

  const addAppointmentAsync = useCallback(
    async (newAppointment) => {
      try {
        const resultAction = await dispatch(createAppointmentThunk(newAppointment));
        if (createAppointmentThunk.fulfilled.match(resultAction)) {
          const { appointment, source, message } = resultAction.payload;
          showNotification("success", message);
          return { success: true, appointment, source };
        } else {
          const errMsg = resultAction.payload || "Failed to book appointment.";
          showNotification("error", errMsg);
          return { success: false, error: errMsg };
        }
      } catch (error) {
        showNotification("error", error.message || "Failed to book appointment.");
        return { success: false, error: error.message };
      }
    },
    [dispatch, showNotification]
  );

  const updateAppointmentStatus = useCallback(
    async (indexOrId, newStatus) => {
      const resultAction = await dispatch(changeAppointmentStatusThunk({ indexOrId, newStatus }));
      if (changeAppointmentStatusThunk.fulfilled.match(resultAction)) {
        showNotification("info", resultAction.payload.message);
        return { success: true, status: resultAction.payload.status };
      } else {
        const errMsg = resultAction.payload || "Could not update appointment status.";
        showNotification("error", errMsg);
        return { success: false, error: errMsg };
      }
    },
    [dispatch, showNotification]
  );

  const deleteAppointment = useCallback(
    async (indexOrId) => {
      let targetId = typeof indexOrId === "string" ? indexOrId : null;
      if (typeof indexOrId === "number" && appointments[indexOrId]) {
        targetId = appointments[indexOrId].id;
      }

      if (backendStatus !== "offline" && targetId) {
        try {
          await apiDeleteAppointment(targetId);
          dispatch(deleteAppointmentSync(targetId));
          showNotification("info", "Appointment removed from hospital schedule.");
          return;
        } catch (err) {
          if (!err.isNetworkError) {
            showNotification("error", err.message || "Failed to delete appointment.");
            return;
          }
        }
      }

      dispatch(deleteAppointmentSync(indexOrId));
      showNotification("info", "Appointment removed from hospital schedule.");
    },
    [appointments, backendStatus, dispatch, showNotification]
  );

  // --- Doctor Management Operations ---
  const addDoctor = useCallback(
    async (doctorData) => {
      if (backendStatus !== "offline") {
        try {
          const res = await apiCreateDoctor(doctorData);
          if (res.success && res.data) {
            dispatch(addDoctorSync(res.data));
            showNotification("success", `${res.data.name} added to hospital directory.`);
            return res.data;
          }
        } catch (err) {
          if (!err.isNetworkError) {
            showNotification("error", err.message || "Failed to add doctor.");
            return null;
          }
        }
      }

      const docWithId = {
        ...doctorData,
        id: `doc-${Date.now()}`
      };
      dispatch(addDoctorSync(docWithId));
      showNotification("success", `${doctorData.name} added to hospital directory.`);
      return docWithId;
    },
    [backendStatus, dispatch, showNotification]
  );

  const deleteDoctor = useCallback(
    async (doctorId) => {
      const found = doctors.find((d) => d.id === doctorId);
      const docName = found ? found.name : "Doctor";

      if (backendStatus !== "offline" && doctorId) {
        try {
          await apiDeleteDoctor(doctorId);
          dispatch(deleteDoctorSync(doctorId));
          showNotification("info", `${docName} removed from hospital directory.`);
          return;
        } catch (err) {
          if (!err.isNetworkError) {
            showNotification("error", err.message || "Failed to remove doctor.");
            return;
          }
        }
      }

      dispatch(deleteDoctorSync(doctorId));
      showNotification("info", `${docName} removed from hospital directory.`);
    },
    [backendStatus, dispatch, doctors, showNotification]
  );

  // --- Reset to default sample data ---
  const resetToDefaults = useCallback(async () => {
    if (backendStatus !== "offline") {
      try {
        await resetSystemData();
        await dispatch(syncWithBackend());
        showNotification("info", "Hospital database reset to initial records.");
        return;
      } catch (err) {
        console.warn("Backend reset error", err);
      }
    }

    dispatch(resetAllToDefaultsSync());
    showNotification("info", "Hospital records reset to defaults.");
  }, [backendStatus, dispatch, showNotification]);

  const value = {
    // Shared Redux State
    patients,
    doctors,
    appointments,
    stats,
    isSubmitting,
    notification,
    backendStatus,

    // Feedback actions
    showNotification,
    dismissNotification,
    refreshFromBackend,

    // Authentication & Role Session
    currentUser,
    isAuthenticated: Boolean(currentUser),
    register,
    login,
    logout,

    // Patient Actions
    addPatient,
    addPatientAsync,
    updatePatient,
    deletePatient,

    // Appointment Actions
    addAppointment,
    addAppointmentAsync,
    updateAppointmentStatus,
    deleteAppointment,

    // Doctor Actions
    addDoctor,
    deleteDoctor,

    // System Utilities
    resetToDefaults
  };

  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  );
}

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error("useHospital must be used within a HospitalProvider");
  }
  return context;
}
