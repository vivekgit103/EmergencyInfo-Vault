# EmergencyInfo Vault

> A private, access-controlled web application where individuals store emergency contacts and essential medical or situational instructions, and can share a minimal read-only emergency card with first responders.

Built as an academic demonstration project for the CIA2 Backend Course.

---

## Table of Contents
- [Problem Statement](#problem-statement)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Database Seeding](#database-seeding)
- [Automated Testing](#automated-testing)
- [Building for Production](#building-for-production)
- [REST API Reference](#rest-api-reference)
- [Security Architecture](#security-architecture)
- [Manual Deployment Steps for the Owner](#manual-deployment-steps-for-the-owner)

---

## Problem Statement

In an emergency, a person or bystander may need quick access to important contacts and essential instructions (for example *"Inhaler is in the left bag pocket"* or *"Severe penicillin allergy"*). Existing alternatives are either scattered across phone settings or store far more sensitive information than necessary.

EmergencyInfo Vault gives the owner a private, access-controlled organizer and generates a stripped-down emergency card for responders. The application intentionally avoids storing sensitive personal data: no government identification numbers, credit or debit cards, bank details, full medical charts, or exact street addresses are allowed or stored.

---

## Repository Layout

```
emergencyinfo-vault/
  server/
    config/
      db.js                    # MongoDB connection helper
    controllers/
      accountController.js     # Cascade account deletion with password verification
      authController.js        # Register, login, logout, me
      contactController.js     # Emergency contact CRUD & user filtering
      emergencyController.js   # Public minimal emergency card & PIN verification
      instructionController.js # Emergency instruction CRUD & sensitive data check
      shareLinkController.js   # Share link token generation & revocation
    middleware/
      authMiddleware.js        # JWT verification via httpOnly cookie & Bearer token
      errorHandler.js          # Central error handling returning { message, errors? }
      rateLimiters.js          # express-rate-limit for auth & emergency routes
      sensitiveDataGuard.js    # Rejects 12-digit IDs and 13-19 digit card numbers
      validateMiddleware.js    # express-validator result handler
    models/
      Contact.js               # Emergency contact schema with priority & visibility
      Instruction.js           # Instruction schema (max 60 title, max 300 text)
      ShareLink.js             # 32-char hex token, hashed PIN, expiry, lockout
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
      sensitivePatterns.js     # Regex for 12-digit IDs and card patterns
      tokenUtils.js            # JWT generation & cookie configuration
    tests/
      account.test.js          # Account deletion cascade tests
      auth.test.js             # Auth and session tests
      contacts.test.js         # Contacts CRUD & priority ordering tests
      e2e_flow.test.js         # Complete end-to-end user lifecycle test
      emergency.test.js        # Public emergency card & PIN lockout tests
      instructions.test.js     # Instructions CRUD & sensitive data guard tests
      setup.js                 # mongodb-memory-server test database setup
      shareLinks.test.js       # Share link expiry, PIN hash & revocation tests
    app.js                     # Express app configuration & middleware
    server.js                  # Server entry point
    seed.js                    # Demo user and fictional sample data seeder
    package.json
    .env.example
  client/
    public/
      favicon.svg              # Geometric shield & medical cross mark
      apple-touch-icon.png     # 180x180 PNG touch icon
      og-image.png             # 1200x630 Open Graph typographic graphic
      og-image.svg             # Vector typographic Open Graph graphic
    src/
      components/
        ContactFormModal.jsx   # Add/edit contact modal
        DeleteAccountModal.jsx # Password-confirmed cascade deletion modal
        Footer.jsx             # Accessible footer with all legal & marketing links
        InstructionFormModal.jsx# Add/edit instruction with sensitive guard
        Navbar.jsx             # Accessible header with skip link & brand
        ProtectedRoute.jsx     # Route guard for authenticated owner views
        SensitiveDataNotice.jsx# Persistent privacy notice banner
        ShareLinkModal.jsx     # Share link creation modal (1h, 24h, 7d, optional PIN)
      context/
        AuthContext.jsx        # Authentication and session state
      pages/
        DashboardPage.jsx      # Owner dashboard (contacts, instructions, share links)
        EmergencyCardPage.jsx  # Public emergency view (/e/:token) with PIN prompt
        EmergencyPreviewPage.jsx# Live owner preview of responder view
        HowItWorksPage.jsx     # Informational workflow page
        LandingPage.jsx        # Marketing and product introduction page
        LoginPage.jsx          # Login form with inline validation
        NotFoundPage.jsx       # 404 handler
        PrivacyPolicyPage.jsx  # Plain language privacy policy
        RegisterPage.jsx       # Registration with password validation
        TermsPage.jsx          # Plain language terms and medical disclaimer
      services/
        api.js                 # Centralized fetch wrapper for backend endpoints
      styles/
        index.css              # Custom CSS variables, WCAG AA tokens, reset
      App.jsx                  # React Router configuration
      main.jsx                 # Application entry point
    index.html                 # Atkinson Hyperlegible typography & OG tags
    vite.config.js             # Vite configuration with API proxy
    package.json
    .env.example
  README.md
  ASSUMPTIONS.md
  REPORT.md
  .gitignore
  package.json
```

---

## Prerequisites

- **Node.js**: v20+ or v24+ (tested on Node v24.15.0).
- **npm**: v10+ or v11+ (tested on npm 11.12.1).
- **MongoDB**: A running MongoDB instance (e.g. `mongodb://127.0.0.1:27017/emergencyinfo_vault`), or MongoDB Atlas connection string. *Note: Automated tests do not require an active MongoDB server as they run entirely in-memory using `mongodb-memory-server`.*

---

## Environment Variables

### Server (`server/.env` based on `server/.env.example`)
| Variable | Description | Example Default |
|---|---|---|
| `PORT` | HTTP port for the backend server | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/emergencyinfo_vault` |
| `JWT_SECRET` | Secret key used to sign session JWTs | `emergencyinfo_vault_secret_key` |
| `CLIENT_ORIGIN`| Allowed frontend CORS origin | `http://localhost:5173` |
| `COOKIE_SECRET`| Cookie parser secret | `emergencyinfo_vault_cookie_secret` |

### Client (`client/.env` based on `client/.env.example`)
| Variable | Description | Example Default |
|---|---|---|
| `VITE_API_URL` | Backend API URL for production builds | `http://localhost:5000` |

---

## Setup & Installation

From the project root:

```bash
# 1. Install server dependencies
cd server
npm install
cp .env.example .env

# 2. Install client dependencies
cd ../client
npm install
cp .env.example .env

# Return to root
cd ..
```

---

## Running the Application

### Development Mode

You can run both the backend API and frontend client together with a single command from the project root:

```bash
npm run dev
```

Alternatively, you can run them in separate terminals if preferred:

```bash
# Terminal 1: Backend Server (runs on http://localhost:5000 with --watch)
npm run server:dev

# Terminal 2: Frontend Client (runs on http://localhost:5173)
npm run client
```

Open `http://localhost:5173` in your browser.

---

## Database Seeding

To populate a demonstration user and realistic, non-sensitive sample emergency data (using reserved fictional phone numbers from the North American 555-01xx range):

```bash
npm run seed
```

### Demo Account Credentials
- **Email:** `demo@example.com`
- **Password:** `Password123!`
- **Sample Direct Public Link:** `/e/demo-emergency-token-1234567890`
- **Sample PIN-Protected Link:** `/e/demo-pin-protected-token-987654` (PIN: `4321`)

---

## Automated Testing

Backend tests run completely in-memory using `mongodb-memory-server` and `supertest`. No external database is needed.

To execute all test suites:

```bash
npm test
```

Test coverage includes:
- Registration and login validation (email format, 8-character password minimum, unique email).
- Authentication and session protection (JWT via httpOnly cookies and Bearer headers).
- User data isolation (User A cannot view, edit, or delete User B's contacts, instructions, or links).
- Contact and instruction CRUD.
- Sensitive data guard (rejection of 12-digit ID numbers and 13-19 digit card numbers).
- Share link management (duration expiration, bcrypt PIN hashing, link revocation).
- Public emergency card access (`/e/:token`), PIN challenge, and 5-attempt brute-force lockout.
- Complete user account deletion cascade.
- Full end-to-end user lifecycle test.

---

## Building for Production

To create an optimized production build of the React frontend:

```bash
npm run client:build
```

The compiled assets will be output to `client/dist/`.

---

## REST API Reference

All requests and responses use JSON. Error responses follow a uniform shape:
```json
{
  "message": "Human-readable explanation of error",
  "errors": [{ "field": "email", "message": "Please provide a valid email address" }]
}
```

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (`name`, `email`, `password >= 8 chars`) |
| `POST` | `/api/auth/login` | Public | Log in with credentials and receive session cookie/token |
| `POST` | `/api/auth/logout` | Public | Clears session cookie |
| `GET` | `/api/auth/me` | Private | Returns current authenticated user record |

### Emergency Contacts Endpoints (`/api/contacts`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/contacts` | Private | List all contacts for owner, sorted by priority |
| `POST` | `/api/contacts` | Private | Create contact (`name`, `relationship`, `phone`, `priority`, `showInEmergency`) |
| `PUT` | `/api/contacts/:id` | Private | Update contact details or toggle emergency visibility |
| `DELETE` | `/api/contacts/:id` | Private | Delete contact |

### Emergency Instructions Endpoints (`/api/instructions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/instructions` | Private | List instructions for owner |
| `POST` | `/api/instructions` | Private | Create instruction (max 60 title, max 300 text, sensitive guard enforced) |
| `PUT` | `/api/instructions/:id` | Private | Update instruction (sensitive guard enforced) |
| `DELETE` | `/api/instructions/:id` | Private | Delete instruction |

### Share Links Endpoints (`/api/share-links`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/share-links` | Private | List share links generated by owner |
| `POST` | `/api/share-links` | Private | Generate unguessable link (`expiry`: `1h`, `24h`, `7d`; optional `pin`) |
| `DELETE` | `/api/share-links/:id` | Private | Revoke active share link |

### Public Emergency Endpoint (`/api/emergency`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/emergency/:token` | Public | Check link status (indicates whether PIN is required) |
| `POST` | `/api/emergency/:token` | Public | Submit optional `pin` and receive minimal public emergency payload |

### Account Endpoints (`/api/account`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `DELETE` | `/api/account` | Private | Permanently delete user and cascade delete all data after password confirmation |

---

## Security Architecture

1. **Authentication:** Passwords are never stored in plain text; they are hashed with `bcryptjs` (salt rounds: 10). Authentication supports secure `httpOnly`, `sameSite: 'lax'`, `secure: production` cookies as well as `Authorization: Bearer` headers.
2. **Data Isolation:** Every database operation in owner mode filters explicitly by `userId: req.user._id`.
3. **Sensitive Data Guard:** Input text is scanned by regex patterns that reject 12-digit identification numbers (e.g. Aadhaar formats) and 13 to 19 digit card numbers.
4. **Rate Limiting:**
   - Authentication routes (`/api/auth/*`): 25 requests per 15 minutes per IP.
   - Public emergency routes (`/api/emergency/*`): 60 requests per 15 minutes per IP.
   - Share link PIN lockout: 5 consecutive incorrect PIN attempts locks the specific link for 15 minutes.
5. **NoSQL Injection Defense:** `express-mongo-sanitize` strips `$` and `.` operators from incoming request bodies and query parameters.
6. **Minimal Public Exposure:** Public responder views never expose the owner's email address, database IDs, password hashes, or private items.

---

## Manual Deployment Steps for the Owner

For items that require manual domain configuration or production hosting infrastructure:

1. **Custom Domain Connection & HTTPS:**
   - Purchase or configure your domain name through a registrar.
   - Point your DNS `A` records or `CNAME` records to your hosting platform (for example Render, Railway, DigitalOcean, or AWS EC2).
   - Provision an SSL/TLS certificate using Let's Encrypt / Certbot or enable automatic HTTPS via your host.
2. **Environment Configuration:**
   - In production, set `NODE_ENV=production`.
   - Set a strong, 64-character random string for `JWT_SECRET`.
   - Update `CLIENT_ORIGIN` to your real HTTPS domain (e.g. `https://vault.example.com`).
3. **Legal Review:**
   - Before public launch, have a qualified legal professional in India review the Privacy Policy and Terms and Conditions pages.
   - Ensure the application is never marketed as a healthcare provider or emergency dispatch service.
