# Applied phase-2 database handoff

Applied remotely on explicit parent/user authorization: **20261008235036 / phase2_players_rivals_goals**, 2026-10-08 23:50:36 UTC. Exact reviewed migration is `../../../football/supabase/migrations/20261008235036_phase2_players_rivals_goals.sql`. Do not reapply it. No app deployment, commit, or push by the DB task.

Canonical contracts: `../../../football/docs/db/PHASE2_CONTRACT.md`; review/concurrency procedure: `../../../football/docs/db/PHASE2_REVIEW.md`; rollback-only verification: `../../../football/docs/db/verify_phase2_remote.sql`.

Types refreshed via Supabase and persisted in `src/lib/database.types.ts` and public `lib/database.types.ts`, with identical condensed formatting and documented CHECK text-union/nullable-RPC refinements. Actual inferred rival→v_match relationships replace prepared assumptions. Generated normalized_name typing accepts string but clients must omit this generated column. `npm run check` passed with 15 tests after refresh.

Remote rollback-only checks passed: admin invoker save_player/save_match/add_goal/remove_goal; membership and WB legacy/structured sync; retained squads/scores; null-player goals/caps/invalid attributions/minutes; score/scorer/history guards; nonadmin/anon read and mutation denial; public debt projection/raw Payment denial. Fixtures all rolled back, zero persisted verification players/rivals.

Retained counts: 194 Goal / 22 Player / 69 Match / 667 MatchSquad / 749 Payment. Approved dorsals Corneas22 / Leobardo24 / Sebastian12. Backfilled 55 rivals / 36 historical membership pairs; membership evidence is not certainty of current affiliation. All 194 historical goals remain player-attributed; no automatic missing-goal insertions.

Follow-up **20261009032355 / merge_confirmed_rival_aliases** applied after explicit owner confirmation: AE Trucking→AE Trucking FC, C.M.T FC→CMT FC, Union Real→Union Real FC. Surviving rivals retain their IDs/slugs and each now has two matches; total rivals 52. No match dates/scores or goal records changed. Legacy aliases normalize to the surviving identity on future writes, preventing duplicate recreation. No general fuzzy matching was enabled. SQL source: `../../../football/supabase/migrations/20261009032355_merge_confirmed_rival_aliases.sql`.

Security advisor findings unchanged; new indexes only unused INFO. Two-session concurrency unverified (Docker daemon unavailable); authenticated browser flows pending credentials/session. Single-session SQL role verification does not prove login/browser behavior.

Rollback after successful application requires a separately reviewed migration: do not silently restore invalid dorsals, discard structured/membership/rival data, delete nullable goals, restore cascade deletion, or drop schema objects. Destructive reversal requires explicit confirmation and coordinated application/data exports. No destructive rollback was executed.
