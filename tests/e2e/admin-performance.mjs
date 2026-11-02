#!/usr/bin/env node
// Local, read-only admin performance + auth regression harness.
//
// Everything runs against a synthetic Supabase backend (this file) on 127.0.0.1.
// No real credentials, cookies, or database are read or contacted. The app is a
// production build whose NEXT_PUBLIC_SUPABASE_URL was inlined with the fixture URL.
//
//   node tests/e2e/admin-performance.mjs --build   # build with fixture env, then run
//   node tests/e2e/admin-performance.mjs           # run against an existing fixture build
//
// Options / env: --runs N (RUNS, default 5), --latency MS (LATENCY_MS, default 20),
//   --slow-latency MS (SLOW_LATENCY_MS, default 50), --no-browser, FIXTURE_PORT (54329),
//   APP_PORT (3107), PLAYWRIGHT_CORE (path to playwright-core).
import http from 'node:http'
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const opt = (name, env, dflt) => {
  const i = args.indexOf(`--${name}`)
  return Number(i >= 0 ? args[i + 1] : process.env[env] ?? dflt)
}
const RUNS = opt('runs', 'RUNS', 5)
const LATENCY = opt('latency', 'LATENCY_MS', 20)
const SLOW_LATENCY = opt('slow-latency', 'SLOW_LATENCY_MS', 50)
const FIXTURE_PORT = Number(process.env.FIXTURE_PORT ?? 54329)
const APP_PORT = Number(process.env.APP_PORT ?? 3107)
const FIXTURE_URL = `http://127.0.0.1:${FIXTURE_PORT}`
const APP = `http://127.0.0.1:${APP_PORT}`
const PUBLISHABLE_KEY = 'fixture-publishable-key'
const COOKIE_NAME = `sb-${new URL(FIXTURE_URL).hostname.split('.')[0]}-auth-token`

const appEnv = {
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  NEXT_PUBLIC_SUPABASE_URL: FIXTURE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: PUBLISHABLE_KEY,
}

// ---------------------------------------------------------------- fixture data
const b64u = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url')
const uuid = (kind, n) => `00000000-0000-4000-8000-${String(kind).padStart(4, '0')}${String(n).padStart(8, '0')}`

const seasons = [
  { id: uuid(1, 1), name: 'FIXTURE_SEASON_2026', startdate: '2026-01-01', enddate: '2026-12-31', active: true },
  { id: uuid(1, 2), name: 'FIXTURE_SEASON_2025', startdate: '2025-01-01', enddate: '2025-12-31', active: false },
]
const teams = [1, 2].map((n) => ({ id: uuid(2, n), slug: `fixture-team-${n}`, name: `FIXTURE_TEAM_${n}`, match_weekday: n, league_name: 'Liga fixture', sort_order: n }))
const slots = [{ time: '09:00:00' }, { time: '11:00:00' }, { time: '13:00:00' }]
const rivals = Array.from({ length: 10 }, (_, i) => ({ id: uuid(3, i + 1), name: `FIXTURE_RIVAL_${i + 1}`, normalized_name: `fixture rival ${i + 1}`, slug: `fixture-rival-${i + 1}` }))
const players = Array.from({ length: 30 }, (_, i) => ({
  id: uuid(4, i + 1), name: `FIXTURE_PLAYER_${String(i + 1).padStart(2, '0')}`, nickname: null, dorsal: i + 1, active: i < 26,
  foot: 'R', preferred_side: 'R', primary_position: 'CM', secondary_positions: [],
  player_team: [{ team_id: teams[i % 2].id, team: { id: teams[i % 2].id, name: teams[i % 2].name } }],
}))
const MATCH_COUNT = 24
const matches = Array.from({ length: MATCH_COUNT + 4 }, (_, i) => {
  const season = i < MATCH_COUNT ? seasons[0] : seasons[1]
  const id = uuid(5, i + 1)
  const team = teams[i % 2]
  const rival = rivals[i % rivals.length]
  const squadPlayers = players.slice(i % 10, (i % 10) + 12)
  return {
    id, date: new Date(Date.UTC(2026, 0, 3 + i * 7, 17)).toISOString(), kit: 1 + (i % 2), location: `FIXTURE_FIELD_${i + 1}`,
    myPos: 1 + (i % 8), myTeam: team.name, rivalId: rival.id, rivalPos: 2, rivalTeam: rival.name, schedule_override: false,
    scoreAway: i % 3, scoreHome: 2 + (i % 2), seasonid: season.id, teamId: team.id,
    rival: { id: rival.id, name: rival.name }, team: { id: team.id, name: team.name }, season: { id: season.id, name: season.name },
    squad: squadPlayers.map((p, j) => ({ id: uuid(6, i * 100 + j), matchId: id, playerId: p.id, player: { id: p.id, name: p.name, dorsal: p.dorsal, active: p.active, primary_position: p.primary_position } })),
    goals: squadPlayers.slice(0, 2).map((p, j) => ({ id: uuid(7, i * 100 + j), matchId: id, kind: 'player', minute: 10 + j, playerId: p.id, player: { id: p.id, name: p.name } })),
  }
})
const events = Array.from({ length: 6 }, (_, i) => ({ id: uuid(8, i + 1), name: `FIXTURE_EVENT_${i + 1}`, cost: 100 + i * 10, date: `2026-0${i + 1}-15`, seasonid: seasons[0].id }))
const activePlayers = players.filter((p) => p.active)
const payments = activePlayers.flatMap((p, i) => events.map((e, j) => ({ id: uuid(9, i * 10 + j), eventId: e.id, playerId: p.id, paid: (i + j) % 2 === 0, event: { seasonid: e.seasonid } })))
const playerStats = players.slice(0, 15).map((p, i) => ({ player_id: p.id, team_id: teams[i % 2].id, season_id: seasons[0].id, goals: 15 - i, call_ups: 20 }))
const clubSettings = { id: 1, phone: '555-0100', clabe: '000000000000000000', account: 'FIXTURE', bank: 'FIXTURE BANK', weekly_fee: 50 }

