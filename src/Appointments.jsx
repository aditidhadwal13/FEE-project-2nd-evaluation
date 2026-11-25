import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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

function Appointments({
  appointments: propAppointments,
  deleteAppointment: propDeleteAppointment,
  updateAppointmentStatus: propUpdateAppointmentStatus
}) {
  const context = useHospital();
  const appointments = propAppointments !== undefined ? propAppointments : context.appointments;
  const deleteAppointment = propDeleteAppointment || context.deleteAppointment;
  const updateAppointmentStatus = propUpdateAppointmentStatus || context.updateAppointmentStatus;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  // Status counts for tabs
  const pendingCount = appointments.filter((a) => a.status === "Pending").length;
  const confirmedCount = appointments.filter((a) => a.status === "Confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;
  const rejectedCount = appointments.filter(
    (a) => a.status === "Rejected" || a.status === "Cancelled"
  ).length;

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (apt.patient || "").toLowerCase().includes(term) ||
        (apt.doctor || "").toLowerCase().includes(term) ||
        (apt.reason || "").toLowerCase().includes(term) ||
        (apt.department || "").toLowerCase().includes(term) ||
        (apt.date || "").includes(term);

      let matchesStatus = true;
      if (statusFilter === "rejected") {
        matchesStatus = apt.status === "Rejected" || apt.status === "Cancelled";
      } else if (statusFilter !== "all") {
        matchesStatus = (apt.status || "").toLowerCase() === statusFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  function promptDelete(apt, index) {
    setAppointmentToDelete({ apt, index });
  }

  function confirmDelete() {
    if (appointmentToDelete) {
      deleteAppointment(appointmentToDelete.apt.id || appointmentToDelete.index);
      setAppointmentToDelete(null);
    }
  }

  return (
    <div className="appointments-management-container">
      <div className="section-header-row">
        <div>
          <h1>Appointments</h1>
          <p>All booked appointments and clinical schedules are shown below.</p>
        </div>
        <Link to="/appointments/new" className="primary-action-btn">
          <span>➕ Book New Appointment</span>
        </Link>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="appointments-filter-bar">
        <div className="status-tabs" role="tablist">
          <button
            type="button"
            className={`tab-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Appointments ({appointments.length})
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

        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by patient, doctor, date, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field"
            aria-label="Search appointments"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Empty State */}
      {appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No appointments booked yet.</h3>
          <p>Schedule your first consultation with an attending hospital doctor.</p>
          <Link to="/appointments/new" className="primary-button">
            Book Appointment
          </Link>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No appointments match your search or filter.</h3>
          <p>Try searching with another keyword or change your status tab filter.</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
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
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason / Specialty</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.map((appointment, index) => {
                const targetKey = appointment.id || index;
                const badgeClass = getStatusBadgeClass(appointment.status);

                return (
                  <tr key={targetKey}>
                    <td>
                      <strong>{appointment.patient}</strong>
                    </td>

                    <td>{appointment.doctor}</td>

                    <td>{appointment.date}</td>

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
                                updateAppointmentStatus(targetKey, "Confirmed")
                              }
                              title="Confirm appointment"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              className="reject-button"
                              onClick={() =>
                                updateAppointmentStatus(targetKey, "Rejected")
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
                                updateAppointmentStatus(targetKey, "Completed")
                              }
                              title="Mark as completed"
                            >
                              Complete
                            </button>
                            <button
                              type="button"
                              className="reject-button"
                              onClick={() =>
                                updateAppointmentStatus(targetKey, "Rejected")
                              }
                              title="Reject appointment"
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
                              updateAppointmentStatus(targetKey, "Confirmed")
                            }
                            title="Re-confirm appointment"
                          >
                            Re-Confirm
                          </button>
                        )}

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => promptDelete(appointment, index)}
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(appointmentToDelete)}
        title="Delete Appointment"
        message={`Are you sure you want to delete the appointment for ${appointmentToDelete?.apt?.patient} with ${appointmentToDelete?.apt?.doctor} on ${appointmentToDelete?.apt?.date}?`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setAppointmentToDelete(null)}
      />
    </div>
  );
}

export default Appointments;
