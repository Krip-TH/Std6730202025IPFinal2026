# Verification record — 15 October 2026

The upgraded backend is deployed at **http://119.59.102.161:3117**, connected to the existing teacher Cloud MySQL table. All six employee records present before the upgrade match the final database snapshot. Cloud configuration and six audited ImperialWood files have matching before/after hashes. No schema or seed script was executed.

| Check | Result |
| --- | --- |
| Backend automated suite | 32 passed, 0 failed |
| Executive analytics and CSV tests | 5 passed, 0 failed |
| Frontend TypeScript | Passed; exported bundles excluded from source checking |
| Expo SDK package compatibility | Passed |
| Production Web, Android and iOS exports | Passed, `frontend/dist/executive` |
| Cloud MySQL connection and required columns | Passed, 6 existing employees |
| Public authentication | Valid login 200; invalid login and unauthorized access 401 |
| Live CRUD | Create 201, list, edit with preserved status, toggle both ways, delete passed |
| Validation and missing IDs | Invalid create 400; missing status/delete IDs 404 |
| Live K-Means | Three sorted tiers, current salaries, exact memberships and correct counts/payroll totals |
| Cloud-backed rendered dashboard, 1440px and 390px | Both passed |
| Local rendered dashboard and empty employee fixture | Passed; no remote data cleared |
| Local failed-request handling | Error displayed, last successful metrics retained, refresh recovered |
| Preservation audit | Original employees, Cloud configuration and audited ImperialWood files unchanged |
| Secret exclusions | Private environment files and SSH tooling ignored and untracked |

The rendered dashboard workflow uses React Native Web in jsdom with the actual application and live Cloud API. It verifies protected pages, invalid/valid login, all seven KPIs against API values, employee add/edit/status/search/filter/sort, chart sections, actual tier counts, loading state, inspectable salary points, CSV content/download, delete cancellation/confirmation, refreshed metrics and logout. Each Cloud run creates and removes only its own temporary employee and compares the complete original snapshot afterward.

Backend tests cover HTTP contracts with isolated fixtures, MySQL parameter binding, DECIMAL conversion, edit/status transaction commit/rollback/release, validation, secret-safe startup errors, exact table naming, and K-Means memberships for empty, small and duplicated salary sets. Analytics tests independently check metrics, salary-band boundaries, payroll memberships, empty results and CSV escaping/formula neutralization.

## Repeatable local checks

```powershell
npm --prefix backend test
npm --prefix frontend run check
npm --prefix frontend run test:analytics
npm --prefix frontend test
cd frontend
npx expo install --check
npx expo export --platform all --output-dir dist/executive
```

Live API and dashboard commands are documented in [deploy/STATUS.md](deploy/STATUS.md). The SQL integration suite is separate; these checks do not reset or recreate the Cloud table.

## Blank-page repair and real-browser verification

On 15 October 2026 the running Expo development server returned HTML 200 but its actual `AppEntry.bundle` request returned 500: Metro could not resolve `lucide-react-native/dist/esm/icons/a-arrow-down.mjs`. The file existed on disk. The old Metro process retained a stale dependency map after packages were installed. Only the local frontend process was stopped and restarted with `--clear`; the exact development bundle then returned 200 and the browser rendered normally. Start/web scripts now clear Metro's cache on startup; restart after dependency installations.

A real Chromium-based in-app browser at `http://localhost:8081` verified fresh-load login, successful Cloud authentication, all five pages, desktop sidebar collapse/reopen, mobile drawer navigation at 390px, visible SVG charts, inspectable K-Means salary points, actual CSV download, logout and fresh reload. Browser console error/warning inspection was empty after repair. Cloud create, status toggle, salary edit with preserved leave status and deletion were performed through the UI on a temporary employee only. The complete six-employee baseline matched after cleanup. No Cloud service restart or unrelated file change was needed. TypeScript passed again.

This real-browser check supersedes the earlier unavailable-browser limitation below. A physical Expo Go device remains untested.

## Verification limits

- jsdom checks interactions, not rendered pixels. The real browser now covers Web appearance and responsive navigation. Physical Expo Go behavior and native CSV sharing still need a device check. jsdom's missing ResizeObserver warning is expected.
- Keep the authenticated SSH window open. The course sandbox previously stopped session-owned backend processes on logout; teacher-managed hosting is required for persistence after logout.
- The frontend dependency audit reported 32 upstream advisories. Supported Expo package versions were retained; no incompatible forced upgrade was applied.
- The project was published to the Public repository [Krip-TH/Std0202025IPFinal2026](https://github.com/Krip-TH/Std0202025IPFinal2026) on 15 October 2026. Publishable files and existing Git history were scanned for configured secret values before pushing. Credentials remain in private ignored environment files. No LMS submission was performed.
