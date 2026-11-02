# Admin performance: baseline and verification

This file records measurements and how to reproduce them. It does **not** claim an improvement over production: the production numbers and the fixture numbers below come from different environments and must not be compared or turned into a "% faster" figure.

## 1. Production baseline (before the refactor, measured through the authorized browser session)

Real deployment, real Supabase, a single user session. Milliseconds, browser-measured.

| Page | Direct load (domReady) | Median | Sidebar click |
| --- | --- | --- | --- |
| Matches | 4621, 4247, 4517 | 4517 | 3034, 3397 (avg 3216) |
| Goals | 3031, 4122, 3644 | 3644 | 3377, 2822 (avg 3100) |
| Payments | 2159, 2787, 2721 | 2721 | 2051, 2059 (avg 2055) |

Samples are small (2-3 per cell). No post-refactor production measurement has been taken yet; that is the only comparison that would be meaningful and it is still **pending**.

## 2. Local synthetic fixture (not comparable to production)

`tests/e2e/admin-performance.mjs` runs the production build against a fake Supabase backend on `127.0.0.1` (Auth `getUser`, `is_admin` RPC and PostgREST table endpoints with fixture data: 24 matches in the active season, 30 players, 156 payments). Each fixture endpoint adds an artificial delay (`--latency`, default 20 ms; slow run 50 ms). The fixture is local, in-memory, and has no network round trip, no real RLS and no real data volume. Its numbers only show request *structure* (counts, ordering, overlap) and relative local cost, never production latency.

Run of 2026-11-02 (5 runs per cell after one warm-up, headless Chromium, "data-ready" = skeleton gone AND fixture data visible):

| Page | Artificial latency | Direct DOMContentLoaded | Direct data-ready (median) | Click data-ready (median) | Skeleton visible after click (median) | Data reads per load |
| --- | --- | --- | --- | --- | --- | --- |
| Matches | 20 ms | 142 ms | 466 ms | 415 ms | 106 ms | 6 |
| Goals | 20 ms | 147 ms | 459 ms | 415 ms | 100 ms | 4 |
| Payments | 20 ms | 128 ms | 438 ms | 411 ms | 104 ms | 4 |
| Matches | 50 ms | 296 ms | 538 ms | 446 ms | 189 ms | 6 |
| Goals | 50 ms | 330 ms | 540 ms | 431 ms | 191 ms | 4 |
| Payments | 50 ms | 282 ms | 520 ms | 433 ms | 188 ms | 4 |

Notes:

- The loading skeleton (`SectionSkeleton`) renders the **same `<h1>`** as the real page. A heading alone is therefore not "ready"; the benchmark waits for `section[aria-busy]` to disappear and for a fixture-only data marker. The skeleton time is recorded separately as loading feedback and is not data-ready time.
- "Data reads per load" counts fixture table reads issued during the timed direct load (`Match`+`season`+`Player`+`rival`+`team`+`kickoff_slot` for matches). Router prefetches triggered later are outside the window.
- The fixture does not measure a pre-refactor build, so these numbers are a baseline for future runs of the same harness, not evidence of a speed-up.

## 3. What the harness verifies (13 checks, all passing on 2026-11-02)

Auth and request scope:

- Anonymous requests redirect to `/login` and cause zero backend traffic.
- Revoked/garbage token and expired session with failed refresh (`getClaims` failure): redirect to login, no `is_admin`, no reads.
- Authenticated non-admin: redirected, exactly one `is_admin`, zero protected table reads, no fixture data in the response.
- `/login`: non-admin stays on login (role check preserved), admin is redirected home.
- Admin, every dashboard route: exactly one `is_admin`, 1-2 `/auth/v1/user` calls, no write, no duplicated table read. With HS256 (legacy) tokens, `getClaims` in the proxy falls back to `/auth/v1/user` (1) and `requireAdmin` calls `getUser` (1); more than 2 fails, 0 would mean the app skipped verification. The two calls cannot be told apart from the fixture side.
- No cross-request cache leak: admin -> non-admin -> anonymous -> admin sequence, and 10 interleaved concurrent requests (admins, non-admins, revoked, anonymous); unauthorized callers never receive fixture data and each caller triggers its own `is_admin`.
- Reads use explicit `select` lists (no `*`), matches embed squad and goals in one request (no N+1).
- Under 50 ms per endpoint, independent readers start together (spread < latency), and `Match` starts right after `season` resolves (one inherent dependency), and all protected reads start only after the single `is_admin` completes.

