# FINDORA — CAMPUS LOST-AND-FOUND MANAGEMENT SYSTEM
## Comprehensive Project Engineering & Architecture Report

---

## 1. Abstract
On university and college campuses, the loss and recovery of personal belongings is a daily friction point affecting thousands of students, faculty, and administrative staff. Conventional recovery channels rely on scattered physical lost-and-found desks, informal social media posts, or department message boards, leading to low recovery rates, zero verification, and frequent leaks of private student contact details. 

**Findora** is a centralized, production-oriented web application engineered on the MERN stack (MongoDB, Express.js, React.js, and Node.js) that transforms campus lost-and-found operations. Findora incorporates rule-based candidate matching, transparent multi-factor scoring, a verified ownership claim pipeline, automated case resolution, and role-based administrative moderation. By strictly separating public metadata from sensitive user identifiers, Findora safeguards student privacy while maintaining high accountability.

---

## 2. Introduction & Background
Colleges function like micro-cities. On any given weekday, thousands of individuals traverse libraries, lecture halls, dining facilities, laboratories, and recreation complexes. Belongings such as student ID cards, keys, textbooks, water bottles, and electronics are routinely misplaced.

The absence of an integrated, automated software solution forces students to visit multiple security offices or broadcast their personal phone numbers on public social groups. Findora was designed to provide an institution-grade digital platform specifically tailored to the nuances of campus life.

---

## 3. Problem Statement & Existing-System Limitations

### 3.1 Existing System Limitations
| Parameter | Conventional / Informal System | Findora Centralized Solution |
| :--- | :--- | :--- |
| **Visibility** | Siloed by building or department | Unified campus-wide searchable database |
| **Matching** | 100% manual, dependent on luck | Automated, explainable rule-based candidate suggestion |
| **Verification** | Inconsistent or nonexistent | Mandatory structured ownership claims |
| **Privacy** | High exposure of student phones & emails | Contact details shielded; mediated internal claims |
| **Accountability** | Lost items remain unattended indefinitely | Life cycle tracking: `open` $\rightarrow$ `claim_pending` $\rightarrow$ `resolved` |
| **Moderation** | No moderation against spam or prank reports | Role-based administrator portal |

---

## 4. Project Objectives

1. **Centralize Campus Reporting:** Provide a single authoritative repository for all lost and found reports.
2. **Accelerate Item Recovery:** Enable fast multi-faceted search (title, keywords, category, campus building, date).
3. **Automate Candidate Suggestions:** Compare items across reciprocal categories (`lost` vs. `found`) with transparent scoring.
4. **Prevent False Claims:** Require claimants to provide specific physical identifiers or proof of ownership prior to handover.
5. **Protect Student Privacy:** Mask personal email addresses and contact information from public cards and listings.
6. **Provide Administrative Oversight:** Equip campus authorities with real-time analytics, report moderation, and claim auditing.

---

## 5. System Requirements Specification

### 5.1 Functional Requirements
- **FR-01: User Authentication & Role Management:** Secure registration, login, session persistence, and role separation (`user` vs. `admin`).
- **FR-02: Item Reporting (Lost):** Registered users can publish lost reports with title, category, description, location, date, and optional image URL.
- **FR-03: Item Reporting (Found):** Registered users can register discovered items with location and date details.
- **FR-04: Multi-Parameter Search & Filtering:** Dynamic query filtering across keywords, categories, locations, status, and chronological sorting.
- **FR-05: Explainable Potential-Match Algorithm:** Rule-based evaluation comparing category match, title keyword overlap, location proximity, and date proximity.
- **FR-06: Ownership Claim Workflow:** Authenticated users can submit claims for open found items with proof. Prevents duplicate pending claims and self-claiming.
- **FR-07: Claim Review & Auto-Resolution:** Finders can review, approve, or reject claims. Approving a claim automatically marks the item `resolved` and rejects competing pending claims.
- **FR-08: User Dashboard:** Tabbed view displaying personal reports, incoming claims to review, outgoing submitted claims, and resolved history.
- **FR-09: Administrative Moderation:** Admin dashboard providing real-time statistics, status overrides, and content deletion.

### 5.2 Non-Functional Requirements
- **NFR-01: Security & Confidentiality:** Passwords hashed using bcrypt; JWT tokens signed and verified; Helmet headers active; sensitive fields hidden from API output.
- **NFR-02: Reliability & Data Integrity:** Referential integrity maintained across Users, ItemReports, and ClaimRequests via Mongoose schemas.
- **NFR-03: Responsive Design:** Fluid layout adapting from mobile screens (320px) to ultra-wide displays without horizontal scroll or overflow.
- **NFR-04: Performance:** Efficient MongoDB indexing on text search and composite fields; sub-100ms API response latency on local environments.
- **NFR-05: Maintainability:** Decoupled service architecture, clear separation of controllers, routes, validation, and reusable UI components.

---

## 6. System Architecture & Database Design

