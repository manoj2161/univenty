# UNIVENTY – Corrected Project Package

This package contains the corrected UNIVENTY MERN application source. The existing React page components, styles, colours, typography, and image assets have been retained; the fixes focus on routing, backend correctness, access control, registration capacity, certificates, and startup configuration.

## Requirements

- Node.js 20 LTS or later
- npm 10 or later
- MongoDB local instance or MongoDB Atlas database

## 1. Configure the backend

1. Open `backend/`.
2. Copy `.env.example` to `.env`.
3. Set `MONGO_URI` to your MongoDB connection string.
4. Set `JWT_SECRET` to a random secret containing at least 32 characters.
5. Optionally configure `EMAIL_USER` and `EMAIL_PASS` for email notifications.
6. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` only if you intend to run the admin seed command. Use a unique password of at least 12 characters.

Do not commit or share `.env`. It is intentionally excluded from this package because the original archive contained live credentials. Rotate the original MongoDB password and JWT secret if the archive was shared outside your own device or trusted workspace.

Install and start the backend:

```bash
cd backend
npm install
npm run dev
```

The API starts at `http://localhost:5000` after MongoDB connects successfully. The server now exits rather than pretending to be healthy when the database connection fails.

To create or verify the administrator account:

```bash
npm run seed:admin
```

The seed command requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`. It does not create predictable demo credentials. To intentionally reset an existing admin password, set `RESET_ADMIN_PASSWORD=true` for that run.

## 2. Configure the frontend

1. Open `frontend/`.
2. Copy `.env.example` to `.env`.
3. Keep `VITE_API_URL=http://localhost:5000` for local development, unless your backend runs elsewhere.
4. Install and start:

```bash
cd frontend
npm install
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

For a production bundle:

```bash
npm run build
```

## 3. Fixes included

- Database connection is awaited before the API starts listening.
- A failed MongoDB connection now fails startup instead of leaving a misleading live API.
- JWT signing and verification require the configured secret; the insecure hard-coded fallback was removed.
- Secret-bearing `.env` files and `node_modules` are excluded; safe `.env.example` files are included.
- The event review/bookmark router is mounted before the generic event `/:id` route so `/api/events/my-bookmarks` reaches the correct controller.
- Public single-event access now returns only approved events and validates event IDs.
- Event create/update persists the advanced form fields already present in the UI: waitlist, team-event settings, and custom fields.
- Event seat capacity is claimed with an atomic conditional database update during registration approval to prevent concurrent approvals from exceeding capacity.
- Student and administrator cancellation/rejection paths release seats without decrementing below zero; waitlisted users are promoted when a seat is released.
- QR check-in uses an atomic update to prevent duplicate scans from checking in the same attendee twice.
- Organisers can issue certificates for their own events; admins retain their administrator endpoint.
- Certificates are available only after an approved attendee has been checked in and the certificate has been issued.
- The student UI only displays the certificate download control when the certificate is actually ready; the existing visual design is unchanged.
- Passwords and token-hash fields are excluded by default from Mongoose query results; login explicitly selects the password hash for comparison.
- Admin event updates use an allowlist rather than blindly assigning every request-body property.
- The admin seed script no longer creates known default accounts/passwords.

## 4. Verification performed in the preparation environment

- All backend JavaScript files passed `node --check`.
- The backend module graph loaded successfully with `NODE_ENV=test`.
- All frontend JavaScript/JSX files parsed successfully with Babel's parser.
- All local frontend imports were checked for resolvable files and exported symbols.

A full frontend Vite production build could not be completed in the preparation environment because the archived `node_modules` contains Windows native optional packages, while this environment is Linux. Reinstall dependencies with `npm install` on the target machine before running the production build. Live database, email delivery, QR camera, and browser end-to-end tests also require your actual runtime environment and cannot be certified from a static source archive.

## 5. Important operational notes

- Use MongoDB Atlas IP access rules or a local MongoDB instance that permits your backend to connect.
- Keep `.env` private and rotate exposed credentials.
- Configure `CLIENT_URLS` in the backend `.env` for your deployed frontend origin(s), separated by commas.
- Email notifications are skipped safely when email credentials are not configured.
- Existing database data is not migrated or deleted by these source changes. Take a backup before deploying changes to an existing production database.
- The PDF code listing is a reference copy. Use the accompanying ZIP to preserve the exact folder structure and copy files into your project.
