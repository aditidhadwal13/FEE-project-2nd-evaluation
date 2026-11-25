# MediCare — Hospital Management System (Enhanced Edition)
## Front End Engineering-II • Project Evaluation-II (26 October 2026)

An enterprise-ready, accessible, multi-page Single Page Application (SPA) built with **React 19**, **React Router v7**, and the **React Context API**, designed for hospital reception desks, clinical administrators, and attending physicians.

---

## 🌟 Executive Summary & Evaluation Milestones

This project builds directly upon the foundation created in **Project Evaluation-I**, preserving every working feature (patient registration, patient directory, appointment scheduling, status updates, and deletion) while upgrading the architecture to meet all requirements of **Front End Engineering-II Project Evaluation-II**.

### Milestone Comparison Matrix

| Capability | Project Evaluation-I (Preserved) | Project Evaluation-II (Enhanced) |
| :--- | :--- | :--- |
| **Routing & Navigation** | Conditional local `page` state (`useState("dashboard")`). No URL history. | Declarative **React Router v7** with 8 distinct routes, active links, mobile responsive drawer, and custom 404 handler. |
| **State Management** | Local state and prop-drilling within `App.jsx`. Data lost on page reload. | Centralized **React Context API (`HospitalContext`)** with automatic **LocalStorage persistence** and custom hooks (`useHospital`). |
| **Async Operations** | Synchronous state mutation without loading indicators or network simulation. | Simulated asynchronous actions (`addPatientAsync`, `addAppointmentAsync`) with Promise delays, loading spinners, and non-blocking toast alerts. |
| **Form Handling & Validation** | Browser `alert()` boxes with basic regex checks. | Controlled inputs, field-specific accessible inline error messages, duplicate prevention, and past-date booking guards. |
| **Doctor Management** | Static hardcoded `<select>` options in booking form. | Dedicated **Doctor Directory (`/doctors`)** with specialty filters, room numbers, contact info, and active appointment tallies. |
| **Safety & UX Safeguards** | Direct instant deletion on click. | Accessible **Confirmation Dialog Modals** before destructive patient or appointment deletion. |
| **Theming & Design** | Early prototype styles with high-contrast palette. | Cohesive, modern healthcare visual system with WCAG-compliant color contrast and responsive breakpoints. |

---

## 🧭 Multi-Page SPA Routing Architecture

The application implements client-side routing via `react-router-dom` v7 with zero full-page reloads and complete browser history support:

* **`/`** — **Project Overview / Portfolio**: Problem statement, clinical objectives, role portal entry points, and technical stack details.
* **`/login`** — **Role-Based Authentication Gateway**: Dedicated login options for **Doctor**, **Patient**, and **Receptionist** with role-specific form fields and instant validation.
* **`/doctor-dashboard`** — **Doctor Clinical Workspace**: Active physician queue, assigned patient consultations, chief complaints, and complete/prescribe actions.
* **`/patient-portal`** — **Patient Health Portal**: Personal upcoming appointments, medical history, documented allergies, and consultation booking.
* **`/dashboard`** — **Receptionist Dashboard**: 6 dynamic metric cards (Total Patients, Total Doctors, Total Appointments, Pending, Confirmed, Completed), quick action shortcuts, and recent appointments table.
* **`/patients`** — **Patient Management**: Searchable, filterable patient registry with inline editing, vital signs, and deletion safeguards.
* **`/patients/new`** — **Patient Registration**: Accessible registration form with field-specific real-time validation and asynchronous submission.
* **`/appointments`** — **Appointment Management**: Filter by status (All, Pending, Confirmed, Completed), search by doctor or patient, and confirm/complete appointments.
* **`/appointments/new`** — **Book Appointment**: Patient dropdown, doctor & department selection, past-date prevention, conflict detection, and async submission.
* **`/doctors`** — **Doctor Directory & Management**: Specialist directory with OPD rooms, schedules, appointment counters, and doctor addition.
* **`/about`** — **Project Information & Viva Notes**: Syllabus compliance checklist, architectural deep dive, viva preparation Q&A, and demo data reset.
* **`*`** — **Custom 404 Not Found Page**: Themed error page with intuitive navigation recovery links.