### 6.1 Architectural Overview
Findora follows a classical layered client-server architecture:
1. **Presentation Layer (React + Vite):** Single Page Application (SPA) consuming REST endpoints via Axios.
2. **API & Business Logic Layer (Node.js + Express):** Express router, authentication middleware, validation handlers, and controller logic.
3. **Data Persistence Layer (MongoDB + Mongoose):** Document-oriented database enforcing schema validation and compound indexing.

### 6.2 Database Schemas

#### User Schema (`users`)
- `_id`: ObjectId (Primary Key)
- `name`: String, required, trim, max 60 chars
- `email`: String, required, unique, lowercase, regex validated
- `passwordHash`: String, required, excluded from default queries (`select: false`)
- `role`: String, enum: `['user', 'admin']`, default: `'user'`
- `createdAt`, `updatedAt`: Timestamps

#### ItemReport Schema (`itemreports`)
- `_id`: ObjectId (Primary Key)
- `title`: String, required, max 100 chars
- `category`: String, required, enum of 8 predefined campus categories
- `description`: String, required, max 1000 chars
- `reportType`: String, required, enum: `['lost', 'found']`
- `location`: String, required, max 120 chars
- `eventDate`: Date, required
- `imageUrl`: String, optional
- `status`: String, enum: `['open', 'claim_pending', 'resolved']`, default: `'open'`
- `reporter`: ObjectId, ref: `User`, required
- `resolvedAt`: Date, default: null
- **Indexes:** Text index on `{ title: 'text', description: 'text', location: 'text' }`; Compound index on `{ reportType: 1, status: 1, category: 1, createdAt: -1 }`.

#### ClaimRequest Schema (`claimrequests`)
- `_id`: ObjectId (Primary Key)
- `item`: ObjectId, ref: `ItemReport`, required
- `requester`: ObjectId, ref: `User`, required
- `message`: String, required, min 10, max 600 chars
- `status`: String, enum: `['pending', 'approved', 'rejected']`, default: `'pending'`
- `reviewedAt`: Date, default: null
- **Indexes:** Compound index on `{ item: 1, requester: 1 }` and `{ requester: 1, createdAt: -1 }`.

---

## 7. Rule-Based Matching Algorithm

Rather than relying on opaque machine learning models that require extensive historical training data, Findora implements a deterministic, explainable algorithm:

$$\text{Total Score} = S_{\text{category}} + S_{\text{title}} + S_{\text{location}} + S_{\text{description}} + S_{\text{date}}$$

Where:
- $S_{\text{category}} = 35$ if categories match exactly, else 0.
- $S_{\text{title}} = \min(30, N_{\text{matched\_keywords}} \times 15)$, excluding common English and campus stop words.
- $S_{\text{location}} = 15$ if location keywords match.
- $S_{\text{description}} = \min(10, N_{\text{desc\_keywords}} \times 5)$.
- $S_{\text{date}} = 10$ if within $\le 2$ days; $5$ if within $\le 7$ days.

Items scoring $\ge 65$ are rated **High Match**, $40-64$ as **Moderate Match**, and $20-39$ as **Fair Match**. The endpoint `GET /api/items/:id/matches` returns these candidates alongside explicit reasons (e.g. *"Matching category: Electronics"*, *"Title keywords matched: 'Apple', 'Watch'"*).

---

## 8. Verification & Testing Strategy

### 8.1 Automated Test Execution
Automated integration tests were implemented using Node's native test runner (`node --test`), `supertest`, and `mongodb-memory-server` to run fully isolated tests in memory:

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

Total Tests: 17 | Passed: 17 | Failed: 0
```

### 8.2 Production Build Verification
The React frontend client was built and verified using `vite build`:
- Transformed 2021 modules.
- Output: Valid minified JavaScript bundle (131.30 kB gzip) and stylesheet (2.14 kB gzip) with 0 errors.

---

## 9. Security & Privacy Audit

1. **No Sensitive Data Exposure:** Password hashes are set to `select: false` at the schema level. Public report details sanitize reporter information to display name only.
2. **Strict Authorization Checks:** Controllers enforce user ownership before executing updates, status changes, or deletions.
3. **Helmet Protection:** HTTP security headers (X-DNS-Prefetch-Control, X-Frame-Options, Strict-Transport-Security, X-Download-Options, X-Content-Type-Options) are applied across all API routes.
4. **Rate Limiting:** Authentication routes are guarded against credential-stuffing and brute-force attacks.

---

## 10. Conclusion & Future Scope

Findora successfully delivers an end-to-end, production-grade campus lost-and-found management solution. The application eliminates fragmented reporting channels, protects student privacy, automates candidate discovery through explainable matching, and ensures that claimed belongings are verified prior to physical handover.

### Future Scope
- **Push & Email Notifications:** Automated email or SMS notifications when a high-strength candidate match is registered.
- **Campus Card SSO Integration:** Integration with university SAML/OAuth systems (e.g., Shibboleth or Google Workspace for Education).
- **QR Code Pickup Verification:** Generation of dynamic, one-time QR codes for contactless physical handover verification at campus security desks.
