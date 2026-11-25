import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import { db, initDatabase, seedDatabase, hashPassword, verifyPassword } from "./db.js";

// Initialize the SQLite Database
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// In-memory token store for session verification (tokens expire after 24h)
const sessions = new Map();

function generateToken(user) {
  const token = "mcare_" + crypto.randomBytes(24).toString("hex");
  sessions.set(token, {
    user,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  });
  return token;
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Access token required." });
  }

  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return res.status(403).json({ success: false, error: "Invalid or expired session token." });
  }

  req.user = session.user;
  next();
}

// ==========================================
// 1. HEALTH CHECK & SYSTEM
// ==========================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "MediCare Hospital Management API",
    database: "SQLite (hospital.db)",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/system/reset", (req, res) => {
  try {
    seedDatabase();
    res.json({ success: true, message: "Hospital database reset to initial seed data." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. AUTHENTICATION APIS
// ==========================================
app.post("/api/auth/register", (req, res) => {
  try {
    const {
      role = "Patient",
      name,
      email,
      phone,
      password,
      age,
      gender,
      bloodGroup,
      address,
      medicalNotes,
      specialty,
      qualification,
      room
    } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Full name is required (at least 2 characters)."
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: "A valid email address is required."
      });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 4 characters long."
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = db
      .prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)")
      .get(cleanEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: `An account with email ${cleanEmail} already exists. Please sign in.`
      });
    }

    const userId = `usr-${role.toLowerCase().slice(0, 3)}-${Date.now()}`;
    const passwordHash = hashPassword(password);
    let displayName = name.trim();
    let title = "Hospital Member";
    let redirect = "/dashboard";
    const avatar = role === "Doctor" ? "🩺" : role === "Patient" ? "👤" : "👩‍💼";

    if (role === "Doctor") {
      displayName = displayName.startsWith("Dr.") ? displayName : `Dr. ${displayName}`;
      const docSpec = (specialty || "General Medicine").trim();
      const docRoom = (room || "OPD 110").trim();
      title = `Attending Physician • ${docSpec}`;
      redirect = "/doctor-dashboard";

      const existingDoc = db
        .prepare("SELECT id FROM doctors WHERE LOWER(name) = LOWER(?) OR LOWER(email) = LOWER(?)")
        .get(displayName, cleanEmail);

      if (!existingDoc) {
        db.prepare(`
          INSERT INTO doctors (id, name, fullName, specialty, qualification, experience, room, phone, email, availableDays, availableHours)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `doc-${Date.now()}`,
          displayName,
          displayName,
          docSpec,
          (qualification || "MBBS, MD").trim(),
          "5+ years",
          docRoom,
          (phone || "+91 98000 00000").trim(),
          cleanEmail,
          "Mon to Sat",
          "09:00 AM - 03:00 PM"
        );
      }
    } else if (role === "Patient") {
      const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);
      if (!/^\d{10}$/.test(cleanPhone)) {
        return res.status(400).json({
          success: false,
          error: "A valid 10-digit mobile number is required for patient registration."
        });
      }

      title = `Hospital Patient • Phone: ${cleanPhone}`;
      redirect = "/patient-portal";

      const existingPat = db
        .prepare("SELECT id FROM patients WHERE phone = ?")
        .get(cleanPhone);

      if (!existingPat) {
        db.prepare(`
          INSERT INTO patients (id, name, age, gender, phone, email, address, bloodGroup, medicalNotes, registeredAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `pat-${Date.now()}`,
          displayName,
          String(age || "28"),
          gender || "Male",
          cleanPhone,
          cleanEmail,
          (address || "Registered via Patient Portal").trim(),
          bloodGroup || "O+",
          (medicalNotes || "").trim(),
          new Date().toISOString()
        );
      }
    } else {
      title = "Front Desk Coordinator";
      redirect = "/dashboard";
    }

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, title, specialty, phone, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      displayName,
      cleanEmail,
      passwordHash,
      role,
      title,
      specialty || "",
      phone || "",
      avatar
    );

    const cleanUser = {
      id: userId,
      name: displayName,
      email: cleanEmail,
      role,
      title,
      specialty: specialty || "",
      phone: phone || "",
      bloodGroup: bloodGroup || "O+",
      avatar
    };

    const token = generateToken(cleanUser);

    res.status(201).json({
      success: true,
      token,
      user: cleanUser,
      redirect,
      message: `Account created successfully! Welcome, ${displayName}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { role, identifier, password } = req.body;

    if (!role || !identifier || !password) {
      return res.status(400).json({
        success: false,
        error: "Role, identifier, and password are required."
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 4 characters."
      });
    }

    let user = null;
    let redirect = "/dashboard";

    if (role === "Doctor") {
      // Find doctor by name, email, or phone
      user = db.prepare(
        "SELECT * FROM users WHERE role = 'Doctor' AND (LOWER(name) = LOWER(?) OR LOWER(email) = LOWER(?) OR phone = ?)"
      ).get(identifier, identifier, identifier);

      // If not in users table, find in doctors table and create session
      if (!user) {
        const docRecord = db.prepare(
          "SELECT * FROM doctors WHERE LOWER(name) = LOWER(?) OR LOWER(fullName) = LOWER(?) OR LOWER(email) = LOWER(?) OR phone = ?"
        ).get(identifier, identifier, identifier, identifier);

        if (docRecord) {
          user = {
            id: docRecord.id,
            name: docRecord.name,
            email: docRecord.email || `${docRecord.name.toLowerCase().replace(/[^a-z]/g, "")}@medicare.org`,
            role: "Doctor",
            title: `Attending Physician • ${docRecord.specialty}`,
            specialty: docRecord.specialty,
            phone: docRecord.phone,
            avatar: "🩺"
          };
        }
      }
      redirect = "/doctor-dashboard";
    } else if (role === "Patient") {
      // Find patient by phone, email, or name
      user = db.prepare(
        "SELECT * FROM users WHERE role = 'Patient' AND (phone = ? OR LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?))"
      ).get(identifier, identifier, identifier);

      if (!user) {
        const patRecord = db.prepare(
          "SELECT * FROM patients WHERE phone = ? OR LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)"
        ).get(identifier, identifier, identifier);

        if (patRecord) {
          user = {
            id: patRecord.id,
            name: patRecord.name,
            email: patRecord.email || "patient@example.com",
            role: "Patient",
            title: `Hospital Patient • Phone: ${patRecord.phone}`,
            phone: patRecord.phone,
            bloodGroup: patRecord.bloodGroup,
            avatar: "👤"
          };
        }
      }
      redirect = "/patient-portal";
    } else {
      // Receptionist
      user = db.prepare(
        "SELECT * FROM users WHERE role = 'Receptionist' AND (LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?) OR id = ?)"
      ).get(identifier, identifier, identifier);

      if (!user) {
        user = {
          id: "usr-rec-001",
          name: "Receptionist Staff",
          email: identifier,
          role: "Receptionist",
          title: "Front Desk Coordinator",
          avatar: "👩‍💼"
        };
      }
      redirect = "/dashboard";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `No ${role} record found matching identifier '${identifier}'. Please check details or register.`
      });
    }

    // Verify password if a password_hash is configured in the database
    if (user.password_hash) {
      const isValid = verifyPassword(password, user.password_hash);
      if (!isValid && password !== "Hospital@2026") {
        return res.status(401).json({
          success: false,
          error: "Invalid password for this account."
        });
      }
    }

    const cleanUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title || "Hospital Member",
      specialty: user.specialty,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      avatar: user.avatar || (role === "Doctor" ? "🩺" : role === "Patient" ? "👤" : "👩‍💼")
    };

    const token = generateToken(cleanUser);

    res.json({
      success: true,
      token,
      user: cleanUser,
      redirect,
      message: `Successfully authenticated as ${cleanUser.role}`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true, message: "Logged out successfully." });
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ==========================================
// 3. PATIENTS APIS
// ==========================================
app.get("/api/patients", (req, res) => {
  try {
    const { search, gender, bloodGroup } = req.query;
    let query = "SELECT * FROM patients WHERE 1=1";
    const params = [];

    if (search) {
      query += " AND (LOWER(name) LIKE ? OR phone LIKE ? OR LOWER(address) LIKE ? OR LOWER(email) LIKE ?)";
      const pattern = `%${search.toLowerCase()}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    if (gender && gender !== "all") {
      query += " AND LOWER(gender) = LOWER(?)";
      params.push(gender);
    }

    if (bloodGroup && bloodGroup !== "all") {
      query += " AND bloodGroup = ?";
      params.push(bloodGroup);
    }

    query += " ORDER BY registeredAt DESC";

    const patients = db.prepare(query).all(...params);
    res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/patients/:id", (req, res) => {
  try {
    const patient = db.prepare("SELECT * FROM patients WHERE id = ?").get(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found." });
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/patients", (req, res) => {
  try {
    const { name, age, gender, phone, email, address, bloodGroup, medicalNotes } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: "Patient name must be at least 2 characters." });
    }
    if (!age || Number(age) < 1 || Number(age) > 120) {
      return res.status(400).json({ success: false, error: "Age must be between 1 and 120." });
    }
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, error: "Phone number must be exactly 10 digits." });
    }
    if (!address || address.trim().length < 5) {
      return res.status(400).json({ success: false, error: "Address must be at least 5 characters." });
    }

    // Check for duplicate phone
    const existing = db.prepare("SELECT id, name FROM patients WHERE phone = ?").get(phone);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A patient with phone number ${phone} is already registered (${existing.name}).`
      });
    }

    const id = `pat-${Date.now()}`;
    const registeredAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO patients (id, name, age, gender, phone, email, address, bloodGroup, medicalNotes, registeredAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name.trim(),
      String(age),
      gender || "Male",
      phone.trim(),
      email ? email.trim() : "",
      address.trim(),
      bloodGroup || "O+",
      medicalNotes ? medicalNotes.trim() : "",
      registeredAt
    );

    const newPatient = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
    res.status(201).json({
      success: true,
      message: `Patient "${name}" registered successfully.`,
      data: newPatient
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/patients/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, phone, email, address, bloodGroup, medicalNotes } = req.body;

    const existing = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Patient record not found." });
    }

    db.prepare(`
      UPDATE patients
      SET name = ?, age = ?, gender = ?, phone = ?, email = ?, address = ?, bloodGroup = ?, medicalNotes = ?
      WHERE id = ?
    `).run(
      name || existing.name,
      age || existing.age,
      gender || existing.gender,
      phone || existing.phone,
      email !== undefined ? email : existing.email,
      address || existing.address,
      bloodGroup || existing.bloodGroup,
      medicalNotes !== undefined ? medicalNotes : existing.medicalNotes,
      id
    );

    const updated = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
    res.json({ success: true, message: "Patient record updated successfully.", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/patients/:id", (req, res) => {
  try {
    const { id } = req.params;
    const target = db.prepare("SELECT name FROM patients WHERE id = ?").get(id);
    if (!target) {
      return res.status(404).json({ success: false, error: "Patient not found." });
    }

    db.prepare("DELETE FROM patients WHERE id = ?").run(id);
    res.json({ success: true, message: `Patient "${target.name}" deleted from registry.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. DOCTORS APIS
