# Teacher cloud deployment: awaiting SSH inspection

**Historical preparation notes.** Deployment and live API verification have now completed. Follow [STATUS.md](STATUS.md) for the actual `/app/std6730202025IPFinal2026` directory, assigned port 3117, private MySQL endpoint, recovery commands and the required open-SSH-session limitation. Pending items and suggested paths below describe the earlier preparation stage.

Target: `std6730202025@119.59.102.161`, SSH/SFTP port **2222**.
The SSH port is reachable from this laptop. Authentication and remote filesystem inspection have not been completed. No remote files, services, databases, or firewall rules have been changed.

## 1. Authenticate in your own VS Code PowerShell terminal

```powershell
ssh -p 2222 std6730202025@119.59.102.161
```

Enter the password only at SSH's hidden password prompt. Never paste it into chat. On first connection, verify the host fingerprint with the teacher before accepting it. Do not disable host-key checking. If SSH reports a changed host key, ask the teacher to verify it rather than removing the known host entry automatically.

Once logged in, run `pwd` and `node --version`. Keep that terminal open. Tell the coding agent the connection succeeded; share only non-secret inspection output when needed. An authenticated terminal is not automatically available to the agent's tools; agent-side SSH/SFTP may require a separate login or an already configured key. Do not share private keys or passwords.

## 2. Read-only inventory before any upload

`deploy/inspect-cloud.sh` contains the exact read-only checks: account, home and /app directories, write permission indicators, runtime versions, current-account processes, accessible Node working directories, and listening ports. It does not inspect environment variables, credentials, or existing source files. It does not invoke PM2, which could start a daemon.

You can paste the script into the authenticated SSH terminal, or run it from local PowerShell through SSH (this is a separate connection and may prompt for authentication):

```powershell
Get-Content -Raw deploy/inspect-cloud.sh | ssh -p 2222 std6730202025@119.59.102.161 'sh -s'
```

Before deployment, confirm with the teacher and inspect the output for:

- The actual resolved home directory and whether a new `~/Std0202025IPFinal2026/backend` is permitted. If it exists, stop and inspect its ownership and contents before uploading.
- Node 22.13+ (Node 24 recommended) for the project's npm startup scripts, ESM and native env-file support. If the teacher provides an older runtime, resolve compatibility before deployment rather than changing a shared runtime automatically.
- An assigned application port. A free local port alone does not establish teacher approval or firewall access.
- Existing Node services and their working directories, especially ImperialWood under `/app`. Do not stop or restart them.
- Whether the teacher requires a reverse proxy path, HTTPS, or direct port access. Do not edit a shared reverse proxy or firewall without explicit approval.

## 3. Upload into the confirmed separate directory

The local package `dist/KripTop_backend-upload.zip` contains `src/`, `scripts/`, `package.json`, `package-lock.json`, and `.env.example`. Dependencies, real `.env` files, frontend, Git metadata, Windows tooling, and historical schema scripts are excluded. The employee table already exists; do not run a create/seed script.

FileZilla: choose **SFTP**, host `119.59.102.161`, port `2222`, username `std6730202025`; enter your password inside FileZilla. Verify the same teacher-provided fingerprint. Navigate to the confirmed home directory, create a new `Std0202025IPFinal2026/backend` only after confirming it is absent, and upload the items above from the local backend folder. Do not upload to `/app` or merge with an existing directory. If using the ZIP, extract it locally into a temporary folder first, then upload those items.

Only after the exact directory and permission are confirmed, change into that directory on the Cloud and run:

```sh
pwd
ls -la
npm ci --omit=dev
```

These install commands are preparation instructions, not actions already performed. Do not execute them in a shared or unverified directory.

## 4. Start only the new app, after the port and startup action are approved

Copy `.env.example` to `.env` inside the new deployment only if `.env` does not exist. Set `PORT` to the assigned port and `HOST` to the teacher-approved bind address (`127.0.0.1` for a local reverse proxy, `0.0.0.0` if direct access is permitted). Set EMPLOYEE_STORAGE=mysql and privately fill DB_* credentials for the existing table. Run `npm run db:check` before starting. See `backend/sql/README.md`. Never expose the password in logs or the frontend.

On a runtime with env-file support:

```sh
node --env-file=.env src/server.js
```

Alternatively run `npm start` on Node 22.13+, which now loads `.env` explicitly using Node's env-file option. Exported environment variables take precedence.

Run in the foreground initially. Do not invoke `pm2 restart all`, kill a process occupying a port, install a process manager globally, or restart shared services. For background operation, get the teacher's approved process manager and a unique service name (`KripTop_HR_Std0202025IPFinal2026`) first. MySQL employee data persists across backend restarts.

## 5. Verify the actual Express URL, then configure Expo

First verify a loopback request on the Cloud using the confirmed port. Then verify the teacher-approved URL from this laptop. Port 2222 is SSH, not the API port. phpMyAdmin and MySQL addresses are not REST endpoints. If the service is not externally reachable, ask the teacher for the assigned proxy or port access; do not guess a URL or change the firewall.

From local PowerShell, after the base URL is confirmed (replace the placeholder):

```powershell
$env:KRIPTOP_API_BASE_URL = 'https://CONFIRMED-API-BASE-URL'
node deploy/verify-api.mjs
# Only against this new Final Exam app; creates then deletes its own test employee:
node deploy/verify-api.mjs --crud
```

The checks never print the mock token. The optional CRUD mode does not delete initial or unrelated employees. If cleanup fails due to connectivity, retain the reported test record for later cleanup of that specific ID.

Only once connectivity passes, set `EXPO_PUBLIC_API_BASE_URL` in `frontend/.env` to that exact base URL without `/api`, then restart:

```powershell
npm --prefix frontend start -- --clear
```

Test Expo Web: incorrect login → alert; correct login → employee directory; add → immediate refresh; toggle → badge changes; cancel delete → employee remains; confirm delete → employee disappears; analyze → loading indicator and three tiers with correct counts. Repeat in Expo Go. An HTTPS web page needs an HTTPS API to avoid mixed-content blocks.

## Database decision

MySQL storage uses only **std6730202025IPFinal2026** in **ip_std6730202025**. The user has manually created that table. Do not execute historical create/seed SQL. The `mysql2/promise` integration uses environment variables and parameterized queries. Startup performs a read-only table check and never migrates/seeds automatically. Existing `IW_` tables remain outside this deployment. No second employee table is proposed.

## Current blockers

SSH authentication, cloud directory inspection/approval, private database credential configuration, the assigned API port, and the reachable Express URL are pending. Table creation has been completed manually by the user. The local frontend configuration remains unchanged until the API URL is verified. Remote deployment and cloud end-to-end tests have not been claimed as passed.
