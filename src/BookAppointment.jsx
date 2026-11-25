import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useHospital } from "./context/HospitalContext";

const QUICK_TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "14:00",
  "14:30",
  "15:00",
  "16:00",
  "17:00"
];

const EMPTY_LIST = [];

function BookAppointment({
  patients: propPatients,
  addAppointment: propAddAppointment
}) {
  const location = useLocation();
  const context = useHospital();

  const patients = propPatients !== undefined ? propPatients : context?.patients || EMPTY_LIST;
  const appointments = context?.appointments || EMPTY_LIST;
  const doctors = context?.doctors || [
    { name: "Dr. Mehta", specialty: "Cardiology" },
    { name: "Dr. Singh", specialty: "Neurology" },
    { name: "Dr. Kapoor", specialty: "Pediatrics" }
  ];
  const addAppointmentAsync = context?.addAppointmentAsync;
  const directAddAppointment = propAddAppointment || context?.addAppointment;

  // Form State
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  // Check if a preselected patient or doctor was passed via navigation state
  useEffect(() => {
    if (location.state?.preselectedPatient) {
      setPatient(location.state.preselectedPatient);
    }
    if (location.state?.preselectedDoctor) {
      setDoctor(location.state.preselectedDoctor);
    }
  }, [location.state]);

  // Validation & UI State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lastBookedAppointment, setLastBookedAppointment] = useState(null);

  // Today's date string YYYY-MM-DD for min date attribute
  const todayStr = new Date().toISOString().split("T")[0];

  // Booked slots for selected doctor and date
  const bookedTimesForDocAndDate = useMemo(() => {
    if (!doctor || !date) return new Set();
    return new Set(
      appointments
        .filter(
          (a) =>
            a.doctor === doctor &&
            a.date === date &&
            a.status !== "Cancelled" &&
            a.status !== "Rejected"
        )
        .map((a) => a.time)
    );
  }, [appointments, doctor, date]);

  function validateField(fieldName, value) {
    let error = "";
    switch (fieldName) {
      case "patient":
        if (!value || value === "") {
          error = "Please select a registered patient.";
        }
        break;

      case "doctor":
        if (!value || value === "") {
          error = "Please choose an attending doctor.";
        }
        break;

      case "date":
        if (!value) {
          error = "Appointment date is required.";
        } else if (value < todayStr) {
          error = "Appointment date cannot be in the past. Please select today or a future date.";
        }
        break;

      case "time":
        if (!value) {
          error = "Appointment time slot is required.";
        } else if (bookedTimesForDocAndDate.has(value)) {
          error = `${doctor} is already booked at ${value} on ${date}. Please choose another slot.`;
        }
        break;

      case "reason":
        if (!value || !value.trim()) {
          error = "Please specify a brief reason for the appointment.";
        } else if (value.trim().length < 3) {
          error = "Reason must be at least 3 characters long.";
        }
        break;

      default:
        break;
    }
    return error;
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const valueMap = { patient, doctor, date, time, reason };
    const err = validateField(field, valueMap[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }

  function validateEntireForm() {
    const newErrors = {
      patient: validateField("patient", patient),
      doctor: validateField("doctor", doctor),
      date: validateField("date", date),
      time: validateField("time", time),
      reason: validateField("reason", reason)
    };

    const activeErrors = Object.entries(newErrors).reduce((acc, [k, v]) => {
      if (v) acc[k] = v;
      return acc;
    }, {});

    setErrors(activeErrors);
    setTouched({
      patient: true,
      doctor: true,
      date: true,
      time: true,
      reason: true
    });

    return Object.keys(activeErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (!validateEntireForm()) {
      return;
    }

    const selectedDocObj = doctors.find((d) => d.name === doctor);
    const appointmentData = {
      patient,
      doctor,
      department: selectedDocObj?.specialty || "General Consultation",
      date,
      time,
      reason: reason.trim(),
      status: "Pending"
    };

    setIsSubmitting(true);

    try {
      if (addAppointmentAsync) {
        const result = await addAppointmentAsync(appointmentData);
        if (result.success) {
          setLastBookedAppointment(result.appointment);
          setPatient("");
          setDoctor("");
          setDate("");
          setTime("");
          setReason("");
          setErrors({});
          setTouched({});
        } else {
          setSubmitError(result.error || "Failed to book appointment.");
        }
      } else if (directAddAppointment) {
        directAddAppointment(appointmentData);
        setLastBookedAppointment(appointmentData);
        setPatient("");
        setDoctor("");
        setDate("");
        setTime("");
        setReason("");
      }
    } catch (err) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="book-appointment-container">
      <div className="section-header-row">
        <div>
          <h1>Book Appointment</h1>
          <p>Schedule a patient consultation with an attending medical specialist.</p>
        </div>
        <Link to="/appointments" className="secondary-action-btn">
          <span>📅 View All Appointments ({appointments.length})</span>
        </Link>
      </div>

      {/* Success Notification Banner */}
      {lastBookedAppointment && (
        <div className="alert-banner alert-success" role="alert">
          <div className="alert-content">
            <strong>✅ Appointment Scheduled Successfully!</strong>
            <p>
              Consultation booked for <strong>{lastBookedAppointment.patient}</strong> with{" "}
              <strong>{lastBookedAppointment.doctor}</strong> ({lastBookedAppointment.department}) on{" "}
              <strong>{lastBookedAppointment.date}</strong> at{" "}
              <strong>{lastBookedAppointment.time}</strong>. Initial Status:{" "}
              <span className="status pending" style={{ marginLeft: "4px" }}>
                {lastBookedAppointment.status || "Pending"}
              </span>
            </p>
          </div>
          <div className="alert-actions">
            <Link to="/dashboard" className="alert-btn">
              📊 View on Dashboard
            </Link>
            <Link to="/appointments" className="alert-btn" style={{ background: "#1e40af" }}>
              📅 Manage Appointments
            </Link>
            <button
              type="button"
              className="alert-dismiss"
              onClick={() => setLastBookedAppointment(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Submission Error Banner */}
      {submitError && (
        <div className="alert-banner alert-error" role="alert">
          <div className="alert-content">
            <strong>⚠️ Scheduling Conflict or Error:</strong>
            <p>{submitError}</p>
            <small>Your entered details are preserved below. Please pick another time slot or physician.</small>
          </div>
          <div className="alert-actions">
            <button
              type="button"
              className="alert-dismiss"
              onClick={() => setSubmitError("")}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Patient count alert if no registered patients */}
      {patients.length === 0 && (
        <div className="alert-banner alert-warning" role="alert">
          <div>
            <strong>⚠️ No Registered Patients Found:</strong>
            <p>
              You must register a patient first before scheduling an appointment.
            </p>
          </div>
          <Link to="/patients/new" className="alert-btn">
            ➕ Register Patient Now
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="hospital-form">
        <div className="form-legend">
          <h3>Consultation Booking Details</h3>
          <span>* All fields are required</span>
        </div>

        {/* Patient and Doctor Selection */}
        <div className="form-grid-two">
          <div className="form-field-group">
            <label htmlFor="appointment-patient">
              Select Patient <span className="req">*</span>
            </label>
            <select
              id="appointment-patient"
              value={patient}
              onChange={(e) => {
                setPatient(e.target.value);
                if (touched.patient) {
                  setErrors((prev) => ({
                    ...prev,
                    patient: validateField("patient", e.target.value)
                  }));
                }
              }}
              onBlur={() => handleBlur("patient")}
              aria-invalid={Boolean(errors.patient)}
              aria-describedby={errors.patient ? "patient-select-error" : undefined}
              className={errors.patient ? "input-error" : ""}
              disabled={isSubmitting}
              required
            >
              <option value="">-- Choose Registered Patient --</option>
              {patients.map((p, index) => (
                <option key={p.id || index} value={p.name}>
                  {p.name} {p.phone ? `(${p.phone})` : ""}
                </option>
              ))}
            </select>
            {errors.patient && (
              <span id="patient-select-error" className="field-error-msg" role="alert">
                {errors.patient}
              </span>
            )}
            {patients.length > 0 && (
              <small className="field-hint">
                Don't see the patient?{" "}
                <Link to="/patients/new">Register a new patient</Link>
              </small>
            )}
          </div>

          <div className="form-field-group">
            <label htmlFor="appointment-doctor">
              Attending Doctor <span className="req">*</span>
            </label>
            <select
              id="appointment-doctor"
              value={doctor}
              onChange={(e) => {
                setDoctor(e.target.value);
                if (touched.doctor) {
                  setErrors((prev) => ({
                    ...prev,
                    doctor: validateField("doctor", e.target.value)
                  }));
                }
              }}
              onBlur={() => handleBlur("doctor")}
              aria-invalid={Boolean(errors.doctor)}
              aria-describedby={errors.doctor ? "doctor-select-error" : undefined}
              className={errors.doctor ? "input-error" : ""}
              disabled={isSubmitting}
              required
            >
              <option value="">-- Select Doctor & Specialty --</option>
              {doctors.map((d, index) => (
                <option key={d.id || index} value={d.name}>
                  {d.name} {d.specialty ? `— ${d.specialty}` : ""}
                </option>
              ))}
            </select>
            {errors.doctor && (
              <span id="doctor-select-error" className="field-error-msg" role="alert">
                {errors.doctor}
              </span>
            )}
          </div>
        </div>

        {/* Date and Time Pickers */}
        <div className="form-grid-two">
          <div className="form-field-group">
            <label htmlFor="appointment-date">
              Appointment Date <span className="req">*</span>
            </label>
            <input
              id="appointment-date"
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (touched.date) {
                  setErrors((prev) => ({
                    ...prev,
                    date: validateField("date", e.target.value)
                  }));
                }
              }}
              onBlur={() => handleBlur("date")}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? "date-error" : undefined}
              className={errors.date ? "input-error" : ""}
              disabled={isSubmitting}
              required
            />
            {errors.date && (
              <span id="date-error" className="field-error-msg" role="alert">
                {errors.date}
              </span>
            )}
            <small className="field-hint">Must be today or a future date</small>
          </div>

          <div className="form-field-group">
            <label htmlFor="appointment-time">
              Consultation Time Slot <span className="req">*</span>
            </label>
            <input
              id="appointment-time"
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                if (touched.time) {
                  setErrors((prev) => ({
                    ...prev,
                    time: validateField("time", e.target.value)
                  }));
                }
              }}
              onBlur={() => handleBlur("time")}
              aria-invalid={Boolean(errors.time)}
              aria-describedby={errors.time ? "time-error" : undefined}
              className={errors.time ? "input-error" : ""}
              disabled={isSubmitting}
              required
            />
            {errors.time && (
              <span id="time-error" className="field-error-msg" role="alert">
                {errors.time}
              </span>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
              {QUICK_TIME_SLOTS.map((slot) => {
                const isBooked = bookedTimesForDocAndDate.has(slot);
                const isSelected = time === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked || isSubmitting}
                    onClick={() => {
                      setTime(slot);
                      if (touched.time) {
                        setErrors((prev) => ({ ...prev, time: "" }));
                      }
                    }}
                    style={{
                      padding: "4px 9px",
                      fontSize: "11px",
                      fontWeight: 600,
                      borderRadius: "6px",
                      border: isSelected
                        ? "1px solid #2563eb"
                        : isBooked
                        ? "1px solid #fecaca"
                        : "1px solid #cbd5e1",
                      background: isSelected
                        ? "#2563eb"
                        : isBooked
                        ? "#fef2f2"
                        : "#f8fafc",
                      color: isSelected
                        ? "#ffffff"
                        : isBooked
                        ? "#991b1b"
                        : "#334155",
                      cursor: isBooked ? "not-allowed" : "pointer",
                      textDecoration: isBooked ? "line-through" : "none"
                    }}
                    title={isBooked ? "Already booked for this doctor/date" : `Select ${slot}`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            <small className="field-hint">
              Click a quick slot above or enter custom OPD time (08:30 AM to 06:00 PM)
            </small>
          </div>
        </div>

        {/* Reason for Appointment */}
        <div className="form-field-group">
          <label htmlFor="appointment-reason">
            Reason for Appointment / Chief Complaint <span className="req">*</span>
          </label>
          <input
            id="appointment-reason"
            type="text"
            placeholder="e.g., Routine cardiac review, severe headache, seasonal checkup..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (touched.reason) {
                setErrors((prev) => ({
                  ...prev,
                  reason: validateField("reason", e.target.value)
                }));
              }
            }}
            onBlur={() => handleBlur("reason")}
            aria-invalid={Boolean(errors.reason)}
            aria-describedby={errors.reason ? "reason-error" : undefined}
            className={errors.reason ? "input-error" : ""}
            disabled={isSubmitting}
            required
          />
          {errors.reason && (
            <span id="reason-error" className="field-error-msg" role="alert">
              {errors.reason}
            </span>
          )}
        </div>

        {/* Submit Actions */}
        <div className="form-submit-row">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || patients.length === 0}
          >
            {isSubmitting ? (
              <span className="button-loader">
                <span className="spinner"></span>
                <span>Scheduling Appointment...</span>
              </span>
            ) : (
              <span>Book Appointment</span>
            )}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setPatient("");
              setDoctor("");
              setDate("");
              setTime("");
              setReason("");
              setErrors({});
              setTouched({});
              setSubmitError("");
            }}
            disabled={isSubmitting}
          >
            Reset Form
          </button>
        </div>
      </form>

      {/* Live Preview Table of Recently Booked Appointments */}
      {appointments.length > 0 && (
        <section className="appointment-section">
          <div className="section-header">
            <div>
              <h2>Current Appointments Schedule ({appointments.length})</h2>
              <p>Live synchronized OPD appointments and confirmation status</p>
            </div>
            <Link to="/appointments" className="view-button">
              Manage All Appointments
            </Link>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Department / Reason</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((apt, idx) => {
                  const statusClass =
                    apt.status === "Pending"
                      ? "pending"
                      : apt.status === "Confirmed"
                      ? "confirmed"
                      : apt.status === "Rejected" || apt.status === "Cancelled"
                      ? "rejected"
                      : "completed";
                  return (
                    <tr key={apt.id || idx}>
                      <td>
                        <strong>{apt.patient}</strong>
                      </td>
                      <td>{apt.doctor}</td>
                      <td>
                        <span className="dept-tag">
                          {apt.reason || apt.department || "Consultation"}
                        </span>
                      </td>
                      <td>
                        {apt.date} • <strong>{apt.time}</strong>
                      </td>
                      <td>
                        <span className={`status ${statusClass}`}>{apt.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default BookAppointment;
