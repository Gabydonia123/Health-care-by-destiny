# Community Health Report System (CHRS) - Nigeria
### Final-Year Computer Science Degree Project

An automated, full-stack epidemiological surveillance and early-warning web platform designed for the Nigerian public health ecosystem (aligned with National Centre for Disease Control — NCDC and Federal Ministry of Health — FMOH protocols).

---

## 1. System Overview & Problem Statement

In developing nations such as Nigeria, delays in identifying communicable disease clusters (e.g., *Vibrio cholerae*, Lassa fever, yellow fever, and contaminated community water sources) lead to preventable morbidity and mortality.

The **Community Health Report System (CHRS)** bridges the communication gap between grassroots citizens and accredited primary healthcare facilities:
1. **Citizens** submit real-time health reports with automatic GPS geo-coordinates or manual map pinning, clinical symptom checklists, and photo evidence.
2. **Automated Geodesic Routing** calculates the Haversine distance to instantly route each report to the closest accredited and active Primary Healthcare Centre (PHC) or General Hospital.
3. **Medical Surveillance Officers** inspect the case (automatically changing the status to `VIEWED` and alerting the citizen), conduct triage, and record laboratory verification.
4. **Automated Spatial-Temporal Clustering** scans verified cases in real-time. If 5 or more verified reports coincide within a 5 km radius over a 7-day sliding window, an **Outbreak Cluster** is automatically created and escalated.
5. **AI Administrative Assistant** enables authorized system administrators to command and audit surveillance operations using natural language with built-in safety confirmation gates.

---

## 2. Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React icons, Motion animations.
- **Mapping & GIS**: Leaflet 1.9, OpenStreetMap, HTML5 Geolocation API, reverse geocoding heuristics.
- **Offline & PWA**: IndexedDB (`chrs_offline_reports` store) with automatic sync upon network reconnection.
- **Backend**: Node.js, Express, TypeScript (`tsx` dev runner, `esbuild` production bundler).
- **Database**: MySQL 8 / High-Performance Relational Schema with complete Foreign Key constraints and ACID transaction isolation.
- **Security**: JWT & Session Bearer token authentication, bcrypt/Argon2 password hashing, backend RBAC middleware, and immutable audit logging.
- **AI Engine**: Server-side Google Gemini SDK (`@google/genai`) with structured parameter interpretation and whitelisted administrative tool-calling.

---

## 3. Core Algorithms

### A. Haversine Nearest-Facility Routing Algorithm
When a citizen lodges a report with coordinates $(\phi_1, \lambda_1)$, the system queries all approved and active healthcare facilities $\{(\phi_2, \lambda_2)\}$ and determines the minimum great-circle distance:

$$d = 2R \arcsin\left( \sqrt{ \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right) } \right)$$

