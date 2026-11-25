import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useHospital } from "./context/HospitalContext";
import ConfirmModal from "./components/ConfirmModal";

function PatientList({
  patients: propPatients,
  deletePatient: propDeletePatient,
  updatePatient: propUpdatePatient
}) {
  // Support both props (Evaluation-I) and Context API (Evaluation-II)
  const context = useHospital();
  const patients = propPatients !== undefined ? propPatients : context.patients;
  const deletePatient = propDeletePatient || context.deletePatient;
  const updatePatient = propUpdatePatient || context.updatePatient;

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [bloodFilter, setBloodFilter] = useState("all");

  // Editing state
  const [editIndex, setEditIndex] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [editErrors, setEditErrors] = useState({});

  // Deletion Modal state
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Filtered patients list
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (patient.name || "").toLowerCase().includes(term) ||
        (patient.phone || "").includes(term) ||
        (patient.address || "").toLowerCase().includes(term) ||
        (patient.email || "").toLowerCase().includes(term) ||
        (patient.bloodGroup || "").toLowerCase().includes(term);

      const matchesGender =
        genderFilter === "all" ||
        (patient.gender || "").toLowerCase() === genderFilter.toLowerCase();

      const matchesBlood =
        bloodFilter === "all" || patient.bloodGroup === bloodFilter;

      return matchesSearch && matchesGender && matchesBlood;
    });
  }, [patients, searchTerm, genderFilter, bloodFilter]);

  function startEdit(patient, index) {
    setEditIndex(index);
    setName(patient.name || "");
    setAge(patient.age || "");
    setGender(patient.gender || "Male");
    setPhone(patient.phone || "");
    setEmail(patient.email || "");
    setAddress(patient.address || "");
    setBloodGroup(patient.bloodGroup || "O+");
    setMedicalNotes(patient.medicalNotes || "");
    setEditErrors({});
  }

  function validateEditForm() {
    const errors = {};
    if (!name.trim()) errors.name = "Patient name is required.";
    if (!age || Number(age) < 1 || Number(age) > 120) {
      errors.age = "Valid age (1-120) is required.";
    }
    if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Phone number must be exactly 10 digits.";
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please provide a valid email format.";
    }
    if (!address.trim() || address.trim().length < 5) {
      errors.address = "Address must be at least 5 characters.";
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function saveEdit(e) {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    const currentPatient = patients[editIndex];
    const updatedPatient = {
      ...(currentPatient || {}),
      name: name.trim(),
      age: String(age),
      gender: gender,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      bloodGroup: bloodGroup,
      medicalNotes: medicalNotes.trim()
    };

    updatePatient(editIndex, updatedPatient);
    setEditIndex(null);
  }

  function promptDelete(patient, index) {
    setPatientToDelete({ patient, index });
  }

  function confirmDelete() {
    if (patientToDelete) {
      deletePatient(patientToDelete.patient.id || patientToDelete.index);
      setPatientToDelete(null);
      if (editIndex === patientToDelete.index) {
        setEditIndex(null);
      }
    }
  }

  return (
    <div className="patient-list-container">
      <div className="section-header-row">
        <div>
          <h1>Patient List</h1>
          <p>All registered patients are shown below.</p>
        </div>
        <Link to="/patients/new" className="primary-action-btn">
          <span>➕ Register New Patient</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="filter-controls-bar">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, phone, address, blood group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field"
            aria-label="Search patients"
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
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            aria-label="Filter by gender"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            aria-label="Filter by blood group"
          >
            <option value="all">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      {/* Patient Listing */}
      {patients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No patients registered yet.</h3>
          <p>Register patients to begin booking appointments and managing records.</p>
          <Link to="/patients/new" className="primary-button">
            Register First Patient
          </Link>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No patients match your search criteria.</h3>
          <p>Try searching with another keyword or reset active filters.</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setSearchTerm("");
              setGenderFilter("all");
              setBloodFilter("all");
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
                <th>Age / Gender</th>
                <th>Phone Number</th>
                <th>Blood Group</th>
                <th>Address</th>
                <th>Medical Notes</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((patient, index) => {
                const originalIndex = patients.findIndex(
                  (p) => (p.id && p.id === patient.id) || p.name === patient.name
                );

                return (
                  <tr key={patient.id || patient.name + index}>
                    <td>
                      <strong>{patient.name}</strong>
                      {patient.email && (
                        <span className="sub-cell-text">{patient.email}</span>
                      )}
                    </td>
                    <td>
                      {patient.age} yrs
                      {patient.gender && (
                        <span className="gender-badge">{patient.gender}</span>
                      )}
                    </td>
                    <td>{patient.phone}</td>
                    <td>
                      <span className="blood-badge">
                        {patient.bloodGroup || "—"}
                      </span>
                    </td>
                    <td>{patient.address}</td>
                    <td>
                      <small className="notes-text">
                        {patient.medicalNotes || "None documented"}
                      </small>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => startEdit(patient, originalIndex)}
                          title="Edit patient details"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => promptDelete(patient, originalIndex)}
                          title="Delete patient record"
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

      {/* Edit Form Modal/Drawer */}
      {editIndex !== null && (
        <div className="edit-box">
          <div className="edit-box-header">
            <h2>Edit Patient Record</h2>
            <p>Update contact information, vitals, or clinical notes.</p>
          </div>

          <form onSubmit={saveEdit} noValidate>
            <div className="form-grid-two">
              <div className="form-field-group">
                <label htmlFor="edit-name">Patient Full Name *</label>
                <input
                  id="edit-name"
                  type="text"
                  placeholder="Patient Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={editErrors.name ? "input-error" : ""}
                  required
                />
                {editErrors.name && (
                  <span className="field-error-msg">{editErrors.name}</span>
                )}
              </div>

              <div className="form-field-group">
                <label htmlFor="edit-age">Age (Years) *</label>
                <input
                  id="edit-age"
                  type="number"
                  placeholder="Age"
                  value={age}
                  min="1"
                  max="120"
                  onChange={(e) => setAge(e.target.value)}
                  className={editErrors.age ? "input-error" : ""}
                  required
                />
                {editErrors.age && (
                  <span className="field-error-msg">{editErrors.age}</span>
                )}
              </div>
            </div>

            <div className="form-grid-two">
              <div className="form-field-group">
                <label htmlFor="edit-gender">Gender</label>
                <select
                  id="edit-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-field-group">
                <label htmlFor="edit-blood">Blood Group</label>
                <select
                  id="edit-blood"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="form-grid-two">
              <div className="form-field-group">
                <label htmlFor="edit-phone">Phone Number (10 Digits) *</label>
                <input
                  id="edit-phone"
                  type="tel"
                  placeholder="10 Digit Phone Number"
                  value={phone}
                  maxLength="10"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) setPhone(val);
                  }}
                  className={editErrors.phone ? "input-error" : ""}
                  required
                />
                {editErrors.phone && (
                  <span className="field-error-msg">{editErrors.phone}</span>
                )}
              </div>

              <div className="form-field-group">
                <label htmlFor="edit-email">Email Address</label>
                <input
                  id="edit-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={editErrors.email ? "input-error" : ""}
                />
                {editErrors.email && (
                  <span className="field-error-msg">{editErrors.email}</span>
                )}
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="edit-address">Residential Address *</label>
              <input
                id="edit-address"
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={editErrors.address ? "input-error" : ""}
                required
              />
              {editErrors.address && (
                <span className="field-error-msg">{editErrors.address}</span>
              )}
            </div>

            <div className="form-field-group">
              <label htmlFor="edit-notes">Medical Notes / Allergies</label>
              <textarea
                id="edit-notes"
                rows="2"
                placeholder="Pre-existing conditions, allergies, or physician notes..."
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
              />
            </div>

            <div className="form-button-group">
              <button type="submit" className="save-btn">
                Save Changes
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={() => setEditIndex(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={Boolean(patientToDelete)}
        title="Delete Patient Record"
        message={`Are you sure you want to permanently delete patient "${patientToDelete?.patient?.name}"? All corresponding medical records for this patient will be removed.`}
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setPatientToDelete(null)}
      />
    </div>
  );
}

export default PatientList;
