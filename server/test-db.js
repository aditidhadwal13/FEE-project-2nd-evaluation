import assert from "node:assert";
import { db, initDatabase, verifyPassword } from "./db.js";

console.log("=================================================");
console.log("SQLITE DATABASE INTEGRATION & DIRECT QUERY SUITE");
console.log("=================================================");

initDatabase();

// 1. Verify Users Table
const users = db.prepare("SELECT * FROM users").all();
assert.ok(users.length >= 3, "Users table must contain seeded roles");
const doctorUser = users.find((u) => u.role === "Doctor");
assert.ok(doctorUser, "Doctor user must exist in DB");
assert.ok(verifyPassword("Hospital@2026", doctorUser.password_hash), "Password verification with salt hash must succeed");
console.log("✓ Test 1: SQLite Users Table & Salt-Hashed Passwords Verified");

// 2. Verify Patients Table & CRUD
const patCountBefore = db.prepare("SELECT COUNT(*) as c FROM patients").get().c;
assert.ok(patCountBefore >= 4, "Initial patients must be present in SQLite");

const testPatId = `pat-test-${Date.now()}`;
db.prepare(`
  INSERT INTO patients (id, name, age, gender, phone, email, address, bloodGroup, medicalNotes, registeredAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(testPatId, "Direct DB Test Patient", "35", "Female", "9001122334", "dbtest@example.com", "456 SQLite Lane", "A+", "Test Notes", new Date().toISOString());

const insertedPat = db.prepare("SELECT * FROM patients WHERE id = ?").get(testPatId);
assert.strictEqual(insertedPat.name, "Direct DB Test Patient");

// Update
db.prepare("UPDATE patients SET age = ? WHERE id = ?").run("36", testPatId);
const updatedPat = db.prepare("SELECT age FROM patients WHERE id = ?").get(testPatId);
assert.strictEqual(updatedPat.age, "36");

// Delete
db.prepare("DELETE FROM patients WHERE id = ?").run(testPatId);
const deletedPat = db.prepare("SELECT * FROM patients WHERE id = ?").get(testPatId);
assert.strictEqual(deletedPat, undefined);
console.log("✓ Test 2: SQLite Patients Table Full CRUD Lifecycle Verified");

// 3. Verify Doctors Table
const docs = db.prepare("SELECT * FROM doctors").all();
assert.ok(docs.length >= 5, "Doctors table must contain active hospital specialists");
console.log("✓ Test 3: SQLite Doctors Table Query Verified");

// 4. Verify Appointments Table & Status Changes
const apts = db.prepare("SELECT * FROM appointments").all();
assert.ok(apts.length >= 4, "Appointments table must contain initial bookings");

const firstApt = apts[0];
db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run("Completed", firstApt.id);
const verifiedApt = db.prepare("SELECT status FROM appointments WHERE id = ?").get(firstApt.id);
assert.strictEqual(verifiedApt.status, "Completed");
db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(firstApt.status, firstApt.id); // restore
console.log("✓ Test 4: SQLite Appointments Status Mutation Verified");

// 5. Verify SQL Dynamic Aggregation for Dashboard
const totalPatients = db.prepare("SELECT COUNT(*) as c FROM patients").get().c;
const totalDoctors = db.prepare("SELECT COUNT(*) as c FROM doctors").get().c;
const totalAppointments = db.prepare("SELECT COUNT(*) as c FROM appointments").get().c;
assert.ok(totalPatients >= 4);
assert.ok(totalDoctors >= 5);
assert.ok(totalAppointments >= 4);
console.log("✓ Test 5: SQLite Dynamic Dashboard SQL Aggregations Verified");

console.log("=================================================");
console.log("ALL 5 SQLITE DATABASE DIRECT TESTS PASSED!");
console.log("=================================================");
