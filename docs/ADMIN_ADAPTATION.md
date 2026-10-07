# Admin adaptation handoff

Implemented on the existing `dev` branch in `app_futbol`. Public repository files were inspected and copied, never edited by the original adaptation task. Typecheck disables incremental writes and Next build metadata now goes under `.next/cache`. Root `tsconfig.tsbuildinfo` is generated output and is ignored; repository cleanup should remove its existing Git tracking while keeping any local file.

## Parent-owned database contract

- `team`: generated text `id`, `slug`, `name`, `match_weekday` (Sunday=0 through Saturday=6), nullable `league_name`, `sort_order`.
- `kickoff_slot`: primary-key `time`, with 18:50, 19:40, 20:30, 21:20, 22:10.
- `club_settings`: existing singleton `id=1`, `phone`, `clabe`, `account`, `bank`, numeric `weekly_fee`.
- `Match.teamId` foreign key to `team`; `Match.schedule_override` boolean.
- Database-generated defaults for every new entity ID. App supplies IDs only to identify existing rows; singleton settings uses the fixed contract ID.
- `is_admin()` returning boolean for the current authenticated user.
- Authenticated admin CRUD grants/RLS on application tables and execute grants for the RPCs. Admin does not query `admin_users`.

### Atomic RPCs

`save_match(p_match jsonb, p_player_ids text[]) → text`

Payload: optional existing `id`, `teamId`, `rivalTeam`, UTC ISO `date`, `location`, `myPos`, `rivalPos`, optional `scoreHome`/`scoreAway`, `kit`, `seasonid`, `schedule_override`. Updating match details omits score keys to preserve the score. The RPC must insert/update and replace the squad within one transaction using invoker permissions/RLS. The old unused `saveMatch` action is removed; both form entrypoints use the RPC. RPC and trigger error messages are displayed in the form.

`create_event_with_payments(p_name text, p_cost numeric, p_date timestamptz, p_season_id text) → text`

Creates the event and payments for active players atomically, using invoker permissions/RLS.

The original admin adaptation task did not apply schema changes, grants or migrations. The coordinated database task subsequently applied `20261007024919 / club_contract` and generated `src/lib/database.types.ts`; see `docs/db/MIGRATION_HANDOFF.md` for the shared contract and current financial-lockdown status.

## Application behavior

- Every domain server action calls `requireAdmin()` which verifies identity with `getUser()` then calls `is_admin()`. Proxy, dashboard layout, login and auth callback check the role too. Only publishable Supabase credentials are used.
- Shared match schedule fields read team/slot tables. Standard mode validates team weekday and authorized kickoff; the explicit checkbox records exceptions and permits free day/time. Server validation mirrors schedule restrictions; DB triggers remain authoritative against direct API writes and races.
- Match scores use **Nosotros / Rival**, independent of venue. Squad and kit selection remain available. `/admin/club` updates singleton settings and displays team schedules.
- Payment updates compare the rendered `paid` value in the database update predicate. Stale writes fail visibly, and the client refreshes authoritative data after success or conflict. Player status updates similarly reject stale state.
- Date helpers still use `America/Tijuana` and UTC storage. Calendar-only values use Tijuana noon. New validation rejects invalid dates/times and nonexistent spring-forward wall-clock times; it does not reinterpret stored dates.
- When kickoff fields are unchanged during edit, the exact original UTC instant is preserved, including seconds and autumn DST overlap choice.
- Public semantic colors and `itj-theme` bootstrap/control were copied to admin: navy `#1B2A4A`, gold, light/dark/system, pre-paint script, system preference changes and storage synchronization. Responsive surfaces, pill actions, focus indicators, reduced-motion support and a native modal dialog complement the existing architecture.
- Confirmed-unused Prisma schema/seed/stub and unused service-key client removed; UUID removed after eliminating all imports. Framer Motion retained.

## Verification

Run `npm run check` and `npm run build`. CI runs both with Node 22. Node tests cover Tijuana winter/summer UTC rollover, date-only round-trips, invalid/leap dates, nonexistent DST times, server schedule checks, omitted update score keys, deduplicated squads and forged numeric/form values.

Original adaptation checks passed: ESLint with zero warnings/errors, TypeScript, all six Node tests, production build, and `git diff --check`. The build reported an outdated Browserslist data notice. Root `tsconfig.tsbuildinfo` was not restored or rewritten by that task.

Live verification remains required against the applied shared contract: admin/non-admin/anonymous RLS behavior; RPC rollback under invalid squad/payment input; trigger errors; create/edit/score/squad/goals/player/season/payment flows; settings update; mobile/desktop rendering; light/dark/system startup and native dialog keyboard behavior. A production build does not prove live RPCs or RLS policies.