---

## 🏗️ State Architecture & Context API

Shared application state is managed cleanly in `src/context/HospitalContext.jsx` without the unnecessary boilerplate of external state libraries like Redux:

```
                  ┌──────────────────────────────┐
                  │       HospitalProvider       │
                  │   (src/context/HospitalContext)│
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
   patients State          doctors State          appointments State
 (syncs with localStorage) (syncs with localStorage) (syncs with localStorage)
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    useHospital() Custom Hook
                                 │
     ┌──────────────┬────────────┴───┬──────────────┬──────────────┐
     ▼              ▼                ▼              ▼              ▼
 Dashboard     PatientList     RegisterPatient Appointments BookAppointment
```

### Key Context Features:
1. **Dynamic Statistics Computation**: `useMemo` computes derived counters (`totalPatients`, `totalDoctors`, `totalAppointments`, `pendingAppointments`, `confirmedAppointments`, `completedAppointments`) reactively from state.
2. **Persistent Storage**: Changes are automatically written to `localStorage` under versioned keys (`medicare_patients_v2`, `medicare_doctors_v2`, `medicare_appointments_v2`).
3. **Asynchronous Simulations**:
   - `addPatientAsync(patient)`: Enforces phone number uniqueness, introduces 500ms latency, and updates global loading state.
   - `addAppointmentAsync(appointment)`: Checks for doctor time-slot scheduling conflicts before booking.
4. **Dual Compatibility**: Exposes both Evaluation-I synchronous methods (`addPatient`, `updatePatient`, `deletePatient`, `addAppointment`, `updateAppointmentStatus`, `deleteAppointment`) and Evaluation-II asynchronous methods (`addPatientAsync`, `addAppointmentAsync`).

---

## 📝 Form Validation & Input Controls

### Patient Registration Form (`/patients/new`)
* **Patient Name**: Mandatory, minimum 2 characters, alphabetic and hyphen characters only.
* **Age**: Mandatory, numeric integer between 1 and 120.
* **Gender**: Selectable between Male, Female, and Other.
* **Phone Number**: Mandatory, exactly 10 digits (`/^\d{10}$/`).
* **Email Address**: Optional, validated against standard RFC 5322 regex when provided.
* **Residential Address**: Mandatory, minimum 5 characters, validated against safe characters.
* **Blood Group**: Optional selection (A+, A-, B+, B-, AB+, AB-, O+, O-).
* **Medical Notes / Allergies**: Textarea for pre-existing conditions and allergies.

### Appointment Booking Form (`/appointments/new`)
* **Patient Selection**: Requires choosing a registered patient from the directory.
* **Doctor Selection**: Dropdown populated dynamically from active hospital physicians with specialty tagging.
* **Date Picker**: HTML5 `min` attribute set to current date (`todayStr`), with programmatic validation preventing past-date scheduling.
* **Time Slot**: Consultation hours picker.
* **Reason / Chief Complaint**: Mandatory, minimum 3 characters.
* **Conflict Guard**: Prevents double-booking the same physician at the exact same date and time.

---

## 🛠️ Project Setup & Execution Instructions

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended, tested on Node v24)
* **npm** (v9.0.0 or higher)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will start at `http://localhost:5173/`. Open this URL in your web browser.

### 3. Run Static Code Linting (Oxlint)
```bash
npm run lint
```
*Zero errors, zero warnings.*

### 4. Run Automated Logic & Verification Tests
```bash
npm test
```
Executes the logic verification suite covering stats computation, patient validation, past date checking, doctor conflict scheduling, and status lifecycle.

### 5. Create Production Build
```bash
npm run build
```
Creates an optimized, minified production bundle in the `dist/` directory.

### 6. Preview Production Build
```bash
npm run preview
```

---

## 📁 Source Code Organization