const tables = {
  season: seasons, team: teams, kickoff_slot: slots, rival: rivals, Player: players, Match: matches,
  Event: events, Payment: payments, v_player_stats: playerStats, club_settings: [clubSettings],
}
const WRITE_FREE_RPC = new Set(['is_admin'])

// ------------------------------------------------------------- fake Supabase
const users = new Map() // sub -> { admin, revoked }
let userSeq = 0
const log = []
let latency = LATENCY

function mkUser(label, { admin = true, revoked = false } = {}) {
  const sub = `fixture-${label}-${++userSeq}`
  users.set(sub, { admin, revoked })
  return sub
}

function mkJwt(sub, { expOffset = 3600 } = {}) {
  const now = Math.floor(Date.now() / 1000)
  // HS256 with a dummy signature: auth-js getClaims falls back to a remote getUser() for HS* tokens,
  // which the fake /auth/v1/user answers. The signature is never trusted locally.
  return `${b64u({ alg: 'HS256', typ: 'JWT' })}.${b64u({ sub, aud: 'authenticated', role: 'authenticated', iat: now, exp: now + expOffset, email: `${sub}@fixture.invalid`, session_id: `sess-${sub}` })}.${b64u('fixture-signature')}`
}

function sessionCookie(sub, opts) {
  const access = mkJwt(sub, opts)
  const session = {
    access_token: access, refresh_token: `fixture-refresh-${sub}`, token_type: 'bearer',
    expires_in: opts?.expOffset ?? 3600, expires_at: Math.floor(Date.now() / 1000) + (opts?.expOffset ?? 3600),
    user: { id: sub, aud: 'authenticated', role: 'authenticated', email: `${sub}@fixture.invalid`, app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' },
  }
  return { name: COOKIE_NAME, value: `base64-${b64u(session)}` }
}

function subOf(req) {
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization ?? '')
  if (!m) return 'anon'
  const parts = m[1].split('.')
  if (parts.length !== 3) return 'anon'
  try { return JSON.parse(Buffer.from(parts[1], 'base64url').toString()).sub ?? 'anon' } catch { return 'anon' }
}

function getPath(row, path) {
  return path.split('.').reduce((v, k) => (v == null ? v : v[k]), row)
}
function matchesFilter(row, key, raw) {
  const dot = raw.indexOf('.')
  const op = raw.slice(0, dot)
  const val = raw.slice(dot + 1)
  const actual = getPath(row, key)
  if (op === 'eq') return String(actual) === val
  if (op === 'in') return val.replace(/^\(|\)$/g, '').split(',').map((s) => s.replace(/^"|"$/g, '')).includes(String(actual))
  throw new Error(`fixture: unsupported filter ${key}=${raw}`)
}

function send(res, status, body, headers = {}) {
  const text = body === undefined ? '' : JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json', ...headers })
  res.end(text)
}

