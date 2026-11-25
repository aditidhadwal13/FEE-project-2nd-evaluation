import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useHospital } from "./context/HospitalContext";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, register, isSubmitting } = useHospital();

  // Active Role tab: "Doctor", "Patient", or "Receptionist"
  const initialRoleParam = searchParams.get("role");
  const validRole = ["doctor", "patient", "receptionist"].includes(
    (initialRoleParam || "").toLowerCase()
  )
    ? initialRoleParam.charAt(0).toUpperCase() + initialRoleParam.slice(1).toLowerCase()
    : "Receptionist";

  const [activeRole, setActiveRole] = useState(validRole);
  const [authTab, setAuthTab] = useState("signin"); // "signin" | "signup"
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Sign Up Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [address, setAddress] = useState("");
  const [specialty, setSpecialty] = useState("Cardiology");
  const [qualification, setQualification] = useState("");
  const [room, setRoom] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (initialRoleParam) {
      const formatted =
        initialRoleParam.charAt(0).toUpperCase() + initialRoleParam.slice(1).toLowerCase();
      if (["Doctor", "Patient", "Receptionist"].includes(formatted)) {
        setActiveRole(formatted);
      }
    }
  }, [initialRoleParam]);

  function handleRoleChange(newRole) {
    setActiveRole(newRole);
    setSearchParams({ role: newRole.toLowerCase() });
    setIdentifier("");
    setPassword("");
    setFormErrors({});
    setAuthError("");
  }

  function handleTabSwitch(tab) {
    setAuthTab(tab);
    setFormErrors({});
    setAuthError("");
  }

  function validateSignIn() {
    const errors = {};
    if (!identifier.trim()) {
      errors.identifier =
        activeRole === "Doctor"
          ? "Please enter your Doctor Email or Name."
          : activeRole === "Patient"
          ? "Please enter your registered 10-digit Mobile Number, Email, or Name."
          : "Please enter your Staff Email or Employee ID.";
    }

    if (activeRole === "Patient" && /^\d+$/.test(identifier.trim()) && identifier.trim().length !== 10) {
      errors.identifier = "Mobile number must be 10 digits.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 4) {
      errors.password = "Password must be at least 4 characters long.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateSignUp() {
    const errors = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Full name is required (at least 2 characters).";
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (activeRole === "Patient") {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        errors.phone = "Please enter a valid 10-digit mobile number.";
      }
      if (!age || Number(age) < 1 || Number(age) > 120) {
        errors.age = "Age must be between 1 and 120.";
      }
      if (!address.trim() || address.trim().length < 5) {
        errors.address = "Residential address is required (min 5 characters).";
      }
    }

    if (activeRole === "Doctor") {
      if (!specialty.trim()) {
        errors.specialty = "Medical specialty is required.";
      }
      if (!room.trim()) {
        errors.room = "OPD Room number is required.";
      }
    }

    if (!password || password.length < 4) {
      errors.password = "Password must be at least 4 characters long.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAuthError("");

    if (authTab === "signin") {
      if (!validateSignIn()) return;

      if (onLogin) {
        onLogin(activeRole);
        return;
      }

      const result = await login(activeRole, {
        identifier: identifier.trim(),
        password: password.trim()
      });

      if (result.success) {
        navigate(result.redirect);
      } else {
        setAuthError(result.error || "Sign in failed. Please check your credentials.");
      }
    } else {
      if (!validateSignUp()) return;

      const result = await register({
        role: activeRole,
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),
        age: age.trim(),
        gender,
        bloodGroup,
        address: address.trim(),
        specialty: specialty.trim(),
        qualification: qualification.trim(),
        room: room.trim()
      });

      if (result.success) {
        navigate(result.redirect);
      } else {
        setAuthError(result.error || "Account registration failed.");
      }
    }
  }

  return (
    <div className="login-page-container">
      {/* Portal Header */}
      <div className="login-header-block">
        <div className="portal-badge">MEDICARE ACCESS PORTAL</div>
        <h1>{authTab === "signin" ? "Sign In to MediCare" : "Create MediCare Account"}</h1>
        <p>
          Select your role below to sign in to your existing account or register a new profile.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="role-selector-cards" role="tablist" aria-label="Select Role">
        <button
          type="button"
          className={`role-select-card ${activeRole === "Receptionist" ? "active" : ""}`}
          onClick={() => handleRoleChange("Receptionist")}
          role="tab"
          aria-selected={activeRole === "Receptionist"}
        >
          <div className="role-card-icon">👩‍💼</div>
          <div className="role-card-text">
            <h3>Receptionist</h3>
            <p>Front desk, admissions & central schedule</p>
          </div>
          <span className="role-indicator-radio"></span>
        </button>

        <button
          type="button"
          className={`role-select-card ${activeRole === "Doctor" ? "active" : ""}`}
          onClick={() => handleRoleChange("Doctor")}
          role="tab"
          aria-selected={activeRole === "Doctor"}
        >
          <div className="role-card-icon">🩺</div>
          <div className="role-card-text">
            <h3>Doctor</h3>
            <p>Attending physicians & OPD clinical queue</p>
          </div>
          <span className="role-indicator-radio"></span>
        </button>

        <button
          type="button"
          className={`role-select-card ${activeRole === "Patient" ? "active" : ""}`}
          onClick={() => handleRoleChange("Patient")}
          role="tab"
          aria-selected={activeRole === "Patient"}
        >
          <div className="role-card-icon">👤</div>
          <div className="role-card-text">
            <h3>Patient</h3>
            <p>Book consultations, track status & vitals</p>
          </div>
          <span className="role-indicator-radio"></span>
        </button>
      </div>

      {/* Auth Card Surface */}
      <div className="login-card-surface">
        {/* Sign In / Create Account Mode Switcher */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-mode-tab ${authTab === "signin" ? "active" : ""}`}
            onClick={() => handleTabSwitch("signin")}
          >
            🔐 Sign In
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${authTab === "signup" ? "active" : ""}`}
            onClick={() => handleTabSwitch("signup")}
          >
            ✨ Create New Account
          </button>
        </div>

        <div className="login-card-header">
          <div className="active-role-pill">
            <span>
              {activeRole === "Doctor" ? "🩺" : activeRole === "Patient" ? "👤" : "👩‍💼"}
            </span>
            <strong>
              {authTab === "signin"
                ? `${activeRole} Sign In`
                : `New ${activeRole} Registration`}
            </strong>
          </div>
          <p className="login-card-desc">
            {authTab === "signin"
              ? activeRole === "Doctor"
                ? "Enter your registered doctor email or full name and password."
                : activeRole === "Patient"
                ? "Enter your registered 10-digit mobile number, email, or name and password."
                : "Enter your staff email address and password to access the hospital desk."
              : `Create a new ${activeRole} account in the MediCare Hospital system.`}
          </p>
        </div>

        {authError && (
          <div className="alert-banner alert-error" role="alert">
            <strong>⚠️ Error:</strong> {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="role-login-form">
          {authTab === "signin" ? (
            <>
              <div className="form-field-group">
                <label htmlFor="auth-identifier">
                  {activeRole === "Doctor"
                    ? "Doctor Email or Full Name"
                    : activeRole === "Patient"
                    ? "Registered Mobile Number, Email, or Name"
                    : "Staff Email Address"}{" "}
                  <span className="req">*</span>
                </label>
                <input
                  id="auth-identifier"
                  type="text"
                  placeholder={
                    activeRole === "Doctor"
                      ? "e.g., dr.mehta@medicare.org or Dr. Mehta"
                      : activeRole === "Patient"
                      ? "e.g., 9876543210 or Aarav Sharma"
                      : "e.g., reception@medicare.org"
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={formErrors.identifier ? "input-error" : ""}
                  disabled={isSubmitting}
                />
                {formErrors.identifier && (
                  <span className="field-error-msg">{formErrors.identifier}</span>
                )}
              </div>

              <div className="form-field-group">
                <label htmlFor="auth-password">
                  Password <span className="req">*</span>
                </label>
                <div className="password-input-wrap">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={formErrors.password ? "input-error" : ""}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="field-error-msg">{formErrors.password}</span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="form-grid-two">
                <div className="form-field-group">
                  <label htmlFor="signup-name">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder={
                      activeRole === "Doctor" ? "e.g., Dr. Vikram Nair" : "e.g., Ankit Verma"
                    }
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={formErrors.fullName ? "input-error" : ""}
                    disabled={isSubmitting}
                  />
                  {formErrors.fullName && (
                    <span className="field-error-msg">{formErrors.fullName}</span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="signup-email">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="e.g., name@medicare.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={formErrors.email ? "input-error" : ""}
                    disabled={isSubmitting}
                  />
                  {formErrors.email && (
                    <span className="field-error-msg">{formErrors.email}</span>
                  )}
                </div>
              </div>

              {activeRole === "Patient" && (
                <>
                  <div className="form-grid-two">
                    <div className="form-field-group">
                      <label htmlFor="signup-phone">
                        10-Digit Mobile Number <span className="req">*</span>
                      </label>
                      <input
                        id="signup-phone"
                        type="tel"
                        maxLength={10}
                        placeholder="e.g., 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className={formErrors.phone ? "input-error" : ""}
                        disabled={isSubmitting}
                      />
                      {formErrors.phone && (
                        <span className="field-error-msg">{formErrors.phone}</span>
                      )}
                    </div>

                    <div className="form-grid-two-nested">
                      <div className="form-field-group">
                        <label htmlFor="signup-age">
                          Age <span className="req">*</span>
                        </label>
                        <input
                          id="signup-age"
                          type="number"
                          min="1"
                          max="120"
                          placeholder="28"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className={formErrors.age ? "input-error" : ""}
                          disabled={isSubmitting}
                        />
                        {formErrors.age && (
                          <span className="field-error-msg">{formErrors.age}</span>
                        )}
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="signup-blood">Blood Group</label>
                        <select
                          id="signup-blood"
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          disabled={isSubmitting}
                        >
                          {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-grid-two">
                    <div className="form-field-group">
                      <label htmlFor="signup-gender">Gender</label>
                      <select
                        id="signup-gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={isSubmitting}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="signup-address">
                        Residential Address <span className="req">*</span>
                      </label>
                      <input
                        id="signup-address"
                        type="text"
                        placeholder="House No, Street, City"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={formErrors.address ? "input-error" : ""}
                        disabled={isSubmitting}
                      />
                      {formErrors.address && (
                        <span className="field-error-msg">{formErrors.address}</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeRole === "Doctor" && (
                <>
                  <div className="form-grid-two">
                    <div className="form-field-group">
                      <label htmlFor="signup-specialty">
                        Medical Specialty <span className="req">*</span>
                      </label>
                      <select
                        id="signup-specialty"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        disabled={isSubmitting}
                      >
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="General Medicine">General Medicine</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="signup-room">
                        OPD Room Number <span className="req">*</span>
                      </label>
                      <input
                        id="signup-room"
                        type="text"
                        placeholder="e.g., OPD 206 (Block B)"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className={formErrors.room ? "input-error" : ""}
                        disabled={isSubmitting}
                      />
                      {formErrors.room && (
                        <span className="field-error-msg">{formErrors.room}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-grid-two">
                    <div className="form-field-group">
                      <label htmlFor="signup-qual">Qualifications</label>
                      <input
                        id="signup-qual"
                        type="text"
                        placeholder="e.g., MBBS, MD, DM"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="signup-doc-phone">Contact Number</label>
                      <input
                        id="signup-doc-phone"
                        type="tel"
                        placeholder="e.g., +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeRole === "Receptionist" && (
                <div className="form-field-group">
                  <label htmlFor="signup-rec-phone">Contact Phone Number</label>
                  <input
                    id="signup-rec-phone"
                    type="tel"
                    placeholder="e.g., +91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="form-field-group">
                <label htmlFor="signup-password">
                  Create Password <span className="req">*</span>
                </label>
                <div className="password-input-wrap">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 4 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={formErrors.password ? "input-error" : ""}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="field-error-msg">{formErrors.password}</span>
                )}
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="login-action-row">
            <button
              type="submit"
              className="submit-button login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="button-loader">
                  <span className="spinner"></span>
                  <span>
                    {authTab === "signin" ? "Signing In..." : "Creating Account..."}
                  </span>
                </span>
              ) : (
                <span>
                  {authTab === "signin"
                    ? `Sign In as ${activeRole}`
                    : `Create ${activeRole} Account`}
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Switch between Sign In and Sign Up */}
        <div className="auth-switch-footer">
          {authTab === "signin" ? (
            <p>
              Don&apos;t have a {activeRole} account yet?{" "}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => handleTabSwitch("signup")}
              >
                Create a new {activeRole} account →
              </button>
            </p>
          ) : (
            <p>
              Already registered with MediCare?{" "}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => handleTabSwitch("signin")}
              >
                Sign in to your account →
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
