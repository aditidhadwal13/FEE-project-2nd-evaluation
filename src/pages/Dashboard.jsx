import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useHospital } from "../context/HospitalContext";
import ConfirmModal from "../components/ConfirmModal";

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

function Dashboard() {
  const {
    appointments,
    stats,
    updateAppointmentStatus,
    deleteAppointment
  } = useHospital();

  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  // Filtered appointments for dashboard display
  const filteredAppointments = useMemo(() => {
    if (statusFilter === "all") return appointments;
    if (statusFilter === "rejected") {
      return appointments.filter(
        (a) => a.status === "Rejected" || a.status === "Cancelled"
      );
    }
    return appointments.filter(
      (a) => (a.status || "").toLowerCase() === statusFilter.toLowerCase()
    );
  }, [appointments, statusFilter]);

  const handleDeleteClick = (apt) => {
    setAppointmentToDelete(apt);
  };

  const handleConfirmDelete = () => {
    if (appointmentToDelete) {
      deleteAppointment(appointmentToDelete.id);
      setAppointmentToDelete(null);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Quick Action Navigation Buttons */}
      <section className="quick-actions-bar">
        <Link to="/patients/new" className="quick-btn btn-register">
          <span className="btn-icon">➕</span>
          <span>Register New Patient</span>
        </Link>
        <Link to="/appointments/new" className="quick-btn btn-book">
          <span className="btn-icon">📅</span>
          <span>Book Appointment</span>
        </Link>
        <Link to="/patients" className="quick-btn btn-neutral">
          <span className="btn-icon">👥</span>
          <span>Manage Patients</span>
        </Link>
        <Link to="/doctors" className="quick-btn btn-neutral">
          <span className="btn-icon">🩺</span>
          <span>Doctor Directory</span>
        </Link>
      </section>

      {/* Hospital Metrics Cards Grid */}
      <section className="cards">
        {/* Total Patients */}
        <div className="card">
          <div className="card-icon">👥</div>
          <div>
            <h3>{stats.totalPatients}</h3>
            <p>Total Patients</p>
            <small className="card-meta">Registered in system</small>
          </div>
        </div>

        {/* Total Doctors */}
        <div className="card">
          <div className="card-icon">🩺</div>
          <div>
            <h3>{stats.totalDoctors}</h3>
            <p>Total Doctors</p>
            <small className="card-meta">Active OPD specialists</small>
          </div>
        </div>

        {/* Total Appointments */}
        <div className="card">
          <div className="card-icon">📅</div>
          <div>
            <h3>{stats.totalAppointments}</h3>
            <p>Total Appointments</p>
            <small className="card-meta">All-time bookings</small>
          </div>
        </div>

        {/* Pending Appointments */}
        <div className="card card-pending">
          <div className="card-icon">⏳</div>
          <div>
            <h3>{stats.pendingAppointments}</h3>
            <p>Pending</p>
            <small className="card-meta">Awaiting confirmation</small>
          </div>
        </div>

        {/* Confirmed Appointments */}
        <div className="card card-confirmed">
          <div className="card-icon">📋</div>
          <div>
            <h3>{stats.confirmedAppointments}</h3>
            <p>Confirmed</p>
            <small className="card-meta">Scheduled for visit</small>
          </div>
        </div>

        {/* Completed / Rejected Summary */}
        <div className="card card-completed">
          <div className="card-icon">✅</div>
          <div>
            <h3>{stats.completedAppointments}</h3>
            <p>Completed</p>
            <small className="card-meta">
              {stats.rejectedAppointments > 0
                ? `${stats.rejectedAppointments} Rejected`
                : "Successfully treated"}
            </small>
          </div>
        </div>
      </section>

      {/* Recent & All Appointments Section */}
      <section className="appointment-section">
        <div className="section-header">
          <div>
            <h2>Hospital Appointments & Status Workflow</h2>
            <p>Track and manage live appointment confirmation statuses across all departments</p>
          </div>
          <div className="header-actions" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div className="doctor-filter-tabs">
              <button
                type="button"
                className={`tab-btn ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All ({appointments.length})
              </button>
              <button
                type="button"
                className={`tab-btn ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending ({stats.pendingAppointments})
              </button>
              <button
                type="button"
                className={`tab-btn ${statusFilter === "confirmed" ? "active" : ""}`}
                onClick={() => setStatusFilter("confirmed")}
              >
                Confirmed ({stats.confirmedAppointments})
              </button>
              <button
                type="button"
                className={`tab-btn ${statusFilter === "completed" ? "active" : ""}`}
                onClick={() => setStatusFilter("completed")}
              >
                Completed ({stats.completedAppointments})
              </button>
              <button
                type="button"
                className={`tab-btn ${statusFilter === "rejected" ? "active" : ""}`}
                onClick={() => setStatusFilter("rejected")}
              >
                Rejected ({stats.rejectedAppointments || 0})
              </button>
            </div>
            <Link to="/appointments" className="view-button">
              Full Queue ({appointments.length})
            </Link>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No appointments booked yet.</h3>
            <p>Get started by booking your first patient consultation.</p>
            <Link to="/appointments/new" className="primary-button">
              Book Appointment Now
            </Link>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No appointments with status "{statusFilter}".</h3>
            <p>Switch to "All" to view appointments in other workflow stages.</p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setStatusFilter("all")}
            >
              Show All Appointments
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason / Dept</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => {
                  const badgeClass = getStatusBadgeClass(appointment.status);
                  return (
                    <tr key={appointment.id || appointment.patient + appointment.time}>
                      <td>
                        <strong>{appointment.patient}</strong>
                      </td>
                      <td>{appointment.doctor}</td>
                      <td>
                        {appointment.date}
                        {appointment.date === todayStr && (
                          <span className="badge-today">Today</span>
                        )}
                      </td>
                      <td>{appointment.time}</td>
                      <td>
                        <span className="dept-tag">
                          {appointment.reason || appointment.department || "Consultation"}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${badgeClass}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {appointment.status === "Pending" && (
                            <>
                              <button
                                type="button"
                                className="edit-button"
                                onClick={() =>
                                  updateAppointmentStatus(appointment.id, "Confirmed")
                                }
                                title="Confirm appointment"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                className="reject-button"
                                onClick={() =>
                                  updateAppointmentStatus(appointment.id, "Rejected")
                                }
                                title="Reject appointment"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {appointment.status === "Confirmed" && (
                            <>
                              <button
                                type="button"
                                className="edit-button complete-btn"
                                onClick={() =>
                                  updateAppointmentStatus(appointment.id, "Completed")
                                }
                                title="Mark as completed"
                              >
                                Complete
                              </button>
                              <button
                                type="button"
                                className="reject-button"
                                onClick={() =>
                                  updateAppointmentStatus(appointment.id, "Rejected")
                                }
                                title="Reject / Cancel appointment"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(appointment.status === "Rejected" || appointment.status === "Cancelled") && (
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                updateAppointmentStatus(appointment.id, "Confirmed")
                              }
                              title="Re-confirm appointment"
                            >
                              Re-Confirm
                            </button>
                          )}
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => handleDeleteClick(appointment)}
                            title="Delete appointment"
                          >
                            Delete
                          </button>
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(appointmentToDelete)}
        title="Cancel & Delete Appointment"
        message={`Are you sure you want to delete the appointment for ${appointmentToDelete?.patient} with ${appointmentToDelete?.doctor} on ${appointmentToDelete?.date}?`}
        confirmText="Delete Appointment"
        cancelText="Keep Appointment"
        onConfirm={handleConfirmDelete}
        onCancel={() => setAppointmentToDelete(null)}
      />
    </div>
  );
}

export default Dashboard;