```
first aiproject/
├── index.html                   # Entry HTML with hospital title and SVG favicon
├── package.json                 # Dependencies (react 19, react-router-dom 7, vite 8, oxlint)
├── vite.config.js               # Vite React configuration
├── .oxlintrc.json               # Oxlint linting configuration
│
├── src/
│   ├── main.jsx                 # React root renderer
│   ├── App.jsx                  # Main routing container with BrowserRouter & Routes
│   ├── App.css                  # Core healthcare styling, responsive breakpoints & themes
│   ├── index.css                # Base stylesheet and root reset
│   ├── Table.jsx                # Preserved Evaluation-I practice component
│   ├── test-verify.js           # Automated test suite for business logic
│   │
│   ├── context/
│   │   └── HospitalContext.jsx  # Central Context API provider, localStorage & async actions
│   │
│   ├── components/
│   │   ├── MainLayout.jsx       # Persistent app wrapper with header, sidebar, toast & outlet
│   │   ├── Sidebar.jsx          # Responsive navigation sidebar with active NavLink routing
│   │   ├── Header.jsx           # Sticky top navbar with receptionist profile & live indicators
│   │   ├── Toast.jsx            # Non-blocking accessible notification banner
│   │   └── ConfirmModal.jsx     # Accessible dialog modal for destructive actions
│   │
│   ├── pages/
│   │   ├── Overview.jsx         # Route / (Project Portfolio & Evaluation-II Showcase)
│   │   ├── Dashboard.jsx        # Route /dashboard (Live stats, recent appointments, quick actions)
│   │   ├── DoctorsPage.jsx      # Route /doctors (Doctor directory, schedules, add doctor)
│   │   ├── AboutPage.jsx        # Route /about (Syllabus compliance, viva FAQ, reset demo)
│   │   └── NotFoundPage.jsx     # Route * (Custom 404 error page)
│   │
│   ├── PatientList.jsx          # Route /patients (Preserved + enhanced with search/filter/edit)
│   ├── RegisterPatient.jsx      # Route /patients/new (Preserved + enhanced with async validation)
│   ├── Appointments.jsx         # Route /appointments (Preserved + enhanced with search & tabs)
│   └── BookAppointment.jsx     # Route /appointments/new (Preserved + enhanced with conflict checks)
│
└── _backup_restaurant_project/  # Safely archived previous workspace files (Savoria)
```

---

## 💡 Viva / Academic Defense Guide

### 1. Why use React Context API rather than Redux Toolkit?
> **Answer**: Context API is native to React, requiring no external packages. It provides an elegant, lightweight solution for medium-scale applications with shared state (like patient rosters, doctor schedules, and UI notifications). Redux Toolkit is intended for large-scale enterprise applications with highly frequent state mutations across complex nested subtrees. For a hospital front desk portal, Context API paired with `useMemo` and `useCallback` achieves optimal performance without unnecessary boilerplate.

### 2. How does Single Page Application (SPA) routing work?
> **Answer**: In a traditional multi-page website, clicking a link causes the browser to make a round-trip HTTP request to the server, reloading the entire HTML document and wiping out in-memory state. React Router intercepts link clicks via the HTML5 History API (`pushState` and `popState`), updates the browser URL bar, and conditionally swaps component trees in the DOM instantly without refreshing the page.

### 3. How are asynchronous operations and duplicate entries handled?
> **Answer**: Simulated asynchronous handlers (`addPatientAsync`, `addAppointmentAsync`) return Promises with realistic artificial latency. The UI enters a loading state (`isSubmitting: true`), disabling submission buttons and rendering an animated spinner. Before committing state, uniqueness constraints are checked (e.g., verifying phone numbers or doctor time slots). If validation fails, descriptive feedback is rendered to the user while keeping their input intact.

---

## 📄 License & Academic Attribution
Developed for **Front End Engineering-II Project Evaluation-II**, 26 October 2026.
Designed and verified to comply with all evaluation rubrics and syllabus requirements.
#   F E E - p r o j e c t - 2 n d - e v a l u a t i o n  
 #   F E E - p r o j e c t - 2 n d - e v a l u a t i o n  
 