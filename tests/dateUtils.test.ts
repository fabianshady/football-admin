import test from 'node:test'
import assert from 'node:assert/strict'
import { calendarDateToIso, formatCalendarDate, toCalendarInput, utcToVenueDateInput, utcToVenueTimeInput, validateCalendarDate, venueWallclockToUtcIso } from '../src/lib/dateUtils'

test('Tijuana evening kickoffs cross the UTC date correctly in winter and summer', () => {
  const winter = venueWallclockToUtcIso('2026-01-08', '22:10')
  const summer = venueWallclockToUtcIso('2026-07-09', '18:50')
  assert.equal(winter, '2026-01-09T06:10:00.000Z')
  assert.equal(summer, '2026-07-10T01:50:00.000Z')
  assert.equal(utcToVenueDateInput(winter), '2026-01-08')
  assert.equal(utcToVenueTimeInput(winter), '22:10')
})

test('date-only event values retain their calendar day independent of host timezone', () => {
  const instant = calendarDateToIso('2026-03-08')
  assert.equal(instant, '2026-03-08T19:00:00.000Z')
  assert.equal(toCalendarInput(instant), '2026-03-08')
  assert.equal(toCalendarInput('2026-03-08'), '2026-03-08')
  assert.equal(formatCalendarDate('2026-03-08'), formatCalendarDate(instant))
})

test('invalid dates, malformed time and nonexistent spring-forward time are rejected', () => {
  for (const date of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-1-01', '']) {
    assert.throws(() => validateCalendarDate(date))
    assert.throws(() => calendarDateToIso(date))
  }
  assert.equal(validateCalendarDate('2028-02-29'), '2028-02-29')
  for (const time of ['24:00', '18:60', '8:50', '']) assert.throws(() => venueWallclockToUtcIso('2026-01-08', time))
  assert.throws(() => venueWallclockToUtcIso('2026-03-08', '02:30'), /no existe/)
})