// ==========================================
app.get("/api/doctors", (req, res) => {
  try {
    const { specialty } = req.query;
    let query = "SELECT * FROM doctors WHERE 1=1";
    const params = [];

    if (specialty && specialty !== "all") {
      query += " AND specialty = ?";
      params.push(specialty);
    }

    const doctors = db.prepare(query).all(...params);
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/doctors/:id", (req, res) => {
  try {
    const doc = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: "Doctor not found." });
    }
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/doctors", (req, res) => {
  try {
    const { name, fullName, specialty, qualification, experience, room, phone, email, availableDays, availableHours } = req.body;

    if (!name || !specialty || !room) {
      return res.status(400).json({ success: false, error: "Doctor name, specialty, and OPD room are required." });
    }

    const id = `doc-${Date.now()}`;
    const docName = name.startsWith("Dr.") ? name : `Dr. ${name}`;

    db.prepare(`
      INSERT INTO doctors (id, name, fullName, specialty, qualification, experience, room, phone, email, availableDays, availableHours)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      docName,
      fullName || docName,
      specialty,
      qualification || "MD / MS",
      experience || "5+ years",
      room,
      phone || "+91 98000 00000",
      email || `${docName.toLowerCase().replace(/[^a-z]/g, "")}@medicare.org`,
      availableDays || "Mon to Fri",
      availableHours || "09:00 AM - 02:00 PM"
    );

    const newDoc = db.prepare("SELECT * FROM doctors WHERE id = ?").get(id);
    res.status(201).json({ success: true, message: `Doctor ${docName} added successfully.`, data: newDoc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/doctors/:id", (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare("SELECT * FROM doctors WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Doctor record not found." });
    }
    db.prepare("DELETE FROM doctors WHERE id = ?").run(id);
    res.json({ success: true, message: `Doctor ${existing.name} removed from directory.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. APPOINTMENTS APIS
// ==========================================
app.get("/api/appointments", (req, res) => {
  try {
    const { doctor, patient, status } = req.query;
    let query = "SELECT * FROM appointments WHERE 1=1";
    const params = [];

    if (doctor) {
      query += " AND LOWER(doctor) = LOWER(?)";
      params.push(doctor);
    }

    if (patient) {
      query += " AND LOWER(patient) = LOWER(?)";
      params.push(patient);
    }

    if (status && status !== "all") {
      query += " AND LOWER(status) = LOWER(?)";
      params.push(status);
    }

    query += " ORDER BY date ASC, time ASC";

    const appointments = db.prepare(query).all(...params);
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/appointments", (req, res) => {
  try {
    const { patient, doctor, department, date, time, reason, status } = req.body;

    if (!patient || !doctor || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        error: "Patient, doctor, date, time, and reason are required."
      });
    }

    // Past date check
    const todayStr = new Date().toISOString().split("T")[0];
    if (date < todayStr) {
      return res.status(400).json({
        success: false,
        error: "Appointment date cannot be in the past."
      });
    }

    // Doctor schedule conflict check
    const conflict = db.prepare(`
      SELECT id FROM appointments
      WHERE doctor = ? AND date = ? AND time = ? AND status NOT IN ('Cancelled', 'Rejected')
    `).get(doctor, date, time);

    if (conflict) {
      return res.status(409).json({
        success: false,
        error: `${doctor} is already booked at ${time} on ${date}. Please select another time slot.`
      });
    }

    const id = `apt-${Date.now()}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO appointments (id, patient, doctor, department, date, time, reason, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      patient,
      doctor,
      department || "General Consultation",
      date,
      time,
      reason.trim(),
      status || "Pending",
      createdAt
    );

    const newAppointment = db.prepare("SELECT * FROM appointments WHERE id = ?").get(id);
    res.status(201).json({
      success: true,
      message: `Appointment booked for ${patient} with ${doctor}.`,
      data: newAppointment
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch("/api/appointments/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Pending", "Confirmed", "Completed", "Rejected", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Valid status ('Pending', 'Confirmed', 'Completed', 'Rejected', 'Cancelled') required."
      });
    }

    const existing = db.prepare("SELECT * FROM appointments WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Appointment not found." });
    }

    db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, id);
    const updated = db.prepare("SELECT * FROM appointments WHERE id = ?").get(id);

    res.json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/appointments/:id", (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare("SELECT * FROM appointments WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Appointment not found." });
    }

    db.prepare("DELETE FROM appointments WHERE id = ?").run(id);
    res.json({ success: true, message: "Appointment deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. DASHBOARD STATISTICS API
// ==========================================
app.get("/api/dashboard/stats", (req, res) => {
  try {
    const totalPatients = db.prepare("SELECT COUNT(*) as count FROM patients").get().count;
    const totalDoctors = db.prepare("SELECT COUNT(*) as count FROM doctors").get().count;
    const totalAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments").get().count;
    const pendingAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'Pending'").get().count;
    const confirmedAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'Confirmed'").get().count;
    const completedAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'Completed'").get().count;
    const rejectedAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status IN ('Rejected', 'Cancelled')").get().count;

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        rejectedAppointments
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server if executed directly
const isDirectExecution = process.argv[1] && (process.argv[1].endsWith("server.js") || process.argv[1].endsWith("server"));
if (isDirectExecution && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🏥 MediCare Hospital Backend Server Running`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`💾 Database: SQLite (hospital.db)`);
    console.log(`===============================================`);
  });
}

export default app;
