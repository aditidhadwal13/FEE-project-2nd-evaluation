import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Toast from "./Toast";

function MainLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Map current route to page header title and subtitle
  const getHeaderInfo = (pathname) => {
    switch (pathname) {
      case "/":
        return {
          title: "MediCare Multi-Specialty Hospital",
          subtitle: "24/7 Emergency Care, Specialist Outpatient Clinics & Digital Healthcare Portal"
        };
      case "/login":
        return {
          title: "Role-Based Authentication",
          subtitle: "Select Doctor, Patient, or Receptionist to access your workspace."
        };
      case "/doctor-dashboard":
        return {
          title: "Doctor Clinical Workspace",
          subtitle: "Review assigned patient appointments, OPD queue, and medical history."
        };
      case "/patient-portal":
        return {
          title: "Patient Health Portal",
          subtitle: "Review your consultation bookings, medical notes, and schedule visits."
        };
      case "/dashboard":
        return {
          title: "Receptionist Dashboard",
          subtitle: "Welcome back! Manage hospital admissions, queues, and appointments."
        };
      case "/patients":
        return {
          title: "Patient Management Directory",
          subtitle: "Search, filter, update, and manage registered patients."
        };
      case "/patients/new":
        return {
          title: "Patient Registration Desk",
          subtitle: "Enroll a new patient with contact and medical vitals."
        };
      case "/appointments":
        return {
          title: "Appointment Management",
          subtitle: "Monitor OPD queues, confirm visits, and track patient consultations."
        };
      case "/appointments/new":
        return {
          title: "Book Patient Consultation",
          subtitle: "Schedule doctor appointment with conflict checking."
        };
      case "/doctors":
        return {
          title: "Doctor Management Directory",
          subtitle: "Hospital physicians, departments, and consultation schedules."
        };
      default:
        return {
          title: "MediCare Healthcare Portal",
          subtitle: "Hospital Management Information System"
        };
    }
  };

  const { title, subtitle } = getHeaderInfo(location.pathname);

  return (
    <div className="app">
      {/* Responsive Overlay for Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Persistent Sidebar */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          title={title}
          subtitle={subtitle}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        <main className="main-content">
          <Toast />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
