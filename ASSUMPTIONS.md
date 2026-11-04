# Project Assumptions: EmergencyInfo Vault

This document records all architectural, functional, environmental, and implementation choices made to ensure a consistent, secure, and complete implementation of EmergencyInfo Vault.

## 1. Environment & Stack Specifications
- **Node.js**: v20+ / v24.x LTS compatible (current environment: Node v24.15.0, npm 11.12.1).
- **Backend Port**: `5000` (configurable via `PORT` environment variable).
- **Frontend Port**: `5173` (Vite default dev server).
- **Database**:
  - Production: MongoDB URI configured via `MONGODB_URI`.
  - Local development: First attempts connection to `MONGODB_URI` (defaulting to `mongodb://127.0.0.1:27017/emergencyinfo_vault`). If no external MongoDB daemon is detected, the server automatically starts an in-memory database using `mongodb-memory-server` and seeds the demo account (`demo@example.com` / `Password123!`), allowing zero-friction local development without requiring a pre-installed MongoDB daemon.
  - Automated testing: In-memory MongoDB using `mongodb-memory-server` ensuring 100% self-contained, reproducible tests without requiring an active external MongoDB daemon.
- **Client Framework**: React 18 / 19 with Vite, React Router v6/v7, React Context for authentication and notification state.
- **Styling**: Plain CSS with CSS Custom Properties (CSS variables) matching the design specification:
  - Base background: `#FAF8F4` (Warm off-white)
  - Text: `#1B1B1B` (Near-black)
  - Primary accent: `#0F5C4D` (Deep teal green)
  - Destructive & Emergency card header accent: `#9B1C1C` (Dark red)
  - Card/Surface backgrounds: `#FFFFFF` and `#F3EFEA`
  - Border: `#DDD7CE`
  - Font: Atkinson Hyperlegible
- **Icons**: `lucide-react` for clean, professional SVG icons (strictly no emoji as UI icons).

## 2. Authentication & Security Choices
- **Password Policy**: Minimum 8 characters. Hashed using `bcryptjs` with a work factor of 10 rounds.
- **Session & Tokens**:
  - JSON Web Tokens (JWT) signed with `JWT_SECRET` and expiring in 7 days (default).
  - Both `httpOnly` secure cookies (named `token`) and standard `Authorization: Bearer <token>` headers are supported by backend middleware. This ensures direct browser security with cookies and straightforward automated API testing with headers.
  - Cookies use `sameSite: 'lax'`, `httpOnly: true`, and `secure: process.env.NODE_ENV === 'production'`.
- **Rate Limiting**:
  - Authentication routes (`/api/auth/*`): 15 requests per 15 minutes per IP.
  - Public Emergency access (`/api/emergency/:token`): 30 requests per 15 minutes per IP.
  - Share link PIN verification lockout: 5 consecutive failed PIN attempts locks the specific share link for 15 minutes (`pinAttempts` counter and `lockedUntil` timestamp tracked on the link document).

## 3. Data Models & Validation
- **User**:
  - `name`: String, required, trimmed, 2 to 70 characters.
  - `email`: String, required, lowercase, trimmed, valid email format, unique index.
  - `password`: String, required, minimum 8 characters, hashed before persistence.
  - `createdAt`, `updatedAt`: Timestamps.
- **Emergency Contact**:
  - `userId`: ObjectId reference to User, indexed.
  - `name`: String, required, trimmed, 1 to 100 characters.
  - `relationship`: String, required, trimmed (e.g., Parent, Spouse, Sibling, Friend, Doctor, Colleague, Neighbor, Other).
  - `phone`: String, required, trimmed, international or local format (validated against valid phone character set and length).
  - `priority`: Enum `['primary', 'secondary', 'other']`, default `'primary'`.
  - `showInEmergency`: Boolean, default `true`.
- **Emergency Instruction**:
  - `userId`: ObjectId reference to User, indexed.
  - `title`: String, required, max 60 characters.
  - `text`: String, required, max 300 characters. Checked by sensitive data guard.
  - `showInEmergency`: Boolean, default `true`.
- **Share Link**:
  - `userId`: ObjectId reference to User, indexed.
  - `token`: String, unique, unguessable 32-character hexadecimal string (`crypto.randomBytes(16).toString('hex')`).
  - `pinHash`: Optional String, hashed using `bcryptjs` if a 4-to-6 digit PIN is provided by owner.
  - `expiresAt`: Date, calculated from owner's selection (`1h`, `24h`, `7d`).
  - `isRevoked`: Boolean, default `false`.
  - `pinAttempts`: Number, default `0`.
  - `lockedUntil`: Optional Date.
  - `createdAt`, `updatedAt`: Timestamps.

## 4. Sensitive Data Guard Patterns
- The backend inspection rejects any instruction title or text that matches:
  1. **12-digit national identification numbers** (such as Indian Aadhaar-like 12-digit sequences with optional spaces or hyphens: `\b\d{4}[ -]?\d{4}[ -]?\d{4}\b` or continuous `\b\d{12}\b`).
  2. **13-to-19-digit payment card numbers** (Credit/Debit cards: sequences of 13 to 19 digits formatted with or without spaces/hyphens `\b(?:\d[ -]?){13,19}\b` that match major card formats).
- Frontend enforces inline matching validation and shows a permanent warning banner: *"Do not enter passwords, ID numbers, or financial details."*

## 5. Public Emergency View (`/e/:token`) Behavior
- If the token does not exist: returns 404 with friendly message.
- If the link has expired (`expiresAt < new Date()`): returns 410 (or 404) with clear expired notice.
- If the link was revoked (`isRevoked === true`): returns 403 (or 410) with clear revoked notice.
- If the link is locked due to repeated PIN failures: returns 429 with lockout timer details.
- If a PIN is required and none was sent or incorrect: returns 401 with prompt for PIN (and remaining attempts count).
- When authorized: returns **only** owner's first name / display name (or generic "Emergency Information"), emergency contacts with `showInEmergency: true` sorted by priority (`primary` > `secondary` > `other`), and instructions with `showInEmergency: true`.
- **Strict Privacy**: Owner's email, account creation date, user ID, internal IDs, and private non-emergency items are never exposed.

## 6. Account Deletion Cascade
- When an owner confirms deletion with their current password, the deletion permanently removes in a single coordinated operation:
  1. All `EmergencyContact` documents where `userId == owner._id`.
  2. All `EmergencyInstruction` documents where `userId == owner._id`.
  3. All `ShareLink` documents where `userId == owner._id`.
  4. The `User` record itself.
  5. Clears the authentication cookie and responds with 200 OK.
