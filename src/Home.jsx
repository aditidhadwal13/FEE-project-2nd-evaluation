import { Link, useNavigate } from "react-router-dom";
import { useHospital } from "./context/HospitalContext";

const CLINICAL_DEPARTMENTS = [
  {
    icon: "❤️",
    name: "Cardiology & Heart Care",
    desc: "Advanced non-invasive cardiac diagnostics, ECG monitoring, angiography, and preventive heart care.",
    tag: "24/7 Cardiac Unit"
  },
  {
    icon: "🧠",
    name: "Neurology & Neurosciences",
    desc: "Comprehensive treatment for migraines, stroke rehabilitation, epilepsy, and nerve disorders.",
    tag: "Specialist OPD"
  },
  {
    icon: "👶",
    name: "Pediatrics & Child Care",
    desc: "Dedicated neonatal intensive care, childhood immunizations, nutrition, and developmental checkups.",
    tag: "Child Friendly"
  },
  {
    icon: "🦴",
    name: "Orthopedics & Joint Care",
    desc: "Sports injury rehabilitation, fracture trauma center, spine care, and arthroscopic surgeries.",
    tag: "Trauma & Rehab"
  },
  {
    icon: "🩺",
    name: "Internal & General Medicine",
    desc: "Primary care consultations, diabetes & hypertension management, and seasonal illness care.",
    tag: "Daily OPD"
  },
  {
    icon: "🔬",
    name: "Diagnostics & Pathology",
    desc: "Fully automated blood biochemistry, digital X-ray, ultrasound, and rapid diagnostic reporting.",
    tag: "Same-Day Reports"
  }
];

const HOSPITAL_HIGHLIGHTS = [
  {
    icon: "🚑",
    title: "24×7 Emergency & Trauma",
    text: "Rapid-response triage, life-support ambulances, and round-the-clock emergency physicians."
  },
  {
    icon: "👨‍⚕️",
    title: "Board-Certified Specialists",
    text: "Experienced senior consultants across cardiology, neurology, pediatrics, and orthopedics."
  },
  {
    icon: "⚡",
    title: "Zero-Wait Digital OPD",
    text: "Instant patient registration, conflict-free appointment slots, and real-time queue status."
  },
  {
    icon: "🛡️",
    title: "Integrated Patient Records",
    text: "Unified clinical history, blood group vitals, allergy alerts, and prescription tracking."
  }
];

