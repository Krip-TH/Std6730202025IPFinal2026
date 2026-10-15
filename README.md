# KripTop HR Manager & Salary Analytics

**Cloud API verified:** http://119.59.102.161:3117. See [deployment status, test results and recovery commands](deploy/STATUS.md). Keep the private SSH window open: the course sandbox stopped the backend when its login session disconnected. Hosting after logout needs teacher-approved service management.

Internet Programming Final Exam 2026 · Student **6730202025**.
Submission repository: **Std0202025IPFinal2026** (the name explicitly requested by the student).

Express backend + React Native / Expo frontend. Employee storage defaults to MySQL in `ip_std6730202025`, using only **std6730202025IPFinal2026**. The user has already created the table in phpMyAdmin. Connect to that existing table; do not run the historical create/seed script. See [database connection instructions](backend/sql/README.md). The original array mode remains an explicit test/exam option.

## Executive dashboard

Open **http://localhost:8081** for Expo Web. Start it with `npm --prefix frontend run web -- --port 8081`. The start/web scripts clear Metro's cache on startup. After adding or updating dependencies, stop and restart this frontend process: an already-running Metro can retain a stale dependency map and return HTTP 500 for the JavaScript bundle while the HTML page still returns 200.

Five protected pages provide Executive Dashboard, Employee Management, Salary Analytics, K-Means Clustering, and Reports & Insights, with an animated responsive drawer and Logout. Seven KPIs display workforce counts, payroll, average, highest and lowest salaries. Data refreshes after each mutation, manually, and every 60 seconds while idle.

Employee Management supports persistent edits, name/position search, status filters and salary sorting. Salary Analytics shows salary ranges, employee status, averages by position and payroll composition. K-Means includes tier cards, a scatter plot with centroid lines and inspectable points, average bars, a distribution donut and sorted salary profiles. Reports use actual database records and memberships. CSV downloads on Web; native platforms share CSV text through the system share sheet.

## Installation and startup

Install Node.js 22.13+ (Node 24 recommended) and npm. The Cloud backend is already running; for the normal demo, start only the frontend terminal below. The optional backend commands require a reachable MySQL endpoint; the verified private MySQL endpoint is reachable from the Cloud shell, not directly from the laptop.

```powershell
npm install --prefix backend
# Privately fill DB_PASSWORD in the ignored backend/.env first.
npm --prefix backend run db:check
npm --prefix backend start
```

```powershell
npm install --prefix frontend
Copy-Item frontend/.env.example frontend/.env
# Edit frontend/.env as described below before starting Expo.
npm --prefix frontend start
```

Demo login: **admin** / **password123**.

Use Expo Go compatible with SDK 55 on a phone, or press `w` in Expo for the browser. The dashboard is rendered only after successful login. Session tokens remain in memory; reload signs out.

## API URL: physical phone, emulator and browser

The frontend reads `EXPO_PUBLIC_API_BASE_URL` from `frontend/.env`. The current value, example, and source fallback are **http://119.59.102.161:3117**, verified as the public Express API. It is a public URL, never a secret. This URL works for Expo Web and a phone with network access to the Cloud, without using the laptop's address for API requests.

Start Expo with `npm --prefix frontend start -- --clear` and scan its QR code with a compatible Expo Go app. The phone still needs to reach the laptop's Metro development server. Restart Expo after environment changes.

For optional local backend development, override the URL with `http://localhost:3117` for a browser/iOS Simulator, `http://10.0.2.2:3117` for Android Studio emulator, or `http://YOUR_LAPTOP_LAN_IP:3117` for a physical phone on the same network. That local backend needs its own reachable DB configuration. Do not use a MySQL or phpMyAdmin URL as the API.

## API

All bodies/responses are JSON. Login is public. Employee endpoints require `Authorization: Bearer mock-jwt-token`.

| Method | Endpoint | Behavior |
| --- | --- | --- |
| POST | `/api/login` | `{ "username": "admin", "password": "password123" }` → `{ "success": true, "token": "mock-jwt-token" }`; invalid login 401 |
| GET | `/api/employees` | Employee array |
| POST | `/api/employees` | `{ "name": "Alex", "position": "Designer", "salary": 45000 }` → created employee, 201 |
| PUT | `/api/employees/:id/status` | Toggle Active / On Leave, updated employee |
| PUT | `/api/employees/:id` | Edit name, position and salary; preserve current status; return updated employee |
| DELETE | `/api/employees/:id` | Delete employee, `{ "success": true }` |
| GET | `/api/employees/salary-clusters` | `{ "success": true, "clusters": [{ "group": "Tier 1", "centroid": ..., "count": ... }, ...] }` |

