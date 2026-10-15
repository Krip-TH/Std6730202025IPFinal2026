# Cloud deployment verification — 15 October 2026

Public Express API: **http://119.59.102.161:3117**

| Item | Verified result |
| --- | --- |
| Backend directory | `/app/std6730202025IPFinal2026` |
| Entry point | `src/server.js`, Node.js 24.18.0 |
| Bind address | `0.0.0.0:3117` |
| Database from the Cloud | `127.0.0.1:3306`, database `ip_std6730202025` |
| Employee table | `std6730202025IPFinal2026`, required column types confirmed |
| Employee preservation | Six records present before the executive upgrade; before/after SHA-256 snapshots matched |
| Prior project preservation | Six original `/app` ImperialWood file hashes matched |
| Credentials | Private `.env`, mode 600; not tracked by Git |
| Process manager | Isolated PM2 home inside the exam directory |
| API verification | Cloud loopback and public access both passed |
| Frontend | Cloud URL configured; rendered UI workflow passed against the live API |

## Executive upgrade activated

After the user stopped the previous exam process, the six staged source files were activated and the dedicated PM2 service started on `0.0.0.0:3117`. Pre-upgrade backup:

`/app/std6730202025IPFinal2026/.KripTop_backup_exec_20261015T041126Z/backend-before.tgz`

Cloud configuration was preserved. No dependency reinstall, schema change, seed or existing-record edit was required. The extension adds `PUT /api/employees/:id` and employee membership/snapshot fields to the clustering response. Every previous route remains available.

Final checks: 32 backend tests and 5 analytics tests passed; TypeScript, Expo compatibility and Web/Android/iOS exports passed. Public API tests verified login, validation, create, persistent edit with status preserved, toggles, delete, current salaries and exact memberships. Full executive dashboard workflows passed against Cloud at 1440px and 390px. Each removed only its temporary record and verified all six original records unchanged. Cloud configuration and six audited ImperialWood files also matched their baseline hashes.

These executive-upgrade results supersede the earlier deployment checks below. A real browser visual review and physical Expo Go check remain manual.

## Important Cloud lifecycle constraint

The teacher's interactive shell runs under `bwrap` in a login-session scope. The user systemd manager is unavailable. During verification, disconnecting SSH stopped even the detached PM2 process, and public port 3117 became unreachable. The service was restored from its saved, isolated PM2 process list, and a private authenticated SSH window has been left open without an automatic expiry.

**Keep that SSH window open while using this deployment.** Logout-independent hosting requires the teacher to run this backend through an approved host-level service or change the course session policy. No host services, firewall, account access, or sandbox controls were changed.

## Cause and fix

The uploaded backend had no `.env`, so its required DB_* configuration was absent. It checked MySQL before opening an HTTP listener and therefore could not serve requests. Its previous fallback port was also 3000 rather than the assigned 3117. No process was listening on 3117.

The original exam files were backed up to:

`/app/std6730202025IPFinal2026/.KripTop_backup_20261015T033124Z/backend-before.tgz`

The corrected server and secret-safe database diagnostic were deployed. A private Cloud `.env` was created with PORT=3117, HOST=0.0.0.0 and EMPLOYEE_STORAGE=mysql. MySQL loopback access and the existing table structure were tested before starting the app. No table creation, seed SQL, or `IW_` query was executed. Installed production dependencies were already valid, so no reinstall was needed.

## Managing only this exam service

In an authenticated interactive SSH shell:

```sh
cd /app/std6730202025IPFinal2026
sh scripts/cloud-service.sh status
sh scripts/cloud-service.sh logs
```

If the session was closed and port 3117 is free, reconnect and restore the saved exam service:

```sh
cd /app/std6730202025IPFinal2026
npm run db:check
sh scripts/cloud-service.sh resurrect
```

The script uses `PM2_HOME=/app/std6730202025IPFinal2026/.KripTop_runtime/pm2`, so its process list is separate from other projects. It refuses startup if port 3117 is occupied and never stops another process. Its process name is `KripTop_HR_Std6730202025IPFinal2026`. Do not close the authenticated session afterward unless the teacher has arranged persistent hosting.

## Verification performed

- Local backend regression suite: 22 passed, 0 failed.
- Cloud `npm run db:check`: passed; five existing employee records.
- Cloud curl: valid login 200, invalid login 401, unauthenticated employee request 401.
- Real API workflow on Cloud loopback and public URL: login, employee list, valid creation 201, invalid input 400, status toggle both ways, deletion and live salary analytics passed.
- Public API nonexistent employee IDs: PUT and DELETE returned 404.
- Salary analytics: three ordered tiers, numeric centroids, counts matching current employees, weighted centroid totals matching actual salary totals.
- Browser CORS preflight: 204 with `Access-Control-Allow-Origin: *`.
- Rendered React Native Web + jsdom workflow against the actual Cloud API: login guard, invalid-login alert, add validation, add, status change, delete cancellation/confirmation, automatic refresh, analytics invalidation, analytics cards and sign out all passed. The original employee snapshot was unchanged after cleanup.
- Frontend TypeScript check passed. A physical Expo Go session and visual browser layout remain manual checks because no browser/phone surface is connected.

The tests create unique temporary employee IDs and remove only those records. Existing employee data was not overwritten. Opening `/api/employees` directly in a browser returns 401 until an authenticated API request supplies the required mock token; this is expected and differs from connection refusal.

## Frontend and repeatable checks

`frontend/.env`, its public example, and the configurable source fallback use `http://119.59.102.161:3117`. Restart Expo after environment changes:

```powershell
npm --prefix frontend start -- --clear
```

To repeat the rendered UI test against the live API (creates and cleans up its own employee):

```powershell
$env:KRIPTOP_E2E_API_BASE_URL = 'http://119.59.102.161:3117'
$env:KRIPTOP_ALLOW_E2E_WRITES = '1'
npm --prefix frontend test
Remove-Item Env:KRIPTOP_E2E_API_BASE_URL, Env:KRIPTOP_ALLOW_E2E_WRITES
```

For local regression tests, leave those variables unset. Local DB access from the laptop is not required for the frontend; only Express connects to the private Cloud MySQL endpoint.