function Home({ goToLogin }) {
  const navigate = useNavigate();
  const { stats, doctors } = useHospital();

  const handleSelectRole = (role) => {
    if (goToLogin) {
      goToLogin(role);
    } else {
      navigate(`/login?role=${role.toLowerCase()}`);
    }
  };

  const featuredDoctors = (doctors || []).slice(0, 3);

  return (
    <div className="home-page">
      {/* 1. Hero Banner */}
      <section className="home-hero">
        <div className="home-hero-grid">
          <div className="home-hero-content">
            <div className="home-pill-badge">
              <span className="home-pill-dot"></span>
              <span>NABH Accredited Multi-Specialty Healthcare Center</span>
            </div>
            <h1>
              Compassionate Care Meets <span>Modern Medicine</span> at MediCare
            </h1>
            <p className="home-hero-lead">
              Experience seamless outpatient consultations, instant patient enrollment, and
              coordinated specialist care designed around your health and recovery.
            </p>

            <div className="home-hero-cta">
              <Link to="/appointments/new" className="home-btn-primary">
                <span>📅 Book an Appointment</span>
                <span className="btn-arrow">→</span>
              </Link>
              <Link to="/patients/new" className="home-btn-secondary">
                <span>➕ Register New Patient</span>
              </Link>
              <Link to="/doctors" className="home-btn-outline">
                <span>🩺 Explore Doctors</span>
              </Link>
            </div>

            <div className="home-trust-row">
              <div className="home-trust-item">
                <span>✅</span>
                <span>Instant Slot Confirmation</span>
              </div>
              <div className="home-trust-item">
                <span>✅</span>
                <span>24/7 Emergency Helpline: <strong>1066</strong></span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="home-hero-visual">
            <div className="home-glass-card">
              <div className="home-glass-header">
                <span className="glass-icon">🏥</span>
                <div>
                  <h3>Live Hospital Operations</h3>
                  <p>Real-time OPD & Clinical Capacity</p>
                </div>
                <span className="glass-live-tag">LIVE</span>
              </div>

              <div className="home-glass-metrics">
                <div className="glass-metric-box">
                  <span className="glass-metric-val">{stats.totalDoctors}</span>
                  <span className="glass-metric-lbl">Active Specialists</span>
                </div>
                <div className="glass-metric-box">
                  <span className="glass-metric-val">{stats.totalPatients}</span>
                  <span className="glass-metric-lbl">Enrolled Patients</span>
                </div>
                <div className="glass-metric-box">
                  <span className="glass-metric-val">{stats.confirmedAppointments}</span>
                  <span className="glass-metric-lbl">Confirmed Visits</span>
                </div>
                <div className="glass-metric-box">
                  <span className="glass-metric-val">{stats.totalAppointments}</span>
                  <span className="glass-metric-lbl">Total Consultations</span>
                </div>
              </div>

              <div className="home-glass-footer">
                <div className="emergency-strip">
                  <span>🕒</span>
                  <div>
                    <strong>OPD Consultation Hours</strong>
                    <small>Monday – Saturday • 08:30 AM to 06:00 PM</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Why Choose MediCare Strip */}
      <section className="home-highlights-grid">
        {HOSPITAL_HIGHLIGHTS.map((item) => (
          <div key={item.title} className="home-highlight-card">
            <div className="highlight-icon-wrap">{item.icon}</div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Role-Based Portals Section */}
      <section className="home-section">
        <div className="home-section-head">
          <div>
            <span className="section-kicker">DIGITAL HOSPITAL WORKSPACES</span>
            <h2>Dedicated Portals for Every Role</h2>
            <p>Quickly access clinical queues, patient health records, or front-desk reception tools.</p>
          </div>
          <Link to="/login" className="view-button">
            🔐 Role Login Gateway
          </Link>
        </div>

        <div className="three-role-cards-grid">
          <div className="role-portal-card card-rec">
            <div className="role-portal-icon">👩‍💼</div>
            <span className="role-portal-tag">FRONT DESK & ADMIN</span>
            <h3>Receptionist Portal</h3>
            <p>
              Enroll new patients, schedule conflict-free doctor appointments, confirm OPD queues,
              and monitor live hospital statistics.
            </p>
            <div className="portal-card-footer" style={{ display: "flex", gap: "8px" }}>
              <Link to="/dashboard" className="role-enter-btn">
                <span>Open Dashboard</span>
                <span className="btn-arrow">→</span>
              </Link>
              <button
                type="button"
                className="secondary-button"
                onClick={() => handleSelectRole("receptionist")}
                title="Sign in as Receptionist"
              >
                🔐
              </button>
            </div>
          </div>

          <div className="role-portal-card card-doc">
            <div className="role-portal-icon">🩺</div>
            <span className="role-portal-tag">ATTENDING PHYSICIANS</span>
            <h3>Doctor Workspace</h3>
            <p>
              Review assigned patient consultations, inspect chief complaints and medical history,
              and confirm, reject, or complete visits.
            </p>
            <div className="portal-card-footer">
              <button
                type="button"
                className="role-enter-btn"
                onClick={() => handleSelectRole("doctor")}
              >
                <span>Doctor Sign In</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>

          <div className="role-portal-card card-pat">
            <div className="role-portal-icon">👤</div>
            <span className="role-portal-tag">PERSONAL HEALTH DESK</span>
            <h3>Patient Portal</h3>
            <p>
              Check appointment confirmation status, review documented allergies and blood group
              details, and book follow-up consultations.
            </p>
            <div className="portal-card-footer">
              <button
                type="button"
                className="role-enter-btn"
                onClick={() => handleSelectRole("patient")}
              >
                <span>Patient Sign In</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Centers of Clinical Excellence (Departments) */}
      <section className="home-section">
        <div className="home-section-head">
          <div>
            <span className="section-kicker">CENTERS OF EXCELLENCE</span>
            <h2>Specialized Medical Departments</h2>
            <p>Comprehensive diagnostic and therapeutic care delivered by specialized teams.</p>
          </div>
          <Link to="/appointments/new" className="secondary-action-btn">
            📅 Schedule Consultation
          </Link>
        </div>

        <div className="home-departments-grid">
          {CLINICAL_DEPARTMENTS.map((dept) => (
            <div key={dept.name} className="home-dept-card">
              <div className="home-dept-top">
                <span className="home-dept-icon">{dept.icon}</span>
                <span className="home-dept-tag">{dept.tag}</span>
              </div>
              <h3>{dept.name}</h3>
              <p>{dept.desc}</p>
              <Link to="/appointments/new" className="home-dept-link">
                Book Department Visit →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured Medical Specialists */}
      {featuredDoctors.length > 0 && (
        <section className="home-section">
          <div className="home-section-head">
            <div>
              <span className="section-kicker">SENIOR CONSULTANTS</span>
              <h2>Meet Our Leading Specialists</h2>
              <p>Book a direct OPD time slot with our experienced attending physicians.</p>
            </div>
            <Link to="/doctors" className="secondary-action-btn">
              🩺 View All {doctors.length} Doctors
            </Link>
          </div>

          <div className="doctors-grid">
            {featuredDoctors.map((doc) => (
              <div key={doc.id || doc.name} className="doctor-card">
                <div className="doctor-card-top">
                  <div className="doctor-avatar">🩺</div>
                  <div className="doctor-title-block">
                    <h3>{doc.fullName || doc.name}</h3>
                    <span className="specialty-badge">{doc.specialty}</span>
                    <small className="qualification-text">
                      {doc.qualification || "Senior Consultant"}
                    </small>
                  </div>
                </div>

                <div className="doctor-details-list">
                  <div className="doc-detail-item">
                    <span className="doc-detail-label">📍 OPD Room:</span>
                    <span className="doc-detail-val">{doc.room}</span>
                  </div>
                  <div className="doc-detail-item">
                    <span className="doc-detail-label">🕒 Schedule:</span>
                    <span className="doc-detail-val">{doc.availableDays}</span>
                  </div>
                  <div className="doc-detail-item">
                    <span className="doc-detail-label">⏰ Hours:</span>
                    <span className="doc-detail-val">{doc.availableHours}</span>
                  </div>
                </div>

                <div className="doctor-card-actions">
                  <button
                    type="button"
                    className="book-with-doc-btn"
                    onClick={() =>
                      navigate("/appointments/new", {
                        state: { preselectedDoctor: doc.name }
                      })
                    }
                  >
                    <span>📅 Book with {doc.name}</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Bottom Call-to-Action Banner */}
      <section className="home-cta-banner">
        <div className="home-cta-text">
          <h2>Need Immediate Medical Assistance or an OPD Slot?</h2>
          <p>
            Register a patient in under 60 seconds or schedule a priority consultation with our
            attending specialists today.
          </p>
        </div>
        <div className="home-cta-buttons">
          <Link to="/appointments/new" className="home-btn-primary">
            📅 Book Appointment Now
          </Link>
          <Link to="/patients/new" className="home-btn-secondary">
            ➕ Register Patient
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
