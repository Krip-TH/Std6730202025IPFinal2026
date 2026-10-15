# KripTop HR Manager & Salary Analytics

Internet Programming Final Exam 2026 · Student **6730202025**.
Submission repository: **Std0202025IPFinal2026** (the name explicitly requested by the student).

Express backend + React Native / Expo frontend. Employee records live in a server-side array with five initial employees. Restarting the backend resets all changes. No MySQL connection is used.

## Installation and startup

Install Node.js 22.13+ (Node 24 recommended) and npm. In two terminals from the project root:

```powershell
npm install --prefix backend
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

The frontend reads `EXPO_PUBLIC_API_BASE_URL` from `frontend/.env`. It is a public URL, never a secret.

1. Run `ipconfig` and find the laptop's Wi-Fi IPv4 address, for example `192.168.1.42`.
2. Set `EXPO_PUBLIC_API_BASE_URL=http://192.168.1.42:3000` in `frontend/.env`.
3. Put the phone and laptop on the same Wi-Fi network and allow Node through the Windows private-network firewall if prompted. The API listens on `0.0.0.0:3000`.
4. Restart Expo after changing environment variables (`npm --prefix frontend start -- --clear`). Scan its QR code with Expo Go.

For browser/iOS Simulator use `http://localhost:3000`. For Android Studio emulator use `http://10.0.2.2:3000`. These are the defaults without `.env`; a physical phone needs the laptop LAN IP. An Expo tunnel does not expose the separate Express API. Do not use the teacher's MySQL address as the REST API URL.

## API

All bodies/responses are JSON. Login is public. Employee endpoints require `Authorization: Bearer mock-jwt-token`.

| Method | Endpoint | Behavior |
| --- | --- | --- |
| POST | `/api/login` | `{ "username": "admin", "password": "password123" }` → `{ "success": true, "token": "mock-jwt-token" }`; invalid login 401 |
| GET | `/api/employees` | Employee array |
| POST | `/api/employees` | `{ "name": "Alex", "position": "Designer", "salary": 45000 }` → created employee, 201 |
| PUT | `/api/employees/:id/status` | Toggle Active / On Leave, updated employee |
| DELETE | `/api/employees/:id` | Delete employee, `{ "success": true }` |
| GET | `/api/employees/salary-clusters` | `{ "success": true, "clusters": [{ "group": "Tier 1", "centroid": ..., "count": ... }, ...] }` |

Missing/blank names and positions, nonnumeric salaries, zero, negative, nonfinite or unsafe salaries return 400. Salary must be a JSON number, not a numeric string. IDs use UUIDs. Missing employee IDs return 404. Malformed JSON returns 400. Requests are limited to 16 KB.

Authentication is the mandated mock token; it is suitable for this exam demo, not a production security system.

## Salary analytics

Deterministic one-dimensional Lloyd K-Means with k=3, initialized using minimum, middle and maximum salaries. Each iteration assigns employees to the nearest centroid and recalculates means; execution is capped at 100 iterations. Tiers are sorted by centroid ascending. Ties go to the first nearest cluster. Duplicate values can leave empty tiers; these retain their last centroid with count 0 (the UI shows an em dash for an empty average). With no employees, all three tiers have centroid 0 and count 0. One or two employees are supported. No synthetic employees or fabricated counts are added.

Analytics reads the current array on every request. The UI clears old analysis after mutations and explicit refresh; press Analyze Salary Structure for fresh results.

## Checks

```powershell
npm test
npm --prefix frontend run check
npm --prefix frontend test
npm --prefix frontend run export:web
```

Automated backend tests make real HTTP requests to an ephemeral Express server and cover authentication, invalid input, CRUD, nonexistent IDs, empty storage and clustering edge cases. The frontend test renders React Native Web in jsdom and exercises login, validation, CRUD, delete confirmation and analytics against a separate real Express server. Web export checks that Metro bundles the app.

Manual acceptance: sign in; add an employee; toggle status; cancel a delete and verify the employee remains; confirm delete; analyze and confirm tier counts equal the directory total. Test the configured LAN URL in Expo Go on the target phone. See `TESTING.md` for checks performed in this environment.

## Optional teacher cloud deployment

No remote server or MySQL tables have been accessed. If deployment is later requested, use the teacher-provided SSH/SFTP credentials to upload `backend/` under an approved `/app/Std0202025IPFinal2026/` directory, excluding `node_modules`. Run `npm ci --omit=dev` there and start `src/server.js` through the teacher's process manager. Set `PORT` to the assigned API port and configure an approved reverse proxy / HTTPS URL. Point the Expo public API URL to that deployed REST service. Confirm the assigned directory, port and server policy before deployment. In-memory data still resets on restart; use one backend process so requests share the same array. Do not modify `IW_` tables or other applications.

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
