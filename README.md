# EmergencyInfo Vault

> A private, access-controlled web application where individuals store emergency contacts and essential medical or situational instructions, and can share a minimal read-only emergency card with first responders.

Built as an academic project for the CIA2 Backend Course.

---

## Table of Contents
- [Problem Statement](#problem-statement)
- [What We Deliberately Do NOT Store](#what-we-deliberately-do-not-store)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Development Only: Database Seeding & Demo Credentials](#development-only-database-seeding--demo-credentials)
- [Automated Testing](#automated-testing)
- [Building & Running in Production](#building--running-in-production)
- [REST API Reference](#rest-api-reference)
- [Security & Privacy Architecture](#security--privacy-architecture)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Manual Deployment Steps for the Owner](#manual-deployment-steps-for-the-owner)

---

## Problem Statement

In an emergency, a person or bystander may need quick access to important contacts and essential instructions (for example *"Inhaler is in the left bag pocket"* or *"Severe penicillin allergy"*). Existing alternatives are either scattered across phone settings or store far more sensitive information than necessary.

EmergencyInfo Vault gives the owner a private, access-controlled organizer and generates a stripped-down emergency card for responders. The application intentionally avoids storing sensitive personal data: no government identification numbers, credit or debit cards, bank details, full medical charts, or exact street addresses are allowed or stored.

---

## What We Deliberately Do NOT Store

Privacy by design is a core guarantee of EmergencyInfo Vault. The following table details what the system intentionally refuses to store:

| Data Category | Deliberate Policy | Technical Enforcement Mechanism |
|---|---|---|
| **Plain-text Passwords** | Never stored in plain text or reversible encryption. | Hashed using `bcryptjs` with 10 salt rounds before persistence. |
| **Payment Cards** | Credit and debit card numbers (13 to 19 digits) are strictly prohibited. | `sensitiveDataGuard` and Luhn checksum algorithm (`passesLuhnCheck`) reject card patterns across instructions and contacts. |
| **National IDs** | 12-digit national identification numbers (e.g. Aadhaar format) are prohibited. | Regex scanner rejects continuous or 4-4-4 grouped 12-digit numbers on instructions and contacts. |
| **Visitor IP Addresses** | No IP addresses of responders or emergency card viewers are saved. | Access logging records only an anonymous integer counter (`accessCount`) and timestamp (`lastAccessedAt`). |
| **Browser User-Agents** | No device fingerprints or User-Agent strings of viewers are captured. | Completely omitted from the `ShareLink` access log. |
| **Internal Database IDs** | Database ObjectIDs (`_id`) are never exposed to public emergency viewers. | `emergencyController` strips all `_id` keys from contacts and instructions in public payloads. |
| **Private Contacts / Notes** | Items marked `showInEmergency: false` are never exposed to responders. | Strict database query filter `{ showInEmergency: true }` in `emergencyController`. |
| **Account Email & Passwords** | Owner account email and credentials are never exposed publicly. | Only `ownerName` (the user's first/display name) is delivered on public cards. |
| **Full Medical Records** | No medical files, lab charts, or health insurance logins are accepted. | Only concise, user-authored situational instructions (max 60 char title, max 300 char text) are permitted. |

---

## Repository Layout

```
emergencyinfo-vault/
  server/
    config/
      db.js                    # MongoDB connection helper (development in-memory fallback, opt-in DNS override)
    controllers/
      accountController.js     # Cascade account deletion with password verification
      authController.js        # Cookie-only auth: register, login, logout, me
      contactController.js     # Emergency contact CRUD, 10-contact limit, priority sorting
      emergencyController.js   # Public minimal emergency card, atomic PIN lockout, access counter
      instructionController.js # Emergency instruction CRUD, 20-instruction limit, sensitive guard
      shareLinkController.js   # Share link generation (max 5 active), PIN validation, revocation
    middleware/
      authMiddleware.js        # Strict cookie-only JWT verification (no Bearer fallback)
      csrfGuard.js             # Enforces X-Requested-With header on state-modifying owner routes
      errorHandler.js          # Central error handler; masks 500+ messages as "Internal server error" in production
      mongoSanitize.js         # Non-mutating custom NoSQL injection sanitizer
      rateLimiters.js          # Rate limiters (auth: 15 req/15min; emergency: 30 req/15min)
      sensitiveDataGuard.js    # Rejects 12-digit IDs and Luhn-validated card numbers
      validateMiddleware.js    # express-validator result handler
    models/
      Contact.js               # Emergency contact schema with priority & strict boolean visibility
      Instruction.js           # Instruction schema (max 60 title, max 300 text)
      ShareLink.js             # Unguessable 32-char hex token, hashed PIN, TTL index (7-day buffer)
      User.js                  # User schema with bcrypt password hashing
    routes/
      accountRoutes.js
      authRoutes.js
      contactRoutes.js
      emergencyRoutes.js
      instructionRoutes.js
      shareLinkRoutes.js
    utils/
      asyncHandler.js          # Async wrapper for route handlers
      sensitivePatterns.js     # Regex for 12-digit IDs, Luhn check, and payment card patterns
      tokenUtils.js            # JWT generation, cookie expiration parsing from JWT_EXPIRES_IN
    tests/
      account.test.js          # Cascade deletion tests
      auth.test.js             # Cookie-only authentication tests
      contacts.test.js         # Contacts CRUD, priority, sensitive guard & 10-limit tests
      cors.test.js             # CORS CLIENT_ORIGIN enforcement tests
      csrf.test.js             # CSRF X-Requested-With guard tests
      db_connection.test.js    # DB in-memory development fallback & production failure tests
      e2e_flow.test.js         # Complete end-to-end user lifecycle test
      emergency.test.js        # Emergency card access, atomic PIN lockout & access counter tests
      env_validation.test.js   # Server fail-fast environment validation tests
      error_handler.test.js    # Production error masking tests
      instructions.test.js     # Instruction CRUD, sensitive guard & 20-limit tests
      seed.test.js             # Seed script safety tests
      server_config.test.js    # Trust proxy, compression & health DB check tests
      setup.js                 # mongodb-memory-server test database setup
      shareLinks.test.js       # Share link expiry, PIN hash, 5-limit & TTL index tests
      single_service.test.js   # Single-service production static serving tests
      token_utils.test.js      # Cookie maxAge derivation tests
    app.js                     # Express app configuration & middleware
    server.js                  # Server entry point with graceful SIGTERM shutdown
    seed.js                    # Demo user and fictional sample data seeder (disabled in production)
    package.json
    .env.example
  client/
    src/
      components/
        Button.jsx             # Tactile button component (primary, secondary, danger)
        ContactFormModal.jsx   # Add/edit contact modal
        DeleteAccountModal.jsx # Password-confirmed cascade deletion modal
        Footer.jsx             # Accessible footer with legal & marketing links
        InstructionFormModal.jsx # Add/edit instruction modal with sensitive guard
        Navbar.jsx             # Floating glass pill navbar / accessible light header
        ProtectedRoute.jsx     # Route guard for authenticated owner views
        SensitiveDataNotice.jsx # Persistent privacy notice banner
        ShareLinkModal.jsx     # Share link creation, QR code (qrcode.react) & printable wallet card
      pages/
        DashboardPage.jsx      # Owner dashboard with access counters and last viewed timestamps
        EmergencyCardPage.jsx  # Public emergency view (/e/:token) with PIN prompt & noindex meta
        EmergencyPreviewPage.jsx # Live owner preview of responder view
        HowItWorksPage.jsx     # Informational workflow page
        LandingPage.jsx        # Editorial marketing page with animated background
        LoginPage.jsx          # Login form with cookie-only session handling
        NotFoundPage.jsx       # 404 handler
        PrivacyPolicyPage.jsx  # Plain language privacy policy
        RegisterPage.jsx       # Registration form with validation
        TermsPage.jsx          # Plain language terms and medical disclaimer
      services/
        api.js                 # Centralized fetch wrapper with credentials: 'include' & X-Requested-With
      styles/
        tokens.css             # Synapse design system tokens (WCAG AA audited)
        index.css              # Custom styling, print layout, reset
      App.jsx                  # React Router configuration
      main.jsx                 # Application entry point
    package.json
  package.json                 # Root package scripts (dev, test, build, start)
  README.md
  ASSUMPTIONS.md
  REPORT.md
```

---

## Prerequisites

- **Node.js**: v20+ or v24+ (tested on Node v24.15.0).
- **npm**: v10+ or v11+ (tested on npm 11.12.1).
- **MongoDB**: A running MongoDB instance (e.g. `mongodb://127.0.0.1:27017/emergencyinfo_vault`), or MongoDB Atlas connection string. *Note: Automated tests do not require an active MongoDB server as they run entirely in-memory using `mongodb-memory-server`.*

---

## Environment Variables

### Server (`server/.env` based on `server/.env.example`)
| Variable | Description | Required | Constraints |
|---|---|---|---|
| `PORT` | HTTP port for backend server | No (default `5000`) | Numeric |
| `NODE_ENV` | Runtime environment | Yes | `development`, `production`, or `test` |
| `MONGODB_URI` | MongoDB connection URI | Yes | Valid MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign session cookies | Yes | In production: min 32 characters, cannot contain "replace", "example", or "secret_key" |
| `COOKIE_SECRET` | Secret key for signing cookies | Yes | Required; cannot be empty |
| `CLIENT_ORIGIN` | Allowed frontend CORS origin | Yes | Exact frontend URL (e.g. `http://localhost:5173` or `https://vault.example.com`) |
| `JWT_EXPIRES_IN` | Token duration string | No (default `7d`) | e.g. `7d`, `24h`, `12h`. Cookie `maxAge` is automatically derived from this value |
| `ENABLE_DNS_OVERRIDE` | Opt-in public DNS nameservers override (`8.8.8.8`, `1.1.1.1`) | No (default `false`) | Set `true` if your ISP blocks SRV lookups on MongoDB Atlas |

### Client (`client/.env` based on `client/.env.example`)
| Variable | Description | Required | Notes |
|---|---|---|---|
| `VITE_API_URL` | Base URL for backend API | No | In single-service production mode, omit or leave empty for relative `/api` paths. Set if client is hosted separately. |

---

## Setup & Installation

From the project root:

```bash
# 1. Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install

# 2. Configure environment files manually (never auto-copied)
cp server/.env.example server/.env
```

Edit `server/.env` with your secure keys.

---

## Running the Application

### Development Mode

Run both the backend API and frontend client concurrently from the project root:

```bash
npm run dev
```

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173`

Alternatively:
```bash
npm run server:dev   # Backend only
npm run client       # Frontend only
```

---

## Development Only: Database Seeding & Demo Credentials

> **WARNING:** The database seeder refuses to execute when `NODE_ENV=production`. Demo credentials are for local development evaluation only.

To populate a demonstration user and realistic, non-sensitive sample emergency data:

```bash
npm run seed
```

### Demo Account Credentials (Development only)
- **Email:** `demo@example.com`
- **Password:** `Password123!`
- **Sample Direct Public Link:** `/e/demo-emergency-token-1234567890`
- **Sample PIN-Protected Link:** `/e/demo-pin-protected-token-987654` (PIN: `987654`)

---

## Automated Testing

Backend tests run completely in-memory using `mongodb-memory-server`, `jest`, and `supertest`.

To execute all 16 test suites (93+ tests):

```bash
npm test
```

Test coverage includes:
- Registration and login validation (email format, 8-character password minimum, unique email).
- Cookie-only authentication (no token in response body, no Bearer header, httpOnly cookie).
- Token expiration derivation from `JWT_EXPIRES_IN`.
- CSRF protection (`X-Requested-With` header requirement on state-changing owner routes).
- CORS origin restriction to `CLIENT_ORIGIN`.
- Health check reporting MongoDB connection state (503 when disconnected).
- Sensitive data guard (Luhn-validated payment card grouping and 12-digit ID rejection on instructions and contacts).
- Strict boolean validation on `showInEmergency` (rejects `"false"` strings).
- Per-user limits (max 10 contacts, 20 instructions, 5 active share links).
- Public emergency view minimal payload, no `_id` leakage, and strict no-index headers.
- Atomic PIN attempt counter and 15-minute temporary lockout.
- Share link TTL index (7-day buffer) and access logging (counter and last accessed timestamp without IP/UA).
- Complete user account deletion cascade.
- Fail-fast environment variable validation.
- Production error masking (status >= 500 returns "Internal server error" only).
- Single-service production static serving and fallback.

---

## Building & Running in Production

EmergencyInfo Vault supports single-service mode where Express serves both the REST API and the compiled React frontend client:

```bash
# 1. Build client assets
npm run build

# 2. Start server in production mode
npm start
```

When `NODE_ENV=production`, Express automatically serves `client/dist` and handles client-side routing with a fallback to `client/dist/index.html` for non-API routes.

---

## REST API Reference

All requests and responses use JSON. State-modifying requests (`POST`, `PUT`, `DELETE`) on owner routes require the header:
```http
X-Requested-With: XMLHttpRequest
```

Error responses follow a uniform shape:
```json
{
  "message": "Human-readable explanation of error",
  "errors": [{ "field": "email", "message": "Please provide a valid email address" }]
}
```

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | 15 / 15m | Register new user (`name`, `email`, `password >= 8 chars`). Sets httpOnly `token` cookie. |
| `POST` | `/api/auth/login` | Public | 15 / 15m | Log in with credentials. Sets httpOnly `token` cookie. |
| `POST` | `/api/auth/logout` | Public | - | Clears httpOnly `token` cookie. |
| `GET` | `/api/auth/me` | Private | - | Returns current authenticated user record (`id`, `name`, `email`). |

### Emergency Contacts Endpoints (`/api/contacts`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/contacts` | Private | List all contacts for owner, sorted by priority (`primary` > `secondary` > `other`). |
| `POST` | `/api/contacts` | Private | Create contact (`name`, `relationship`, `phone`, `priority`, `showInEmergency`). Max 10 per user. Sensitive data guard enforced. |
| `PUT` | `/api/contacts/:id` | Private | Update contact details or toggle emergency visibility. Sensitive data guard enforced. |
| `DELETE` | `/api/contacts/:id` | Private | Delete contact. |

### Emergency Instructions Endpoints (`/api/instructions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/instructions` | Private | List instructions for owner. |
| `POST` | `/api/instructions` | Private | Create instruction (`title` max 60, `text` max 300, `showInEmergency`). Max 20 per user. Sensitive data guard enforced. |
| `PUT` | `/api/instructions/:id` | Private | Update instruction. Sensitive data guard enforced. |
| `DELETE` | `/api/instructions/:id` | Private | Delete instruction. |

### Share Links Endpoints (`/api/share-links`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/share-links` | Private | List share links generated by owner, including view counters and last accessed dates. |
| `POST` | `/api/share-links` | Private | Generate unguessable link (`expiry`: `1h`, `24h`, `7d`; optional `pin` min 6 digits). Max 5 active links per user. |
| `DELETE` | `/api/share-links/:id` | Private | Revoke active share link. |

### Public Emergency Endpoint (`/api/emergency`)
| Method | Endpoint | Access | Rate Limit | Description |
|---|---|---|---|---|
| `GET` | `/api/emergency/:token` | Public | 30 / 15m | Check link status. If no PIN is required, returns payload directly and records access. |
| `POST` | `/api/emergency/:token` | Public | 30 / 15m | Submit optional `pin` and receive minimal public emergency payload. Atomically increments access counter on success. |

### System & Health (`/api/health`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Health status. Returns 200 with `{ status: "ok", database: "connected" }` or 503 if disconnected. |

### Account Deletion (`/api/account`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `DELETE` | `/api/account` | Private | Permanently delete user and cascade delete all contacts, instructions, and share links after password verification. |

---

## Security & Privacy Architecture

1. **Cookie-Only Authentication:**
   - JSON Web Tokens (JWT) are stored strictly in `httpOnly` cookies named `token`.
   - JavaScript cannot read session tokens (`XSS` mitigation).
   - Cookies use `sameSite: 'lax'`, `path: '/'`, and `secure: true` in production.
   - Token duration and cookie `maxAge` are synchronized from `JWT_EXPIRES_IN`.
2. **CSRF Defense:**
   - State-changing requests (`POST`, `PUT`, `DELETE`) on owner routes require the custom header `X-Requested-With: XMLHttpRequest`.
   - Browsers prevent cross-origin HTML form submissions from attaching custom headers without CORS preflight approval.
3. **CORS Isolation:**
   - Backend accepts requests strictly from `CLIENT_ORIGIN` (plus direct no-origin tools like cURL). Cross-origin web requests from unauthorized origins are rejected with 403.
4. **Data Isolation & Per-User Limits:**
   - Every database query in owner mode scopes strictly by `userId: req.user._id`.
   - Per-user caps prevent resource exhaustion: max 10 contacts, max 20 instructions, max 5 active share links.
5. **Sensitive Data Guard & Luhn Verification:**
   - Text fields in instructions and contacts are inspected for payment card patterns and national ID numbers.
   - Card numbers are verified with the mathematical Luhn checksum algorithm and card groupings (e.g. 4-4-4-4, 4-6-5), preventing false positives on harmless inputs such as two consecutive phone numbers.
6. **Rate Limiting & Atomic Lockout:**
   - Authentication endpoints limited to 15 requests per 15 minutes per IP.
   - Emergency card access limited to 30 requests per 15 minutes per IP.
   - Brute-force PIN protection uses MongoDB atomic `$inc: { pinAttempts: 1 }` with `findOneAndUpdate`. 5 incorrect attempts triggers a 15-minute lockout. Locks automatically reset upon expiration or correct PIN verification.
7. **Public Privacy Headers & Crawler Prohibition:**
   - Emergency card routes return `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`, `X-Robots-Tag: noindex, nofollow`, and `Referrer-Policy: no-referrer`.
   - Public emergency card page injects `<meta name="robots" content="noindex, nofollow" />`.
8. **NoSQL Injection Defense:**
   - Custom non-mutating recursive sanitizer cleans `$` and `.` operators from request bodies, parameters, and query strings.
9. **Error Masking:**
   - For all HTTP status codes >= 500 in production, the error response is masked to `{ "message": "Internal server error" }` only, preventing internal stack or database error leaks.

---

## Pre-Deployment Checklist

Before deploying EmergencyInfo Vault to a production server, complete each of the following verification steps:

- [ ] **1. Set `NODE_ENV=production`**: Ensure production mode is set in environment configuration.
- [ ] **2. Generate Strong Secrets**:
  - `JWT_SECRET`: Generate a cryptographically random string of at least 64 characters (e.g. `openssl rand -hex 32`). Must NOT contain "replace", "example", or "secret_key".
  - `COOKIE_SECRET`: Generate a cryptographically random string of at least 32 characters.
- [ ] **3. Configure Production MongoDB URI**:
  - Set `MONGODB_URI` to your production MongoDB cluster with authentication and TLS enabled.
  - Verify network firewall / IP access list allows connections from your production host.
- [ ] **4. Configure `CLIENT_ORIGIN`**:
  - Set `CLIENT_ORIGIN` to the exact HTTPS origin of your deployed frontend (e.g. `https://vault.example.com`).
- [ ] **5. Build Client Assets**:
  - Run `npm run build` to generate compiled static assets in `client/dist`.
- [ ] **6. Verify Database Seeding is Disabled**:
  - Confirm `seed.js` is never executed in production.
- [ ] **7. Verify Health Endpoint**:
  - Verify `/api/health` returns HTTP 200 with `{ "status": "ok", "database": "connected" }`.
- [ ] **8. Run Test Suite**:
  - Run `npm test` and verify all 16 test suites pass with 100% success.
- [ ] **9. Legal & Compliance Review**:
  - Have Privacy Policy and Terms and Conditions reviewed by legal counsel in your operating jurisdiction.
  - Confirm all marketing copy contains no claims of being an emergency response service or medical provider.

---

## Manual Deployment Steps for the Owner

1. **Custom Domain Connection & HTTPS:**
   - Point your DNS `A` records or `CNAME` records to your hosting platform (Render, Railway, DigitalOcean, AWS, etc.).
   - Enable automatic HTTPS or provision an SSL/TLS certificate with Let's Encrypt / Certbot.
2. **Environment Configuration:**
   - Add all required environment variables via your host's dashboard (`NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `COOKIE_SECRET`, `CLIENT_ORIGIN`).
3. **Run Process Manager:**
   - Use a production process manager such as `pm2` or containerized deployment (`docker`).
   - Command: `npm start` (executes `node server/server.js`).
