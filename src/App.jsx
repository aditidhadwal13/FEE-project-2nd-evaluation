import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./state/store";
import { HospitalProvider } from "./context/HospitalContext";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Homepage
import Home from "./Home";

// Role-Based Portals & Login
import Login from "./Login";
import Doctor from "./Doctor";
import Patient from "./Patient";
import Receptionist from "./Receptionist";

// Hospital Modules
import PatientList from "./PatientList";
import RegisterPatient from "./RegisterPatient";
import Appointments from "./Appointments";
import BookAppointment from "./BookAppointment";
import Dashboard from "./pages/Dashboard";
import DoctorsPage from "./pages/DoctorsPage";
import NotFoundPage from "./pages/NotFoundPage";

import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <HospitalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Route /: MediCare Hospital Homepage */}
              <Route index element={<Home />} />

              {/* Route /login: Role-Based Authentication Gateway (Doctor, Patient, Receptionist) */}
              <Route path="login" element={<Login />} />

              {/* Dedicated Role Dashboards (Protected by Auth & Role) */}
              <Route
                path="doctor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Doctor"]}>
                    <Doctor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="patient-portal"
                element={
                  <ProtectedRoute allowedRoles={["Patient"]}>
                    <Patient />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Receptionist", "Doctor"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="receptionist"
                element={
                  <ProtectedRoute allowedRoles={["Receptionist"]}>
                    <Receptionist />
                  </ProtectedRoute>
                }
              />

              {/* Route /patients: Patient Management */}
              <Route
                path="patients"
                element={
                  <ProtectedRoute allowedRoles={["Receptionist", "Doctor"]}>
                    <PatientList />
                  </ProtectedRoute>
                }
              />

              {/* Route /patients/new: Patient Registration Form */}
              <Route
                path="patients/new"
                element={
                  <ProtectedRoute>
                    <RegisterPatient />
                  </ProtectedRoute>
                }
              />

              {/* Route /appointments: Appointment Management */}
              <Route
                path="appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />

              {/* Route /appointments/new: Book Appointment Form */}
              <Route
                path="appointments/new"
                element={
                  <ProtectedRoute>
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />

              {/* Route /doctors: Doctor Management Directory */}
              <Route path="doctors" element={<DoctorsPage />} />

              {/* Route *: Custom 404 Not Found Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </HospitalProvider>
    </Provider>
  );
}

export default App;
