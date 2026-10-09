import test from 'node:test'
import assert from 'node:assert/strict'
import { parsePlayer, freeDorsals, parseGoal, goalProgress, primaryLine, normalizeRivalName, squadChoices, goalLabel, type AdminPlayer } from '../src/lib/phase2'
import { parseMatch } from '../src/lib/validation'
import { assertAuthenticated, assertAdminRole } from '../src/lib/adminIdentity'
import { actionResult, unwrapResult } from '../src/lib/actionResult'

function playerForm() {
  const form = new FormData()
  for (const [key, value] of Object.entries({ id: 'original-id', name: 'Corneas', nickname: '', dorsal: '22', active: 'false', primary_position: 'WB', preferred_side: 'L', foot: '', memberships: 'replace' })) form.set(key, value)
  form.append('secondary_positions', 'CM')
  return form
}
function player(id: string, teamId?: string, active = true): AdminPlayer {
  return { id, name: id, nickname: null, dorsal: 22, active, createdAt: '2026-01-01', positions: ['Lateral (L)'], primary_position: 'WB', secondary_positions: [], preferred_side: 'L', foot: null, player_team: teamId ? [{ team_id: teamId, team: null }] : [] }
}
test('player parser preserves identity and inactive state, uses canonical fields and does not rewrite legacy positions', () => {
  const form = playerForm()
  form.append('positions', 'legacy source')
  form.append('createdAt', 'forged')
  const parsed = parsePlayer(form)
  assert.deepEqual(parsed.payload, { id: 'original-id', name: 'Corneas', dorsal: 22, active: false, nickname: null, primary_position: 'WB', secondary_positions: ['CM'], preferred_side: 'L', foot: null })
  assert.deepEqual(parsed.teams, [])
  form.append('team_ids', 'team-a'); form.append('team_ids', 'team-a')
  assert.deepEqual(parsePlayer(form).teams, ['team-a'])
  form.delete('memberships')
  assert.equal(parsePlayer(form).teams, null)
  form.delete('id')
  assert.equal('id' in parsePlayer(form).payload, false)
})
test('player parser rejects out-of-range dorsals, invalid codes, duplicate and primary secondary positions', () => {
  for (const dorsal of ['0', '100', '123', '22x', '1.5']) { const form = playerForm(); form.set('dorsal', dorsal); assert.throws(() => parsePlayer(form), /Dorsal/) }
  for (const secondary of ['WB', 'Cuerpo Técnico', '']) { const form = playerForm(); form.set('secondary_positions', secondary); assert.throws(() => parsePlayer(form)) }
  const form = playerForm(); form.append('secondary_positions', 'CM'); assert.throws(() => parsePlayer(form), /repetidas/)
  form.delete('secondary_positions'); form.set('primary_position', ''); assert.equal(parsePlayer(form).payload.primary_position, null)
  form.append('secondary_positions', 'ST'); assert.throws(() => parsePlayer(form), /principal/)
  for (const [key, value] of [['active', 'on'], ['preferred_side', 'LEFT'], ['foot', 'ANY'], ['primary_position', 'Lateral (L)']]) { const invalid = playerForm(); invalid.set(key, value); assert.throws(() => parsePlayer(invalid)) }
})
test('free dorsal suggestions exclude active numbers only and preserve the current player number', () => {
  const players = [player('active'), { ...player('inactive', undefined, false), dorsal: 24 }]
  assert.equal(freeDorsals(players).includes(22), false)
  assert.equal(freeDorsals(players).includes(24), true)
  assert.equal(freeDorsals(players, 'active').includes(22), true)
  assert.equal(freeDorsals([]).length, 99)
  assert.equal(primaryLine('WB'), 'Carrileros')
  assert.equal(primaryLine('CB'), 'Defensa')
})
test('team filtering retains cross-team selections and inactive historical players without changing their IDs', () => {
  const active = [player('ours', 'a'), player('other', 'b')]
  const historical = player('historical', undefined, false)
  const selected = ['other', 'historical']
  const result = squadChoices(active, [historical], 'a', selected, true)
  assert.deepEqual(result.visible.map(p => p.id), ['ours', 'other', 'historical'])
  assert.deepEqual(result.crossTeam.map(p => p.id), selected)
  assert.deepEqual(selected, ['other', 'historical'])
  assert.deepEqual(squadChoices(active, [historical], 'b', selected, true).visible.map(p => p.id), selected)
  assert.equal(squadChoices(active, [], 'a', [], false).visible.length, 2)
})
test('rival payload sends exactly one identity channel and edit omits scores', () => {
  const form = new FormData()
  for (const [key, value] of Object.entries({ id: 'm', teamId: 't', rivalId: 'existing-rival', date: '2026-01-09T06:10:00Z', location: 'Cancha', myPos: '1', rivalPos: '2', kit: '1', seasonid: 's' })) form.set(key, value)
  let payload = parseMatch(form, true).payload
  assert.equal('rivalId' in payload && payload.rivalId, 'existing-rival'); assert.equal('rivalTeam' in payload, false)
  assert.equal('scoreHome' in payload, false); assert.equal('scoreAway' in payload, false)
  form.set('rivalTeam', 'AE Trucking FC'); assert.throws(() => parseMatch(form, true), /existente/)
  form.delete('rivalId'); payload = parseMatch(form, true).payload
  assert.equal('rivalTeam' in payload && payload.rivalTeam, 'AE Trucking FC'); assert.equal('rivalId' in payload, false)
  form.set('rivalTeam', '  '); assert.throws(() => parseMatch(form, true), /rival/)
  assert.equal(normalizeRivalName(' AE  Trucking '), normalizeRivalName('ae trucking'))
  for (const [a, b] of [['AE Trucking', 'AE Trucking FC'], ['C.M.T FC', 'CMT FC'], ['Unión Real', 'Union Real']]) assert.notEqual(normalizeRivalName(a), normalizeRivalName(b))
})
test('goal RPC payload supports all kinds, nullable player and optional inclusive minute', () => {
  assert.deepEqual(parseGoal('m', 'p', 'player', ''), { p_match_id: 'm', p_player_id: 'p', p_kind: 'player', p_minute: null })
  for (const kind of ['own_goal', 'unknown']) {
    assert.deepEqual(parseGoal('m', null, kind, 0), { p_match_id: 'm', p_player_id: null, p_kind: kind, p_minute: 0 })
    assert.equal(parseGoal('m', null, kind, 120).p_minute, 120)
    assert.throws(() => parseGoal('m', 'p', kind, null), /no lleva jugador/)
  }
  assert.throws(() => parseGoal('m', null, 'player', null), /Jugador/)
  assert.throws(() => parseGoal('m', 'p', 'invalid', null), /Tipo/)
  for (const minute of [-1, 121, '4oops', 1.5, NaN]) assert.throws(() => parseGoal('m', 'p', 'player', minute))
  assert.equal(goalLabel({ kind: 'unknown', playerId: null }, []), 'Sin atribución')
  assert.equal(goalLabel({ kind: 'own_goal', playerId: null }, []), 'Autogol rival')
})
test('goal cap includes non-player kinds, zero-score completion, and allows corrections by removal', () => {
  const goals = [{ kind: 'player', playerId: 'p' }, { kind: 'own_goal', playerId: null }, { kind: 'unknown', playerId: null }]
  assert.deepEqual(goalProgress(goals.length, 3), { assigned: 3, pending: 0, atCap: true, complete: true })
  assert.equal(goalProgress(goals.length - 1, 3).atCap, false)
  assert.equal(goalProgress(0, 0).complete, true)
  assert.equal(goalProgress(4, 3).atCap, true)
  assert.deepEqual(goalProgress(1, 9), { assigned: 1, pending: 8, atCap: false, complete: false })
})
test('admin guard requires verified identity and strict boolean role', () => {
  assert.throws(() => assertAuthenticated(null, false), /sesión/)
  assert.throws(() => assertAuthenticated({ id: 'user' }, true), /sesión/)
  assertAuthenticated({ id: 'user' }, false)
  for (const role of [false, null, undefined, 'true', 1, {}]) assert.throws(() => assertAdminRole(role), /administrador/)
  assertAdminRole(true)
})
test('action results preserve actionable validation errors for production form state', async () => {
  const result = await actionResult(async () => { throw new Error('Dorsal ocupado. Disponibles: 1, 2') })
  assert.deepEqual(result, { ok: false, error: 'Dorsal ocupado. Disponibles: 1, 2' })
  assert.throws(() => unwrapResult(result), /Dorsal ocupado/)
  assert.equal(unwrapResult(await actionResult(async () => 'generated-id')), 'generated-id')
})
