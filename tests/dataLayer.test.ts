import test from 'node:test'
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/lib/database.types'
import { buildTopScorers, totalsByPlayer } from '../src/lib/pure/stats'
import { resolveSeason, resolveSeasonFromList, type Season } from '../src/lib/pure/seasons'
import { fetchAllPages } from '../src/lib/pure/pagination'
import { queryPaymentMatrix, queryTopScorers, queryMatches, querySeasons } from '../src/lib/pure/adminQueries'

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } })

function mockDb(handler: (url: URL) => unknown) {
  const urls: URL[] = []
  const db = createClient<Database>('http://localhost:54321', 'key', {
    global: { fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      assert.equal((init?.method ?? 'GET').toUpperCase(), 'GET', 'readers must never write')
      const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
      urls.push(url)
      return json(handler(url))
    } },
  })
  return { db, urls }
}

test('top scorers sum call-ups and goals across teams, keeping historical players', () => {
  const rows = [
    { player_id: 'a', goals: 2, call_ups: 3 }, { player_id: 'a', goals: 1, call_ups: 2 },
    { player_id: 'b', goals: 0, call_ups: 9 }, { player_id: 'c', goals: 4, call_ups: null }, { player_id: null, goals: 5, call_ups: 5 },
  ]
  assert.equal(totalsByPlayer(rows).get('a')?.callUps, 5)
  const players = [{ id: 'a', name: 'A', dorsal: 1, nickname: null }, { id: 'c', name: 'C', dorsal: 3, nickname: 'Ce' }]
  assert.deepEqual(buildTopScorers(rows, players).map(p => [p.id, p.goals, p.matchesPlayed]), [['c', 4, 0], ['a', 3, 5]])
})

test('queryTopScorers filters by season on the view and only loads scorers', async () => {
  const { db, urls } = mockDb(url => url.pathname.endsWith('v_player_stats')
    ? [{ player_id: 'a', team_id: 't1', season_id: 's', goals: 2, call_ups: 3 }, { player_id: 'a', team_id: 't2', season_id: 's', goals: 1, call_ups: 1 }, { player_id: 'z', team_id: 't1', season_id: 's', goals: 0, call_ups: 4 }]
    : [{ id: 'a', name: 'A', dorsal: 7, nickname: null }])
  const result = await queryTopScorers(db, 's')
  assert.deepEqual(result, [{ id: 'a', name: 'A', dorsal: 7, nickname: null, goals: 3, matchesPlayed: 4 }])
  assert.equal(urls[0].searchParams.get('season_id'), 'eq.s')
  assert.equal(urls[1].searchParams.get('id'), 'in.(a)')
})

test('payment matrix is season-scoped, minimal and joined in memory', async () => {
  const { db, urls } = mockDb(url => {
    if (url.pathname.endsWith('/Event')) return [{ id: 'e1', name: 'Cuota', cost: 50, date: 'd', seasonid: 's' }]
    if (url.pathname.endsWith('/Player')) return [{ id: 'p1', name: 'P', dorsal: 1, active: true }, { id: 'p2', name: 'Q', dorsal: 2, active: true }]
    return [{ id: 'pay1', eventId: 'e1', playerId: 'p1', paid: true, event: { seasonid: 's' } }]
  })
  const { events, players } = await queryPaymentMatrix(db, 's')
  assert.equal(events.length, 1)
  assert.deepEqual(players[0].payments, [{ id: 'pay1', eventId: 'e1', playerId: 'p1', paid: true }])
  assert.deepEqual(players[1].payments, [])
  const payment = urls.find(u => u.pathname.endsWith('/Payment'))!
  assert.equal(payment.searchParams.get('event.seasonid'), 'eq.s')
  assert.ok(!payment.searchParams.get('select')!.includes('*'))
  assert.equal(urls.find(u => u.pathname.endsWith('/Player'))!.searchParams.get('active'), 'eq.true')
})

test('matches query is explicit-column and season filtered', async () => {
  const { db, urls } = mockDb(() => [])
  await queryMatches(db, 's')
  assert.equal(urls[0].searchParams.get('seasonid'), 'eq.s')
  assert.ok(!urls[0].searchParams.get('select')!.includes('*'))
})

test('fetchAllPages reads past the page size and surfaces errors', async () => {
  const calls: number[] = []
  const rows = await fetchAllPages(async (from, to) => { calls.push(from); return { data: Array.from({ length: Math.max(0, Math.min(to + 1, 5) - from) }, (_, i) => from + i), error: null } }, 2)
  assert.deepEqual(rows, [0, 1, 2, 3, 4])
  assert.deepEqual(calls, [0, 2, 4])
  await assert.rejects(fetchAllPages(async () => ({ data: null, error: { message: 'boom' } })), /boom/)
})

test('season resolution validates explicit ids', () => {
  const seasons: Season[] = [{ id: 'a', name: 'A', startdate: '', enddate: '', active: false }, { id: 'b', name: 'B', startdate: '', enddate: '', active: true }]
  assert.equal(resolveSeasonFromList(seasons, 'a'), 'a')
  assert.equal(resolveSeasonFromList(seasons, null), 'b')
  assert.deepEqual([resolveSeason(seasons, 'nope').seasonId, resolveSeason(seasons, 'nope').invalid], ['b', true])
  assert.equal(resolveSeasonFromList([], 'x'), null)
})

test('payment history and seasons are not truncated at the PostgREST row limit', async () => {
  const { db } = mockDb(url => {
    const from = Number(url.searchParams.get('offset') ?? 0)
    const end = from + Number(url.searchParams.get('limit') ?? 1000)
    if (url.pathname.endsWith('/Player')) return [{ id: 'p', name: 'P', dorsal: 1, active: true }]
    const indexes = Array.from({ length: Math.max(0, Math.min(end, 1001) - from) }, (_, index) => from + index)
    if (url.pathname.endsWith('/season')) return indexes.map(index => ({ id: `s${index}`, name: `S${index}`, startdate: '2026-01-01', enddate: '2026-12-31', active: index === 0 }))
    if (url.pathname.endsWith('/Event')) return indexes.map(index => ({ id: `e${index}`, name: 'Cuota', cost: 50, date: '2026-01-01', seasonid: 's0' }))
    return indexes.map(index => ({ id: `pay${index}`, eventId: `e${index}`, playerId: 'p', paid: true, event: { seasonid: 's0' } }))
  })
  const [seasons, matrix] = await Promise.all([querySeasons(db), queryPaymentMatrix(db, 's0')])
  assert.equal(seasons.length, 1001)
  assert.equal(matrix.events.length, 1001)
  assert.equal(matrix.players[0].payments.length, 1001)
  assert.equal(matrix.players[0].payments.at(-1)?.eventId, 'e1000')
})

test('read failures propagate rather than rendering successful empty private data', async () => {
  const db = createClient<Database>('http://localhost:54321', 'fixture-public-key', {
    global: { fetch: async () => new Response(JSON.stringify({ message: 'Data service unavailable', code: 'XX000' }), { status: 503, headers: { 'content-type': 'application/json' } }) },
  })
  await assert.rejects(querySeasons(db), /Data service unavailable/)
  await assert.rejects(queryPaymentMatrix(db, 's'), /Data service unavailable/)
})
