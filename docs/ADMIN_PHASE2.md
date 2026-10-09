# Admin phase 2 · implementation and verification

Local implementation on `dev` in `app_futbol`; no commit/push. Contract and full SQL reviewed from `../football/docs/db/PHASE2_CONTRACT.md` and `../football/supabase/migrations/20261008235036_phase2_players_rivals_goals.sql`. The parent-authorized database task applied **20261008235036 / phase2_players_rivals_goals** remotely and refreshed both repos' types on 2026-10-08. No database writes were made by the admin UI task.

## Contract implementation

- `src/lib/database.types.ts`: Supabase-regenerated applied phase-2 types, condensed identically to public types, with documented CHECK-union/nullable-RPC refinements and actual inferred rival/view relationships. No schema fallback.
- `src/lib/phase2.ts`: typed admin joins, canonical position/side/foot/kind catalogs, player/goal parsers, dorsal availability, attribution progress and selection-preserving team filtering.
- `src/app/actions/players.ts`: `save_player` handles identity, fields and memberships in one call; null/omitted teams preserve affiliation. The forms explicitly replace memberships (empty selection sends `[]`). Omitted RPC fields preserve state. No delete player action or UI remains. Unique active dorsal DB errors show free suggestions; reactivation conflict asks for a new dorsal.
- `PlayerForm/PlayerCard/PlayerRoster`: accessible labels, primary select and secondary checkbox chips, side/foot/nickname/team/status fields, 1–99 input and free suggestions; filter team/status/name/apodo/dorsal; group by primary code. WB is Carrileros, described as defense/midfield bands. Original `name` remains explicit; no legal-name enrichment. Legacy positions are retained and synchronized exclusively by the shared DB contract.
- `getActivePlayers`: structured rows plus `player_team(team_id,team:team(*))`. Match creation offers active players; team filter defaults on and can be disabled. Cross-team selections remain visible and warn. Editing includes retained inactive historical players, preserves IDs and never updates affiliations from squads.
- `RivalFields`: native search and select, separate explicit new-name mode. `parseMatch` sends an existing rival ID or new name, rejects conflicting channels, omits update scores. Match getters join canonical rival catalog and render canonical names. DB trigger resolves concurrent normalized names; no alias/FC/accent/punctuation merging.
- `GoalLogger`: fully typed joins, contribution counts, all-kind assigned/scoreHome progress, add controls disabled at cap, pending/complete/all and past/all filters. Past date is only a heuristic; there is no completion flag and no future-date write block. Completed matches remain correctable. Own goal/unknown use null player, optional minute 0–120. Every recorded goal is visible and removable by its own ID, including repeated player goals and minute zero.
- `addGoal/removeGoal`: exact `add_goal`/`remove_goal` RPCs, auth/role checks, runtime payload validation and revalidation of dashboard/matches/goals. DB owns squad/count locks and caps. All goal kinds count for us; player statistics count only kind player, including inactive historical scorers.
- `ScoreEditor`: assigned-count guard and descriptive DB conflict errors. Match detail edit protects scoreboard by omitted score keys. Populated match deletion reports protected-history errors in state rather than an uncaught form throw.
- All scoped mutations return typed success/error results via `actionResult`; clients present errors with `role="alert"`. Expected DB/validation messages survive Next's production thrown-error sanitization. Getter errors still fail page loading visibly.
- `public/logo.png`: byte copy of inspected existing public jaguar crest. Local ClubLogo and favicon/apple/shortcut metadata; sitewide noindex/nofollow. Existing navy/gold M3 tokens, responsive fields, focus states and ≥44px action targets retained.

## Local verification

`npm run check`, `npm run build` and `git diff --check` are required. Parser tests cover identity/inactive preservation, membership null versus empty, canonical position/side/foot validation, dorsal bounds/availability, WB classification, cross-team/inactive retained selections, rival ID/name payload and normalized distinctions, omitted edit scores, all goal kinds and optional minutes, cap/zero-score/progress, strict authenticated identity and admin boolean role. Existing calendar/DST tests remain.

Unit identity tests exercise actual guard predicates; they do not prove live RLS. Typecheck verifies Supabase nested relationships and RPC calls against regenerated applied-schema types. Production build is compilation evidence, not a live browser/auth flow verification.

Final local evidence (2026-10-08):

- `npm run check`: ESLint clean, Next route type generation and TypeScript passed, **15/15 tests passed**.
- `npm run build`: production Turbopack compilation and TypeScript passed; all dashboard/admin/login/callback routes compiled. Existing nonblocking outdated Browserslist dataset notice remains.
- `git diff --check`: passed.
- `diff -u ../football/lib/database.types.ts src/lib/database.types.ts`: no differences; copied type contracts are byte-identical at verification time.
- Both local crest files have SHA-256 `2802852c557a5305b9798607ba40c2a7acdcda603fc42fbac5d05c576a2c15c8`.
- Scoped player/match/goal code contains no `any`, and no `deletePlayer`, `updatePlayerInline` or Player DELETE call remains. Branch verified as `dev`; no commit/push or SQL was executed.

## Pending authenticated browser verification (migration/type refresh completed)

1. Anonymous, Auth non-admin and admin sessions: page/action denial and direct RPC/RLS enforcement; login/logout expiry handling.
2. Player create/edit with no inferred identity; nullable nickname/foot, WB, primary/secondary changes, side and inactivation. Confirm legacy `positions` source remains intact on unrelated edits. Duplicate active dorsal and reactivation errors; inactive reuse allowed. Confirm player and invalid-team save rolls back atomically; null membership preservation versus `[]` clear. Review historically imported memberships.
3. Team-filtered active squad creation; change team with retained selections, explicit cross-team warning; edit historical inactive selections. DB rejects removal of a recorded scorer and preserves scores/retained squad row IDs.
4. Existing rival ID creation/edit unchanged and changed; new explicit name, normalized whitespace/case duplicate reuse; FC/punctuation/accent variants remain distinct. Renamed catalog entries display canonical names and retain stable IDs/slugs. No score change during detail edits.
5. Player/own_goal/unknown with null joins and minute omitted/0/120; reject -1/121/invalid attribution. Progress counts all kinds. Cap disables addition; two sessions racing at cap permit only the available count (parent concurrency procedure). Specific goal-ID removal leaves other same-player records untouched; missing-ID conflict visible. Correct complete matches; optional all-date filter permits future correction without a date block.
6. Score lower than assigned rejected by UI and DB; concurrent goal addition/score change rejected consistently. Protected sporting history remains intact on attempted populated match deletion.
7. Keyboard/reader and mobile/desktop: chip/team selectors, native rival select, error/status announcements, goal correction, modal focus/Escape, 44px targets, light/dark/system. Inspect noindex and local icons on login and dashboard.

No authenticated browser/session credentials were provided; these flows remain pending. Parent DB synthetic and remote rollback-only admin/nonadmin/anon verification passed; concurrency limitations are documented in the public contract and are not claimed as admin browser verification. Post-refresh `npm run check` passed (ESLint/TypeScript/15 tests).
