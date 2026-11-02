import test from 'node:test'
import assert from 'node:assert/strict'
import { toMatchEditData, resolveKickoffIso } from '../src/lib/matchEdit'

const player = (id: string) => ({ id }) as never
const base = { id: 'm1', date: '2026-01-10T18:30:15.000Z', kit: 0, teamId: 't', rivalId: 'r', location: 'x', seasonid: 's', myPos: 1, rivalPos: 2, schedule_override: false }

test('keeps inactive squad players only as retained', () => {
  const d = toMatchEditData({ ...base, squad: [{ playerId: 'a', player: player('a') }, { playerId: 'b', player: player('b') }] }, [{ id: 'a' }])
  assert.deepEqual(d.squadIds, ['a', 'b'])
  assert.deepEqual(d.retained.map(p => p.id), ['b'])
  assert.equal(d.kit, 1)
})

test('preserves exact instant when kickoff unchanged', () => {
  assert.equal(resolveKickoffIso(base.date, '2026-01-10', '10:30'), base.date)
})
