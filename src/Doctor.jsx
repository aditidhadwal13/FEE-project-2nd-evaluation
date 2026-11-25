import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHospital } from "./context/HospitalContext";
import ConfirmModal from "./components/ConfirmModal";

function getStatusBadgeClass(status) {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "pending";
    case "confirmed":
      return "confirmed";
    case "rejected":
    case "cancelled":
      return "rejected";
    case "completed":
    default:
      return "completed";
  }
}

function Doctor({ logout: propLogout }) {
  const navigate = useNavigate();
  const {
    currentUser,
    logout: contextLogout,
    appointments,
    updateAppointmentStatus,
    patients,
    doctors
  } = useHospital();

  const onLogoutClick = () => {
    if (propLogout) {
      propLogout();
    } else if (contextLogout) {
      contextLogout();
      navigate("/login");
    }
  };

  // Active doctor name from login session
  const doctorName = currentUser?.role === "Doctor" ? currentUser.name : "Dr. Mehta";
  const matchedDoc = doctors.find(
    (d) =>
      (d.name || "").toLowerCase() === doctorName.toLowerCase() ||
      (d.fullName || "").toLowerCase() === doctorName.toLowerCase()
  );
  const doctorSpecialty = currentUser?.specialty || matchedDoc?.specialty || "Specialist Physician";

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [aptToComplete, setAptToComplete] = useState(null);
  const [aptToReject, setAptToReject] = useState(null);

  // Appointments assigned exclusively to this doctor
  const doctorAppointments = useMemo(() => {
    const targetName = doctorName.toLowerCase();
    const targetFull = (matchedDoc?.fullName || "").toLowerCase();
    return appointments.filter((a) => {
      const aptDoc = (a.doctor || "").toLowerCase();
      return aptDoc === targetName || (targetFull && aptDoc === targetFull);
    });
  }, [appointments, doctorName, matchedDoc]);

  // Status statistics for this doctor
  const pendingCount = doctorAppointments.filter((a) => a.status === "Pending").length;
  const confirmedCount = doctorAppointments.filter((a) => a.status === "Confirmed").length;
  const completedCount = doctorAppointments.filter((a) => a.status === "Completed").length;
  const rejectedCount = doctorAppointments.filter(
    (a) => a.status === "Rejected" || a.status === "Cancelled"
  ).length;

  // Filtered view
  const filteredAppointments = useMemo(() => {
    return doctorAppointments.filter((apt) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (apt.patient || "").toLowerCase().includes(term) ||
        (apt.reason || "").toLowerCase().includes(term) ||
        (apt.date || "").includes(term);

      let matchesStatus = true;
      if (statusFilter === "rejected") {
        matchesStatus = apt.status === "Rejected" || apt.status === "Cancelled";
      } else if (statusFilter !== "all") {
        matchesStatus = (apt.status || "").toLowerCase() === statusFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus;
    });
  }, [doctorAppointments, searchTerm, statusFilter]);

  function getPatientDetails(patientName) {
    return patients.find(
      (p) => (p.name || "").toLowerCase() === (patientName || "").toLowerCase()
    );
  }

  return (
    <div className="doctor-portal-container">
      {/* Doctor Identity Header */}
      <div className="doctor-portal-hero">
        <div className="doctor-hero-left">
          <span className="doctor-hero-avatar">🩺</span>
          <div>
            <div className="doctor-badge">ATTENDING PHYSICIAN DESK</div>
            <h1>{doctorName}</h1>
            <p className="doctor-spec-subtitle">
              Department of {doctorSpecialty} • OPD Clinical Queue
            </p>
          </div>
        </div>

        <div className="doctor-hero-actions">
          <Link
            to="/appointments/new"
            state={{ preselectedDoctor: doctorName }}
            className="doctor-action-btn"
          >
            <span>➕ Schedule OPD Slot</span>
          </Link>
          <button type="button" className="doctor-logout-btn" onClick={onLogoutClick}>
            <span>🚪 Sign Out</span>
          </button>
        </div>
      </div>

      {/* Doctor Summary Counters */}
      <div className="cards doctor-stats-cards">
        <div className="card">
          <div className="card-icon">👥</div>
          <div>
            <h3>{doctorAppointments.length}</h3>
            <p>Total Assigned</p>
            <small className="card-meta">All-time patients</small>
          </div>
        </div>

        <div className="card card-pending">
          <div className="card-icon">⏳</div>
          <div>
            <h3>{pendingCount}</h3>
            <p>Pending Consultations</p>
            <small className="card-meta">Awaiting confirmation</small>
          </div>
        </div>

        <div className="card card-confirmed">
          <div className="card-icon">📋</div>
          <div>
            <h3>{confirmedCount}</h3>
            <p>Confirmed Queue</p>
            <small className="card-meta">Ready for OPD visit</small>
          </div>
        </div>

        <div className="card card-completed">
          <div className="card-icon">✅</div>
          <div>
            <h3>{completedCount}</h3>
            <p>Completed</p>
            <small className="card-meta">Discharged / Prescribed</small>
          </div>
        </div>

        <div className="card card-rejected">
          <div className="card-icon">❌</div>
          <div>
            <h3>{rejectedCount}</h3>
            <p>Rejected</p>
            <small className="card-meta">Declined / Cancelled</small>
          </div>
        </div>
      </div>

      {/* Doctor Patient Queue Table */}
      <section className="appointment-section">
        <div className="section-header">
          <div>
            <h2>My Patient Consultation Queue</h2>
            <p>Appointments scheduled exclusively under {doctorName}</p>
          </div>

          <div className="doctor-filter-tabs">
            <button
              type="button"
              className={`tab-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All ({doctorAppointments.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${statusFilter === "pending" ? "active" : ""}`}
              onClick={() => setStatusFilter("pending")}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              className={`tab-btn ${statusFilter === "confirmed" ? "active" : ""}`}
              onClick={() => setStatusFilter("confirmed")}
            >
              Confirmed ({confirmedCount})
            </button>
            <button
              type="button"
              className={`tab-btn ${statusFilter === "completed" ? "active" : ""}`}
              onClick={() => setStatusFilter("completed")}
            >
              Completed ({completedCount})
            </button>
            <button
              type="button"
              className={`tab-btn ${statusFilter === "rejected" ? "active" : ""}`}
              onClick={() => setStatusFilter("rejected")}
            >
              Rejected ({rejectedCount})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-input-group" style={{ marginBottom: "18px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search my patients by name, symptoms, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
            >
              ×
            </button>
          )}
        </div>

        {/* Table or Empty State */}
        {doctorAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🩺</div>
            <h3>No appointments assigned yet.</h3>
            <p>New patient appointments booked for {doctorName} will appear here.</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No appointments match your filter.</h3>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setStatusFilter("all");
                setSearchTerm("");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Date & Time</th>
                  <th>Chief Complaint / Reason</th>
                  <th>Medical Vitals / History</th>
                  <th>Status</th>
                  <th>Clinical Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => {
                  const pat = getPatientDetails(apt.patient);
                  const badgeClass = getStatusBadgeClass(apt.status);

                  return (
                    <tr key={apt.id || apt.patient + apt.time}>
                      <td>
                        <strong>{apt.patient}</strong>
                        {pat && (
                          <span className="sub-cell-text">
                            Age: {pat.age} yrs • Blood: {pat.bloodGroup || "O+"} • Tel: {pat.phone}
                          </span>
                        )}
                      </td>
                      <td>
                        <strong>{apt.date}</strong>
                        <span className="sub-cell-text">Slot: {apt.time}</span>
                      </td>
                      <td>
                        <span className="dept-tag">
                          {apt.reason || "General Consultation"}
                        </span>
                      </td>
                      <td>
                        <small className="notes-text">
                          {pat?.medicalNotes || "No previous history logged"}
                        </small>
                      </td>
                      <td>
                        <span className={`status ${badgeClass}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {apt.status === "Pending" && (
                            <>
                              <button
                                type="button"
                                className="edit-button"
                                onClick={() => updateAppointmentStatus(apt.id, "Confirmed")}
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                className="reject-button"
                                onClick={() => setAptToReject(apt)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {apt.status === "Confirmed" && (
                            <>
                              <button
                                type="button"
                                className="edit-button complete-btn"
                                onClick={() => setAptToComplete(apt)}
                              >
                                Mark Completed
                              </button>
                              <button
                                type="button"
                                className="reject-button"
                                onClick={() => setAptToReject(apt)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(apt.status === "Rejected" || apt.status === "Cancelled") && (
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() => updateAppointmentStatus(apt.id, "Confirmed")}
                            >
                              Re-Confirm
                            </button>
                          )}
                          {apt.status === "Completed" && (
                            <span className="completed-check-tag">✅ Prescribed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Complete Consultation Modal */}
      <ConfirmModal
        isOpen={Boolean(aptToComplete)}
        title="Complete Clinical Consultation"
        message={`Mark consultation for patient ${aptToComplete?.patient} as Completed and finalize clinical documentation?`}
        confirmText="Complete & Prescribe"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={() => {
          if (aptToComplete) {
            updateAppointmentStatus(aptToComplete.id, "Completed");
            setAptToComplete(null);
          }
        }}
        onCancel={() => setAptToComplete(null)}
      />

      {/* Reject Consultation Modal */}
      <ConfirmModal
        isOpen={Boolean(aptToReject)}
        title="Reject Appointment Request"
        message={`Are you sure you want to reject the appointment for ${aptToReject?.patient} on ${aptToReject?.date} at ${aptToReject?.time}? This status update will be visible on the Hospital Dashboard and Patient Portal.`}
        confirmText="Reject Appointment"
        cancelText="Keep Appointment"
        isDestructive={true}
        onConfirm={() => {
          if (aptToReject) {
            updateAppointmentStatus(aptToReject.id, "Rejected");
            setAptToReject(null);
          }
        }}
        onCancel={() => setAptToReject(null)}
      />
    </div>
  );
}

export default Doctor;