Missing/blank names and positions, names/positions longer than 100 characters, and invalid salaries return 400. Salary must be a JSON number from 0.01 to 9,999,999,999.99 with at most two decimal places. IDs use UUIDs. Missing employee IDs return 404. Malformed JSON returns 400. Requests are limited to 16 KB. Database errors return a generic JSON error without SQL or credentials.

Authentication is the mandated mock token; it is suitable for this exam demo, not a production security system.

## Salary analytics

Deterministic one-dimensional Lloyd K-Means with k=3, initialized using minimum, middle and maximum salaries. Each iteration assigns employees to the nearest centroid and recalculates means; execution is capped at 100 iterations. Tiers are sorted by centroid ascending. Ties go to the first nearest cluster. Duplicate values can leave empty tiers; these retain their last centroid with count 0 (the UI shows an em dash for an empty average). With no employees, all three tiers have centroid 0 and count 0. One or two employees are supported. No synthetic employees or fabricated counts are added.

Analytics reads current employee records from the exact MySQL table on every request. DECIMAL salaries become JSON numbers. The cluster response also supplies `assignments` (`id`, `group`, `salary`), `employees`, and `generatedAt`, preserving the existing `success` and `clusters` fields. Metrics and plots use that same snapshot. Analysis refreshes after mutations; Analyze Salary Structure also requests fresh results.

## Checks

```powershell
npm test
npm --prefix frontend run check
npm --prefix frontend run test:analytics
npm --prefix frontend test
npm --prefix frontend run export:web
```

Automated backend tests make real HTTP requests to an ephemeral Express server using explicit memory fixtures, and test SQL binding, DECIMAL conversion, transactions, live salary reads and error sanitization with a mock MySQL pool. The frontend test renders React Native Web in jsdom and exercises login, validation, CRUD, delete confirmation and analytics against a separate memory-backed Express server. Web export checks that Metro bundles the app. Approved live MySQL tests are separate: see `backend/sql/README.md`.

Manual acceptance: sign in; add an employee; toggle status; cancel a delete and verify the employee remains; confirm delete; analyze and confirm tier counts equal the directory total. Test the configured LAN URL in Expo Go on the target phone. See `TESTING.md` for checks performed in this environment.

## Teacher Cloud deployment

The backend has been deployed and verified at `/app/std6730202025IPFinal2026` on port 3117. The frontend uses that verified Cloud API. Current configuration, backups, test results and the SSH-session lifecycle limitation are documented in [deploy/STATUS.md](deploy/STATUS.md). Earlier planning notes in `deploy/CLOUD.md` are superseded by that deployment record.

The confirmed backend directory is `/app/std6730202025IPFinal2026`. Its original files were backed up before deployment. Cloud `.env` is private and uses the verified internal MySQL endpoint. Only temporary test employees were created/deleted; all six records present before the upgrade and audited ImperialWood files are unchanged. No schema, seed or `IW_` query was executed. The course sandbox requires the authenticated SSH session to stay open; see `deploy/STATUS.md`.

For a database-free local demo only, explicitly set `$env:EMPLOYEE_STORAGE='memory'` before starting the backend. This mode resets its five records on restart and is never used as a fallback when MySQL is unavailable.

## GitHub submission

Create a **public** repository named **Std0202025IPFinal2026**, then from this folder:

```powershell
git init
git add .
git commit -m "Build HR manager and salary analytics exam project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Std0202025IPFinal2026.git
git push -u origin main
```

Authenticate with your own account when requested. If an origin or remote repository already exists, inspect it before adding or pushing. Never force-push. `.gitignore` excludes dependencies, local environment files and temporary tooling. Keep lockfiles in the submission. Submit the public repository URL to LMS yourself.

This workspace already has initialized Git metadata. If Windows Git reports dubious ownership because the sandbox account initialized `.git`, prefix commands for this trusted project with `git -c safe.directory=D:/Std6730202025IPFinal2026` in place of `git`, or clone the submitted repository into a new folder owned by your account. No global trust settings were changed.

The current local workspace is named `Std6730202025IPFinal2026`; the contents can be cloned into a directory named `Std0202025IPFinal2026` for the requested submission. Both required source folders are at the repository root.