where $R = 6371\text{ km}$ (Earth's mean radius). The case is then automatically assigned to the facility with $\min(d)$.

### B. Spatial-Temporal Outbreak Detection Algorithm
Upon verification of any clinical report:
1. The engine retrieves all `VERIFIED` cases in the same category within the sliding temporal window:
   $$t_{\text{report}} \ge t_{\text{now}} - \text{window\_days}$$
2. An incremental cluster aggregator iterates across the spatial coordinates. Cases within $\le \text{radius\_km}$ (default $5.0\text{ km}$) are grouped.
3. If the group count $N \ge \text{min\_reports}$ (default $5$), a cluster centroid is calculated:
   $$\bar{\phi} = \frac{1}{N}\sum_{i=1}^N \phi_i, \quad \bar{\lambda} = \frac{1}{N}\sum_{i=1}^N \lambda_i$$
4. An `OutbreakCluster` record is spawned or updated, setting status to `DETECTED`, and surveillance officers are notified immediately.

---

## 4. User Roles & Workflows

### 1. Citizen Sentinel
- Register, login, and secure password recovery token generation.
- Submit health report with automatic GPS location capture or interactive map pin dragging.
- Evidence photo upload and symptom tagging.
- Offline support: Reports created with no network are queued in IndexedDB and automatically synced when back online.
- Track case investigation timeline: `SUBMITTED` $\rightarrow$ `VIEWED` $\rightarrow$ `VERIFIED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`.
- Real-time notification inbox for clinical updates and public advisories.

### 2. Health Surveillance Officer
- Stationed at an accredited Primary Healthcare Centre or General Hospital.
- Review assigned incoming cases in the station triage queue.
- Inspecting a report transitions it to `VIEWED` and dispatches an instant notification to the citizen.
- Confirm diagnoses, attach clinical and laboratory rationale, and update status to `VERIFIED`.
- Inspect unmasked surveillance map layers.
- Investigate active outbreak clusters and append field epidemiology notes.
- Issue and broadcast official Public Health Alerts across affected LGAs.

### 3. Epidemiological System Administrator
- National surveillance overview dashboard with live KPIs.
- Review and verify Healthcare Facility accreditation applications (license checks e.g. MDCN/NMCN).
- Deploy and assign Medical Surveillance Officers to facilities.
- Configure Outbreak Detection Engine thresholds (radius, window days, minimum report threshold).
- **AI Administration Assistant**:
  - Natural language interface powered by Gemini.
  - Safe-tool execution only (no raw SQL injection).
  - Two-phase confirmation safety gate for sensitive operations (e.g., updating thresholds or facility status).
- Inspect immutable audit trails with timestamps, actor IDs, and IP addresses.

---

## 5. REST API Documentation

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new citizen account |
| `POST` | `/api/auth/login` | Public | Citizen JWT authentication |
| `POST` | `/api/auth/official/login` | Public | Official credentials validation |
| `POST` | `/api/auth/admin/login` | Public | Administrator sign in |
| `GET` | `/api/public/map-data` | Public | Anonymized surveillance map layers |
| `GET` | `/api/public/alerts` | Public | Official disease advisories |
| `POST` | `/api/facility/register` | Public | Clinic accreditation application |
| `POST` | `/api/citizen/reports` | Citizen | Submit new health report (geo-routed) |
| `GET` | `/api/citizen/reports` | Citizen | Fetch personal report archive |
| `GET` | `/api/citizen/notifications` | Citizen | View status notifications |
| `POST` | `/api/sync/offline-reports` | Citizen | Sync queued IndexedDB reports |
| `GET` | `/api/official/assigned-reports` | Official | Reports routed to officer's facility |
| `GET` | `/api/official/reports/:id` | Official | Inspect report (marks as VIEWED) |
| `PATCH` | `/api/official/reports/:id/status` | Official | Clinical status update & cluster check |
| `POST` | `/api/official/alerts` | Official | Broadcast public health alert |
| `GET` | `/api/admin/metrics` | Admin | National surveillance KPIs |
| `PATCH` | `/api/admin/facilities/:id` | Admin | Approve or reject facility accreditation |
| `POST` | `/api/admin/officials` | Admin | Provision and assign health officer |
| `PATCH` | `/api/admin/outbreak-settings` | Admin | Update algorithm parameters |
| `POST` | `/api/admin/ai-assistant` | Admin | AI administrative assistant command |
| `GET` | `/api/admin/audit-logs` | Admin | Query system audit trail |

---

## 6. Pre-Configured Demonstration Accounts

For academic project presentation and demonstration:

| Role | Email | Password | Assigned Entity |
|---|---|---|---|
| **Citizen (Chinedu)** | `citizen@chrs.gov.ng` | `password123` | Ikeja Community Ward |
| **Health Official (Dr. Gabriel Etu)** | `official@chrs.gov.ng` | `password123` | Lagos Island Comprehensive Health Centre |
| **Administrator (Dr. Destiny Rukewe)** | `admin@chrs.gov.ng` | `password123` | Federal Surveillance Directorate |

*Note: Quick demo login buttons are also built directly into the login screen and the navigation bar for instant one-click switching during project evaluation.*

---

## 7. Installation & Running Instructions

### Prerequisites
- Node.js 18+ and npm.

### Installation
```bash
# Install dependencies
npm install
```

### Starting Development Server
```bash
npm run dev
```
The server will bind to `http://0.0.0.0:3000` with hot-reload and integrated Vite middleware.

### Production Build
```bash
npm run build
npm start
```

---

## 8. Academic Integrity & Project Statement

This project was engineered as a final-year Computer Science Capstone Project. It demonstrates robust software engineering principles, distributed systems patterns, relational database design, algorithmic spatial analysis, and ethical, safe AI integration.