Browser (read-only):

- Dashboard to each of 6 admin pages by sidebar click, waiting for data-ready.
- Matches page: one edit trigger per match, no editor in the DOM before click, one lazily mounted editor, Escape closes and unmounts it, reopening gives a single editor, no reads or writes while opening/closing.
- Stale mutation: the role is revoked after the page loads; the score action is rejected and zero writes reach the backend.

Fixture writes and write RPCs are answered with HTTP 500 and counted; any would fail a check. The browser blocks every non-local request (including `/_next/image`).

## 4. How to run

The app inlines `NEXT_PUBLIC_SUPABASE_URL` at build time, so the fixture needs a build compiled with the fixture URL (`http://127.0.0.1:54329`). `--build` overwrites `.next`; rebuild with the real environment afterwards.

```sh
node tests/e2e/admin-performance.mjs --build   # build with fixture env, then run everything
node tests/e2e/admin-performance.mjs           # reuse an existing fixture build
node tests/e2e/admin-performance.mjs --no-browser
node tests/e2e/admin-performance.mjs --runs 10 --latency 20 --slow-latency 50
```

Environment: `FIXTURE_PORT` (54329, must match the build), `APP_PORT` (3107), `PLAYWRIGHT_CORE` (path to a `playwright-core` package). If unset, the script looks in `node_modules` and `~/.npm/_npx/*/node_modules`; Playwright is not a project dependency. Chromium comes from Playwright's own cache, falling back to installed Google Chrome.

Isolation: the app process receives a minimal environment (PATH, HOME and fixture variables only); `.env*` files are never read by the script and process env takes precedence in Next. The fixture user and JWTs are synthetic (HS256, dummy signature) and generated at runtime. Reports are written to `tests/artifacts/` (gitignored) and contain only results and timings, never cookies or tokens.

## 5. Known caveats

- The first benchmark run after a long idle once timed out waiting for the Matches heading (one flaky observation, not reproduced in later runs); re-run if a cell fails.
- The server logs `Esta cuenta no tiene acceso de administrador` errors during the non-admin checks; they are expected.
- Historical result before the security follow-up: `framer-motion` was removed, but Next was still 16.1.6 and production audit reported 7 affected packages (1 critical, 5 high and 1 moderate). The subsequent security update pins Next/eslint-config-next to **16.4.4**, resolves Sharp **0.35.5** and updates compatible transitive dependencies; `npm audit --omit=dev` reports **0 vulnerabilities** in both repositories. Final outcome: the full audit has 0 high/critical and 16 moderate dev-tooling advisories per repo (all one `minimatch` < 11.0.1 advisory, GHSA-g3hv-75wg-m249, blocked upstream); `npm audit` exits 1 and `--audit-level=high` exits 0 while printing them. See `../../football_public/docs/SECURITY_UPDATE.md`. The timings above were recorded on 16.1.6, not on the updated framework; do not silently relabel that baseline.

## 6. Final repository checks

- Admin: `npm run check` (lint, route types, TypeScript, **29 unit tests**) and `npm run build` passed.
- Public compact squad view (dorsal and name as primary data, ordered by dorsal): lint, typecheck, **26 tests** and build passed.
- The 13 fixture checks passed on Next 16.4.4; after the last transitive dependency update only unit tests and build were re-run. The browser/fixture harness was not re-run, so there is no fresh browser evidence after that update.
- After the synthetic benchmark, the admin was rebuilt normally with the project's environment, restoring `.next` for ordinary local use. The fixture build must never be deployed.
- The verification scripts do not commit, push or deploy code, extract real sessions or mutate the real database. Publishing the verified source changes to `dev` is a separate, owner-authorized Git operation.
