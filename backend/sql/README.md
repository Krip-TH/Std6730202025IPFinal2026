# Connect to the existing MySQL employee table

Database: `ip_std6730202025`.
The only employee table is **`std6730202025IPFinal2026`** (case-sensitive spelling).

**Current verification:** the deployed Cloud backend connected successfully to `127.0.0.1:3306`; the required table structure and five records were confirmed. Real CRUD/analytics tests passed and all original records were preserved. Credentials are configured privately on the Cloud. See `deploy/STATUS.md` at the repository root for current startup and session-lifecycle details. Laptop direct database access and the earlier SSH-forwarding attempt failed; run the backend on the Cloud and connect Expo to Express.

The user has manually created this table in phpMyAdmin. **Do not import or run these scripts against the existing Cloud table.** There is no need to recreate, seed or overwrite existing records.

## Included SQL files

- `std6730202025IPFinal2026.sql`: the exact phpMyAdmin export supplied by the user on 15 October 2026, including the table definition, primary key and seven exported employee records. This is a submission snapshot, not a statement of the current live employee count. It contains `CREATE TABLE`, `INSERT` and `ALTER TABLE` statements and was copied without executing it.
- `KripTop_initial-schema-proposal.sql`: the earlier schema/conditional-seed proposal, preserved separately for reference. It is not the user-supplied export and is not needed for the deployed database.

The supplied export contains no database password. Runtime credentials remain in ignored `.env` files.

The backend defaults to MySQL. It never creates tables or inserts seeds on startup. The original in-memory implementation remains available only through the explicit `EMPLOYEE_STORAGE=memory` setting for isolated tests and the original PDF behavior; database errors never switch the application into memory mode.

## Check the existing table in phpMyAdmin (read-only)

1. Sign into the teacher's phpMyAdmin with your own account; do not share the password in chat.
2. Select **ip_std6730202025**, then **std6730202025IPFinal2026**.
3. Inspect **Structure** for `id`, `name`, `position`, `status`, and `salary`; use **Browse** to review records. Do not edit or import anything.
4. Run `npm --prefix backend run db:check` locally after filling the private `.env`. It checks the required columns and reports only the employee count; it performs no writes. If the table differs, report the discrepancy before changing its schema.

## Backend credentials

The agent created an ignored `backend/.env` with the supplied host, database and username, and a blank password. Fill the password privately in the local editor; quote the value if it contains spaces or `#`. Do not overwrite this file by copying the example again. Do not put DB_* variables into the frontend. `DB_PORT` is the MySQL port (confirm it with the teacher); SSH port 2222 is separate. If direct database access is restricted, run the backend on the Cloud with the teacher-approved DB host or use an approved SSH tunnel; do not open firewall ports automatically.

The example contains the provided host, database and account, plus an empty password. `npm --prefix backend start` loads `backend/.env` on Node 22.13+; exported environment variables take precedence. A startup SELECT verifies the table exists without modifying it. Failed setup stops startup with a sanitized message.

All employee values and IDs use mysql2/promise `execute` placeholders. The table identifier is fixed in source, not configurable. Names/positions accept up to 100 Unicode characters; salary accepts 0.01 through 9,999,999,999.99 with at most two decimal places. Reads convert MySQL DECIMAL strings into JSON numbers. K-Means queries current salary values for every analysis request. The API paths, HTTP methods and response keys are preserved, including `/api/employees/:id/status` and `/api/employees/:id`.

## Verification after approved setup

Run regression tests without Cloud access:

```powershell
npm test
npm --prefix frontend test
npm --prefix frontend run check
```

The SQL adapter tests use a mock pool; they do not establish that the Cloud database is reachable or execute SQL on a live MySQL server.

The current request to verify all endpoints authorizes a disposable test employee without changing existing records. Once credentials and connectivity are available, run the live MySQL integration test from the project root:

```powershell
$env:KRIPTOP_ALLOW_DB_TEST_WRITES = '1'
npm --prefix backend run test:mysql
Remove-Item Env:KRIPTOP_ALLOW_DB_TEST_WRITES
```

This loads the private `backend/.env`, starts an isolated local HTTP server backed by the configured MySQL database, verifies login/401, CRUD, invalid input/400, and three current salary tiers, and deletes only its own UUID test record. It does not create tables, delete seeds, or access any other table. Without the opt-in variable it skips the live test. If connectivity fails during cleanup, retain the printed temporary ID for later deletion of only that record.

If direct access to MySQL times out, an authenticated SSH tunnel can be tested without changing the Cloud firewall. In your own terminal, keep this connection running (verify the teacher's host fingerprint and enter any SSH password only in that terminal):

```powershell
ssh -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -N -L 127.0.0.1:13306:127.0.0.1:3306 -p 2222 std6730202025@119.59.102.161
```

This tests MySQL at `127.0.0.1:3306` from the SSH server; that service/port still needs verification. Once the tunnel is authenticated, use `DB_HOST=127.0.0.1` and `DB_PORT=13306` in the laptop's private backend environment, then rerun `db:check`. If the server's MySQL port differs, ask the teacher before changing the forwarding destination. A tunnel authenticates separately from MySQL; do not assume their passwords match. No firewall changes or shared-service restarts are involved. The integration test also compares employee records before and after its temporary CRUD test.

After deploying the new Express service and confirming its public base URL, `deploy/verify-api.mjs` can verify that actual service as described in `deploy/CLOUD.md`. The frontend continues to connect to Express through `EXPO_PUBLIC_API_BASE_URL`; never use MySQL port 3306 or a phpMyAdmin URL there.

Documentation: [mysql2 Promise pool and execute](https://sidorares.github.io/node-mysql2/docs/examples/connections/create-pool).
