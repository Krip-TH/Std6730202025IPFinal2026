# Verification record

Performed on 15 October 2026, using Node.js 24.18.0 on Windows.

| Check | Result |
| --- | --- |
| Backend automated tests (`npm test`) | 10 passed, 0 failed |
| Login 200 / invalid login 401 / unauthorized employee access 401 | Passed over real HTTP |
| Initial list, create, validation 400, status toggle twice, delete, missing IDs 404 | Passed over real HTTP |
| Malformed JSON and invalid numeric types/ranges | Passed |
| Current analysis counts, deletion to zero employees | Passed |
| K-Means: known means, duplicates, empty tiers, 0/1/2 salaries, outliers, 1,000 salaries | Passed |
| Frontend TypeScript (`npm --prefix frontend run check`) | Passed |
| Expo package compatibility (`npx expo install --check` in frontend) | Passed |
| Production Expo web export | Passed |
| Production Android and iOS bundles | Passed (Hermes bundles exported) |
| Express startup | Listening on port 3000 |
| Expo / Metro startup and HTTP page request | HTTP 200 on port 8081 |
| Rendered frontend workflow (`npm --prefix frontend test`) | Passed using React Native Web + jsdom and an isolated real Express server |

The frontend workflow verifies the dashboard login guard, wrong-password alert, successful login, blank employee validation, employee creation, three analytics cards with counts totaling six, status update, analysis invalidation, delete cancellation and confirmation, automatic directory refresh, and sign out.

## Limits and manual follow-up

- No browser surface is connected to this task; visual layout has not been reviewed in a real browser. jsdom verifies DOM interactions, not pixels or device layout. Its missing ResizeObserver warning does not prevent workflow tests from passing.
- A physical phone / Expo Go session is not connected. Scan Expo's QR code on the same network and complete the manual workflow in README. `frontend/.env` is configured with the detected Wi-Fi IPv4 address `172.20.10.2`; change it when the network changes. This local file is ignored by Git.
- Metro started in offline mode because the sandbox restricts network access. Its optional latest DevTools download could not write to the external Windows cache, so Expo used its fallback DevTools version and served the app successfully.
- The frontend dependency audit reports 32 upstream advisories (21 high, 11 moderate), including Metro / Jest tooling and Expo's signing/build dependencies. Expo's supported package versions pass compatibility checks. No force downgrade or incompatible major upgrade was applied. Backend installation reported zero advisories.
- GitHub CLI is unavailable. No remote repository has been created or pushed, and no LMS submission has been made. Follow README publication instructions using your GitHub account.
- Git metadata was initialized by the sandbox account. Git may report an ownership warning outside that account. A command-specific `-c safe.directory=D:/Std6730202025IPFinal2026` option works without changing global Git settings; see README. Changing metadata ownership was denied by Windows.
- No cloud server, database, previous project, or `IW_` table was accessed or modified.
