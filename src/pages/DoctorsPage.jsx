import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHospital } from "../context/HospitalContext";

function DoctorsPage() {
  const navigate = useNavigate();
  const { doctors, appointments, addDoctor, deleteDoctor, currentUser } = useHospital();

  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  // Add doctor modal state
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("General Medicine");
  const [newQualification, setNewQualification] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDays, setNewDays] = useState("Mon to Fri");
  const [newHours, setNewHours] = useState("09:00 AM - 02:00 PM");
  const [formError, setFormError] = useState("");

  // Get unique specialties
  const specialties = useMemo(() => {
    const set = new Set(doctors.map((d) => d.specialty).filter(Boolean));
    return Array.from(set);
  }, [doctors]);

  // Compute doctor's appointment counts
  const doctorAppointmentCounts = useMemo(() => {
    const counts = {};
    appointments.forEach((apt) => {
      counts[apt.doctor] = (counts[apt.doctor] || 0) + 1;
    });
    return counts;
  }, [appointments]);

  // Filtered doctors list
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (doc.name || "").toLowerCase().includes(term) ||
        (doc.fullName || "").toLowerCase().includes(term) ||
        (doc.specialty || "").toLowerCase().includes(term) ||
        (doc.room || "").toLowerCase().includes(term);

      const matchesSpecialty =
        specialtyFilter === "all" || doc.specialty === specialtyFilter;

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchTerm, specialtyFilter]);

  async function handleAddDoctorSubmit(e) {
    e.preventDefault();
    if (!newDoctorName.trim()) {
      setFormError("Doctor name is required.");
      return;
    }
    if (!newRoom.trim()) {
      setFormError("OPD Room number is required.");
      return;
    }

    const docName = newDoctorName.startsWith("Dr.") ? newDoctorName : `Dr. ${newDoctorName}`;

    await addDoctor({
      name: docName,
      fullName: docName,
      specialty: newSpecialty,
      qualification: newQualification || "MD / MS",
      room: newRoom,
      phone: newPhone || "+91 98000 00000",
      availableDays: newDays,
      availableHours: newHours,
      experience: "5+ years",
      rating: "4.8 / 5.0"
    });

    setIsAddingDoctor(false);
    setNewDoctorName("");
    setNewSpecialty("General Medicine");
    setNewQualification("");
    setNewRoom("");
    setNewPhone("");
    setFormError("");
  }

  function handleBookWithDoctor(doctorName) {
    navigate("/appointments/new", {
      state: { preselectedDoctor: doctorName }
    });
  }

  return (
    <div className="doctors-page">
      <div className="section-header-row">
        <div>
          <h1>Doctor Directory & Management</h1>
          <p>Hospital medical specialists, consultation schedules, and clinical departments.</p>
        </div>
        <button
          type="button"
          className="primary-action-btn"
          onClick={() => setIsAddingDoctor(true)}
        >
          <span>➕ Add New Doctor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-controls-bar">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by doctor name, specialty, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field"
            aria-label="Search doctors"
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

        <div className="filter-select-group">
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            aria-label="Filter by medical specialty"
          >
            <option value="all">All Specialties</option>
            {specialties.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Cards Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🩺</div>
          <h3>No doctors match your query.</h3>
          <p>Try clearing your search terms or specialty filters.</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setSearchTerm("");
              setSpecialtyFilter("all");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="doctors-grid">
          {filteredDoctors.map((doc) => {
            const appointmentCount = doctorAppointmentCounts[doc.name] || 0;

            return (
              <div key={doc.id || doc.name} className="doctor-card">
                <div className="doctor-card-top">
                  <div className="doctor-avatar">🩺</div>
                  <div className="doctor-title-block">
                    <h3>{doc.name}</h3>
                    <span className="specialty-badge">{doc.specialty}</span>
                    <small className="qualification-text">
                      {doc.qualification || "Specialist Physician"}
                    </small>
                  </div>
                </div>

                <div className="doctor-details-list">
                  <div className="doc-detail-item">
                    <span className="doc-detail-label">📍 OPD Room:</span>
                    <span className="doc-detail-val">{doc.room}</span>
                  </div>
                  <div className="doc-detail-item">
                    <span className="doc-detail-label">🕒 Timings:</span>
                    <span className="doc-detail-val">
                      {doc.availableDays} ({doc.availableHours})
                    </span>
                  </div>
                  <div className="doc-detail-item">
                    <span className="doc-detail-label">📞 Contact:</span>
                    <span className="doc-detail-val">{doc.phone}</span>
                  </div>
                  <div className="doc-detail-item">
                    <span className="doc-detail-label">📅 Booked Appointments:</span>
                    <span className="doc-detail-val appointment-counter-badge">
                      {appointmentCount} scheduled
                    </span>
                  </div>
                </div>

                <div className="doctor-card-actions" style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="book-with-doc-btn"
                    style={{ flex: 1 }}
                    onClick={() => handleBookWithDoctor(doc.name)}
                  >
                    <span>📅 Book Appointment</span>
                    <span className="btn-arrow">→</span>
                  </button>
                  {currentUser?.role === "Receptionist" && doc.id && (
                    <button
                      type="button"
                      className="reject-button"
                      title="Remove doctor from directory"
                      onClick={() => deleteDoctor(doc.id)}
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Doctor Modal */}
      {isAddingDoctor && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-doc-title">
          <div className="modal-container modal-wide">
            <div className="modal-header">
              <span className="modal-icon">🩺</span>
              <h3 id="add-doc-title">Add Medical Specialist to Directory</h3>
            </div>

            {formError && (
              <div className="field-error-msg" style={{ marginBottom: "15px" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddDoctorSubmit}>
              <div className="form-grid-two">
                <div className="form-field-group">
                  <label htmlFor="new-doc-name">Doctor Name *</label>
                  <input
                    id="new-doc-name"
                    type="text"
                    placeholder="e.g., Dr. Ramesh Gupta"
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="new-doc-spec">Specialty *</label>
                  <input
                    id="new-doc-spec"
                    type="text"
                    placeholder="e.g., Dermatology, Cardiology"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-two">
                <div className="form-field-group">
                  <label htmlFor="new-doc-room">OPD Room Number *</label>
                  <input
                    id="new-doc-room"
                    type="text"
                    placeholder="e.g., OPD Room 205 (Block C)"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="new-doc-qual">Qualifications</label>
                  <input
                    id="new-doc-qual"
                    type="text"
                    placeholder="e.g., MBBS, MD, DNB"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-two">
                <div className="form-field-group">
                  <label htmlFor="new-doc-days">Available Days</label>
                  <input
                    id="new-doc-days"
                    type="text"
                    placeholder="e.g., Mon, Wed, Fri"
                    value={newDays}
                    onChange={(e) => setNewDays(e.target.value)}
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="new-doc-hours">Consultation Hours</label>
                  <input
                    id="new-doc-hours"
                    type="text"
                    placeholder="e.g., 09:00 AM - 01:00 PM"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label htmlFor="new-doc-phone">Contact Phone</label>
                <input
                  id="new-doc-phone"
                  type="text"
                  placeholder="+91 98765 00000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsAddingDoctor(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Doctor Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorsPage;
