import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "hospital.db");
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// Password hashing utility using standard PBKDF2 (SHA-256)
export function hashPassword(password, salt = "medicare_salt_fee2_2026") {
  return crypto.pbkdf2Sync(password, salt, 1000, 32, "sha256").toString("hex");
}

export function verifyPassword(password, storedHash, salt = "medicare_salt_fee2_2026") {
  const hash = hashPassword(password, salt);
  return hash === storedHash;
}

// Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      title TEXT,
      specialty TEXT,
      phone TEXT,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age TEXT NOT NULL,
      gender TEXT DEFAULT 'Male',
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      address TEXT NOT NULL,
      bloodGroup TEXT DEFAULT 'O+',
      medicalNotes TEXT,
      registeredAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      fullName TEXT,
      specialty TEXT NOT NULL,
      qualification TEXT,
      experience TEXT,
      room TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      availableDays TEXT,
      availableHours TEXT,
      rating TEXT DEFAULT '4.8 / 5.0'
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient TEXT NOT NULL,
      doctor TEXT NOT NULL,
      department TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      createdAt TEXT NOT NULL
    );
  `);

  // Seed default dataset if tables are empty
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  if (userCount === 0) {
    seedDatabase();
  }
}

export function seedDatabase() {
  db.exec("DELETE FROM users; DELETE FROM patients; DELETE FROM doctors; DELETE FROM appointments;");

  const defaultPasswordHash = hashPassword("Hospital@2026");

  // 1. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, title, specialty, phone, avatar)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    "usr-rec-001",
    "Staff Receptionist",
    "reception@medicare.org",
    defaultPasswordHash,
    "Receptionist",
    "Front Desk Coordinator",
    "Administration",
    "+91 98765 00000",
    "👩‍💼"
  );

  insertUser.run(
    "usr-doc-001",
    "Dr. Mehta",
    "dr.mehta@medicare.org",
    defaultPasswordHash,
    "Doctor",
    "Attending Physician",
    "Cardiology",
    "+91 98765 00101",
    "🩺"
  );

  insertUser.run(
    "usr-doc-002",
    "Dr. Singh",
    "dr.singh@medicare.org",
    defaultPasswordHash,
    "Doctor",
    "Attending Physician",
    "Neurology",
    "+91 98765 00102",
    "🩺"
  );

  insertUser.run(
    "usr-pat-001",
    "Aarav Sharma",
    "aarav.sharma@example.com",
    defaultPasswordHash,
    "Patient",
    "Enrolled Patient",
    "General",
    "9876543210",
    "👤"
  );

  // 2. Seed Patients
  const insertPatient = db.prepare(`
    INSERT INTO patients (id, name, age, gender, phone, email, address, bloodGroup, medicalNotes, registeredAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPatient.run(
    "pat-101",
    "Aarav Sharma",
    "32",
    "Male",
    "9876543210",
    "aarav.sharma@example.com",
    "42 Park Street, Civil Lines, Delhi",
    "O+",
    "Hypertension (mild), regular checkups required",
    "2026-10-20T09:00:00"
  );

  insertPatient.run(
    "pat-102",
    "Priya Patel",
    "27",
    "Female",
    "9812345678",
    "priya.patel@example.com",
    "15 Rosewood Enclave, Sector 14, Gurugram",
    "B+",
    "Occasional migraine attacks; allergic to penicillin",
    "2026-10-21T11:30:00"
  );

  insertPatient.run(
    "pat-103",
    "Rohan Verma",
    "45",
    "Male",
    "9988776655",
    "rohan.verma@example.com",
    "78 Sunrise Heights, Model Town, Delhi",
    "A+",
    "Type 2 diabetes under dietary control",
    "2026-10-22T14:15:00"
  );

  insertPatient.run(
    "pat-104",
    "Sneha Reddy",
    "19",
    "Female",
    "9123456789",
    "sneha.reddy@example.com",
    "23 Green Valley, Lake Road, Bengaluru",
    "AB+",
    "Seasonal pollen asthma; inhaler user",
    "2026-10-23T10:00:00"
  );

  // 3. Seed Doctors
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (id, name, fullName, specialty, qualification, experience, room, phone, email, availableDays, availableHours, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDoctor.run(
    "doc-1",
    "Dr. Mehta",
    "Dr. Arvind Mehta",
    "Cardiology",
    "MD, DM (Cardiology), FACC",
    "14 years",
    "OPD 102 (Block A)",
    "+91 98765 00101",
    "dr.mehta@medicare.org",
    "Mon, Wed, Fri",
    "09:00 AM - 02:00 PM",
    "4.9 / 5.0"
  );

  insertDoctor.run(
    "doc-2",
    "Dr. Singh",
    "Dr. Gurpreet Singh",
    "Neurology",
    "MD, DM (Neurology)",
    "11 years",
    "OPD 204 (Block B)",
    "+91 98765 00102",
    "dr.singh@medicare.org",
    "Tue, Thu, Sat",
    "10:00 AM - 04:00 PM",
    "4.8 / 5.0"
  );

  insertDoctor.run(
    "doc-3",
    "Dr. Kapoor",
    "Dr. Sunita Kapoor",
    "Pediatrics",
    "MD (Pediatrics), DCH",
    "9 years",
    "OPD 108 (Child Care Wing)",
    "+91 98765 00103",
    "dr.kapoor@medicare.org",
    "Mon to Fri",
    "09:30 AM - 03:30 PM",
    "4.9 / 5.0"
  );

  insertDoctor.run(
    "doc-4",
    "Dr. Ananya Sharma",
    "Dr. Ananya Sharma",
    "Orthopedics",
    "MS (Orthopedics), MCh",
    "8 years",
    "OPD 301 (Trauma Center)",
    "+91 98765 00104",
    "dr.asharma@medicare.org",
    "Mon, Wed, Sat",
    "11:00 AM - 05:00 PM",
    "4.7 / 5.0"
  );

  insertDoctor.run(
    "doc-5",
    "Dr. Rajesh Verma",
    "Dr. Rajesh Verma",
    "General Medicine",
    "MD (Internal Medicine)",
    "16 years",
    "OPD 105 (Block A)",
    "+91 98765 00105",
    "dr.verma@medicare.org",
    "Mon to Sat",
    "08:30 AM - 02:30 PM",
    "4.8 / 5.0"
  );

  // 4. Seed Appointments
  const insertAppointment = db.prepare(`
    INSERT INTO appointments (id, patient, doctor, department, date, time, reason, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAppointment.run(
    "apt-1",
    "Aarav Sharma",
    "Dr. Mehta",
    "Cardiology",
    "2026-10-26",
    "10:00",
    "Routine cardiac checkup & ECG review",
    "Confirmed",
    "2026-10-25T08:30:00"
  );

  insertAppointment.run(
    "apt-2",
    "Priya Patel",
    "Dr. Singh",
    "Neurology",
    "2026-10-26",
    "11:30",
    "Recurring migraine consultation",
    "Pending",
    "2026-10-25T09:15:00"
  );

  insertAppointment.run(
    "apt-3",
    "Rohan Verma",
    "Dr. Rajesh Verma",
    "General Medicine",
    "2026-10-26",
    "09:00",
    "Blood pressure monitoring & medication review",
    "Completed",
    "2026-10-24T14:20:00"
  );

  insertAppointment.run(
    "apt-4",
    "Sneha Reddy",
    "Dr. Kapoor",
    "Pediatrics",
    "2026-10-27",
    "14:00",
    "Allergy consultation and prescription refill",
    "Pending",
    "2026-10-25T11:00:00"
  );

  console.log("Database initialized and seeded successfully.");
}

export { db };
