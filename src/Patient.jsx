import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHospital } from "./context/HospitalContext";

function Patient({ logout: propLogout }) {
  const navigate = useNavigate();
  const {
    currentUser,
    logout: contextLogout,
    appointments,
    updateAppointmentStatus,
    patients
  } = useHospital();

  const onLogoutClick = () => {
    if (propLogout) {
      propLogout();
    } else if (contextLogout) {
      contextLogout();
      navigate("/login");
    }
  };

  // Active patient from session
  const patientName =
    currentUser?.role === "Patient" ? currentUser.name : "Aarav Sharma";

  // Patient record
  const patientRecord = useMemo(() => {
    return (
      patients.find(
        (p) =>
          p.name.toLowerCase() === patientName.toLowerCase() ||
          p.phone === currentUser?.phone
      ) || {
        name: patientName,
        phone: currentUser?.phone || "9876543210",
        bloodGroup: currentUser?.bloodGroup || "O+",
        age: "32",
        gender: "Male",
        address: "42 Park Street, Civil Lines",
        medicalNotes: "Hypertension (mild), routine checkups required"
      }
    );
  }, [patients, patientName, currentUser]);

  // Appointments for this patient
  const myAppointments = useMemo(() => {
    return appointments.filter(
      (a) => (a.patient || "").toLowerCase() === patientName.toLowerCase()
    );
  }, [appointments, patientName]);

  const upcomingCount = myAppointments.filter(
    (a) => a.status === "Pending" || a.status === "Confirmed"
  ).length;

  const completedCount = myAppointments.filter(
    (a) => a.status === "Completed"
  ).length;

  return (
    <div className="patient-portal-container">
      {/* Patient Hero Banner */}
      <div className="patient-portal-hero">
        <div className="patient-hero-left">
          <span className="patient-hero-avatar">👤</span>
          <div>
            <div className="patient-badge">PATIENT HEALTH PORTAL</div>
            <h1>Welcome, {patientRecord.name}</h1>
            <p className="patient-meta-subtitle">
              Mobile: {patientRecord.phone} • Blood Group:{" "}
              <strong>{patientRecord.bloodGroup}</strong> • Age: {patientRecord.age} yrs
            </p>
          </div>
        </div>

        <div className="patient-hero-actions">
          <Link
            to="/appointments/new"
            state={{ preselectedPatient: patientRecord.name }}
            className="patient-action-btn"
          >
            <span>➕ Book New Consultation</span>
          </Link>
          <button type="button" className="patient-logout-btn" onClick={onLogoutClick}>
            <span>🚪 Sign Out</span>
          </button>
        </div>
      </div>

      {/* Patient Vitals & Stat Cards */}
      <div className="two-col-grid" style={{ marginBottom: "24px" }}>
        {/* Personal Vitals Card */}
        <div className="info-card">
          <div className="info-card-icon">🩺</div>
          <h3>My Clinical Profile & Allergies</h3>
          <div className="patient-profile-details">
            <div className="doc-detail-item">
              <span className="doc-detail-label">Full Name:</span>
              <span className="doc-detail-val">{patientRecord.name}</span>
            </div>
            <div className="doc-detail-item">
              <span className="doc-detail-label">Contact Phone:</span>
              <span className="doc-detail-val">{patientRecord.phone}</span>
            </div>
            <div className="doc-detail-item">
              <span className="doc-detail-label">Blood Group:</span>
              <span className="doc-detail-val blood-badge">{patientRecord.bloodGroup}</span>
            </div>
            <div className="doc-detail-item">
              <span className="doc-detail-label">Address:</span>
              <span className="doc-detail-val">{patientRecord.address}</span>
            </div>
            <div className="doc-detail-item" style={{ marginTop: "8px" }}>
              <span className="doc-detail-label">Documented Conditions / Allergies:</span>
              <span className="doc-detail-val notes-text">
                {patientRecord.medicalNotes || "None documented"}
              </span>
            </div>
          </div>
        </div>

        {/* Appointment Status Summary */}
        <div className="info-card">
          <div className="info-card-icon">📅</div>
          <h3>Consultation Activity Summary</h3>
          <div className="patient-stats-summary-grid">
            <div className="patient-summary-box">
              <span className="stat-big-num">{myAppointments.length}</span>
              <span className="stat-big-label">Total Bookings</span>
            </div>
            <div className="patient-summary-box box-upcoming">
              <span className="stat-big-num">{upcomingCount}</span>
              <span className="stat-big-label">Upcoming / Active</span>
            </div>
            <div className="patient-summary-box box-completed">
              <span className="stat-big-num">{completedCount}</span>
              <span className="stat-big-label">Completed Visits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Appointments Table */}
      <section className="appointment-section">
        <div className="section-header">
          <div>
            <h2>My Scheduled Appointments</h2>
            <p>Track your medical consultations and OPD session status</p>
          </div>
          <Link
            to="/appointments/new"
            state={{ preselectedPatient: patientRecord.name }}
            className="view-button"
          >
            + Book Appointment
          </Link>
        </div>

        {myAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointments found for your profile.</h3>
            <p>Schedule your first hospital consultation with our specialized medical team.</p>
            <Link
              to="/appointments/new"
              state={{ preselectedPatient: patientRecord.name }}
              className="primary-button"
            >
              Book Consultation Now
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Attending Doctor</th>
                  <th>Department / Reason</th>
                  <th>Scheduled Date</th>
                  <th>Time Slot</th>
                  <th>Status</th>
                  <th>Instructions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myAppointments.map((apt) => (
                  <tr key={apt.id || apt.doctor + apt.date}>
                    <td>
                      <strong>{apt.doctor}</strong>
                    </td>
                    <td>
                      <span className="dept-tag">{apt.reason || apt.department || "OPD Checkup"}</span>
                    </td>
                    <td>{apt.date}</td>
                    <td>{apt.time}</td>
                    <td>
                      <span
                        className={`status ${
                          apt.status === "Pending"
                            ? "pending"
                            : apt.status === "Confirmed"
                            ? "confirmed"
                            : apt.status === "Rejected" || apt.status === "Cancelled"
                            ? "rejected"
                            : "completed"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td>
                      <small className="patient-instruction-text">
                        {apt.status === "Pending"
                          ? "Awaiting receptionist/doctor confirmation."
                          : apt.status === "Confirmed"
                          ? "Confirmed: Please arrive 15 minutes before slot."
                          : apt.status === "Rejected" || apt.status === "Cancelled"
                          ? "Slot declined/cancelled. Please reschedule another slot."
                          : "Completed: Prescription on file."}
                      </small>
                    </td>
                    <td>
                      {(apt.status === "Pending" || apt.status === "Confirmed") ? (
                        <button
                          type="button"
                          className="reject-button"
                          onClick={() => updateAppointmentStatus(apt.id, "Cancelled")}
                        >
                          Cancel Visit
                        </button>
                      ) : (
                        <span className="sub-cell-text">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Patient;
