# Findora — Campus Lost-and-Found Management System

> "Lost something? Let's bring it back."

Findora is a full-stack MERN application engineered specifically for colleges and universities. It centralizes the lost-and-found workflow for students and campus staff, offering rule-based candidate matching, secure ownership claims, privacy protection, and administrative moderation.

[![Tests](https://img.shields.io/badge/tests-17%20passed%20%2F%200%20failed-brightgreen.svg)](#12-testing)
[![Stack](https://img.shields.io/badge/stack-MERN%20(React%2018%20%7C%20Vite%20%7C%20Node%2024%20%7C%20Express%20%7C%20MongoDB)-teal.svg)](#3-technology-stack)
[![Security](https://img.shields.io/badge/security-JWT%20%7C%20Bcrypt%20%7C%20Helmet%20%7C%20RateLimit-blue.svg)](#6-authentication-and-security)

---

## 1. Project Overview & Problem Statement

### The Problem
On active university campuses, hundreds of personal belongings are lost weekly: student ID badges, dorm keys, charging adapters, headphones, water bottles, and textbooks. Existing recovery processes are fragmented across bulletin boards, informal social media posts, and physical security desks. This creates several persistent problems:
- **Zero Centralization:** Students must physically check multiple campus desks across different buildings.
- **Privacy Exposure:** Informal social posts often expose private student phone numbers, email addresses, and ID numbers.
- **Fraudulent Pickups:** Found items handed over without proof of ownership are vulnerable to dishonest claimants.
- **No Search or Matching:** Finders and losers have no automated way of discovering potential matches.

### The Solution
Findora offers a responsive, single-pane-of-glass campus web portal where:
1. Students and faculty can report lost or discovered items in seconds.
2. A **rule-based, explainable matching algorithm** highlights candidate matches based on item category, keywords, campus location, and event date proximity.
3. Genuine owners submit structured **ownership claims** providing proof (e.g., engravings, serial codes, stickers).
4. Finders and administrators review claims, approve authentic requests, and coordinate returns safely.
5. Student privacy is protected at all times: personal contact details are never exposed publicly.

---

## 2. Key Features

- **Public & Authenticated Browsing:** Fast searching, category filtering, campus location filtering, and status filters (Open, Claim Pending, Resolved).
- **Rule-Based Matching Algorithm (`GET /api/items/:id/matches`):** Automatically evaluates candidates using weighted scoring (category, keyword intersection, location, date proximity) and outputs transparent human-readable explanations.
- **Safe Ownership Claims:** Prevents duplicate claims, prevents self-claiming, updates item status to `claim_pending`, and coordinates handovers.
- **Personal Dashboard:** Dedicated tabs for Active Lost Reports, Active Found Reports, Incoming Claims to Review, Outgoing Claims Submitted, and Resolved Cases.
- **Admin Moderation Portal:** Campus-wide statistics, status overrides, claim audits, and one-click removal of inappropriate content.
- **Editorial SaaS Design:** Curated palette featuring deep midnight navy (`#0a1128`), warm ivory canvas (`#fbfaf8`), emerald/teal accents (`#0f766e`), soft borders, and zero-layout-shift responsive behavior across mobile, tablet, and desktop.
- **Production-Ready Security:** JWT authentication, bcrypt password hashing, Helmet security headers, Express rate limiting, and centralized safe error handling without leaking stack traces.

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios with JWT request interceptors
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Styling:** Vanilla CSS3 with custom CSS Custom Properties design system

### Backend
- **Runtime:** Node.js (v20+ / v24)
- **Framework:** Express.js REST API
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Security:** Helmet, express-rate-limit, CORS origin restriction
- **Testing:** Node Native Test Runner (`node --test`), Supertest, and `mongodb-memory-server`

---

## 4. Architecture & Data Models

Findora is structured as a monorepo separating client and server concerns:

```
Findora/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ItemCard, Modals, Badges, Skeletons
│   │   ├── context/        # AuthContext (state & session restore)
│   │   ├── pages/          # Home, Browse, Detail, Reports, Dashboards, Auth
│   │   ├── services/       # Centralized Axios API client
│   │   ├── styles/         # CSS design system tokens
│   │   └── utils/          # Formatters, categories, locations
│   ├── index.html
│   └── package.json
├── server/                 # Express REST API Backend
│   ├── src/
│   │   ├── config/         # MongoDB connection (targets 'findora' db)
│   │   ├── controllers/    # Auth, Items, Claims, Matches, Admin
│   │   ├── middleware/     # Auth, Admin, Rate Limit, Error Handling
│   │   ├── models/         # User, ItemReport, ClaimRequest
│   │   ├── routes/         # REST API routes
│   │   ├── utils/          # Match algorithm, JWT helpers
│   │   ├── validation/     # Request payload validators
│   │   ├── app.js          # Express app configuration
│   │   └── server.js       # HTTP server entry point
│   ├── scripts/
│   │   ├── seed.js         # Demonstration data seeder
│   │   └── check-db.js     # Safe MongoDB connectivity validator
│   ├── tests/              # Automated backend test suites
│   └── package.json
├── docs/                   # Academic report & project documentation
├── package.json            # Root workspace orchestration
└── README.md
```

### Data Models & Relationships

```mermaid
erDiagram
    USER ||--o{ ITEM_REPORT : reports
    USER ||--o{ CLAIM_REQUEST : submits
    ITEM_REPORT ||--o{ CLAIM_REQUEST : receives

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "user | admin"
        date createdAt
    }

    ITEM_REPORT {
        ObjectId _id PK
        string title
        string category
        string description
        string reportType "lost | found"
        string location
        date eventDate
        string imageUrl
        string status "open | claim_pending | resolved"
        ObjectId reporter FK
        date resolvedAt
    }

    CLAIM_REQUEST {
        ObjectId _id PK
        ObjectId item FK
        ObjectId requester FK
        string message
        string status "pending | approved | rejected"
        date reviewedAt
        date createdAt
    }
```

---

## 5. API Endpoints Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public (Rate-limited) | Register a new campus user |
| **POST** | `/api/auth/login` | Public (Rate-limited) | Sign in and receive JWT |
| **POST** | `/api/auth/logout` | Public | Sign out |
| **GET** | `/api/auth/me` | Authenticated | Get currently signed-in user |
| **GET** | `/api/items` | Public | Search & filter reports (search, type, category, location, status, page) |
| **GET** | `/api/items/stats` | Public | Real-time counts (total, open, resolved, pending claims) |
| **GET** | `/api/items/my` | Authenticated | Retrieve user's own reports |
| **GET** | `/api/items/:id` | Public | Retrieve single report details |
| **POST** | `/api/items` | Authenticated | Create a lost or found report |
| **PUT** | `/api/items/:id` | Owner / Admin | Update report details |
| **PATCH**| `/api/items/:id/resolve` | Owner / Admin | Mark report as resolved |
| **DELETE**| `/api/items/:id` | Owner / Admin | Delete report and associated claims |
| **GET** | `/api/items/:id/matches` | Public | Scored candidate matches with reasons |
| **POST** | `/api/claims/:itemId` | Authenticated | Submit ownership claim for found item |
| **GET** | `/api/claims/my` | Authenticated | Outgoing claims submitted by user |
| **GET** | `/api/claims/incoming` | Authenticated | Incoming claims for items user found |
| **PATCH**| `/api/claims/:claimId/approve` | Finder / Admin | Approve claim & resolve item |
| **PATCH**| `/api/claims/:claimId/reject` | Finder / Admin | Reject claim request |
| **GET** | `/api/admin/overview` | Admin Only | Campus metrics & category counts |
| **GET** | `/api/admin/reports` | Admin Only | Moderation list with filters |
| **PATCH**| `/api/admin/reports/:id/status`| Admin Only | Override report status |
| **DELETE**| `/api/admin/reports/:id` | Admin Only | Remove inappropriate content |
| **GET** | `/api/admin/claims` | Admin Only | Complete campus claims audit |
| **GET** | `/api/health` | Public | System uptime & health status |

---

## 6. Authentication and Security

- **Password Security:** Passwords hashed with `bcryptjs` (salt rounds: 10). Stored passwords never appear in query results by default (`select: false`).
- **Authorization:** `requireAuth` extracts and verifies Bearer JWT tokens. `requireAdmin` ensures administrative endpoints cannot be accessed by ordinary users.
- **Resource Ownership:** Normal users cannot edit or delete reports created by other members.
- **Claim Integrity:** Users cannot submit claims for items they reported, cannot submit duplicate pending claims for the same item, and cannot approve claims on unrelated reports.
- **Rate Limiting:** Auth routes are throttled to 30 requests per 15-minute window to protect against brute-force attacks.
- **Safe Error Responses:** Centralized error middleware ensures MongoDB internal error dumps and call stacks are never returned to clients.

---

## 7. Matching Algorithm

The matching engine (`server/src/utils/matchAlgorithm.js`) runs a transparent, explainable scoring algorithm:
1. **Category Match (35 pts):** Strict equality comparison between report categories.
2. **Title Keywords (up to 30 pts):** Tokenizes title text, removes stop words, and awards points for intersecting terms.
3. **Location Keywords (up to 15 pts):** Identifies overlapping campus buildings or room identifiers.
4. **Description Keywords (up to 10 pts):** Rewards term overlap when title terms differ.
5. **Date Proximity (up to 10 pts):** Awards 10 pts for reports within 2 days, 5 pts within 1 week.

Candidates scoring $\ge 20\%$ are returned with strength indicators (`High`, `Moderate`, `Fair`) and human-readable explanations (e.g., *"Title keywords matched: 'blue', 'lanyard'"*).

---

## 8. Prerequisites

- **Node.js:** v20.x or v24.x
- **npm:** v9.x or v11.x
- **MongoDB:** A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster **or** a local MongoDB instance.

---

## 9. Installation & Quick Start

### Step 1: Clone the repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Findora
```

### Step 2: Install dependencies
Install root, client, and server packages with one command:
```bash
npm run install:all
```
*(Or install separately: `cd client && npm install` and `cd server && npm install`)*

---

## 10. Environment Variable Setup

### Backend Configuration (`server/.env`)
Copy the example file:
```bash
cp server/.env.example server/.env
```

Open `server/.env` and configure your variables:
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas or Local Connection String
# Replace <username>, <password>, and <cluster-url> with your Atlas credentials:
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/findora?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_SECRET=your_custom_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Allowed Frontend URL
FRONTEND_URL=http://localhost:5173
```

> **Target Database Note:** The backend automatically targets the database named `findora`. Even if your MongoDB Atlas URI omits `/findora`, Mongoose connects to `findora` explicitly.

### Frontend Configuration (`client/.env`)
Copy the frontend environment file:
```bash
cp client/.env.example client/.env
```
Default content:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 11. Testing Database Connection & Seeding Demo Data

### Validate MongoDB Connection Safely
Run the connectivity check script (masks passwords automatically):
```bash
npm --prefix server run check-db
```
Expected output:
```
[DB Check] Attempting connection to: mongodb+srv://***:***@cluster0.xxxx.mongodb.net/findora?retryWrites=true&w=majority
[DB Check] SUCCESS: Connected to MongoDB host: cluster0-shard-00-00.xxxx.mongodb.net
[DB Check] Target Database: "findora"
[DB Check] Connection State: connected
```

### Seed Demonstration Data
Populate realistic campus reports and demo users:
```bash
npm run seed
```
Demo accounts created:
- **Campus Admin:** `admin@findora.campus.edu` / `AdminPass123!`
- **Student Alex:** `alex@findora.campus.edu` / `FindoraDemo123!`
- **Student Priya:** `priya@findora.campus.edu` / `FindoraDemo123!`
- **Student Marcus:** `marcus@findora.campus.edu` / `FindoraDemo123!`

---

## 12. Running Locally

Open two terminal windows:

### Terminal 1: Start Express Backend
```bash
npm run dev:server
```
Runs at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

### Terminal 2: Start Vite Frontend
```bash
npm run dev:client
```
Runs at `http://localhost:5173`.

---

## 13. Testing

Findora includes an automated test suite executed with Node's native test runner (`node --test`), `supertest`, and `mongodb-memory-server`. Tests run hermetically in-memory and require no active Atlas connection:

```bash
npm test
```

### Test Results
```
✔ Auth: should register a new user successfully
✔ Auth: should prevent registration with duplicate email
✔ Auth: should fail registration when passwords do not match or fields invalid
✔ Auth: should login existing user and reject invalid credentials
✔ Auth: should access protected /api/auth/me with token and block request without token
✔ Claims: should create claim request for found item
✔ Claims: should prevent finder from claiming their own found item
✔ Claims: should prevent duplicate pending claims from the same user
✔ Claims: should prevent unauthorized user from approving claim
✔ Claims: should allow finder to approve claim and resolve item
✔ Items: should create lost and found item reports
✔ Items: should reject invalid item report creation
✔ Items: should filter and search items
✔ Items: should prevent unauthorized user from updating another user report
✔ Items: should mark item as resolved
✔ Matching Algorithm: should accurately calculate score and explainable reasons
✔ Matching Endpoint: should return scored candidate matches via GET /api/items/:id/matches

ℹ tests 17 | pass 17 | fail 0 | cancelled 0 | duration_ms 8421
```

---

## 14. Manual End-to-End Test Journey

1. **Homepage:** Open `http://localhost:5173`. Observe real database statistics, category links, and recent reports.
2. **Search & Filter:** Type *"Water Bottle"* in the search bar. Filter by *Bottles & Containers* and verify live filtering.
3. **1-Click Demo Login:** Navigate to Sign In. Click `Student: alex@findora.campus.edu`.
4. **Report Item:** Click *Report Lost Item*. Submit a report with title *"Lost Scientific Calculator"*, category *"Electronics"*, and location *"Science Complex"*.
5. **Rule-Based Matching:** Open your newly created report. Click **Check Potential Matches**. Observe scored candidate cards with explainable match reasons.
6. **Submit Claim:** Browse to an open found item reported by another user. Click **This Is My Item — Submit Claim**. Submit your proof of ownership.
7. **Finder Review:** Log out and log in as the finder (`priya@findora.campus.edu`). Go to **My Dashboard -> Incoming Claims**. Review the proof and click **Approve Claim**. Observe that the item transitions to `resolved`.
8. **Admin Portal:** Log in as `admin@findora.campus.edu`. Access **Admin** in the navbar. View campus metrics, review claims log, and test status moderation.

---

## 15. Deployment Instructions

### Backend (Render / Railway / Fly.io)
1. Set Root Directory to `server`.
2. Build command: `npm install`.
3. Start command: `node src/server.js`.
4. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=5000` (or leave default for platform)
   - `MONGODB_URI=<Your MongoDB Atlas connection URI with findora database>`
   - `JWT_SECRET=<Random 64-character string>`
   - `FRONTEND_URL=<Your live frontend URL, e.g. https://findora-campus.vercel.app>`

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Set Root Directory to `client`.
2. Build command: `npm run build`.
3. Output Directory: `dist`.
4. Add environment variable:
   - `VITE_API_URL=https://<your-backend-domain>/api`
5. Configure SPA fallback rule (e.g. `client/vercel.json` rewrite `/*` to `/index.html`) so refreshing routes works seamlessly.

---

## 16. Academic Documentation

A comprehensive academic report is available in [`docs/PROJECT_REPORT.md`](file:///c:/Users/Jeseentha%20James/OneDrive/Desktop/clg/MERN%20Stack/Findora/docs/PROJECT_REPORT.md), covering:
- System abstract & introduction
- Existing system limitations vs Findora proposed solution
- Functional and non-functional requirements
- Software architecture diagram and database schema
- Security, matching algorithm, and module descriptions
- Test execution documentation and verification matrix
- Limitations and future roadmap

---

## 17. License
This project is open-source and released under the [MIT License](LICENSE).
