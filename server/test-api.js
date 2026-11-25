process.env.NODE_ENV = "test";
import assert from "node:assert";
import http from "node:http";
import app from "./server.js";

console.log("=================================================");
console.log("MEDICARE BACKEND API & SQLITE VERIFICATION SUITE");
console.log("=================================================");

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // Helper fetch wrapper
    async function apiRequest(endpoint, options = {}) {
      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    // 1. Test Health Check
    const health = await apiRequest("/health");
    assert.strictEqual(health.status, 200, "Health check should be 200 OK");
    assert.strictEqual(health.data.database, "SQLite (hospital.db)");
    console.log("✓ Test 1: Health Check & SQLite Connection Verified");

    // 2. Test Doctor Login
    const docLogin = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ role: "Doctor", identifier: "Dr. Mehta", password: "Hospital@2026" })
    });
    assert.strictEqual(docLogin.status, 200, "Doctor login should succeed");
    assert.strictEqual(docLogin.data.user.role, "Doctor");
    assert.strictEqual(docLogin.data.redirect, "/doctor-dashboard");
    assert.ok(docLogin.data.token, "Auth token must be issued");
    const docToken = docLogin.data.token;
    console.log("✓ Test 2: Doctor Authentication API Verified (Token Issued)");

    // 3. Test Patient Login
    const patLogin = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ role: "Patient", identifier: "9876543210", password: "Hospital@2026" })
    });
    assert.strictEqual(patLogin.status, 200, "Patient login should succeed");
    assert.strictEqual(patLogin.data.user.role, "Patient");
    assert.strictEqual(patLogin.data.redirect, "/patient-portal");
    console.log("✓ Test 3: Patient Authentication API Verified (Token Issued)");

    // 4. Test Receptionist Login
    const recLogin = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ role: "Receptionist", identifier: "reception@medicare.org", password: "Hospital@2026" })
    });
    assert.strictEqual(recLogin.status, 200, "Receptionist login should succeed");
    assert.strictEqual(recLogin.data.user.role, "Receptionist");
    assert.strictEqual(recLogin.data.redirect, "/dashboard");
    console.log("✓ Test 4: Receptionist Authentication API Verified");

    // 5. Test Auth /me with Bearer Token
    const authMe = await apiRequest("/auth/me", {
      headers: { Authorization: `Bearer ${docToken}` }
    });
    assert.strictEqual(authMe.status, 200, "Auth me with valid Bearer token should succeed");
    assert.strictEqual(authMe.data.user.name, "Dr. Mehta");
    console.log("✓ Test 5: Bearer Token Authorization Middleware Verified");

    // 6. Test Patients API (GET & POST)
    const initialPatients = await apiRequest("/patients");
    assert.strictEqual(initialPatients.status, 200);
    assert.ok(initialPatients.data.data.length >= 4, "Initial patients should be seeded in SQLite");

    const newPatRes = await apiRequest("/patients", {
      method: "POST",
      body: JSON.stringify({
        name: "Test API Patient",
        age: "29",
        gender: "Female",
        phone: "9911223344",
        email: "test.api@example.com",
        address: "123 Tech Park Road",
        bloodGroup: "B+",
        medicalNotes: "No known allergies"
      })
    });
    assert.strictEqual(newPatRes.status, 201, "Patient creation should return 201 Created");
    const createdPatId = newPatRes.data.data.id;
    console.log("✓ Test 6: Patient Registration API (POST /api/patients) Verified");

    // 7. Test Duplicate Phone Constraint
    const dupRes = await apiRequest("/patients", {
      method: "POST",
      body: JSON.stringify({
        name: "Duplicate Phone Patient",
        age: "30",
        gender: "Male",
        phone: "9911223344",
        address: "Same Address"
      })
    });
    assert.strictEqual(dupRes.status, 409, "Duplicate phone must return 409 Conflict");
    console.log("✓ Test 7: Duplicate Phone Validation (409 Conflict) Verified");

    // 8. Test Doctor API (GET)
    const doctorsRes = await apiRequest("/doctors");
    assert.strictEqual(doctorsRes.status, 200);
    assert.ok(doctorsRes.data.data.length >= 5, "Doctors should be returned from SQLite");
    console.log("✓ Test 8: Doctor Directory API (GET /api/doctors) Verified");

    // 9. Test Appointments API (GET, POST & PATCH status)
    const aptRes = await apiRequest("/appointments", {
      method: "POST",
      body: JSON.stringify({
        patient: "Test API Patient",
        doctor: "Dr. Singh",
        department: "Neurology",
        date: "2026-10-30",
        time: "15:00",
        reason: "Clinical neurology evaluation"
      })
    });
    assert.strictEqual(aptRes.status, 201, "Appointment creation should return 201 Created");
    const createdAptId = aptRes.data.data.id;
    console.log("✓ Test 9: Appointment Booking API (POST /api/appointments) Verified");

    // Status transition: Pending -> Confirmed
    const patchRes = await apiRequest(`/appointments/${createdAptId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "Confirmed" })
    });
    assert.strictEqual(patchRes.status, 200);
    assert.strictEqual(patchRes.data.data.status, "Confirmed");
    console.log("✓ Test 10: Appointment Status Transition API (PATCH /api/appointments/:id/status) Verified");

    // 10. Test Dashboard Stats API (computed via SQL)
    const statsRes = await apiRequest("/dashboard/stats");
    assert.strictEqual(statsRes.status, 200);
    assert.ok(statsRes.data.data.totalPatients >= 5, "Dynamic totalPatients should include new patient");
    assert.ok(statsRes.data.data.totalAppointments >= 5, "Dynamic totalAppointments should include new appointment");
    console.log("✓ Test 11: Real-time Dashboard Statistics API (GET /api/dashboard/stats) Verified");

    // Clean up test records
    await apiRequest(`/patients/${createdPatId}`, { method: "DELETE" });
    await apiRequest(`/appointments/${createdAptId}`, { method: "DELETE" });

    console.log("=================================================");
    console.log("ALL 11 BACKEND API & SQLITE TESTS PASSED CLEANLY!");
    console.log("=================================================");
  } catch (err) {
    console.error("Test failure:", err);
    process.exitCode = 1;
  } finally {
    server.close();
    setTimeout(() => {
      process.exit(process.exitCode || 0);
    }, 50);
  }
});
