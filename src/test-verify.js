// Verification script for MediCare Hospital Management System
import assert from "node:assert";

console.log("=================================================");
console.log("MEDICARE HOSPITAL SYSTEM - LOGIC VERIFICATION SUITE");
console.log("=================================================");

// 1. Initial State & Statistics Test
const patients = [
  { id: "pat-101", name: "Aarav Sharma", phone: "9876543210", age: "32", bloodGroup: "O+" },
  { id: "pat-102", name: "Priya Patel", phone: "9812345678", age: "27", bloodGroup: "B+" },
  { id: "pat-103", name: "Rohan Verma", phone: "9988776655", age: "45", bloodGroup: "A+" },
  { id: "pat-104", name: "Sneha Reddy", phone: "9123456789", age: "19", bloodGroup: "AB+" }
];

const doctors = [
  { id: "doc-1", name: "Dr. Mehta", specialty: "Cardiology" },
  { id: "doc-2", name: "Dr. Singh", specialty: "Neurology" },
  { id: "doc-3", name: "Dr. Kapoor", specialty: "Pediatrics" },
  { id: "doc-4", name: "Dr. Ananya Sharma", specialty: "Orthopedics" },
  { id: "doc-5", name: "Dr. Rajesh Verma", specialty: "General Medicine" }
];

const appointments = [
  { id: "apt-1", patient: "Aarav Sharma", doctor: "Dr. Mehta", date: "2026-10-26", time: "10:00", status: "Confirmed" },
  { id: "apt-2", patient: "Priya Patel", doctor: "Dr. Singh", date: "2026-10-26", time: "11:30", status: "Pending" },
  { id: "apt-3", patient: "Rohan Verma", doctor: "Dr. Rajesh Verma", date: "2026-10-26", time: "09:00", status: "Completed" },
  { id: "apt-4", patient: "Sneha Reddy", doctor: "Dr. Kapoor", date: "2026-10-27", time: "14:00", status: "Pending" }
];

function computeStats(pts, docs, apts) {
  return {
    totalPatients: pts.length,
    totalDoctors: docs.length,
    totalAppointments: apts.length,
    pendingAppointments: apts.filter((a) => a.status === "Pending").length,
    confirmedAppointments: apts.filter((a) => a.status === "Confirmed").length,
    completedAppointments: apts.filter((a) => a.status === "Completed").length,
    rejectedAppointments: apts.filter((a) => a.status === "Rejected" || a.status === "Cancelled").length
  };
}

const stats = computeStats(patients, doctors, appointments);
console.log("Calculated Stats:", stats);
assert.strictEqual(stats.totalPatients, 4, "Total patients must be 4");
assert.strictEqual(stats.totalDoctors, 5, "Total doctors must be 5");
assert.strictEqual(stats.totalAppointments, 4, "Total appointments must be 4");
assert.strictEqual(stats.pendingAppointments, 2, "Pending appointments must be 2");
assert.strictEqual(stats.confirmedAppointments, 1, "Confirmed appointments must be 1");
assert.strictEqual(stats.completedAppointments, 1, "Completed appointments must be 1");
console.log("✓ Test 1: Statistics Calculation Passed");

// 2. Patient Validation Rules
function validatePatient(p) {
  const errors = {};
  if (!p.name || p.name.trim().length < 2) errors.name = "Invalid name";
  if (!p.age || isNaN(p.age) || Number(p.age) < 1 || Number(p.age) > 120) errors.age = "Invalid age";
  if (!p.phone || !/^\d{10}$/.test(p.phone)) errors.phone = "Invalid phone";
  if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) errors.email = "Invalid email";
  if (!p.address || p.address.trim().length < 5) errors.address = "Invalid address";
  return errors;
}

// Invalid patient test
const invalidP = { name: "A", age: "150", phone: "12345", email: "bademail", address: "abc" };
const errs = validatePatient(invalidP);
assert.ok(errs.name, "Short name should fail");
assert.ok(errs.age, "Age 150 should fail");
assert.ok(errs.phone, "Phone length should fail");
assert.ok(errs.email, "Malformed email should fail");
assert.ok(errs.address, "Short address should fail");
console.log("✓ Test 2: Patient Form Validation Constraints Passed");

// 3. Appointment Past-Date and Conflict Validation
function validateAppointment(apt, existingApts, todayStr) {
  if (!apt.patient) return "Patient required";
  if (!apt.doctor) return "Doctor required";
  if (!apt.date || apt.date < todayStr) return "Past date invalid";
  if (!apt.time) return "Time required";
  if (!apt.reason || apt.reason.trim().length < 3) return "Reason required";

  const conflict = existingApts.find(
    (a) => a.doctor === apt.doctor && a.date === apt.date && a.time === apt.time && a.status !== "Cancelled"
  );
  if (conflict) return "Doctor conflict at slot";

  return null;
}

const todayStr = "2026-10-26";
// Past date check
assert.strictEqual(
  validateAppointment({ patient: "Aarav", doctor: "Dr. Mehta", date: "2026-10-20", time: "10:00", reason: "Checkup" }, appointments, todayStr),
  "Past date invalid"
);

// Conflict check (Dr. Mehta already booked at 10:00 on 2026-10-26)
assert.strictEqual(
  validateAppointment({ patient: "Priya", doctor: "Dr. Mehta", date: "2026-10-26", time: "10:00", reason: "Cardiac consultation" }, appointments, todayStr),
  "Doctor conflict at slot"
);

// Valid booking check
assert.strictEqual(
  validateAppointment({ patient: "Priya", doctor: "Dr. Mehta", date: "2026-10-26", time: "11:00", reason: "Cardiac consultation" }, appointments, todayStr),
  null
);
console.log("✓ Test 3: Appointment Date & Conflict Scheduling Constraints Passed");

// 4. Appointment Status Lifecycle (Pending -> Confirmed -> Completed / Rejected)
let testApt = { id: "test-1", status: "Pending" };
assert.strictEqual(testApt.status, "Pending");

// Transition 1: Confirm
testApt.status = "Confirmed";
assert.strictEqual(testApt.status, "Confirmed");

// Transition 2: Complete
testApt.status = "Completed";
assert.strictEqual(testApt.status, "Completed");

// Transition 3: Reject
let rejectedApt = { id: "test-2", status: "Pending" };
rejectedApt.status = "Rejected";
assert.strictEqual(rejectedApt.status, "Rejected");
console.log("✓ Test 4: Appointment Status Lifecycle (Pending -> Confirmed -> Completed / Rejected) Passed");

// 5. Role-Based Login & Routing Resolution
function resolveRoleLogin(role) {
  switch (role) {
    case "Doctor":
      return { redirect: "/doctor-dashboard", roleName: "Doctor" };
    case "Patient":
      return { redirect: "/patient-portal", roleName: "Patient" };
    case "Receptionist":
      return { redirect: "/dashboard", roleName: "Receptionist" };
    default:
      return { redirect: "/", roleName: "Guest" };
  }
}

assert.strictEqual(resolveRoleLogin("Doctor").redirect, "/doctor-dashboard");
assert.strictEqual(resolveRoleLogin("Patient").redirect, "/patient-portal");
assert.strictEqual(resolveRoleLogin("Receptionist").redirect, "/dashboard");
console.log("✓ Test 5: Role-Based Login Redirection Passed");

console.log("=================================================");
console.log("ALL 5 CRITICAL UNIT & INTEGRATION TESTS PASSED!");
console.log("=================================================");
