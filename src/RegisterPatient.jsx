import { useState } from "react";
import { Link } from "react-router-dom";
import { useHospital } from "./context/HospitalContext";

function RegisterPatient({ addPatient: propAddPatient }) {
  const context = useHospital();

  // Support both direct prop and Context/Redux state
  const patients = context?.patients || [];
  const addPatientAsync = context?.addPatientAsync;
  const directAddPatient = propAddPatient || context?.addPatient;

  // Form Fields State
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  // UI State: validation errors, touched state, loading, status banner
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [lastRegisteredPatient, setLastRegisteredPatient] = useState(null);

  // Field validation logic
  function validateField(fieldName, value) {
    let error = "";
    switch (fieldName) {
      case "name":
        if (!value || !value.trim()) {
          error = "Patient full name is required.";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters long.";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) {
          error = "Name should only contain letters, spaces, and hyphens.";
        }
        break;

      case "age":
        if (!value || value === "") {
          error = "Age is required.";
        } else if (isNaN(value) || Number(value) < 1 || Number(value) > 120) {
          error = "Age must be a valid number between 1 and 120.";
        }
        break;

      case "phone":
        if (!value) {
          error = "10-digit phone number is required.";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Phone number must be exactly 10 numeric digits.";
        } else {
          const dupPhone = patients.find((p) => p.phone === value.trim());
          if (dupPhone) {
            error = `A patient with phone ${value} is already registered (${dupPhone.name}).`;
          }
        }
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address (e.g., patient@example.com).";
        } else if (value) {
          const dupEmail = patients.find(
            (p) => p.email && p.email.toLowerCase() === value.trim().toLowerCase()
          );
          if (dupEmail) {
            error = `A patient with email ${value} is already registered (${dupEmail.name}).`;
          }
        }
        break;

      case "address":
        if (!value || !value.trim()) {
          error = "Address is required.";
        } else if (value.trim().length < 5) {
          error = "Address must be at least 5 characters long.";
        } else if (!/^[a-zA-Z0-9\s,./#-]+$/.test(value)) {
          error = "Address contains invalid symbols. Only alphanumeric and ,./#- allowed.";
        }
        break;

      default:
        break;
    }
    return error;
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const valueMap = { name, age, phone, email, address };
    const err = validateField(field, valueMap[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }

  function validateEntireForm() {
    const newErrors = {
      name: validateField("name", name),
      age: validateField("age", age),
      phone: validateField("phone", phone),
      email: validateField("email", email),
      address: validateField("address", address)
    };

    // Remove empty error strings
    const activeErrors = Object.entries(newErrors).reduce((acc, [k, v]) => {
      if (v) acc[k] = v;
      return acc;
    }, {});

    setErrors(activeErrors);
    setTouched({
      name: true,
      age: true,
      phone: true,
      email: true,
      address: true
    });

    return Object.keys(activeErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (!validateEntireForm()) {
      return;
    }

    const patientData = {
      name: name.trim(),
      age: String(age).trim(),
      gender,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      bloodGroup: bloodGroup || "Not Specified",
      medicalNotes: medicalNotes.trim()
    };

    setIsSubmitting(true);

    try {
      if (addPatientAsync) {
        const result = await addPatientAsync(patientData);
        if (result.success) {
          setLastRegisteredPatient(result.patient);
          setName("");
          setAge("");
          setGender("Male");
          setPhone("");
          setEmail("");
          setAddress("");
          setBloodGroup("");
          setMedicalNotes("");
          setErrors({});
          setTouched({});
        } else {
          setSubmitError(result.error || "Failed to register patient.");
        }
      } else if (directAddPatient) {
        directAddPatient(patientData);
        setLastRegisteredPatient(patientData);
        setName("");
        setAge("");
        setPhone("");
        setAddress("");
      }
    } catch (err) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="register-patient-container">
      <div className="section-header-row">
        <div>
          <h1>Register Patient</h1>
          <p>Enter patient demographic, contact, and medical details below.</p>
        </div>
        <Link to="/patients" className="secondary-action-btn">
          <span>👥 View Patient Directory ({patients.length})</span>
        </Link>
      </div>

      {/* Success Banner */}
      {lastRegisteredPatient && (
        <div className="alert-banner alert-success" role="alert">
          <div className="alert-content">
            <strong>✅ Patient Registered Successfully!</strong>
            <p>
              <strong>{lastRegisteredPatient.name}</strong> (Phone: {lastRegisteredPatient.phone}) is now enrolled
              in the hospital system.
            </p>
          </div>
          <div className="alert-actions">
            <Link
              to="/appointments/new"
              state={{ preselectedPatient: lastRegisteredPatient.name }}
              className="alert-btn"
            >
              📅 Book Appointment Now
            </Link>
            <button
              type="button"
              className="alert-dismiss"
              onClick={() => setLastRegisteredPatient(null)}
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
            <strong>⚠️ Submission Failed:</strong>
            <p>{submitError}</p>
            <small>Your entered details are preserved below. Please correct the issue and retry.</small>
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

      <form onSubmit={handleSubmit} noValidate className="hospital-form">
        <div className="form-legend">
          <h3>Patient Information</h3>
          <span>* Indicates mandatory fields</span>
        </div>

        {/* Name and Age/Gender */}
        <div className="form-grid-two">
          <div className="form-field-group">
            <label htmlFor="patient-name">
              Patient Full Name <span className="req">*</span>
            </label>
            <input
              id="patient-name"
              type="text"
              placeholder="e.g., Aarav Sharma"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (touched.name) {
                  setErrors((prev) => ({
                    ...prev,
                    name: validateField("name", e.target.value)
                  }));
                }
              }}
              onBlur={() => handleBlur("name")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={errors.name ? "input-error" : ""}
              disabled={isSubmitting}
              required
            />
            {errors.name && (
              <span id="name-error" className="field-error-msg" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-grid-two-nested">
            <div className="form-field-group">
              <label htmlFor="patient-age">
                Age <span className="req">*</span>
              </label>
              <input
                id="patient-age"
                type="number"
                placeholder="Age (1-120)"
                value={age}
                min="1"
                max="120"
                onChange={(e) => {
                  setAge(e.target.value);
                  if (touched.age) {
                    setErrors((prev) => ({
                      ...prev,
                      age: validateField("age", e.target.value)
                    }));
                  }
                }}
                onBlur={() => handleBlur("age")}
                aria-invalid={Boolean(errors.age)}
                aria-describedby={errors.age ? "age-error" : undefined}
                className={errors.age ? "input-error" : ""}
                disabled={isSubmitting}
                required
              />
              {errors.age && (
                <span id="age-error" className="field-error-msg" role="alert">
                  {errors.age}
                </span>
              )}
            </div>

            <div className="form-field-group">
              <label htmlFor="patient-gender">Gender</label>
              <select
                id="patient-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Phone and Email */}
        <div className="form-grid-two">
          <div className="form-field-group">
            <label htmlFor="patient-phone">
              10-Digit Phone Number <span className="req">*</span>
            </label>
            <input
              id="patient-phone"
              type="tel"
              placeholder="e.g., 9876543210"
              value={phone}
              maxLength="10"
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setPhone(val);
                  if (touched.phone) {
                    setErrors((prev) => ({
                      ...prev,
                      phone: validateField("phone", val)
                    }));
                  }
                }
              }}
              onBlur={() => handleBlur("phone")}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={errors.phone ? "input-error" : ""}
              disabled={isSubmitting}
              required
            />
            {errors.phone && (
              <span id="phone-error" className="field-error-msg" role="alert">
                {errors.phone}
              </span>
            )}
          </div>

          <div className="form-field-group">
            <label htmlFor="patient-email">Email Address (Optional)</label>
            <input
              id="patient-email"
              type="email"
              placeholder="e.g., patient@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  setErrors((prev) => ({
                    ...prev,
                    email: validateField("email", e.target.value)
                  }));
                }
              }}
              onBlur={() => handleBlur("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={errors.email ? "input-error" : ""}
              disabled={isSubmitting}
            />
            {errors.email && (
              <span id="email-error" className="field-error-msg" role="alert">
                {errors.email}
              </span>
            )}
          </div>
        </div>

        {/* Address and Blood Group */}
        <div className="form-grid-two">
          <div className="form-field-group">
            <label htmlFor="patient-address">
              Residential Address <span className="req">*</span>
            </label>
            <input
              id="patient-address"
              type="text"
              placeholder="House, Street, Area, City"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (touched.address) {
                  setErrors((prev) => ({
                    ...prev,
                    address: validateField("address", e.target.value)
                  }));
                }
              }}
              onBlur={() => handleBlur("address")}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={errors.address ? "address-error" : undefined}
              className={errors.address ? "input-error" : ""}
              disabled={isSubmitting}
              required
            />
            {errors.address && (
              <span id="address-error" className="field-error-msg" role="alert">
                {errors.address}
              </span>
            )}
          </div>

          <div className="form-field-group">
            <label htmlFor="patient-blood">Blood Group</label>
            <select
              id="patient-blood"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Select Blood Group (Optional)</option>
              <option value="A+">A+ (A Positive)</option>
              <option value="A-">A- (A Negative)</option>
              <option value="B+">B+ (B Positive)</option>
              <option value="B-">B- (B Negative)</option>
              <option value="AB+">AB+ (AB Positive)</option>
              <option value="AB-">AB- (AB Negative)</option>
              <option value="O+">O+ (O Positive)</option>
              <option value="O-">O- (O Negative)</option>
            </select>
          </div>
        </div>

        {/* Medical History */}
        <div className="form-field-group">
          <label htmlFor="patient-medical-history">
            Known Medical Conditions / Allergies / Notes
          </label>
          <textarea
            id="patient-medical-history"
            rows="3"
            placeholder="Document existing allergies (e.g. penicillin), chronic conditions (diabetes, hypertension), or past surgeries..."
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Actions */}
        <div className="form-submit-row">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="button-loader">
                <span className="spinner"></span>
                <span>Registering Patient...</span>
              </span>
            ) : (
              <span>Register Patient</span>
            )}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={() => {
              setName("");
              setAge("");
              setGender("Male");
              setPhone("");
              setEmail("");
              setAddress("");
              setBloodGroup("");
              setMedicalNotes("");
              setErrors({});
              setTouched({});
              setSubmitError("");
            }}
            disabled={isSubmitting}
          >
            Clear Form
          </button>
        </div>
      </form>

      {/* Live Preview Table of Recently Registered Patients */}
      {patients.length > 0 && (
        <section className="appointment-section">
          <div className="section-header">
            <div>
              <h2>Recently Registered Patients ({patients.length})</h2>
              <p>Live synchronized patient records in hospital registry</p>
            </div>
            <Link to="/patients" className="view-button">
              Full Patient Directory
            </Link>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age / Gender</th>
                  <th>Phone</th>
                  <th>Blood Group</th>
                  <th>Address</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 5).map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td>
                      <strong>{p.name}</strong>
                      {p.email && <span className="sub-cell-text">{p.email}</span>}
                    </td>
                    <td>
                      {p.age} yrs
                      {p.gender && <span className="gender-badge">{p.gender}</span>}
                    </td>
                    <td>{p.phone}</td>
                    <td>
                      <span className="blood-badge">{p.bloodGroup || "—"}</span>
                    </td>
                    <td>{p.address}</td>
                    <td>
                      <Link
                        to="/appointments/new"
                        state={{ preselectedPatient: p.name }}
                        className="edit-button"
                        style={{ textDecoration: "none", display: "inline-block" }}
                      >
                        + Book Slot
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default RegisterPatient;
