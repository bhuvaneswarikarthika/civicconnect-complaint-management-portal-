# CivicConnect - Citizen Civic Issue & Complaint Management Portal 🏛️

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade, full-stack citizen civic grievance redressal and municipal issue management portal. Built to bridge the communication gap between citizens and municipal corporations with automated ticket routing, photographic evidence verification, real-time timeline auditing, and public civic transparency.

---

## 🌟 Key Highlights & Features

### 1. 🔐 Unified Smart Login Portal (`/login`)
- **Single Login Screen:** Seamless auto-detection between Admin and Citizen personas without requiring confusing role switchers.
- **Admin Access:** Enter **`admin1234`** as User ID or password to automatically route directly to the **Municipal Operations Console** (`/admin`).
- **Citizen / User Access:** Enter your **User ID** (e.g. `UID-2026-10492`) or registered credentials to access your personal **Citizen Dashboard** (`/dashboard`).
- **Fast Registration:** New users receive an automatically generated unique User ID (`UID-2026-XXXXX`).

### 2. 📝 Complaint Submission & GPS Geotagging (`/raise-complaint`)
- Lodge complaints across 9 municipal categories:
  - *Roads & Potholes*, *Garbage & Waste*, *Street Lights*, *Water Supply*, *Drainage*, *Public Toilets*, *Traffic & Signs*, *Parks & Public Spaces*, and *Other*.
- Hardware GPS coordinate locking and interactive municipal ward mapping.
- Photographic evidence upload with client-side image compression.
- Instant automated generation of a tracking ticket number (`CC-2026-XXXXX`).

### 3. 🏢 Municipal Admin Operations Console (`/admin`)
- **6 Key KPI Summary Cards:**
  1. **Total Complaints** (All complaints lodged)
  2. **New Complaints** (Awaiting triage)
  3. **Pending Review** (Under departmental inspection)
  4. **In Progress** (Field crews active on-site)
  5. **Resolved** (Verified repairs with completion photos)
  6. **Closed / Rejected** (Non-actionable or completed dossiers)
- **Advanced Filtering:** Filter complaints by Complaint ID, User ID, Category, Status, Priority, and Date presets (Today, Past 7 Days, Past 30 Days).
- **Zonal Dispatch:** Assign specific municipal departments (e.g., Roads & Infrastructure, Solid Waste Management) and field engineers.
- **Photo Resolution Proof:** Upload completed site images upon closing tickets.

### 4. 💬 User ↔ Admin Two-Way Messaging
- Interactive message thread inside each complaint dossier (`/complaints/:id`).
- Timestamps and role-based badging (*"Admin / Officer"* vs. *"Citizen"*).
- Instant **Navbar Notification Bell** with unread count alerting citizens when municipal officers reply or update complaint status.

### 5. 🌐 Public Civic Transparency Feed (`/public-complaints`)
- Citywide explorer allowing citizens to browse complaints across all 15 municipal wards.
- **Privacy Protection Active:** Personal mobile numbers, emails, and sensitive account details are redacted (e.g., `Priya R. (Resident)`).
- Community Upvoting system (+1 Citizen Voice) to highlight critical civic bottlenecks.

### 6. 👤 Citizen Profile (`/profile`)
- Displays citizen's name, verified Unique User ID (with 1-click copy), contact details, account creation date, and complete history of submitted grievances.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 (Functional Components & Hooks) |
| **Language** | TypeScript |
| **Build Tool & Server** | Vite 6 + Express Full-Stack Server |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Database** | MongoDB Atlas (via Mongoose) with automated in-memory fallback |
| **Visuals & Effects** | Canvas Confetti, CSS Grid & Flexbox |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or bun

### 1. Clone Repository
```bash
git clone https://github.com/<YOUR-USERNAME>/civicconnect-portal.git
cd civicconnect-portal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string_here
```
*(Note: If MongoDB URI is not provided, the app automatically runs in seamless in-memory fallback mode).*

### 4. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 🔑 Demo Credentials

| Role | Username / ID | Password | Destination |
|---|---|---|---|
| **Municipal Admin** | `admin1234` | `admin1234` | `/admin` |
| **Resident Citizen** | `UID-2026-10492` | `password123` | `/dashboard` |

---

## 📁 Project Directory Structure

```text
├── server.ts                  # Express backend with MongoDB & REST API routes
├── index.html                 # HTML Entry Point
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite configuration
└── src/
    ├── App.tsx                # App routing & protected route wrappers
    ├── main.tsx               # React DOM root entry
    ├── components/
    │   ├── common/            # Navbar, Sidebar, Badges, Timeline, Modals
    │   └── complaints/        # ComplaintCard, ComplaintFilters
    ├── context/               # AuthContext, ComplaintContext, ToastContext
    ├── data/                  # Mock data, wards, departments, categories
    ├── pages/
    │   ├── LandingPage.tsx          # Homepage with stats & public highlights
    │   ├── LoginPage.tsx            # Unified login portal (admin1234 / User ID)
    │   ├── CitizenDashboard.tsx     # Citizen personal portal & notifications
    │   ├── AdminDashboard.tsx       # 6 KPI metric overview & charts
    │   ├── AdminComplaintsPage.tsx  # Triage, status transitions, department assign
    │   ├── RaiseComplaintPage.tsx   # Complaint lodging with GPS & photo upload
    │   ├── TrackComplaintPage.tsx   # Public tracking by Complaint ID
    │   ├── PublicComplaintsPage.tsx # Public feed with privacy protection
    │   ├── ComplaintDetailsPage.tsx # Full dossier & user-admin discussion
    │   └── ProfilePage.tsx          # Citizen profile, User ID & filed tickets
    ├── services/api.ts        # Client API service
    └── types/index.ts         # TypeScript data contracts & interfaces
```

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
