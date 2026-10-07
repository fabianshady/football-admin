import test from 'node:test'
import assert from 'node:assert/strict'
import { integer, nonnegativeAmount, parseMatch, utcInstant, validateSchedule } from '../src/lib/validation'
import { KICKOFF_TIMES, type Team } from '../src/lib/club'
import { venueWallclockToUtcIso } from '../src/lib/dateUtils'

const team: Team = { id: 'team-id', slug: 'team', name: 'Equipo', match_weekday: 4, league_name: null, sort_order: 0 }
function matchForm() {
  const form = new FormData()
  for (const [key, value] of Object.entries({ id: 'existing-match', teamId: team.id, rivalTeam: 'Rival', location: 'Cancha', date: venueWallclockToUtcIso('2026-01-08', '22:10'), myPos: '1', rivalPos: '2', kit: '1', seasonid: 'season-id' })) form.set(key, value)
  return form
}

test('schedule validation uses the Tijuana weekday, including UTC next-day kickoffs', () => {
  validateSchedule(venueWallclockToUtcIso('2026-01-08', '22:10'), team, [...KICKOFF_TIMES], false)
  assert.throws(() => validateSchedule(venueWallclockToUtcIso('2026-01-09', '22:10'), team, [...KICKOFF_TIMES], false), /día/)
  assert.throws(() => validateSchedule(venueWallclockToUtcIso('2026-01-08', '20:00'), team, [...KICKOFF_TIMES], false), /Hora/)
  validateSchedule(venueWallclockToUtcIso('2026-01-09', '20:00'), team, [...KICKOFF_TIMES], true)
})

test('match updates omit scores so the atomic RPC preserves the existing result', () => {
  const form = matchForm()
  form.append('squad', 'player-1'); form.append('squad', 'player-1')
  const { payload, players } = parseMatch(form, true)
  assert.equal(payload.id, 'existing-match')
  assert.equal('scoreHome' in payload, false)
  assert.equal('scoreAway' in payload, false)
  assert.equal(payload.schedule_override, false)
  assert.deepEqual(players, ['player-1'])
  form.set('schedule_override', 'on')
  form.set('scoreHome', '3'); form.set('scoreAway', '1')
  const created = parseMatch(form, false).payload
  assert.equal('id' in created, false)
  assert.equal(created.scoreHome, 3)
  assert.equal(created.schedule_override, true)
})

test('forged form values cannot bypass integer, required field, uniform or UTC validation', () => {
  for (const value of ['2oops', '-1', '', '1.5', NaN, Infinity]) assert.throws(() => integer(value, 'Goles'))
  for (const value of ['-1', 'NaN', '', '12oops', '1.234']) assert.throws(() => nonnegativeAmount(value))
  assert.equal(nonnegativeAmount('12.50'), 12.5)
  for (const date of ['2026-01-08', '2026-02-30T12:00:00Z', '2026-01-08T12:00:00-08:00']) assert.throws(() => utcInstant(date))
  const form = matchForm()
  form.set('kit', '3'); assert.throws(() => parseMatch(form, true), /Uniforme/)
  form.set('kit', '1'); form.delete('teamId'); assert.throws(() => parseMatch(form, true), /Nosotros/)
})
