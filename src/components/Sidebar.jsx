import { NavLink, useNavigate } from "react-router-dom";
import { useHospital } from "../context/HospitalContext";

function Sidebar({ isMobileOpen, closeMobileMenu }) {
  const navigate = useNavigate();
  const { stats, currentUser, logout } = useHospital();

  const handleNavClick = () => {
    if (closeMobileMenu) {
      closeMobileMenu();
    }
  };

  const handleLogout = () => {
    logout();
    if (closeMobileMenu) closeMobileMenu();
    navigate("/login");
  };

  const role = currentUser?.role || "Receptionist";

  return (
    <aside className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-top">
          <h2>
            <span className="sidebar-logo-icon" aria-hidden="true">🏥</span>
            <span>MediCare</span>
          </h2>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={handleNavClick}
            aria-label="Close sidebar navigation"
            title="Close navigation menu"
          >
            ✕
          </button>
        </div>
        <div className="sidebar-brand-meta">
          <p className="role">{role} Portal</p>
        </div>
      </div>

      <nav aria-label="Main Navigation">
        {/* Hospital Homepage Link */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={handleNavClick}
        >
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </NavLink>

        {/* Role-Specific Primary Dashboard Link */}
        {role === "Doctor" ? (
          <NavLink
            to="/doctor-dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleNavClick}
          >
            <span className="nav-icon">🩺</span>
            <span>Doctor Dashboard</span>
          </NavLink>
        ) : role === "Patient" ? (
          <NavLink
            to="/patient-portal"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleNavClick}
          >
            <span className="nav-icon">👤</span>
            <span>Patient Portal</span>
          </NavLink>
        ) : (
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleNavClick}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
        )}

        {/* Section 1: Clinical & Desk Services */}
        <div className="nav-group-title">
          {role === "Doctor" ? "CLINICAL SERVICES" : role === "Patient" ? "MY HEALTH DESK" : "PATIENT SERVICES"}
        </div>

        {role !== "Patient" && (
          <NavLink
            to="/patients/new"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleNavClick}
          >
            <span className="nav-icon">📝</span>
            <span>Register Patient</span>
          </NavLink>
        )}

        {role !== "Patient" && (
          <NavLink
            to="/patients"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleNavClick}
          >
            <span className="nav-icon">👥</span>
            <span>Patient List</span>
            {stats.totalPatients > 0 && (
              <span className="nav-badge">{stats.totalPatients}</span>
            )}
          </NavLink>
        )}

        <NavLink
          to="/appointments/new"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={handleNavClick}
        >
          <span className="nav-icon">➕</span>
          <span>Book Appointment</span>
        </NavLink>

        <NavLink
          to="/appointments"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={handleNavClick}
        >
          <span className="nav-icon">📅</span>
          <span>Appointments</span>
          {stats.pendingAppointments > 0 && (
            <span className="nav-badge badge-pending">
              {stats.pendingAppointments}
            </span>
          )}
        </NavLink>

        {/* Section 2: Directory & Access */}
        <div className="nav-group-title">STAFF & PORTALS</div>

        <NavLink
          to="/doctors"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={handleNavClick}
        >
          <span className="nav-icon">🩺</span>
          <span>Doctors</span>
          <span className="nav-badge">{stats.totalDoctors}</span>
        </NavLink>

        <NavLink
          to="/login"
          className={({ isActive }) => (isActive ? "active" : "")}
          onClick={handleNavClick}
        >
          <span className="nav-icon">🔐</span>
          <span>Switch Role / Login</span>
        </NavLink>
      </nav>

      {/* Sidebar Footer with Active User Session */}
      <div className="sidebar-footer">
        <div className="sidebar-user-block">
          <div className="user-icon-badge">{currentUser?.avatar || "👤"}</div>
          <div className="user-text-info">
            <strong>{currentUser?.name || "Guest User"}</strong>
            <small>{currentUser?.role || "Not signed in"}</small>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-logout-button"
          onClick={handleLogout}
          title="Sign out of current role"
        >
          <span>🚪 Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
