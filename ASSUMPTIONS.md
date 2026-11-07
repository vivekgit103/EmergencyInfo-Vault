# Project Assumptions & Technical Specifications: EmergencyInfo Vault

This document records all architectural, functional, environmental, and security specifications implemented in EmergencyInfo Vault.

---

## 1. Environment & Stack Specifications
- **Node.js**: v20+ / v24.x LTS compatible (tested on Node v24.15.0, npm 11.12.1).
- **Backend Port**: `5000` (configurable via `PORT` environment variable).
- **Database Connection & Safety**:
  - Production: MongoDB connection URI configured via `MONGODB_URI`.
  - In-memory database fallback: Enabled ONLY when `NODE_ENV === 'development'`. If connection to MongoDB fails in development, the server launches an isolated `mongodb-memory-server` and initializes the demo account. In test or production environments, in-memory fallback is strictly disabled and the process exits with code 1.
  - DNS Override: Opt-in via `ENABLE_DNS_OVERRIDE === 'true'` or `ENABLE_ATLAS_DNS_OVERRIDE === 'true'`. It is disabled by default to prevent unexpected changes to host resolver configurations.
- **Client Architecture**: React 18 with Vite and React Router v6.
- **Single-Service Production Mode**: In production (`NODE_ENV === 'production'`), Express serves static assets from `client/dist` and routes non-API requests to `client/dist/index.html`.
- **Client API URL**: In development, Vite proxies `/api` requests to backend on port 5000. In production builds, `api.js` uses `import.meta.env.VITE_API_URL || ''`.

---

## 2. Authentication & Session Architecture
- **Cookie-Only Authentication**:
  - JWT tokens are delivered strictly via `httpOnly` secure cookies named `token`.
  - Registration and login responses never return the token in JSON payload.
  - No `localStorage` or `sessionStorage` token storage exists.
  - Backend authentication middleware (`protect`) reads exclusively from `req.cookies.token`. Authorization header support was removed.
- **Cookie Configuration**:
  - `httpOnly: true` (prevents JavaScript access to cookie).
  - `sameSite: 'lax'` (protects against cross-site request forgery while permitting top-level navigation).
  - `secure: process.env.NODE_ENV === 'production'` (transmits cookie exclusively over HTTPS in production).
  - Cookie `maxAge` is derived dynamically from `JWT_EXPIRES_IN` (e.g. `7d` translates to `7 * 24 * 60 * 60 * 1000` ms) via a unified helper (`getCookieOptions`).
- **CSRF Defense**:
  - State-changing HTTP methods (`POST`, `PUT`, `DELETE`) on authenticated owner routes (`/api/contacts`, `/api/instructions`, `/api/share-links`, `/api/account`) require the custom header:
    ```http
    X-Requested-With: XMLHttpRequest
    ```
  - Standard HTML forms cannot set custom headers across origins without triggering CORS preflights, providing simple CSRF defense for cookie-based authentication.
- **CORS Isolation**:
  - Server accepts requests strictly from `CLIENT_ORIGIN` (plus direct no-origin tools like cURL). All other origins are rejected with 403.
- **Password Policy**:
  - Minimum 8 characters. Hashed using `bcryptjs` with 10 salt rounds.

---

## 3. Rate Limiting & Resource Protection
- **Rate Limiters (`express-rate-limit`)**:
  - Authentication endpoints (`/api/auth/*`): 15 requests per 15 minutes per IP.
  - Emergency card public endpoints (`/api/emergency/*`): 30 requests per 15 minutes per IP.
- **Per-User Resource Caps**:
  - Maximum 10 emergency contacts per user.
  - Maximum 20 emergency instructions per user.
  - Maximum 5 active share links per user (where `isRevoked: false` and `expiresAt > Date.now()`).
  - Attempts to exceed these quotas are rejected with clear HTTP 400 Bad Request messages.
- **Atomic PIN Lockout**:
  - Brute-force PIN protection tracks incorrect attempts using MongoDB's atomic `$inc: { pinAttempts: 1 }` operator via `findOneAndUpdate`.
  - 5 consecutive incorrect attempts sets `lockedUntil` to 15 minutes in the future.
  - When the lockout period expires, attempts and lock timestamps are automatically and atomically reset to 0 / null.
- **Reverse Proxy Support & Compression**:
  - `app.set('trust proxy', 1)` is enabled to ensure accurate client IP resolution behind standard load balancers.
  - `compression()` middleware is configured to optimize response payloads.

---

## 4. Sensitive Data Guard & Luhn Verification
- **Fields Inspected**:
  - Instruction `title` and `text`.
  - Contact `name` and `relationship`.
- **National ID Numbers**:
  - Rejects 12-digit numbers formatted as 4-4-4 (e.g. `1234 5678 9012` or `1234-5678-9012`) and continuous 12-digit strings.
- **Payment Card Numbers (Luhn Algorithm Check)**:
  - Sequences of 13 to 19 digits formatted in card-like groupings (4-4-4-4, 4-6-5, 4-6-4, 4-4-4-4-X) or continuous digit runs are validated with the mathematical Luhn checksum (`passesLuhnCheck`).
  - Combining card grouping with the Luhn test ensures real payment cards are blocked while eliminating false positives on harmless inputs such as two consecutive 10-digit phone numbers (`"9876543210 9123456789"`).

---

## 5. Public Emergency View (`/e/:token`) & Privacy
- **Owner Name**:
  - Stored in `User.name` (required, 2-70 characters).
  - Delivered to public emergency view as `ownerName: user.name`.
- **Zero Internal ID Exposure**:
  - Database `_id` fields are completely stripped from contacts and instructions in public emergency responses.
- **Strict Privacy Headers**:
  - `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
  - `X-Robots-Tag: noindex, nofollow`
  - `Referrer-Policy: no-referrer`
  - Public emergency client page dynamically injects `<meta name="robots" content="noindex, nofollow" />`.
- **Access Logging (No IP / No User-Agent)**:
  - `ShareLink` logs only an anonymous integer counter (`accessCount`) and the last accessed timestamp (`lastAccessedAt`).
  - No visitor IP addresses or User-Agent strings are stored.
- **TTL Expiration Index**:
  - `ShareLink.expiresAt` uses a MongoDB TTL index with a 7-day retention buffer:
    `{ expireAfterSeconds: 604800 }`.
  - Redundant secondary indexes on `token` were removed in favor of a single `unique: true` index.
- **Strict Boolean Validation**:
  - Contact and instruction `showInEmergency` fields use strict boolean validation (`isBoolean({ strict: true })`) to reject string representations like `"false"` or `"true"`.

---

## 6. Error Handling & Information Masking
- Centralized `errorHandler` middleware ensures uniform response shape:
  ```json
  { "message": "Explanation of error", "errors": [] }
  ```
- In production (`NODE_ENV === 'production'`), for any error where `statusCode >= 500`:
  - The client response is strictly masked to `{ "message": "Internal server error" }`.
  - Internal database errors, file paths, and `err.message` are never leaked to clients.

---

## 7. Account Deletion Cascade
- Password-confirmed account deletion atomically removes:
  1. All `Contact` documents owned by the user.
  2. All `Instruction` documents owned by the user.
  3. All `ShareLink` documents owned by the user.
  4. The `User` record itself.
  5. Clears the authentication cookie and responds with 200 OK.