const fake = http.createServer((req, res) => {
  const url = new URL(req.url, FIXTURE_URL)
  const sub = subOf(req)
  const entry = { start: performance.now(), end: 0, method: req.method, path: url.pathname, user: sub, kind: 'other', name: '', select: url.searchParams.get('select') ?? '', status: 0 }
  log.push(entry)
  const finish = (status, body, headers) => {
    entry.status = status
    setTimeout(() => { entry.end = performance.now(); send(res, status, body, headers) }, latency)
  }
  let raw = ''
  req.on('data', (c) => { raw += c })
  req.on('end', () => {
    try {
      if (url.pathname === '/auth/v1/user') {
        entry.kind = 'auth_user'
        const u = users.get(sub)
        if (!u || u.revoked) return finish(401, { code: 401, error_code: 'bad_jwt', msg: 'invalid JWT' })
        return finish(200, { id: sub, aud: 'authenticated', role: 'authenticated', email: `${sub}@fixture.invalid`, app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' })
      }
      if (url.pathname === '/auth/v1/token') {
        entry.kind = 'auth_token'
        return finish(400, { code: 400, error_code: 'refresh_token_not_found', msg: 'fixture: refresh not supported' })
      }
      const rpc = /^\/rest\/v1\/rpc\/(.+)$/.exec(url.pathname)
      if (rpc) {
        entry.kind = 'rpc'; entry.name = rpc[1]
        if (!WRITE_FREE_RPC.has(rpc[1])) { entry.kind = 'write'; return finish(500, { message: 'fixture: write rpc blocked' }) }
        const u = users.get(sub)
        return finish(200, Boolean(u && !u.revoked && u.admin))
      }
      const tbl = /^\/rest\/v1\/([^/]+)$/.exec(url.pathname)
      if (tbl) {
        entry.name = tbl[1]
        if (req.method !== 'GET' && req.method !== 'HEAD') { entry.kind = 'write'; return finish(500, { message: 'fixture: writes blocked' }) }
        entry.kind = 'read'
        const u = users.get(sub)
        // Emulates RLS: a non-admin / anonymous caller would get no protected rows.
        if (!u || u.revoked || !u.admin) return finish(200, [])
        const data = tables[tbl[1]]
        if (!data) return finish(404, { message: `fixture: unknown table ${tbl[1]}` })
        let rows = data
        for (const [k, v] of url.searchParams) {
          if (['select', 'order', 'limit', 'offset'].includes(k)) continue
          rows = rows.filter((r) => matchesFilter(r, k, v))
        }
        const offset = Number(url.searchParams.get('offset') ?? 0)
        const limit = url.searchParams.get('limit')
        rows = rows.slice(offset, limit ? offset + Number(limit) : undefined)
        if ((req.headers.accept ?? '').includes('vnd.pgrst.object')) {
          return rows.length === 1 ? finish(200, rows[0]) : finish(406, { message: 'fixture: single row expected' })
        }
        return finish(200, rows)
      }
      return finish(404, { message: `fixture: no route ${url.pathname}` })
    } catch (e) {
      return finish(500, { message: String(e?.message ?? e) })
    }
  })
})

// -------------------------------------------------------------- helpers
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN }
const forUser = (sub, from = 0) => log.slice(from).filter((e) => e.user === sub)
const count = (entries, kind, name) => entries.filter((e) => e.kind === kind && (name === undefined || e.name === name)).length
const maxConcurrency = (entries) => {
  const pts = entries.flatMap((e) => [[e.start, 1], [e.end, -1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  let cur = 0, max = 0
  for (const [, d] of pts) { cur += d; max = Math.max(max, cur) }
  return max
}
const waitFor = async (cond, ms = 3000) => { const t = Date.now(); while (Date.now() - t < ms) { if (cond()) return true; await new Promise((r) => setTimeout(r, 25)) } return cond() }

async function get(path, cookie) {
  const res = await fetch(APP + path, { redirect: 'manual', headers: cookie ? { cookie: `${cookie.name}=${cookie.value}` } : {} })
  return { status: res.status, location: res.headers.get('location'), body: await res.text() }
}

const results = []
async function check(name, fn) {
  try { await fn(); results.push({ name, ok: true }); console.log(`  ok   ${name}`) }
  catch (e) { results.push({ name, ok: false, error: String(e?.message ?? e).split('\n').slice(0, 6).join(' | ') }); console.log(`  FAIL ${name}\n       ${String(e?.message ?? e).split('\n').slice(0, 6).join('\n       ')}`) }
}

// -------------------------------------------------------------- app lifecycle
function builtWithFixtureUrl() {
  const dir = join(ROOT, '.next/server')
  if (!existsSync(join(ROOT, '.next/BUILD_ID')) || !existsSync(dir)) return false
  const stack = [dir]
  while (stack.length) {
    const d = stack.pop()
    for (const f of readdirSync(d)) {
      const p = join(d, f)
      const s = statSync(p)
      if (s.isDirectory()) stack.push(p)
      else if (/\.(js|mjs)$/.test(f) && s.size < 5_000_000 && readFileSync(p, 'utf8').includes(FIXTURE_URL)) return true
    }
  }
  return false
}

function build() {
  console.log(`Building production app with fixture env (${FIXTURE_URL})...`)
  const r = spawnSync(join(ROOT, 'node_modules/.bin/next'), ['build'], { cwd: ROOT, env: appEnv, stdio: 'inherit' })
  if (r.status !== 0) throw new Error('next build failed')
}

let appProc
let appOut = ''
async function startApp() {
  appProc = spawn(join(ROOT, 'node_modules/.bin/next'), ['start', '-p', String(APP_PORT), '-H', '127.0.0.1'], { cwd: ROOT, env: appEnv })
  appProc.stdout.on('data', (d) => { appOut += d })
  appProc.stderr.on('data', (d) => { appOut += d })
  appProc.on('exit', (c) => { if (c) appOut += `\n[exit ${c}]` })
  const t = Date.now()
  while (Date.now() - t < 60_000) {
    try { await fetch(`${APP}/login`, { redirect: 'manual' }); return } catch { await new Promise((r) => setTimeout(r, 250)) }
  }
  throw new Error(`app did not start:\n${appOut}`)
}

function findPlaywright() {
  const candidates = []
  if (process.env.PLAYWRIGHT_CORE) candidates.push(process.env.PLAYWRIGHT_CORE)
  candidates.push(join(ROOT, 'node_modules/playwright-core'), join(ROOT, 'node_modules/playwright'))
  const npx = join(homedir(), '.npm/_npx')
  if (existsSync(npx)) for (const h of readdirSync(npx)) candidates.push(join(npx, h, 'node_modules/playwright-core'), join(npx, h, 'node_modules/playwright'))
  const found = candidates.find((c) => existsSync(join(c, 'package.json')))
  if (!found) return null
  return createRequire(join(found, 'package.json'))(found)
}

// -------------------------------------------------------------- HTTP-level tests
const ROUTES = [
  ['/', 'ITJAGUARS'],
  ['/admin/matches', 'FIXTURE_RIVAL_1'],
  ['/admin/goals', 'FIXTURE_PLAYER_01'],
  ['/admin/payments', 'FIXTURE_PLAYER_01'],
  ['/admin/players', 'FIXTURE_PLAYER_01'],
  ['/admin/club', 'FIXTURE_TEAM_1'],
  ['/admin/seasons', 'FIXTURE_SEASON_2026'],
]
const PROTECTED = ROUTES.filter(([p]) => p !== '/')

async function httpTests() {
  console.log('\nAuth / request-scope regression (HTTP, latency %dms)', latency)

  await check('anonymous: every protected route redirects to /login with zero backend traffic', async () => {
    for (const [path] of ROUTES) {
      const from = log.length
      const r = await get(path)
      assert.equal(r.status, 307, `${path} status`)
      assert.match(r.location ?? '', /\/login/, `${path} location`)
      assert.ok(!r.body.includes('FIXTURE_'), `${path} leaked fixture data`)
      const calls = log.slice(from)
      assert.equal(calls.length, 0, `${path}: anonymous caused ${calls.map((c) => c.path).join(',')}`)
    }
  })

  await check('garbage / revoked token (getClaims fails): redirect to login, no reads, no is_admin', async () => {
    const sub = mkUser('revoked', { admin: true, revoked: true })
    for (const [path] of PROTECTED) {
      const from = log.length
      const r = await get(path, sessionCookie(sub))
      assert.equal(r.status, 307, path)
      assert.match(r.location ?? '', /\/login/)
      assert.ok(!r.body.includes('FIXTURE_'))
      const calls = forUser(sub, from)
      assert.equal(count(calls, 'read'), 0, `${path} reads`)
      assert.equal(count(calls, 'rpc'), 0, `${path} rpc is_admin reached despite failed getClaims`)
    }
  })

  await check('expired session with failing refresh: treated as signed out', async () => {
    const sub = mkUser('expired', { admin: true })
    const r = await get('/admin/matches', sessionCookie(sub, { expOffset: -600 }))
    assert.equal(r.status, 307)
    assert.match(r.location ?? '', /\/login/)
    assert.ok(!r.body.includes('FIXTURE_'))
    assert.equal(count(forUser(sub), 'read'), 0)
  })

  await check('authenticated non-admin: redirected, is_admin consulted, ZERO protected reads, no payload', async () => {
    for (const [path] of PROTECTED) {
      const sub = mkUser('nonadmin', { admin: false })
      const r = await get(path, sessionCookie(sub))
      assert.equal(r.status, 307, `${path} status`)
      assert.match(r.location ?? '', /\/login/)
      assert.ok(!r.body.includes('FIXTURE_'), `${path} leaked data to non-admin`)
      const calls = forUser(sub)
      assert.equal(count(calls, 'read'), 0, `${path}: non-admin triggered table reads`)
      assert.equal(count(calls, 'rpc', 'is_admin'), 1, `${path}: expected exactly one is_admin`)
    }
  })

  await check('/login: non-admin stays (role check preserved), admin is redirected home', async () => {
    const na = mkUser('nonadmin', { admin: false })
    const r1 = await get('/login', sessionCookie(na))
    assert.equal(r1.status, 200)
    assert.equal(count(forUser(na), 'rpc', 'is_admin'), 1)
    const ad = mkUser('admin', { admin: true })
    const r2 = await get('/login', sessionCookie(ad))
    assert.equal(r2.status, 307)
    assert.ok(new URL(r2.location, APP).pathname === '/')
  })

  await check('admin: each initial dashboard read does ONE app getUser + ONE is_admin, no duplicate table reads', async () => {
    for (const [path, marker] of PROTECTED) {
      const sub = mkUser('admin', { admin: true })
      const r = await get(path, sessionCookie(sub))
      assert.equal(r.status, 200, `${path} status`)
      assert.ok(r.body.includes(marker), `${path} missing marker ${marker}`)
      const calls = forUser(sub)
      // HS256 legacy tokens: proxy getClaims() falls back to /auth/v1/user (1) + app requireAdmin getUser (1).
      // Anything above 2 means an extra verification crept in; 0 would mean the app skipped verification.
      const nUser = count(calls, 'auth_user')
      assert.ok(nUser >= 1 && nUser <= 2, `${path}: /auth/v1/user x${nUser} (expected 1-2: proxy getClaims fallback + app getUser)`)
      assert.equal(count(calls, 'rpc', 'is_admin'), 1, `${path}: is_admin x${count(calls, 'rpc', 'is_admin')}`)
      assert.equal(count(calls, 'write'), 0)
      // Fixture tables stay under one 1000-row page, so an identical table+select must be read once per request.
      const dup = Object.entries(Object.groupBy(calls.filter((c) => c.kind === 'read'), (c) => `${c.name}|${c.select}`)).filter(([, v]) => v.length > 1)
      assert.equal(dup.length, 0, `${path}: duplicate reads ${dup.map(([k, v]) => `${k.slice(0, 40)} x${v.length}`).join('; ')}`)
    }
  })

  await check('reads use explicit select lists (no select=*), joins are embedded in one request', async () => {
    const sub = mkUser('admin', { admin: true })
    await get('/admin/matches', sessionCookie(sub))
    const reads = forUser(sub).filter((e) => e.kind === 'read')
    assert.ok(reads.length > 0)
    for (const e of reads) assert.ok(e.select && e.select !== '*' && !/(^|,)\s*\*/.test(e.select), `${e.name} select=${e.select}`)
    const match = reads.find((e) => e.name === 'Match')
    assert.ok(match && /squad:MatchSquad\(/.test(match.select) && /goals:Goal\(/.test(match.select), 'Match read must embed squad and goals')
    assert.equal(reads.filter((e) => e.name === 'MatchSquad' || e.name === 'Goal').length, 0, 'no N+1 squad/goal reads')
  })

  await check('no cross-request cache leak: admin -> non-admin -> anonymous -> admin sequence', async () => {
    const admin1 = mkUser('admin', { admin: true })
    const nonadmin = mkUser('nonadmin', { admin: false })
    const admin2 = mkUser('admin', { admin: true })
    assert.equal((await get('/admin/matches', sessionCookie(admin1))).status, 200)
    const a = await get('/admin/matches', sessionCookie(nonadmin))
    assert.equal(a.status, 307); assert.ok(!a.body.includes('FIXTURE_'))
    const b = await get('/admin/matches')
    assert.equal(b.status, 307); assert.ok(!b.body.includes('FIXTURE_'))
    const c = await get('/admin/matches', sessionCookie(admin2))
    assert.equal(c.status, 200)
    for (const sub of [admin1, nonadmin, admin2]) assert.equal(count(forUser(sub), 'rpc', 'is_admin'), 1, `${sub} is_admin`)
    assert.equal(count(forUser(nonadmin), 'read'), 0)
  })

  await check('no cross-request cache leak: interleaved concurrent admin / non-admin / anonymous / revoked', async () => {
    const mk = (label, opts) => { const sub = mkUser(label, opts); return { sub, cookie: sessionCookie(sub), ...opts } }
    const actors = [
      ...Array.from({ length: 4 }, () => mk('admin', { admin: true })),
      ...Array.from({ length: 4 }, () => mk('nonadmin', { admin: false })),
      ...Array.from({ length: 2 }, () => mk('revoked', { admin: true, revoked: true })),
    ]
    const paths = ['/admin/matches', '/admin/goals', '/admin/payments', '/admin/players']
    const jobs = [
      ...actors.flatMap((a, i) => [get(paths[i % paths.length], a.cookie).then((r) => ({ a, r }))]),
      get('/admin/matches').then((r) => ({ a: { admin: false, anon: true }, r })),
      get('/admin/goals').then((r) => ({ a: { admin: false, anon: true }, r })),
    ]
    for (const { a, r } of await Promise.all(jobs)) {
      if (a.admin && !a.revoked) { assert.equal(r.status, 200); assert.ok(r.body.includes('FIXTURE_')) }
      else { assert.equal(r.status, 307); assert.match(r.location ?? '', /\/login/); assert.ok(!r.body.includes('FIXTURE_'), 'leaked to unauthorized concurrent request') }
    }
    for (const a of actors) {
      const calls = forUser(a.sub)
      if (a.revoked) assert.equal(count(calls, 'read') + count(calls, 'rpc'), 0)
      else assert.equal(count(calls, 'rpc', 'is_admin'), 1, `${a.sub} is_admin`)
      if (!a.admin || a.revoked) assert.equal(count(calls, 'read'), 0)
    }
  })

  await check('data readers run in parallel (not sequential) under per-endpoint latency', async () => {
    const saved = latency
    latency = SLOW_LATENCY
    try {
      const sub = mkUser('admin', { admin: true })
      const t0 = performance.now()
      const r = await get('/admin/matches', sessionCookie(sub))
      const wall = performance.now() - t0
      assert.equal(r.status, 200)
      const calls = forUser(sub)
      const reads = calls.filter((e) => e.kind === 'read')
      const total = calls.reduce((s, e) => s + (e.end - e.start), 0)
      // Match depends on the resolved season list (one inherent hop); everything else is independent.
      const independent = reads.filter((e) => e.name !== 'Match')
      assert.ok(independent.length >= 5, `expected >=5 independent reads, got ${independent.length}`)
      const spread = Math.max(...independent.map((e) => e.start)) - Math.min(...independent.map((e) => e.start))
      assert.ok(spread < SLOW_LATENCY * 0.9, `independent readers started ${spread.toFixed(0)}ms apart (>= ${SLOW_LATENCY}ms latency => sequential awaits)`)
      assert.ok(maxConcurrency(independent) >= independent.length - 1, `max concurrency ${maxConcurrency(independent)} of ${independent.length} independent reads`)
      const season = reads.find((e) => e.name === 'season'), match = reads.find((e) => e.name === 'Match')
      assert.ok(match.start >= season.end - 5 && match.start - season.end < SLOW_LATENCY * 0.9, 'Match should start right after seasons resolve, not after the other readers')
      assert.ok(wall < total, `wall ${wall.toFixed(0)}ms >= sum of endpoint time ${total.toFixed(0)}ms`)
      // is_admin must complete before any protected data read begins (reader waits on the single verification).
      const isAdmin = calls.find((e) => e.kind === 'rpc')
      for (const e of reads) assert.ok(e.start >= isAdmin.end - 5, `${e.name} started before is_admin finished`)
    } finally { latency = saved }
  })
}

// -------------------------------------------------------------- browser tests
const isLocal = (u) => /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(u) || u.startsWith('data:') || u.startsWith('blob:')

async function newPage(browser, cookie) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await context.route('**/*', (route) => (isLocal(route.request().url()) && !route.request().url().includes('/_next/image') ? route.continue() : route.abort()))
  await context.addCookies([{ ...cookie, url: APP }])
  return { context, page: await context.newPage() }
}

// SectionSkeleton (loading.tsx) renders the SAME <h1> as the real page, so a heading alone is not "data ready".
// Ready = skeleton gone (no section[aria-busy]) AND a fixture-only data marker is visible.
const DATA_MARKER = { '/admin/matches': 'FIXTURE_RIVAL_1', '/admin/goals': 'FIXTURE_PLAYER_01', '/admin/payments': 'FIXTURE_PLAYER_01', '/admin/players': 'FIXTURE_PLAYER_01', '/admin/seasons': 'FIXTURE_SEASON_2026', '/admin/club': 'FIXTURE_TEAM_1' }
async function dataReady(page, href, h1, timeout = 20000) {
  await page.getByRole('heading', { level: 1, name: h1 }).first().waitFor({ timeout })
  await page.locator('section[aria-busy="true"]').first().waitFor({ state: 'detached', timeout })
  const marker = DATA_MARKER[href]
  if (marker) await page.locator(`main :text("${marker}"), main input[value*="${marker}"]`).first().waitFor({ state: 'attached', timeout })
}

async function browserTests(browser) {
  console.log('\nBrowser behaviour (matches page)')

  await check('real navigation: dashboard -> every admin page renders for admin, via sidebar click', async () => {
    const sub = mkUser('admin', { admin: true })
    const { context, page } = await newPage(browser, sessionCookie(sub))
    try {
      await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' })
      const targets = [['/admin/matches', 'Partidos'], ['/admin/goals', 'Tabla de Goleo'], ['/admin/payments', 'Pagos y Deudas'], ['/admin/players', 'Plantilla'], ['/admin/seasons', 'Temporadas'], ['/admin/club', 'Nuestro club']]
      for (const [href, h1] of targets) {
        await page.locator(`a[href="${href}"]:visible`).first().click()
        await page.waitForURL(`**${href}`, { timeout: 15000 })
        await dataReady(page, href, h1)
      }
    } finally { await context.close() }
  })

  await check('matches payload: one edit trigger per match, a single lazily-mounted editor, Escape closes it, no writes', async () => {
    const sub = mkUser('admin', { admin: true })
    const { context, page } = await newPage(browser, sessionCookie(sub))
    try {
      await page.goto(`${APP}/admin/matches`, { waitUntil: 'networkidle' })
      const triggers = page.locator('button[aria-label="Editar detalles del partido"]')
      assert.equal(await triggers.count(), MATCH_COUNT, 'edit triggers == matches in active season')
      assert.equal(await page.locator('dialog').count(), 0, 'no editor mounted before click (singleton, lazy)')
      const before = log.length
      await triggers.nth(3).click()
      const dialog = page.locator('dialog[open]')
      await dialog.waitFor({ timeout: 10000 })
      assert.equal(await page.locator('dialog').count(), 1, 'exactly one editor in DOM')
      await page.keyboard.press('Escape')
      await page.locator('dialog').waitFor({ state: 'detached', timeout: 5000 })
      await triggers.nth(5).click()
      await page.locator('dialog[open]').waitFor({ timeout: 10000 })
      assert.equal(await page.locator('dialog').count(), 1, 'still a single editor after reopening for another match')
      await page.keyboard.press('Escape')
      await page.locator('dialog').waitFor({ state: 'detached', timeout: 5000 })
      assert.equal(log.slice(before).filter((e) => e.user === sub && e.kind === 'read').length, 0, 'open/close issued no reads')
      assert.equal(count(forUser(sub), 'write'), 0)
    } finally { await context.close() }
  })

  await check('stale mutation: role revoked after page load -> action unauthorized, no write reaches backend', async () => {
    const sub = mkUser('admin', { admin: true })
    const { context, page } = await newPage(browser, sessionCookie(sub))
    try {
      await page.goto(`${APP}/admin/matches`, { waitUntil: 'networkidle' })
      users.get(sub).admin = false // the admin loses the role while the page is open
      const from = log.length
      await page.locator('button[title="Clic para editar marcador"]').first().click()
      await page.getByLabel('Goles del rival').fill('9')
      await page.getByRole('button', { name: /OK/ }).click()
      await page.locator('main [role="alert"]').first().waitFor({ timeout: 15000 })
      const calls = log.slice(from).filter((e) => e.user === sub)
      const detail = `alert="${(await page.locator('main [role="alert"]').first().innerText()).trim()}" calls=${calls.map((c) => `${c.method} ${c.path}`).join(',')}`
      assert.equal(count(calls, 'write'), 0, `mutation reached the backend after role revocation; ${detail}`)
      assert.equal(count(calls, 'rpc', 'is_admin'), 1, `action must re-verify the role (one is_admin); ${detail}`)
      assert.equal(calls.filter((e) => e.kind === 'read' && e.name === 'Match').length, 0, 'unauthorized action issued data reads')
      const msg = (await page.locator('main [role="alert"]').first().innerText()).trim()
      assert.ok(msg.length > 0)
    } finally { await context.close() }
  })
}

// -------------------------------------------------------------- benchmark
const reads = (sub, from, to) => log.filter((e) => e.user === sub && e.kind === 'read' && e.start >= from && e.start <= to).length
async function benchmark(browser) {
  const out = { fixture: { matches: MATCH_COUNT, players: players.length, payments: payments.length }, runs: RUNS, latencies: {} }
  const targets = [['/admin/matches', 'Partidos'], ['/admin/goals', 'Tabla de Goleo'], ['/admin/payments', 'Pagos y Deudas']]
  for (const ms of [LATENCY, SLOW_LATENCY]) {
    latency = ms
    console.log(`\nBenchmark, fixture latency ${ms}ms/endpoint, ${RUNS} runs (synthetic backend, NOT comparable to production)`)
    out.latencies[ms] = {}
    for (const [path, h1] of targets) {
      const direct = [], click = [], srv = [], domReadyMs = [], skel = []
      for (let i = 0; i < RUNS + 1; i++) { // first iteration is warm-up
        const sub = mkUser('admin', { admin: true })
        const { context, page } = await newPage(browser, sessionCookie(sub))
        try {
          let t = performance.now()
          await page.goto(`${APP}${path}`, { waitUntil: 'domcontentloaded' })
          const domReady = performance.now() - t
          await dataReady(page, path, h1)
          const d = performance.now() - t
          const readsDirect = reads(sub, t, t + d)
          await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' })
          t = performance.now()
          const skeleton = page.locator('section[aria-busy="true"]').first().waitFor({ state: 'attached', timeout: 20000 }).then(() => performance.now() - t, () => null)
          await page.locator(`a[href="${path}"]:visible`).first().click()
          await dataReady(page, path, h1)
          const c = performance.now() - t
          const sk = await Promise.race([skeleton, new Promise((r) => setTimeout(() => r(null), 0))])
          if (i > 0) { direct.push(d); domReadyMs.push(domReady); click.push(c); srv.push(readsDirect); skel.push(sk) }
        } finally { await context.close() }
      }
      const sks = skel.filter((x) => x != null)
      const row = { directDomContentLoadedMedianMs: Math.round(median(domReadyMs)), directDataReadyMedianMs: Math.round(median(direct)), clickDataReadyMedianMs: Math.round(median(click)), clickSkeletonSeenMedianMs: sks.length ? Math.round(median(sks)) : null, clickSkeletonSeenRuns: `${sks.length}/${skel.length}`, directDataReady: direct.map(Math.round), clickDataReady: click.map(Math.round), readRequestsPerDirectLoad: median(srv) }
      out.latencies[ms][path] = row
      console.log(`  ${path.padEnd(16)} direct data-ready median ${row.directDataReadyMedianMs}ms (DCL ${row.directDomContentLoadedMedianMs}ms)  click data-ready median ${row.clickDataReadyMedianMs}ms  skeleton seen ${row.clickSkeletonSeenRuns} (median ${row.clickSkeletonSeenMedianMs}ms)  reads/direct load ${row.readRequestsPerDirectLoad}`)
    }
  }
  latency = LATENCY
  return out
}

// -------------------------------------------------------------- main
async function main() {
  if (flag('build')) build()
  if (!builtWithFixtureUrl()) {
    console.error(`No production build compiled with ${FIXTURE_URL} found in .next.\nRun: node tests/e2e/admin-performance.mjs --build`)
    process.exit(2)
  }
  await new Promise((r) => fake.listen(FIXTURE_PORT, '127.0.0.1', r))
  let browser, report = {}
  try {
    await startApp()
    await httpTests()
    if (!flag('no-browser')) {
      const pw = findPlaywright()
      if (!pw) { console.log('\nplaywright-core not found (set PLAYWRIGHT_CORE); skipping browser tests'); results.push({ name: 'browser tests', ok: false, error: 'playwright-core not found' }) }
      else {
        try { browser = await pw.chromium.launch({ headless: true }) } catch { browser = await pw.chromium.launch({ headless: true, channel: 'chrome' }) }
        await browserTests(browser)
        report = await benchmark(browser)
      }
    }
  } finally {
    await browser?.close().catch(() => {})
    appProc?.kill('SIGTERM')
    fake.close()
  }
  const dir = join(ROOT, 'tests/artifacts')
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `admin-performance-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  writeFileSync(file, JSON.stringify({ at: new Date().toISOString(), latencyMs: LATENCY, slowLatencyMs: SLOW_LATENCY, results, benchmark: report, fixtureRequests: log.length }, null, 2))
  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed. Report: ${file}`)
  if (failed.length) console.log(`App output tail:\n${appOut.split('\n').slice(-15).join('\n')}`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => { console.error(e); appProc?.kill('SIGTERM'); process.exit(1) })
